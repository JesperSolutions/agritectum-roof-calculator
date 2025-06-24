/**
 * PVGIS API Integration
 * European Commission's Photovoltaic Geographical Information System
 */

import { PVGISData, MonthlyData } from './solarCalculations';

const PVGIS_BASE_URL = 'https://re.jrc.ec.europa.eu/api/v5_2';

interface PVGISMonthlyResponse {
  inputs: {
    location: {
      latitude: number;
      longitude: number;
      elevation: number;
    };
  };
  outputs: {
    monthly: Array<{
      month: number;
      H_sun: number;      // Global irradiation on horizontal plane (kWh/m²)
      H_dif: number;      // Diffuse irradiation (kWh/m²)
      T2m: number;        // 2-meter air temperature (°C)
      WS10m: number;      // Wind speed at 10m (m/s)
      Int: number;        // Solar irradiation on inclined plane (kWh/m²)
    }>;
    totals: {
      H_year: number;     // Yearly sum of global irradiation (kWh/m²)
      Int_year: number;   // Yearly sum on inclined plane (kWh/m²)
    };
  };
}

interface PVGISPVResponse {
  inputs: {
    location: {
      latitude: number;
      longitude: number;
      elevation: number;
    };
    pv_module: {
      technology: string;
      peak_power: number;
      system_loss: number;
    };
    mounting_system: {
      fixed: {
        slope: {
          value: number;
          optimal: boolean;
        };
        azimuth: {
          value: number;
          optimal: boolean;
        };
      };
    };
  };
  outputs: {
    monthly: Array<{
      month: number;
      E_m: number;        // Monthly energy output (kWh)
      H_sun: number;      // Monthly global irradiation (kWh/m²)
      T2m: number;        // Monthly average temperature (°C)
    }>;
    totals: {
      E_y: number;        // Yearly energy output (kWh)
      H_year: number;     // Yearly irradiation (kWh/m²)
    };
  };
}

export class PVGISApi {
  /**
   * Get detailed solar irradiance data from PVGIS
   */
  static async getSolarIrradianceData(
    latitude: number,
    longitude: number,
    optimalInclination: boolean = true,
    slope?: number,
    azimuth?: number
  ): Promise<PVGISData> {
    try {
      // Build URL parameters
      const params = new URLSearchParams({
        lat: latitude.toFixed(6),
        lon: longitude.toFixed(6),
        outputformat: 'json',
        browser: '1'
      });

      if (optimalInclination) {
        params.append('optimalinclination', '1');
        params.append('optimalangles', '1');
      } else {
        if (slope !== undefined) params.append('angle', slope.toString());
        if (azimuth !== undefined) params.append('aspect', azimuth.toString());
      }

      const response = await fetch(`${PVGIS_BASE_URL}/seriescalc?${params}`);
      
      if (!response.ok) {
        throw new Error(`PVGIS API error: ${response.status} ${response.statusText}`);
      }

      const data: PVGISMonthlyResponse = await response.json();
      
      return this.processPVGISData(data);
    } catch (error) {
      console.error('Error fetching PVGIS data:', error);
      throw new Error('Failed to fetch solar irradiance data. Please try again.');
    }
  }

  /**
   * Get PV system potential from PVGIS
   */
  static async getPVSystemData(
    latitude: number,
    longitude: number,
    peakPower: number = 1, // kWp
    systemLoss: number = 14, // %
    technology: string = 'crystSi',
    optimalAngles: boolean = true,
    slope?: number,
    azimuth?: number
  ): Promise<{
    yearlyOutput: number;
    monthlyOutput: number[];
    performanceRatio: number;
    optimalTilt?: number;
    optimalAzimuth?: number;
  }> {
    try {
      const params = new URLSearchParams({
        lat: latitude.toFixed(6),
        lon: longitude.toFixed(6),
        peakpower: peakPower.toString(),
        loss: systemLoss.toString(),
        pvtechchoice: technology,
        outputformat: 'json',
        browser: '1'
      });

      if (optimalAngles) {
        params.append('optimalinclination', '1');
        params.append('optimalangles', '1');
      } else {
        if (slope !== undefined) params.append('angle', slope.toString());
        if (azimuth !== undefined) params.append('aspect', azimuth.toString());
      }

      const response = await fetch(`${PVGIS_BASE_URL}/PVcalc?${params}`);
      
      if (!response.ok) {
        throw new Error(`PVGIS PV API error: ${response.status} ${response.statusText}`);
      }

      const data: PVGISPVResponse = await response.json();
      
      const monthlyOutput = data.outputs.monthly.map(month => month.E_m);
      const yearlyOutput = data.outputs.totals.E_y;
      const performanceRatio = yearlyOutput / (peakPower * data.outputs.totals.H_year);

      return {
        yearlyOutput,
        monthlyOutput,
        performanceRatio,
        optimalTilt: data.inputs.mounting_system.fixed.slope.optimal ? 
          data.inputs.mounting_system.fixed.slope.value : undefined,
        optimalAzimuth: data.inputs.mounting_system.fixed.azimuth.optimal ? 
          data.inputs.mounting_system.fixed.azimuth.value : undefined
      };
    } catch (error) {
      console.error('Error fetching PVGIS PV data:', error);
      throw new Error('Failed to fetch PV system data. Please try again.');
    }
  }

  /**
   * Get optimal angles for solar panels
   */
  static async getOptimalAngles(
    latitude: number,
    longitude: number
  ): Promise<{ optimalTilt: number; optimalAzimuth: number; yearlyIrradiance: number }> {
    try {
      const data = await this.getSolarIrradianceData(latitude, longitude, true);
      
      return {
        optimalTilt: data.yearly.optimalTilt,
        optimalAzimuth: data.yearly.optimalAzimuth,
        yearlyIrradiance: data.yearly.totalIrradiance
      };
    } catch (error) {
      console.error('Error getting optimal angles:', error);
      // Fallback to simple calculation
      return {
        optimalTilt: Math.abs(latitude),
        optimalAzimuth: 180, // South-facing
        yearlyIrradiance: 1100 // Default estimate
      };
    }
  }

  /**
   * Check if coordinates are within PVGIS coverage area
   */
  static isLocationSupported(latitude: number, longitude: number): boolean {
    // PVGIS covers Europe, Africa, and parts of Asia
    // Europe: roughly 25°N to 75°N, 40°W to 65°E
    // Africa: roughly 40°S to 40°N, 25°W to 60°E
    
    if (latitude >= 25 && latitude <= 75 && longitude >= -40 && longitude <= 65) {
      return true; // Europe and northern regions
    }
    
    if (latitude >= -40 && latitude <= 40 && longitude >= -25 && longitude <= 60) {
      return true; // Africa and surrounding regions
    }
    
    return false;
  }

  /**
   * Process raw PVGIS data into our format
   */
  private static processPVGISData(data: PVGISMonthlyResponse): PVGISData {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    const monthly: MonthlyData[] = data.outputs.monthly.map(month => ({
      month: month.month,
      monthName: monthNames[month.month - 1],
      avgDailyIrradiance: month.H_sun / daysInMonth[month.month - 1],
      avgTemperature: month.T2m,
      optimalTilt: Math.abs(data.inputs.location.latitude), // Simplified
      daysInMonth: daysInMonth[month.month - 1],
      totalIrradiance: month.H_sun
    }));

    // Calculate yearly averages
    const avgTemperature = monthly.reduce((sum, m) => sum + m.avgTemperature, 0) / 12;
    const optimalTilt = Math.abs(data.inputs.location.latitude);

    // Estimate PV potential (simplified)
    const systemEfficiency = 0.15; // 15% system efficiency
    const performanceRatio = 0.75; // 75% performance ratio
    const fixedSystem = data.outputs.totals.H_year * systemEfficiency * performanceRatio * 1000; // kWh/kWp
    
    return {
      location: {
        latitude: data.inputs.location.latitude,
        longitude: data.inputs.location.longitude,
        elevation: data.inputs.location.elevation
      },
      monthly,
      yearly: {
        totalIrradiance: data.outputs.totals.H_year,
        avgTemperature,
        optimalTilt,
        optimalAzimuth: 180 // South-facing default
      },
      pvPotential: {
        fixedSystem,
        trackingSystem: fixedSystem * 1.25, // 25% improvement with tracking
        optimalFixed: fixedSystem * 1.1 // 10% improvement with optimal angles
      }
    };
  }
}

/**
 * Enhanced location data with detailed solar information
 */
export interface EnhancedLocationData {
  lat: number;
  lng: number;
  address: string;
  country: string;
  solarIrradiance: number;
  climateZone: string;
  temperatureRange: {
    min: number;
    max: number;
  };
  pvgisData?: PVGISData;
  pvSystemPotential?: {
    yearlyOutput: number;
    monthlyOutput: number[];
    performanceRatio: number;
    optimalTilt: number;
    optimalAzimuth: number;
  };
  dataSource: 'pvgis' | 'estimated';
  lastUpdated: Date;
}

/**
 * Get enhanced location data with PVGIS integration
 */
export async function getEnhancedLocationData(
  lat: number, 
  lng: number,
  includePVData: boolean = true
): Promise<EnhancedLocationData> {
  // Start with basic location data (from existing function)
  const { getLocationData } = await import('./locationUtils');
  const basicData = await getLocationData(lat, lng);

  const enhancedData: EnhancedLocationData = {
    ...basicData,
    dataSource: 'estimated',
    lastUpdated: new Date()
  };

  // Try to get PVGIS data if location is supported
  if (includePVData && PVGISApi.isLocationSupported(lat, lng)) {
    try {
      console.log('Fetching PVGIS data for location:', lat, lng);
      
      // Get detailed solar irradiance data
      const pvgisData = await PVGISApi.getSolarIrradianceData(lat, lng, true);
      
      // Get PV system potential
      const pvSystemPotential = await PVGISApi.getPVSystemData(lat, lng, 1, 14, 'crystSi', true);
      
      enhancedData.pvgisData = pvgisData;
      enhancedData.pvSystemPotential = pvSystemPotential;
      enhancedData.solarIrradiance = Math.round(pvgisData.yearly.totalIrradiance);
      enhancedData.dataSource = 'pvgis';
      
      console.log('PVGIS data successfully retrieved');
    } catch (error) {
      console.warn('Failed to get PVGIS data, using estimates:', error);
      // Keep estimated data as fallback
    }
  }

  return enhancedData;
}