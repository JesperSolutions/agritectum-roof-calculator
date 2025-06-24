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

export interface RoofTypeData {
  co2: number;
  nox: number;
  energy: number;
  lifespan: number;
  maintenance: string;
  color: string;
  materialCost: number;
  laborCost: number;
  totalCost: number;
  installationRate: number;
  description: string;
  category: 'coating' | 'membrane' | 'living' | 'reflective' | 'advanced';
  complexity: 'simple' | 'moderate' | 'complex';
  climateOptimal: string[];
  buildingTypes: string[];
  certifications: string[];
  warranty: number;
  rValue?: number; // Thermal resistance
  sriValue?: number; // Solar Reflectance Index
  permeability?: number; // Water permeability
  fireRating?: string;
  windResistance?: number; // km/h
  features: string[];
  limitations: string[];
  bestFor: string[];
}

// Enhanced ROOF_TYPES with comprehensive specifications
export const ROOF_TYPES: Record<string, RoofTypeData> = {
  "Photocatalytic Coating - Standard": { 
    co2: 1.94, 
    nox: 0.1, 
    energy: 0,
    lifespan: 15, 
    maintenance: 'Reapply every 2 years to maintain NOₓ effect. Annual inspection recommended.', 
    color: '#5C9323',
    materialCost: 3.00,
    laborCost: 0.12,
    totalCost: 3.12,
    installationRate: 500,
    description: 'Standard photocatalytic coating with NOₓ reduction properties',
    category: 'coating',
    complexity: 'simple',
    climateOptimal: ['Continental', 'Temperate'],
    buildingTypes: ['Commercial', 'Industrial', 'Residential'],
    certifications: ['ISO 22197-1', 'ASTM D7343'],
    warranty: 5,
    features: [
      'Air pollution reduction',
      'Self-cleaning properties',
      'UV resistance',
      'Easy application'
    ],
    limitations: [
      'Requires UV light activation',
      'Performance decreases over time',
      'Not suitable for shaded areas'
    ],
    bestFor: [
      'Urban environments',
      'High pollution areas',
      'Large flat surfaces'
    ]
  },
  "Photocatalytic Coating - Premium": { 
    co2: 2.8, 
    nox: 0.15, 
    energy: 2.0,
    lifespan: 20, 
    maintenance: 'Reapply every 3 years. Self-monitoring system included.', 
    color: '#4A7C1A',
    materialCost: 8.50,
    laborCost: 1.20,
    totalCost: 9.70,
    installationRate: 300,
    description: 'Advanced photocatalytic coating with enhanced performance and longevity',
    category: 'coating',
    complexity: 'moderate',
    climateOptimal: ['Continental', 'Temperate', 'Subtropical'],
    buildingTypes: ['Commercial', 'Industrial', 'Healthcare', 'Educational'],
    certifications: ['ISO 22197-1', 'ASTM D7343', 'GREENGUARD Gold'],
    warranty: 10,
    rValue: 0.5,
    features: [
      'Enhanced NOₓ reduction (50% more)',
      'Thermal regulation properties',
      'Smart monitoring integration',
      'Extended durability'
    ],
    limitations: [
      'Higher initial cost',
      'Requires professional application',
      'Longer curing time'
    ],
    bestFor: [
      'Premium commercial buildings',
      'Healthcare facilities',
      'High-performance requirements'
    ]
  },
  "Cool Roof Coating - Standard": { 
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
    description: 'High-performance reflective coating with excellent energy savings',
    category: 'reflective',
    complexity: 'moderate',
    climateOptimal: ['Temperate', 'Subtropical', 'Continental'],
    buildingTypes: ['Commercial', 'Industrial', 'Residential'],
    certifications: ['ENERGY STAR', 'CRRC Rated'],
    warranty: 15,
    sriValue: 97,
    rValue: 1.2,
    features: [
      'High solar reflectance (85%+)',
      'Thermal emittance (90%+)',
      'Energy cost reduction',
      'UV protection'
    ],
    limitations: [
      'Performance affected by dirt accumulation',
      'Color options limited',
      'Requires proper surface preparation'
    ],
    bestFor: [
      'Hot climates',
      'Large commercial buildings',
      'Energy cost reduction focus'
    ]
  },
  "Cool Roof Coating - Premium": { 
    co2: 9.2, 
    nox: 0.03, 
    energy: 12.8,
    lifespan: 25, 
    maintenance: 'Self-cleaning properties reduce maintenance. Inspect every 3 years.', 
    color: '#7C3AED',
    materialCost: 78.50,
    laborCost: 12.80,
    totalCost: 91.30,
    installationRate: 5,
    description: 'Premium cool roof system with self-cleaning and enhanced performance',
    category: 'reflective',
    complexity: 'moderate',
    climateOptimal: ['Temperate', 'Subtropical', 'Tropical'],
    buildingTypes: ['Premium Commercial', 'Data Centers', 'Healthcare'],
    certifications: ['ENERGY STAR', 'CRRC Rated', 'LEED Compliant'],
    warranty: 20,
    sriValue: 105,
    rValue: 1.8,
    features: [
      'Self-cleaning nanotechnology',
      'Superior reflectance (90%+)',
      'Enhanced durability',
      'Antimicrobial properties'
    ],
    limitations: [
      'Higher investment cost',
      'Specialized application required',
      'Limited color options'
    ],
    bestFor: [
      'Premium facilities',
      'Maximum energy efficiency',
      'Low maintenance requirements'
    ]
  },
  "Green Roof - Extensive": {
    co2: 2.1,
    nox: 0.05,
    energy: 1.5,
    lifespan: 40,
    maintenance: 'Trim plants yearly, check drainage twice annually. Irrigation system maintenance.',
    color: '#34D399',
    materialCost: 38.50,
    laborCost: 6.50,
    totalCost: 45.00,
    installationRate: 12,
    description: 'Lightweight green roof system with sedum and drought-resistant plants',
    category: 'living',
    complexity: 'moderate',
    climateOptimal: ['Continental', 'Temperate'],
    buildingTypes: ['Commercial', 'Residential', 'Industrial'],
    certifications: ['FLL Guidelines', 'ASTM E2777'],
    warranty: 25,
    rValue: 8.0,
    permeability: 0.1,
    features: [
      'Biodiversity enhancement',
      'Stormwater management',
      'Excellent insulation',
      'Urban heat island reduction'
    ],
    limitations: [
      'Structural load requirements',
      'Irrigation needs in dry periods',
      'Plant establishment time'
    ],
    bestFor: [
      'Sustainability goals',
      'Stormwater management',
      'Biodiversity requirements'
    ]
  },
  "Green Roof - Intensive": {
    co2: 4.2,
    nox: 0.08,
    energy: 3.8,
    lifespan: 50,
    maintenance: 'Professional landscaping required. Monthly maintenance visits.',
    color: '#10B981',
    materialCost: 125.00,
    laborCost: 35.00,
    totalCost: 160.00,
    installationRate: 3,
    description: 'Full garden system with diverse plants, trees, and recreational space',
    category: 'living',
    complexity: 'complex',
    climateOptimal: ['Continental', 'Temperate', 'Subtropical'],
    buildingTypes: ['Premium Commercial', 'Residential', 'Mixed-Use'],
    certifications: ['FLL Guidelines', 'ASTM E2777', 'LEED Compliant'],
    warranty: 30,
    rValue: 15.0,
    permeability: 0.05,
    features: [
      'Maximum biodiversity',
      'Recreational space',
      'Superior insulation',
      'Food production potential'
    ],
    limitations: [
      'High structural requirements',
      'Significant maintenance needs',
      'Higher water consumption'
    ],
    bestFor: [
      'Premium developments',
      'Community spaces',
      'Maximum environmental impact'
    ]
  },
  "TPO Membrane - Standard": {
    co2: 1.2,
    nox: 0.01,
    energy: 4.2,
    lifespan: 25,
    maintenance: 'Annual inspection, seam checks every 5 years.',
    color: '#6B7280',
    materialCost: 28.50,
    laborCost: 12.00,
    totalCost: 40.50,
    installationRate: 15,
    description: 'Thermoplastic polyolefin single-ply membrane roofing system',
    category: 'membrane',
    complexity: 'moderate',
    climateOptimal: ['Continental', 'Temperate', 'Subtropical'],
    buildingTypes: ['Commercial', 'Industrial', 'Institutional'],
    certifications: ['ASTM D6878', 'UL Listed', 'FM Approved'],
    warranty: 20,
    rValue: 2.5,
    windResistance: 200,
    fireRating: 'Class A',
    features: [
      'Heat-weldable seams',
      'Chemical resistance',
      'UV stability',
      'Energy efficient'
    ],
    limitations: [
      'Puncture susceptible',
      'Professional installation required',
      'Limited color options'
    ],
    bestFor: [
      'Commercial flat roofs',
      'Chemical exposure areas',
      'Long-term durability'
    ]
  },
  "EPDM Membrane - Premium": {
    co2: 0.8,
    nox: 0.005,
    energy: 2.8,
    lifespan: 30,
    maintenance: 'Minimal maintenance. Inspect annually for punctures.',
    color: '#374151',
    materialCost: 35.00,
    laborCost: 15.50,
    totalCost: 50.50,
    installationRate: 12,
    description: 'Premium EPDM rubber membrane with enhanced durability',
    category: 'membrane',
    complexity: 'moderate',
    climateOptimal: ['Continental', 'Temperate', 'Subarctic'],
    buildingTypes: ['Commercial', 'Industrial', 'Residential'],
    certifications: ['ASTM D4637', 'UL Listed', 'ENERGY STAR'],
    warranty: 25,
    rValue: 3.2,
    windResistance: 250,
    fireRating: 'Class A',
    features: [
      'Excellent weather resistance',
      'Flexible in cold temperatures',
      'Ozone resistant',
      'Low maintenance'
    ],
    limitations: [
      'Dark color absorbs heat',
      'Seaming requires expertise',
      'Can be punctured'
    ],
    bestFor: [
      'Extreme weather conditions',
      'Low maintenance requirements',
      'Cold climate applications'
    ]
  },
  "Solar Reflective Shingles": {
    co2: 3.8,
    nox: 0.02,
    energy: 6.5,
    lifespan: 30,
    maintenance: 'Standard shingle maintenance. Clean gutters seasonally.',
    color: '#94A3B8',
    materialCost: 45.00,
    laborCost: 18.00,
    totalCost: 63.00,
    installationRate: 8,
    description: 'Energy-efficient shingles with solar reflective granules',
    category: 'reflective',
    complexity: 'moderate',
    climateOptimal: ['Continental', 'Temperate', 'Subtropical'],
    buildingTypes: ['Residential', 'Small Commercial'],
    certifications: ['ENERGY STAR', 'CRRC Rated'],
    warranty: 25,
    sriValue: 78,
    rValue: 2.8,
    windResistance: 180,
    fireRating: 'Class A',
    features: [
      'Traditional appearance',
      'Energy savings',
      'Storm resistance',
      'Multiple color options'
    ],
    limitations: [
      'Slope requirements',
      'Higher cost than standard shingles',
      'Installation complexity'
    ],
    bestFor: [
      'Residential applications',
      'Aesthetic requirements',
      'Sloped roof applications'
    ]
  },
  "Liquid Applied Membrane": {
    co2: 1.5,
    nox: 0.01,
    energy: 3.2,
    lifespan: 20,
    maintenance: 'Recoat every 10-15 years. Annual inspection recommended.',
    color: '#64748B',
    materialCost: 32.00,
    laborCost: 8.50,
    totalCost: 40.50,
    installationRate: 25,
    description: 'Seamless liquid-applied waterproofing membrane system',
    category: 'coating',
    complexity: 'simple',
    climateOptimal: ['Continental', 'Temperate', 'Subtropical'],
    buildingTypes: ['Commercial', 'Industrial', 'Residential'],
    certifications: ['ASTM C836', 'ASTM C957'],
    warranty: 15,
    rValue: 1.5,
    permeability: 0.02,
    features: [
      'Seamless application',
      'Complex shape adaptability',
      'Self-flashing',
      'Quick installation'
    ],
    limitations: [
      'Weather dependent application',
      'Thickness control critical',
      'UV protection needed'
    ],
    bestFor: [
      'Complex roof shapes',
      'Quick installation needs',
      'Retrofit applications'
    ]
  }
} as const;

// Roof type categories for better organization
export const ROOF_CATEGORIES = {
  coating: {
    name: 'Protective Coatings',
    description: 'Applied coatings that enhance roof performance',
    icon: '🎨'
  },
  membrane: {
    name: 'Membrane Systems',
    description: 'Single-ply and multi-ply membrane roofing',
    icon: '🛡️'
  },
  living: {
    name: 'Living Roof Systems',
    description: 'Green roofs with vegetation and growing medium',
    icon: '🌱'
  },
  reflective: {
    name: 'Reflective Systems',
    description: 'High-performance reflective and cool roof solutions',
    icon: '☀️'
  },
  advanced: {
    name: 'Advanced Technologies',
    description: 'Cutting-edge roofing technologies and smart systems',
    icon: '🚀'
  }
} as const;