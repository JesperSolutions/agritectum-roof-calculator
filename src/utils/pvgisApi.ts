/**
 * PVGIS API Integration
 * European Commission's Photovoltaic Geographical Information System
 */

import { PVGISData, MonthlyData } from './solarCalculations';

// Use proxy path for development, direct URL for production
const PVGIS_BASE_URL = import.meta.env.DEV ? '/api/pvgis' : 'https://re.jrc.ec.europa.eu/api/v5_2';

interface PVGISDailyResponse {
  inputs: {
    location: {
      latitude: number;
      longitude: number;
      elevation: number;
    };
    meteo_data: {
      radiation_db: string;
      meteo_db: string;
      year_min: number;
      year_max: number;
      use_horizon: boolean;
      horizon_db: string;
    };
  };
  outputs: {
    daily_profile: Array<{
      month: number;
      day: number;
      H_sun: number;      // Global irradiation on horizontal plane (Wh/m²)
      T2m: number;        // 2-meter air temperature (°C)
      WS10m: number;      // Wind speed at 10m (m/s)
      Int: number;        // Solar irradiation on inclined plane (Wh/m²)
    }>;
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
      // Validate coordinates
      if (!this.isValidCoordinate(latitude, longitude)) {
        throw new Error(`Invalid coordinates: lat=${latitude}, lon=${longitude}`);
      }

      // Build URL parameters for daily radiation data
      const params = new URLSearchParams({
        lat: latitude.toFixed(6),
        lon: longitude.toFixed(6),
        outputformat: 'json',
        browser: '1',
        dailyrad: '1'  // Request daily radiation data
      });

      if (optimalInclination) {
        params.append('optimalinclination', '1');
        params.append('optimalangles', '1');
      } else {
        if (slope !== undefined) params.append('angle', slope.toString());
        if (azimuth !== undefined) params.append('aspect', azimuth.toString());
      }

      const url = `${PVGIS_BASE_URL}/seriescalc?${params}`;
      console.log('Fetching PVGIS data from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; Solar Calculator App)',
        },
        // Add timeout and other fetch options for better error handling
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('PVGIS API HTTP error:', {
          status: response.status,
          statusText: response.statusText,
          url,
          response: errorText
        });
        throw new Error(`PVGIS API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Raw PVGIS response:', data);
      
      const processed = this.processPVGISData(data);
      
      if (!processed) {
        throw new Error("Failed to process PVGIS data - invalid response structure");
      }
      
      return processed;
    } catch (error) {
      // Enhanced error logging with more specific error information
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('Network error fetching PVGIS data:', {
          message: error.message,
          latitude,
          longitude,
          url: `${PVGIS_BASE_URL}/seriescalc`,
          error: error
        });
        throw new Error('Network connection failed. Please check your internet connection and try again. The PVGIS service may also be temporarily unavailable.');
      } else if (error instanceof DOMException && error.name === 'AbortError') {
        console.error('PVGIS request timeout:', error);
        throw new Error('Request timed out. The PVGIS service is taking too long to respond. Please try again.');
      } else if (error instanceof Error) {
        console.error('Error fetching PVGIS data:', {
          message: error.message,
          stack: error.stack,
          latitude,
          longitude
        });
        throw new Error(`Failed to fetch solar irradiance data: ${error.message}`);
      } else {
        console.error('Unknown error fetching PVGIS data:', error);
        throw new Error('An unexpected error occurred while fetching solar data. Please try again.');
      }
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
      // Validate coordinates
      if (!this.isValidCoordinate(latitude, longitude)) {
        throw new Error(`Invalid coordinates: lat=${latitude}, lon=${longitude}`);
      }

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

      const url = `${PVGIS_BASE_URL}/PVcalc?${params}`;
      console.log('Fetching PVGIS PV data from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; Solar Calculator App)',
        },
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('PVGIS PV API HTTP error:', {
          status: response.status,
          statusText: response.statusText,
          url,
          response: errorText
        });
        throw new Error(`PVGIS PV API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Raw PVGIS PV response:', data);
      
      // Defensive checks for PV data
      if (!data || !data.outputs) {
        console.error("Invalid PVGIS PV response - missing outputs:", data);
        throw new Error("Invalid PVGIS PV response structure");
      }

      if (!data.outputs.monthly || !Array.isArray(data.outputs.monthly)) {
        console.error("Invalid PVGIS PV response - missing monthly data:", data.outputs);
        throw new Error("Missing monthly data in PVGIS PV response");
      }

      if (!data.outputs.totals) {
        console.error("Invalid PVGIS PV response - missing totals:", data.outputs);
        throw new Error("Missing totals data in PVGIS PV response");
      }
      
      const monthlyOutput = data.outputs.monthly.map((month: any) => month.E_m || 0);
      const yearlyOutput = data.outputs.totals.E_y || 0;
      const yearlyIrradiance = data.outputs.totals.H_year || 1000; // Fallback
      const performanceRatio = yearlyOutput / (peakPower * yearlyIrradiance);

      return {
        yearlyOutput,
        monthlyOutput,
        performanceRatio: Math.max(0, Math.min(1, performanceRatio)), // Clamp between 0-1
        optimalTilt: data.inputs?.mounting_system?.fixed?.slope?.optimal ? 
          data.inputs.mounting_system.fixed.slope.value : undefined,
        optimalAzimuth: data.inputs?.mounting_system?.fixed?.azimuth?.optimal ? 
          data.inputs.mounting_system.fixed.azimuth.value : undefined
      };
    } catch (error) {
      // Enhanced error logging for PV data
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('Network error fetching PVGIS PV data:', {
          message: error.message,
          latitude,
          longitude,
          error: error
        });
        throw new Error('Network connection failed while fetching PV system data. Please check your internet connection and try again.');
      } else if (error instanceof DOMException && error.name === 'AbortError') {
        console.error('PVGIS PV request timeout:', error);
        throw new Error('PV data request timed out. Please try again.');
      } else if (error instanceof Error) {
        console.error('Error fetching PVGIS PV data:', {
          message: error.message,
          stack: error.stack,
          latitude,
          longitude
        });
        throw new Error(`Failed to fetch PV system data: ${error.message}`);
      } else {
        console.error('Unknown error fetching PVGIS PV data:', error);
        throw new Error('An unexpected error occurred while fetching PV system data. Please try again.');
      }
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
   * Validate coordinates
   */
  private static isValidCoordinate(latitude: number, longitude: number): boolean {
    return !isNaN(latitude) && !isNaN(longitude) &&
           latitude >= -90 && latitude <= 90 &&
           longitude >= -180 && longitude <= 180;
  }

  /**
   * Process raw PVGIS daily data into monthly aggregated format with robust error handling
   */
  private static processPVGISData(response: any): PVGISData | null {
    try {
      // Defensive checks for response structure
      if (!response) {
        console.error("PVGIS response is null or undefined");
        return null;
      }

      if (!response.inputs) {
        console.error("Invalid PVGIS response - missing inputs:", response);
        return null;
      }

      if (!response.inputs.location) {
        console.error("Invalid PVGIS response - missing location:", response.inputs);
        return null;
      }

      if (!response.outputs) {
        console.error("Invalid PVGIS response - missing outputs:", response);
        return null;
      }

      if (!response.outputs.daily_profile || !Array.isArray(response.outputs.daily_profile)) {
        console.error("Invalid PVGIS response - missing or invalid daily_profile:", response.outputs);
        return null;
      }

      if (response.outputs.daily_profile.length === 0) {
        console.error("PVGIS response contains empty daily_profile array");
        return null;
      }

      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];

      const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

      // Aggregate daily data into monthly averages
      const monthlyAggregates: { [month: number]: { 
        H_sun: number[], 
        T2m: number[], 
        Int: number[] 
      } } = {};

      // Initialize monthly aggregates
      for (let i = 1; i <= 12; i++) {
        monthlyAggregates[i] = { H_sun: [], T2m: [], Int: [] };
      }

      // Group daily data by month with validation
      response.outputs.daily_profile.forEach((day: any) => {
        // Validate day object
        if (!day || typeof day.month !== 'number' || day.month < 1 || day.month > 12) {
          console.warn("Invalid day object in daily_profile:", day);
          return;
        }

        // Validate required fields with fallbacks
        const H_sun = typeof day.H_sun === 'number' ? day.H_sun : 0;
        const T2m = typeof day.T2m === 'number' ? day.T2m : 15; // Default temperature
        const Int = typeof day.Int === 'number' ? day.Int : H_sun; // Fallback to H_sun

        monthlyAggregates[day.month].H_sun.push(H_sun / 1000); // Convert Wh/m² to kWh/m²
        monthlyAggregates[day.month].T2m.push(T2m);
        monthlyAggregates[day.month].Int.push(Int / 1000); // Convert Wh/m² to kWh/m²
      });

      // Calculate monthly averages
      const monthly: MonthlyData[] = [];
      let yearlyTotalIrradiance = 0;
      let yearlyAvgTemperature = 0;

      for (let month = 1; month <= 12; month++) {
        const monthData = monthlyAggregates[month];
        
        const avgDailyIrradiance = monthData.H_sun.length > 0 
          ? monthData.H_sun.reduce((sum, val) => sum + val, 0) / monthData.H_sun.length
          : 3.0; // Default daily irradiance (kWh/m²/day)
        
        const avgTemperature = monthData.T2m.length > 0
          ? monthData.T2m.reduce((sum, val) => sum + val, 0) / monthData.T2m.length
          : 15; // Default temperature
        
        const totalIrradiance = avgDailyIrradiance * daysInMonth[month - 1];
        
        monthly.push({
          month,
          monthName: monthNames[month - 1],
          avgDailyIrradiance,
          avgTemperature,
          optimalTilt: Math.abs(response.inputs.location.latitude || 45),
          daysInMonth: daysInMonth[month - 1],
          totalIrradiance
        });

        yearlyTotalIrradiance += totalIrradiance;
        yearlyAvgTemperature += avgTemperature;
      }

      yearlyAvgTemperature /= 12;

      // Calculate PV potential (simplified) with validation
      const systemEfficiency = 0.15; // 15% system efficiency
      const performanceRatio = 0.75; // 75% performance ratio
      const fixedSystem = yearlyTotalIrradiance * systemEfficiency * performanceRatio * 1000; // kWh/kWp
      
      const result: PVGISData = {
        location: {
          latitude: response.inputs.location.latitude || 0,
          longitude: response.inputs.location.longitude || 0,
          elevation: response.inputs.location.elevation || 0
        },
        monthly,
        yearly: {
          totalIrradiance: yearlyTotalIrradiance,
          avgTemperature: yearlyAvgTemperature,
          optimalTilt: Math.abs(response.inputs.location.latitude || 45),
          optimalAzimuth: 180 // South-facing default
        },
        pvPotential: {
          fixedSystem: Math.max(500, fixedSystem), // Minimum 500 kWh/kWp/year
          trackingSystem: Math.max(625, fixedSystem * 1.25), // 25% improvement with tracking
          optimalFixed: Math.max(550, fixedSystem * 1.1) // 10% improvement with optimal angles
        }
      };

      console.log('Successfully processed PVGIS data:', result);
      return result;

    } catch (error) {
      console.error('Error processing PVGIS data:', error, 'Raw response:', response);
      return null;
    }
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