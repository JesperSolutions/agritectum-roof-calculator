// Location utilities for the roof calculator
export interface LocationData {
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
}

// Search for locations using Nominatim (OpenStreetMap)
export const searchLocation = async (query: string): Promise<Array<{lat: number, lng: number, display_name: string}>> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
    );
    
    if (!response.ok) {
      throw new Error('Search request failed');
    }
    
    const data = await response.json();
    
    return data.map((item: any) => ({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      display_name: item.display_name
    }));
  } catch (error) {
    console.error('Location search error:', error);
    return [];
  }
};

// Get detailed location data including solar irradiance
export const getLocationData = async (lat: number, lng: number): Promise<LocationData> => {
  try {
    // Get address from coordinates using reverse geocoding
    const geocodeResponse = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
    );
    
    if (!geocodeResponse.ok) {
      throw new Error('Reverse geocoding failed');
    }
    
    const geocodeData = await geocodeResponse.json();
    
    // Extract country and address
    const address = geocodeData.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    const country = geocodeData.address?.country || 'Unknown';
    
    // Estimate solar irradiance based on latitude (simplified model)
    // This is a rough approximation - in production, you'd use a proper solar API
    const solarIrradiance = calculateSolarIrradiance(lat);
    
    // Determine climate zone based on latitude
    const climateZone = getClimateZone(lat);
    
    // Estimate temperature range based on latitude and climate zone
    const temperatureRange = getTemperatureRange(lat, climateZone);
    
    return {
      lat,
      lng,
      address,
      country,
      solarIrradiance,
      climateZone,
      temperatureRange
    };
  } catch (error) {
    console.error('Error getting location data:', error);
    
    // Return fallback data
    return {
      lat,
      lng,
      address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      country: 'Unknown',
      solarIrradiance: 1100, // Default value
      climateZone: 'Temperate',
      temperatureRange: { min: 0, max: 25 }
    };
  }
};

// Calculate solar irradiance based on latitude (simplified model)
const calculateSolarIrradiance = (lat: number): number => {
  const absLat = Math.abs(lat);
  
  // Simplified model based on latitude
  // Higher irradiance near equator, lower near poles
  if (absLat < 10) return 1800; // Tropical
  if (absLat < 23.5) return 1600; // Subtropical
  if (absLat < 35) return 1400; // Mediterranean
  if (absLat < 45) return 1200; // Temperate
  if (absLat < 55) return 1000; // Cool temperate
  if (absLat < 65) return 800; // Subarctic
  return 600; // Arctic
};

// Determine climate zone based on latitude
const getClimateZone = (lat: number): string => {
  const absLat = Math.abs(lat);
  
  if (absLat < 10) return 'Tropical';
  if (absLat < 23.5) return 'Subtropical';
  if (absLat < 35) return 'Mediterranean';
  if (absLat < 45) return 'Temperate';
  if (absLat < 55) return 'Continental';
  if (absLat < 65) return 'Subarctic';
  return 'Arctic';
};

// Estimate temperature range based on latitude and climate zone
const getTemperatureRange = (lat: number, climateZone: string): { min: number; max: number } => {
  const absLat = Math.abs(lat);
  
  switch (climateZone) {
    case 'Tropical':
      return { min: 20, max: 35 };
    case 'Subtropical':
      return { min: 15, max: 30 };
    case 'Mediterranean':
      return { min: 10, max: 28 };
    case 'Temperate':
      return { min: 5, max: 25 };
    case 'Continental':
      return { min: -5, max: 22 };
    case 'Subarctic':
      return { min: -15, max: 18 };
    case 'Arctic':
      return { min: -25, max: 10 };
    default:
      return { min: 0, max: 20 };
  }
};