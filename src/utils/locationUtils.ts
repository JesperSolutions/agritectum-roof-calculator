import { LocationData } from '../types/project';

// Solar irradiance data by country/region (kWh/m²/year)
const SOLAR_IRRADIANCE_DATA: Record<string, number> = {
  'Denmark': 1000,
  'Germany': 1100,
  'Netherlands': 1050,
  'Sweden': 950,
  'Norway': 900,
  'Finland': 850,
  'United Kingdom': 950,
  'France': 1300,
  'Spain': 1700,
  'Italy': 1500,
  'Portugal': 1600,
  'Greece': 1600,
  'Poland': 1000,
  'Czech Republic': 1050,
  'Austria': 1150,
  'Switzerland': 1200,
  'Belgium': 1000,
  'Luxembourg': 1100,
  'Ireland': 900,
  'Iceland': 800,
  // Default for unknown locations
  'default': 1100
};

// Climate zones based on latitude
const getClimateZone = (lat: number): string => {
  const absLat = Math.abs(lat);
  if (absLat >= 60) return 'Subarctic';
  if (absLat >= 50) return 'Continental';
  if (absLat >= 40) return 'Temperate';
  if (absLat >= 30) return 'Subtropical';
  return 'Tropical';
};

// Temperature ranges by climate zone (°C)
const TEMPERATURE_RANGES = {
  'Subarctic': { min: -20, max: 15 },
  'Continental': { min: -10, max: 25 },
  'Temperate': { min: 0, max: 30 },
  'Subtropical': { min: 10, max: 35 },
  'Tropical': { min: 20, max: 40 }
};

export const getLocationData = async (lat: number, lng: number): Promise<LocationData> => {
  try {
    // Use reverse geocoding to get country information
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
    );
    
    if (!response.ok) {
      throw new Error('Geocoding failed');
    }
    
    const data = await response.json();
    const country = data.address?.country || 'Unknown';
    const address = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    
    const climateZone = getClimateZone(lat);
    const solarIrradiance = SOLAR_IRRADIANCE_DATA[country] || SOLAR_IRRADIANCE_DATA['default'];
    
    // Adjust solar irradiance based on latitude (higher latitudes get less solar)
    const latitudeAdjustment = Math.max(0.7, 1 - (Math.abs(lat) - 45) * 0.01);
    const adjustedSolarIrradiance = solarIrradiance * latitudeAdjustment;
    
    return {
      lat,
      lng,
      address,
      country,
      solarIrradiance: Math.round(adjustedSolarIrradiance),
      climateZone,
      temperatureRange: TEMPERATURE_RANGES[climateZone as keyof typeof TEMPERATURE_RANGES] || TEMPERATURE_RANGES['Temperate']
    };
  } catch (error) {
    console.error('Error getting location data:', error);
    
    // Return default data if geocoding fails
    const climateZone = getClimateZone(lat);
    return {
      lat,
      lng,
      address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      country: 'Unknown',
      solarIrradiance: SOLAR_IRRADIANCE_DATA['default'],
      climateZone,
      temperatureRange: TEMPERATURE_RANGES[climateZone as keyof typeof TEMPERATURE_RANGES] || TEMPERATURE_RANGES['Temperate']
    };
  }
};

export const searchLocation = async (query: string): Promise<Array<{lat: number, lng: number, display_name: string}>> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
    );
    
    if (!response.ok) {
      throw new Error('Search failed');
    }
    
    const data = await response.json();
    return data.map((item: any) => ({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      display_name: item.display_name
    }));
  } catch (error) {
    console.error('Error searching location:', error);
    return [];
  }
};