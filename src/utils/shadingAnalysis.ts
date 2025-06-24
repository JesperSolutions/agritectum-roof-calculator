/**
 * Shading Analysis Utilities
 * Basic geometric shadow casting and horizon profile analysis
 */

export interface ShadingObstacle {
  type: 'building' | 'tree' | 'terrain' | 'structure';
  height: number;        // meters
  distance: number;      // meters from roof edge
  azimuth: number;       // degrees from north (0-360)
  width?: number;        // meters (for buildings/structures)
  description: string;
}

export interface HorizonProfile {
  azimuth: number;       // degrees from north
  elevation: number;     // degrees above horizon
}

export interface ShadingAnalysis {
  annualShadingLoss: number;     // percentage (0-100)
  seasonalLosses: {
    spring: number;
    summer: number;
    autumn: number;
    winter: number;
  };
  criticalPeriods: Array<{
    timeOfDay: string;
    season: string;
    shadingPercentage: number;
    cause: string;
  }>;
  recommendations: string[];
}

export class ShadingCalculator {
  /**
   * Calculate shadow length for given obstacle
   */
  static calculateShadowLength(
    obstacleHeight: number,
    sunElevation: number
  ): number {
    if (sunElevation <= 0) return Infinity;
    
    const sunElevationRad = this.toRadians(sunElevation);
    return obstacleHeight / Math.tan(sunElevationRad);
  }

  /**
   * Check if point is in shadow of obstacle
   */
  static isPointInShadow(
    pointDistance: number,
    pointAzimuth: number,
    obstacle: ShadingObstacle,
    sunElevation: number,
    sunAzimuth: number
  ): boolean {
    if (sunElevation <= 0) return true; // No sun = shadow

    // Calculate shadow length
    const shadowLength = this.calculateShadowLength(obstacle.height, sunElevation);
    
    // Calculate shadow direction (opposite to sun)
    const shadowAzimuth = this.normalizeAngle(sunAzimuth + 180);
    
    // Check if point is within shadow cone
    const azimuthDiff = Math.abs(this.normalizeAngle(pointAzimuth - shadowAzimuth));
    const maxAzimuthDiff = obstacle.width ? 
      Math.atan2(obstacle.width / 2, obstacle.distance) * 180 / Math.PI : 5; // 5° default width
    
    return pointDistance <= shadowLength && 
           azimuthDiff <= maxAzimuthDiff &&
           pointDistance >= obstacle.distance;
  }

  /**
   * Analyze shading for a roof area throughout the year
   */
  static analyzeAnnualShading(
    latitude: number,
    longitude: number,
    obstacles: ShadingObstacle[],
    roofArea: { width: number; depth: number } = { width: 20, depth: 20 }
  ): ShadingAnalysis {
    const seasons = [
      { name: 'spring', months: [3, 4, 5] },
      { name: 'summer', months: [6, 7, 8] },
      { name: 'autumn', months: [9, 10, 11] },
      { name: 'winter', months: [12, 1, 2] }
    ];

    const seasonalLosses: any = {};
    const criticalPeriods: any[] = [];
    let totalShadingLoss = 0;
    let totalSamples = 0;

    // Sample key times throughout the year
    for (const season of seasons) {
      let seasonShadingLoss = 0;
      let seasonSamples = 0;

      for (const month of season.months) {
        // Sample mid-month, key hours (9 AM, 12 PM, 3 PM)
        const sampleDate = new Date(2024, month - 1, 15);
        
        for (const hour of [9, 12, 15]) {
          sampleDate.setHours(hour, 0, 0, 0);
          
          const solarPos = this.getSolarPosition(latitude, longitude, sampleDate);
          
          if (solarPos.elevation > 10) { // Only consider when sun is reasonably high
            const shadingPercentage = this.calculateRoofShadingPercentage(
              obstacles,
              solarPos,
              roofArea
            );
            
            seasonShadingLoss += shadingPercentage;
            totalShadingLoss += shadingPercentage;
            seasonSamples++;
            totalSamples++;

            // Identify critical periods (>30% shading)
            if (shadingPercentage > 30) {
              criticalPeriods.push({
                timeOfDay: `${hour}:00`,
                season: season.name,
                shadingPercentage,
                cause: this.identifyPrimaryShadingCause(obstacles, solarPos)
              });
            }
          }
        }
      }

      seasonalLosses[season.name] = seasonSamples > 0 ? seasonShadingLoss / seasonSamples : 0;
    }

    const annualShadingLoss = totalSamples > 0 ? totalShadingLoss / totalSamples : 0;

    return {
      annualShadingLoss,
      seasonalLosses,
      criticalPeriods,
      recommendations: this.generateShadingRecommendations(annualShadingLoss, seasonalLosses, obstacles)
    };
  }

  /**
   * Calculate percentage of roof area in shadow
   */
  private static calculateRoofShadingPercentage(
    obstacles: ShadingObstacle[],
    solarPosition: { elevation: number; azimuth: number },
    roofArea: { width: number; depth: number }
  ): number {
    const gridSize = 2; // 2m grid for sampling
    const pointsX = Math.ceil(roofArea.width / gridSize);
    const pointsY = Math.ceil(roofArea.depth / gridSize);
    
    let shadedPoints = 0;
    let totalPoints = 0;

    for (let x = 0; x < pointsX; x++) {
      for (let y = 0; y < pointsY; y++) {
        const pointX = x * gridSize;
        const pointY = y * gridSize;
        
        // Calculate distance and azimuth from roof center
        const centerX = roofArea.width / 2;
        const centerY = roofArea.depth / 2;
        const distance = Math.sqrt(Math.pow(pointX - centerX, 2) + Math.pow(pointY - centerY, 2));
        const azimuth = Math.atan2(pointX - centerX, pointY - centerY) * 180 / Math.PI;

        // Check if this point is shaded by any obstacle
        const isShaded = obstacles.some(obstacle =>
          this.isPointInShadow(distance, azimuth, obstacle, solarPosition.elevation, solarPosition.azimuth)
        );

        if (isShaded) shadedPoints++;
        totalPoints++;
      }
    }

    return totalPoints > 0 ? (shadedPoints / totalPoints) * 100 : 0;
  }

  /**
   * Identify primary cause of shading
   */
  private static identifyPrimaryShadingCause(
    obstacles: ShadingObstacle[],
    solarPosition: { elevation: number; azimuth: number }
  ): string {
    // Find obstacle most likely causing shading based on sun position
    const relevantObstacles = obstacles.filter(obs => {
      const azimuthDiff = Math.abs(this.normalizeAngle(obs.azimuth - solarPosition.azimuth));
      return azimuthDiff < 90; // Obstacle is roughly between sun and roof
    });

    if (relevantObstacles.length === 0) return 'Unknown obstacle';

    // Find closest/tallest obstacle
    const primaryObstacle = relevantObstacles.reduce((prev, current) => {
      const prevScore = prev.height / prev.distance;
      const currentScore = current.height / current.distance;
      return currentScore > prevScore ? current : prev;
    });

    return primaryObstacle.description;
  }

  /**
   * Generate shading mitigation recommendations
   */
  private static generateShadingRecommendations(
    annualLoss: number,
    seasonalLosses: any,
    obstacles: ShadingObstacle[]
  ): string[] {
    const recommendations: string[] = [];

    if (annualLoss > 20) {
      recommendations.push('Consider relocating panels to less shaded roof areas');
      recommendations.push('Evaluate tree trimming or removal options');
    }

    if (seasonalLosses.winter > seasonalLosses.summer * 2) {
      recommendations.push('Winter shading is significant - consider higher tilt angles');
    }

    if (obstacles.some(obs => obs.type === 'tree' && obs.height > 10)) {
      recommendations.push('Large trees detected - regular pruning may improve performance');
    }

    if (obstacles.some(obs => obs.type === 'building' && obs.distance < obs.height * 2)) {
      recommendations.push('Nearby buildings cause significant shading - consider elevated mounting');
    }

    if (annualLoss < 5) {
      recommendations.push('Minimal shading detected - excellent site for solar installation');
    }

    return recommendations;
  }

  /**
   * Simplified solar position calculation
   */
  private static getSolarPosition(lat: number, lng: number, date: Date) {
    // Simplified calculation - in production, use the full SolarCalculator
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
    const declination = 23.45 * Math.sin(this.toRadians(360 * (284 + dayOfYear) / 365));
    
    const hour = date.getHours() + date.getMinutes() / 60;
    const hourAngle = 15 * (hour - 12);
    
    const elevation = Math.asin(
      Math.sin(this.toRadians(declination)) * Math.sin(this.toRadians(lat)) +
      Math.cos(this.toRadians(declination)) * Math.cos(this.toRadians(lat)) * Math.cos(this.toRadians(hourAngle))
    );
    
    const azimuth = Math.atan2(
      Math.sin(this.toRadians(hourAngle)),
      Math.cos(this.toRadians(hourAngle)) * Math.sin(this.toRadians(lat)) - 
      Math.tan(this.toRadians(declination)) * Math.cos(this.toRadians(lat))
    );

    return {
      elevation: elevation * 180 / Math.PI,
      azimuth: this.normalizeAngle((azimuth * 180 / Math.PI) + 180)
    };
  }

  private static toRadians(degrees: number): number {
    return degrees * Math.PI / 180;
  }

  private static normalizeAngle(angle: number): number {
    while (angle < 0) angle += 360;
    while (angle >= 360) angle -= 360;
    return angle;
  }
}

/**
 * Estimate common shading obstacles based on location type
 */
export function estimateCommonObstacles(
  locationType: 'urban' | 'suburban' | 'rural',
  buildingHeight: number = 10 // meters
): ShadingObstacle[] {
  const obstacles: ShadingObstacle[] = [];

  switch (locationType) {
    case 'urban':
      // Dense urban environment
      obstacles.push(
        {
          type: 'building',
          height: buildingHeight * 1.5,
          distance: 15,
          azimuth: 180, // South
          width: 20,
          description: 'Adjacent building (south)'
        },
        {
          type: 'building',
          height: buildingHeight * 0.8,
          distance: 12,
          azimuth: 135, // Southeast
          width: 15,
          description: 'Neighboring building (southeast)'
        }
      );
      break;

    case 'suburban':
      // Suburban with trees and houses
      obstacles.push(
        {
          type: 'tree',
          height: 15,
          distance: 20,
          azimuth: 200, // Southwest
          width: 8,
          description: 'Large tree (southwest)'
        },
        {
          type: 'building',
          height: buildingHeight * 0.9,
          distance: 25,
          azimuth: 160, // South-southeast
          width: 12,
          description: 'Neighbor house'
        }
      );
      break;

    case 'rural':
      // Rural with minimal obstacles
      obstacles.push(
        {
          type: 'tree',
          height: 12,
          distance: 30,
          azimuth: 220, // Southwest
          width: 6,
          description: 'Isolated tree'
        }
      );
      break;
  }

  return obstacles;
}