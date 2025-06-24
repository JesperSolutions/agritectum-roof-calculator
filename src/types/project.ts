export interface Project {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  roofSize: number;
  roofType: keyof typeof ROOF_TYPES;
  includeSolar: boolean;
  useMetric: boolean;
  location?: {
    lat: number;
    lng: number;
    address: string;
    country: string;
    solarIrradiance: number; // kWh/m²/year
    climateZone: string;
  };
  notes?: string;
  status: 'draft' | 'calculating' | 'completed' | 'archived';
}

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

// Define ROOF_TYPES here to avoid circular dependency
export const ROOF_TYPES = {
  "Photocatalytic Coating": { 
    co2: 1.94, 
    nox: 0.1, 
    energy: 0,
    lifespan: 15, 
    maintenance: 'Reapply every 2 years to maintain NOₓ effect.', 
    color: '#5C9323',
    materialCost: 3.00,
    laborCost: 0.12,
    totalCost: 3.12,
    installationRate: 500,
    description: 'Photocatalytic coating with NOₓ reduction properties'
  },
  "White - Cool Roof Coating": { 
    co2: 6.65, 
    nox: 0.02, 
    energy: 8.5,
    lifespan: 20, 
    maintenance: 'Clean every 2 years, recoat every 15–20 years.', 
    color: '#8B5CF6',
    materialCost: 46.98,
    laborCost: 8.57,
    totalCost: 55.55,
    installationRate: 7,
    description: 'High-performance Triflex coating with SRI 97'
  },
  "Green Roof": {
    co2: 2.1,
    nox: 0.05,
    energy: 1.5,
    lifespan: 40,
    maintenance: 'Trim plants yearly, check drainage twice annually.',
    color: '#34D399',
    materialCost: 38.50,
    laborCost: 6.50,
    totalCost: 45.00,
    installationRate: 12,
    description: 'Extensive green roof system with sedum or grass'
  }
} as const;