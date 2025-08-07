export interface Project {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  roofSegments: RoofSegment[];
  location?: LocationData;
  notes?: string;
  status: 'draft' | 'calculating' | 'completed' | 'archived';
}

export interface RoofSegment {
  id: string;
  name: string;
  size: number;
  roofType: keyof typeof ROOF_TYPES;
  includeSolar: boolean;
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

export type UserRole = 'esg-expert' | 'roofing-specialist' | 'private-individual' | null;

// Comprehensive roof types with accurate calculations and realistic pricing
export const ROOF_TYPES = {
  "Standard Roofing": { 
    co2: 0, 
    nox: 0, 
    energy: 0,
    lifespan: 20, 
    maintenance: 'Regular maintenance every 5 years', 
    color: '#6B7280',
    materialCost: 0,
    laborCost: 0,
    totalCost: 0,
    installationRate: 100, // m² per hour
    description: 'Standard roofing materials (baseline - no environmental benefits)'
  },
  "Photocatalytic Coating": { 
    co2: 1.94, 
    nox: 0.1, 
    energy: 0,
    lifespan: 15, 
    maintenance: 'Reapply every 2 years to maintain NOₓ effect', 
    color: '#10B981',
    materialCost: 3.00,
    laborCost: 0.12,
    totalCost: 3.12,
    installationRate: 500, // Very fast application
    description: 'Photocatalytic coating that reduces air pollution (NOₓ)'
  },
  "White - Cool Roof Coating": { 
    co2: 6.65, 
    nox: 0.02, 
    energy: 8.5,
    lifespan: 20, 
    maintenance: 'Clean every 2 years, recoat every 15–20 years', 
    color: '#3B82F6',
    materialCost: 46.98,
    laborCost: 8.57,
    totalCost: 55.55,
    installationRate: 7, // Slower due to preparation
    description: 'Reflective coating that reduces cooling costs and CO₂ emissions'
  },
  "Green Roof System": {
    co2: 2.1,
    nox: 0.05,
    energy: 1.5,
    lifespan: 40,
    maintenance: 'Trim plants yearly, check drainage twice annually',
    color: '#059669',
    materialCost: 38.50,
    laborCost: 6.50,
    totalCost: 45.00,
    installationRate: 12, // Complex installation
    description: 'Living roof with plants that improves insulation and air quality'
  },
  "Solar-Ready Membrane": {
    co2: 1.2,
    nox: 0.01,
    energy: 2.0,
    lifespan: 30,
    maintenance: 'Annual inspection, minimal maintenance required',
    color: '#7C3AED',
    materialCost: 25.00,
    laborCost: 5.00,
    totalCost: 30.00,
    installationRate: 15,
    description: 'High-performance membrane optimized for solar panel installation'
  },
  "Social Activities Area": {
    co2: 0.5,
    nox: 0.02,
    energy: 0,
    lifespan: 25,
    maintenance: 'Regular furniture maintenance and plant care',
    color: '#F59E0B',
    materialCost: 60.00,
    laborCost: 4.00,
    totalCost: 64.00,
    installationRate: 5, // Slower due to furniture and plant installation
    description: 'Social relaxation area with furniture and plants for meetings and activities (250m² capacity for 20 people)'
  }
} as const;