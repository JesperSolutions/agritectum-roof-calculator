/**
 * Solar Position and Irradiance Calculations
 * Based on NREL Solar Position Algorithm (SPA) and PVGIS data
 */

export interface SolarPosition {
  elevation: number;    // degrees above horizon (0-90)
  azimuth: number;      // degrees from north (0-360)
  zenith: number;       // degrees from vertical (0-90)
  hourAngle: number;    // hour angle in degrees
}

export interface HourlyIrradiance {
  hour: number;         // 0-23
  ghi: number;          // Global Horizontal Irradiance (W/m²)
  dni: number;          // Direct Normal Irradiance (W/m²)
  dhi: number;          // Diffuse Horizontal Irradiance (W/m²)
  temperature: number;  // Ambient temperature (°C)
}

export interface MonthlyData {
  month: number;
  monthName: string;
  avgDailyIrradiance: number;  // kWh/m²/day
  avgTemperature: number;      // °C
  optimalTilt: number;         // degrees
  daysInMonth: number;
  totalIrradiance: number;     // kWh/m²/month
}

export interface PVGISData {
  location: {
    latitude: number;
    longitude: number;
    elevation: number;
  };
  monthly: MonthlyData[];
  yearly: {
    totalIrradiance: number;    // kWh/m²/year
    avgTemperature: number;     // °C
    optimalTilt: number;        // degrees
    optimalAzimuth: number;     // degrees (180 = south)
  };
  pvPotential: {
    fixedSystem: number;        // kWh/kWp/year
    trackingSystem: number;     // kWh/kWp/year
    optimalFixed: number;       // kWh/kWp/year at optimal angle
  };
}

/**
 * Solar Position Calculator using simplified SPA algorithm
 */
export class SolarCalculator {
  /**
   * Calculate solar position for given location and time
   */
  static getSolarPosition(
    latitude: number,
    longitude: number,
    date: Date,
    timezone: number = 0
  ): SolarPosition {
    const lat = this.toRadians(latitude);
    const lon = this.toRadians(longitude);
    
    // Julian day calculation
    const julianDay = this.getJulianDay(date);
    const n = julianDay - 2451545.0;
    
    // Solar coordinates
    const L = this.normalizeAngle(280.460 + 0.9856474 * n); // Mean longitude
    const g = this.toRadians(this.normalizeAngle(357.528 + 0.9856003 * n)); // Mean anomaly
    const lambda = this.toRadians(L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)); // Ecliptic longitude
    
    // Declination angle
    const declination = Math.asin(Math.sin(this.toRadians(23.439)) * Math.sin(lambda));
    
    // Time calculations
    const timeCorrection = 4 * (longitude - timezone * 15) + this.getEquationOfTime(n);
    const solarTime = date.getHours() + date.getMinutes() / 60 + timeCorrection / 60;
    const hourAngle = this.toRadians(15 * (solarTime - 12));
    
    // Solar position
    const elevation = Math.asin(
      Math.sin(declination) * Math.sin(lat) +
      Math.cos(declination) * Math.cos(lat) * Math.cos(hourAngle)
    );
    
    const azimuth = Math.atan2(
      Math.sin(hourAngle),
      Math.cos(hourAngle) * Math.sin(lat) - Math.tan(declination) * Math.cos(lat)
    );
    
    return {
      elevation: this.toDegrees(elevation),
      azimuth: this.normalizeAngle(this.toDegrees(azimuth) + 180), // Convert to 0-360 from north
      zenith: 90 - this.toDegrees(elevation),
      hourAngle: this.toDegrees(hourAngle)
    };
  }
  
  /**
   * Calculate hourly solar irradiance profile for a given day
   */
  static getHourlyIrradiance(
    latitude: number,
    longitude: number,
    date: Date,
    dailyTotal: number // kWh/m²/day from PVGIS
  ): HourlyIrradiance[] {
    const hourlyData: HourlyIrradiance[] = [];
    let totalCalculated = 0;
    
    // Calculate relative irradiance for each hour
    const hourlyRelative: number[] = [];
    
    for (let hour = 0; hour < 24; hour++) {
      const hourDate = new Date(date);
      hourDate.setHours(hour, 30, 0, 0); // Use middle of hour
      
      const solarPos = this.getSolarPosition(latitude, longitude, hourDate);
      
      if (solarPos.elevation > 0) {
        // Simplified irradiance model based on solar elevation
        const airMass = 1 / Math.sin(this.toRadians(solarPos.elevation));
        const clearSkyIrradiance = 1000 * Math.pow(0.7, Math.pow(airMass, 0.678));
        const relativeIrradiance = clearSkyIrradiance * Math.sin(this.toRadians(solarPos.elevation));
        hourlyRelative.push(Math.max(0, relativeIrradiance));
        totalCalculated += relativeIrradiance;
      } else {
        hourlyRelative.push(0);
      }
    }
    
    // Normalize to match daily total
    const scaleFactor = totalCalculated > 0 ? (dailyTotal * 1000) / totalCalculated : 0;
    
    for (let hour = 0; hour < 24; hour++) {
      const ghi = hourlyRelative[hour] * scaleFactor;
      
      hourlyData.push({
        hour,
        ghi: Math.round(ghi),
        dni: Math.round(ghi * 0.8), // Simplified: assume 80% direct
        dhi: Math.round(ghi * 0.2), // Simplified: assume 20% diffuse
        temperature: this.estimateHourlyTemperature(hour, 15) // Default 15°C avg
      });
    }
    
    return hourlyData;
  }
  
  /**
   * Calculate optimal panel tilt for given latitude
   */
  static getOptimalTilt(latitude: number, month?: number): number {
    if (month !== undefined) {
      // Monthly optimization
      const seasonalAdjustment = 15 * Math.cos(this.toRadians((month - 1) * 30));
      return Math.abs(latitude) + seasonalAdjustment;
    } else {
      // Annual optimization
      return Math.abs(latitude);
    }
  }
  
  /**
   * Estimate solar panel output for given conditions
   */
  static estimatePanelOutput(
    irradiance: number,        // W/m²
    panelEfficiency: number,   // 0-1 (e.g., 0.20 for 20%)
    temperature: number,       // °C
    panelArea: number,         // m²
    tempCoeff: number = -0.004 // Temperature coefficient per °C
  ): number {
    const tempLoss = 1 + tempCoeff * (temperature - 25); // STC is 25°C
    const output = (irradiance / 1000) * panelArea * panelEfficiency * tempLoss;
    return Math.max(0, output); // kW
  }
  
  // Helper methods
  private static toRadians(degrees: number): number {
    return degrees * Math.PI / 180;
  }
  
  private static toDegrees(radians: number): number {
    return radians * 180 / Math.PI;
  }
  
  private static normalizeAngle(angle: number): number {
    while (angle < 0) angle += 360;
    while (angle >= 360) angle -= 360;
    return angle;
  }
  
  private static getJulianDay(date: Date): number {
    const a = Math.floor((14 - (date.getMonth() + 1)) / 12);
    const y = date.getFullYear() + 4800 - a;
    const m = (date.getMonth() + 1) + 12 * a - 3;
    
    return date.getDate() + Math.floor((153 * m + 2) / 5) + 365 * y + 
           Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  }
  
  private static getEquationOfTime(n: number): number {
    const L = this.normalizeAngle(280.460 + 0.9856474 * n);
    const g = this.toRadians(this.normalizeAngle(357.528 + 0.9856003 * n));
    const lambda = this.toRadians(L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g));
    
    const alpha = Math.atan2(Math.cos(this.toRadians(23.439)) * Math.sin(lambda), Math.cos(lambda));
    const E = 4 * this.toDegrees(this.toRadians(L) - alpha);
    
    return E;
  }
  
  private static estimateHourlyTemperature(hour: number, avgTemp: number): number {
    // Simple sinusoidal temperature model
    const tempVariation = 8; // ±8°C variation
    const minTempHour = 6; // Minimum temperature at 6 AM
    const phase = this.toRadians((hour - minTempHour) * 15); // 15° per hour
    return avgTemp + tempVariation * Math.sin(phase);
  }
}