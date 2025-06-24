import React, { useState, useEffect } from 'react';
import { Leaf, Zap, Wind, Sun, Calculator, TrendingUp, AlertTriangle, CheckCircle, Info, BarChart3, PieChart, Target, Settings, Droplets, Thermometer, Shield, Award, Clock, DollarSign, Activity, Layers, MapPin, Calendar, Download, Share2, RefreshCw, Maximize2, Eye, EyeOff, Save } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, PieChart as RechartsPieChart, Cell, BarChart, Bar, Pie, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart } from 'recharts';
import HelpTooltip from './HelpTooltip';

interface RoofElement {
  id: string;
  name: string;
  percentage: number;
  color: string;
  co2PerM2PerYear: number;
  energyPerM2PerYear: number;
  noxPerM2PerYear: number;
  initialCo2PerM2: number;
  costPerM2: number;
  lifespan: number;
  maintenancePerM2PerYear: number;
  description: string;
  synergies: string[];
  conflicts: string[];
  // Enhanced properties
  thermalPerformance: number; // R-value or thermal resistance
  stormwaterRetention: number; // Percentage of rainfall retained
  noiseReduction: number; // Decibel reduction
  fireResistance: 'low' | 'medium' | 'high';
  windResistance: number; // Wind speed resistance in km/h
  installationComplexity: 'simple' | 'moderate' | 'complex';
  weatherDependency: 'low' | 'medium' | 'high';
  structuralRequirements: {
    additionalLoad: number; // kg/m²
    reinforcementNeeded: boolean;
    accessRequirements: string[];
  };
  environmentalBenefits: {
    biodiversityScore: number; // 0-100
    airPurification: number; // m³ air cleaned per m² per day
    carbonSequestration: number; // kg CO2 stored per m² (for green roofs)
    heatIslandReduction: number; // Temperature reduction in °C
  };
  seasonalVariation: {
    spring: number;
    summer: number;
    autumn: number;
    winter: number;
  };
}

interface EnvironmentalData {
  year: number;
  cumulativeCo2Offset: number;
  netCo2Impact: number;
  annualEnergyGeneration: number;
  annualNoxReduction: number;
  solarGeneration: number;
  greenRoofBenefits: number;
  coolRoofSavings: number;
  noxTreatment: number;
  totalBenefits: number;
  maintenanceCosts: number;
  // Enhanced metrics
  stormwaterManaged: number;
  temperatureReduction: number;
  noiseReduction: number;
  biodiversityIndex: number;
  airQualityImprovement: number;
  structuralStress: number;
  weatherRiskFactor: number;
}

interface WeatherImpact {
  temperature: number;
  rainfall: number;
  windSpeed: number;
  solarHours: number;
  humidity: number;
}

interface RiskAssessment {
  category: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  impact: string;
  mitigation: string[];
  cost: number;
}

interface CustomRoofDesignerProps {
  roofSize: number;
  location?: {
    solarIrradiance: number;
    climateZone: string;
    temperatureRange: { min: number; max: number };
  };
}

// CORRECTED ROOF ELEMENTS with realistic industry-standard costs and specifications
const ENHANCED_ROOF_ELEMENTS: RoofElement[] = [
  {
    id: 'solar',
    name: 'Solar Panels',
    percentage: 0,
    color: '#f59e0b',
    co2PerM2PerYear: 80, // Realistic CO2 offset from solar generation
    energyPerM2PerYear: 180, // Adjusted to realistic 180 kWh/m²/year for residential panels
    noxPerM2PerYear: 0,
    initialCo2PerM2: 45, // Manufacturing footprint
    costPerM2: 180, // Realistic cost including panels, inverters, installation (€150-220/m²)
    lifespan: 25,
    maintenancePerM2PerYear: 3, // Realistic maintenance cost
    description: 'Photovoltaic panels generating clean electricity',
    synergies: ['Enhanced cooling from white roof underneath', 'Optimal performance with proper ventilation'],
    conflicts: ['Shading affects other elements', 'Requires structural reinforcement'],
    thermalPerformance: 0.5,
    stormwaterRetention: 0,
    noiseReduction: 2,
    fireResistance: 'medium',
    windResistance: 150,
    installationComplexity: 'moderate',
    weatherDependency: 'high',
    structuralRequirements: {
      additionalLoad: 20, // Realistic load for modern panels
      reinforcementNeeded: true,
      accessRequirements: ['Electrical access', 'Crane access', 'Safety anchors']
    },
    environmentalBenefits: {
      biodiversityScore: 5,
      airPurification: 0,
      carbonSequestration: 0,
      heatIslandReduction: 1
    },
    seasonalVariation: {
      spring: 0.8,
      summer: 1.2,
      autumn: 0.7,
      winter: 0.3
    }
  },
  {
    id: 'green',
    name: 'Green Roof',
    percentage: 0,
    color: '#10b981',
    co2PerM2PerYear: 2.1, // Realistic CO2 sequestration
    energyPerM2PerYear: 15, // Energy savings from insulation
    noxPerM2PerYear: 0.05,
    initialCo2PerM2: 8,
    costPerM2: 85, // Realistic extensive green roof cost (€70-120/m²)
    lifespan: 40,
    maintenancePerM2PerYear: 4, // Higher maintenance for green systems
    description: 'Living vegetation providing insulation and biodiversity',
    synergies: ['Natural cooling enhances solar efficiency', 'Excellent stormwater management'],
    conflicts: ['High structural load', 'Complex maintenance requirements'],
    thermalPerformance: 3.5,
    stormwaterRetention: 85,
    noiseReduction: 15,
    fireResistance: 'low',
    windResistance: 120,
    installationComplexity: 'complex',
    weatherDependency: 'medium',
    structuralRequirements: {
      additionalLoad: 120, // Realistic load for extensive green roof
      reinforcementNeeded: true,
      accessRequirements: ['Drainage systems', 'Irrigation access', 'Maintenance walkways']
    },
    environmentalBenefits: {
      biodiversityScore: 95,
      airPurification: 50,
      carbonSequestration: 5,
      heatIslandReduction: 8
    },
    seasonalVariation: {
      spring: 1.2,
      summer: 1.0,
      autumn: 0.8,
      winter: 0.6
    }
  },
  {
    id: 'white',
    name: 'White Cool Roof',
    percentage: 0,
    color: '#6b7280',
    co2PerM2PerYear: 6.65, // From energy savings
    energyPerM2PerYear: 25, // Realistic cooling energy savings
    noxPerM2PerYear: 0.02,
    initialCo2PerM2: 3,
    costPerM2: 35, // Realistic cool roof coating cost (€25-45/m²)
    lifespan: 20,
    maintenancePerM2PerYear: 1.5,
    description: 'Highly reflective coating reducing heat absorption',
    synergies: ['Excellent base for other elements', 'Enhances NOx treatment'],
    conflicts: ['Potential glare issues', 'Requires regular cleaning'],
    thermalPerformance: 2.0,
    stormwaterRetention: 10,
    noiseReduction: 3,
    fireResistance: 'high',
    windResistance: 180,
    installationComplexity: 'simple',
    weatherDependency: 'low',
    structuralRequirements: {
      additionalLoad: 2,
      reinforcementNeeded: false,
      accessRequirements: ['Surface preparation', 'Weather protection']
    },
    environmentalBenefits: {
      biodiversityScore: 10,
      airPurification: 5,
      carbonSequestration: 0,
      heatIslandReduction: 12
    },
    seasonalVariation: {
      spring: 0.9,
      summer: 1.3,
      autumn: 1.0,
      winter: 0.8
    }
  },
  {
    id: 'nox',
    name: 'NOx Treatment',
    percentage: 0,
    color: '#8b5cf6',
    co2PerM2PerYear: 1.94,
    energyPerM2PerYear: 0,
    noxPerM2PerYear: 0.1,
    initialCo2PerM2: 2,
    costPerM2: 18, // Realistic photocatalytic coating cost (€15-25/m²)
    lifespan: 15,
    maintenancePerM2PerYear: 0.8, // Slightly higher for reapplication
    description: 'Photocatalytic coating breaking down air pollutants',
    synergies: ['Works excellently with white roof base', 'Enhanced by UV exposure'],
    conflicts: ['Reduced effectiveness in shade', 'Requires UV activation'],
    thermalPerformance: 0.1,
    stormwaterRetention: 5,
    noiseReduction: 1,
    fireResistance: 'medium',
    windResistance: 160,
    installationComplexity: 'simple',
    weatherDependency: 'medium',
    structuralRequirements: {
      additionalLoad: 1,
      reinforcementNeeded: false,
      accessRequirements: ['Surface preparation', 'UV exposure verification']
    },
    environmentalBenefits: {
      biodiversityScore: 15,
      airPurification: 80,
      carbonSequestration: 0,
      heatIslandReduction: 2
    },
    seasonalVariation: {
      spring: 1.0,
      summer: 1.2,
      autumn: 0.9,
      winter: 0.6
    }
  }
];

const WEATHER_SCENARIOS = {
  mild: { temperature: 15, rainfall: 600, windSpeed: 20, solarHours: 1400, humidity: 70 },
  moderate: { temperature: 20, rainfall: 800, windSpeed: 30, solarHours: 1600, humidity: 65 },
  harsh: { temperature: 25, rainfall: 1200, windSpeed: 50, solarHours: 1800, humidity: 80 }
};

export default function CustomRoofDesigner({ roofSize, location }: CustomRoofDesignerProps) {
  const [roofElements, setRoofElements] = useState<RoofElement[]>(ENHANCED_ROOF_ELEMENTS);
  const [environmentalData, setEnvironmentalData] = useState<EnvironmentalData[]>([]);
  const [breakEvenYear, setBreakEvenYear] = useState<number | null>(null);
  const [totalCoverage, setTotalCoverage] = useState(0);
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [synergies, setSynergies] = useState<string[]>([]);
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);
  const [weatherScenario, setWeatherScenario] = useState<keyof typeof WEATHER_SCENARIOS>('moderate');
  const [activeView, setActiveView] = useState<'design' | 'analysis' | 'timeline' | 'breakdown' | 'environmental' | 'risk' | 'optimization'>('design');
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [savedConfigurations, setSavedConfigurations] = useState<any[]>([]);

  useEffect(() => {
    const total = roofElements.reduce((sum, element) => sum + element.percentage, 0);
    setTotalCoverage(total);
    
    if (total === 100) {
      calculateEnhancedEnvironmentalImpact();
      analyzeInteractions();
      performRiskAssessment();
    }
  }, [roofElements, roofSize, location, weatherScenario]);

  const updateElementPercentage = (id: string, percentage: number) => {
    setRoofElements(prev => prev.map(element => 
      element.id === id ? { ...element, percentage } : element
    ));
  };

  const calculateEnhancedEnvironmentalImpact = () => {
    const data: EnvironmentalData[] = [];
    let cumulativeCo2Offset = 0;
    
    const initialCo2Impact = roofElements.reduce((sum, element) => 
      sum + (element.percentage / 100) * roofSize * element.initialCo2PerM2, 0
    );

    const weather = WEATHER_SCENARIOS[weatherScenario];

    for (let year = 0; year <= 50; year++) {
      const seasonalMultiplier = getCurrentSeasonalMultiplier(year);
      const weatherImpactFactor = calculateWeatherImpact(weather, year);
      
      // Enhanced calculations with weather and seasonal factors
      const solarGeneration = calculateEnhancedSolarBenefits(year, seasonalMultiplier, weatherImpactFactor);
      const greenRoofBenefits = calculateEnhancedGreenRoofBenefits(year, seasonalMultiplier, weatherImpactFactor);
      const coolRoofSavings = calculateEnhancedCoolRoofBenefits(year, seasonalMultiplier, weatherImpactFactor);
      const noxTreatment = calculateEnhancedNoxBenefits(year, seasonalMultiplier, weatherImpactFactor);

      // Environmental metrics
      const stormwaterManaged = calculateStormwaterManagement();
      const temperatureReduction = calculateTemperatureReduction();
      const noiseReduction = calculateNoiseReduction();
      const biodiversityIndex = calculateBiodiversityIndex(year);
      const airQualityImprovement = calculateAirQualityImprovement();
      const structuralStress = calculateStructuralStress();
      const weatherRiskFactor = calculateWeatherRiskFactor(weather);

      const totalAnnualCo2Offset = solarGeneration.co2 + greenRoofBenefits.co2 + 
                                   coolRoofSavings.co2 + noxTreatment.co2;
      
      const totalAnnualEnergy = solarGeneration.energy + greenRoofBenefits.energy + 
                               coolRoofSavings.energy;

      const totalAnnualNox = greenRoofBenefits.nox + noxTreatment.nox;

      cumulativeCo2Offset += totalAnnualCo2Offset;
      const netCo2Impact = initialCo2Impact - cumulativeCo2Offset;

      const maintenanceCosts = roofElements.reduce((sum, element) => 
        sum + (element.percentage / 100) * roofSize * element.maintenancePerM2PerYear, 0
      );

      data.push({
        year,
        cumulativeCo2Offset,
        netCo2Impact: Math.max(0, netCo2Impact),
        annualEnergyGeneration: totalAnnualEnergy,
        annualNoxReduction: totalAnnualNox,
        solarGeneration: solarGeneration.energy,
        greenRoofBenefits: greenRoofBenefits.energy,
        coolRoofSavings: coolRoofSavings.energy,
        noxTreatment: noxTreatment.co2,
        totalBenefits: totalAnnualCo2Offset,
        maintenanceCosts,
        stormwaterManaged,
        temperatureReduction,
        noiseReduction,
        biodiversityIndex,
        airQualityImprovement,
        structuralStress,
        weatherRiskFactor
      });

      if (netCo2Impact <= 0 && !breakEvenYear) {
        setBreakEvenYear(year);
      }
    }

    setEnvironmentalData(data);
  };

  const getCurrentSeasonalMultiplier = (year: number): number => {
    const month = (year * 12) % 12;
    if (month >= 2 && month <= 4) return 1.0; // Spring
    if (month >= 5 && month <= 7) return 1.2; // Summer
    if (month >= 8 && month <= 10) return 0.9; // Autumn
    return 0.7; // Winter
  };

  const calculateWeatherImpact = (weather: WeatherImpact, year: number): number => {
    // Climate change factor - temperatures increasing over time
    const climateChangeFactor = 1 + (year * 0.002); // 0.2% increase per year
    const adjustedTemp = weather.temperature * climateChangeFactor;
    
    // Weather impact on performance (simplified model)
    const tempImpact = Math.max(0.7, 1 - Math.abs(adjustedTemp - 20) * 0.02);
    const rainImpact = Math.min(1.2, 0.8 + weather.rainfall / 1000);
    const windImpact = Math.max(0.8, 1 - weather.windSpeed / 200);
    
    return (tempImpact + rainImpact + windImpact) / 3;
  };

  const calculateEnhancedSolarBenefits = (year: number, seasonalMultiplier: number, weatherImpact: number) => {
    const solarElement = roofElements.find(el => el.id === 'solar');
    if (!solarElement || solarElement.percentage === 0 || year > solarElement.lifespan) {
      return { co2: 0, energy: 0, nox: 0 };
    }

    const area = (solarElement.percentage / 100) * roofSize;
    const locationMultiplier = location ? (location.solarIrradiance / 1100) : 1;
    const degradationFactor = Math.pow(0.995, year);
    
    // Enhanced calculation with weather and seasonal factors
    const energy = area * solarElement.energyPerM2PerYear * locationMultiplier * 
                   degradationFactor * seasonalMultiplier * weatherImpact;
    const co2 = energy * 0.4;

    return { co2, energy, nox: 0 };
  };

  const calculateEnhancedGreenRoofBenefits = (year: number, seasonalMultiplier: number, weatherImpact: number) => {
    const greenElement = roofElements.find(el => el.id === 'green');
    if (!greenElement || greenElement.percentage === 0 || year > greenElement.lifespan) {
      return { co2: 0, energy: 0, nox: 0 };
    }

    const area = (greenElement.percentage / 100) * roofSize;
    const maturityFactor = Math.min(1, year / 3);
    
    // Enhanced with seasonal and weather factors
    const performanceFactor = maturityFactor * seasonalMultiplier * weatherImpact;
    
    return {
      co2: area * greenElement.co2PerM2PerYear * performanceFactor,
      energy: area * greenElement.energyPerM2PerYear * performanceFactor,
      nox: area * greenElement.noxPerM2PerYear * performanceFactor
    };
  };

  const calculateEnhancedCoolRoofBenefits = (year: number, seasonalMultiplier: number, weatherImpact: number) => {
    const coolElement = roofElements.find(el => el.id === 'white');
    if (!coolElement || coolElement.percentage === 0 || year > coolElement.lifespan) {
      return { co2: 0, energy: 0, nox: 0 };
    }

    const area = (coolElement.percentage / 100) * roofSize;
    const climateMultiplier = location ? 
      (location.temperatureRange.max > 25 ? 1.2 : 
       location.temperatureRange.max > 20 ? 1.0 : 0.8) : 1.0;
    
    const performanceFactor = seasonalMultiplier * weatherImpact * climateMultiplier;
    
    return {
      co2: area * coolElement.co2PerM2PerYear * performanceFactor,
      energy: area * coolElement.energyPerM2PerYear * performanceFactor,
      nox: area * coolElement.noxPerM2PerYear * performanceFactor
    };
  };

  const calculateEnhancedNoxBenefits = (year: number, seasonalMultiplier: number, weatherImpact: number) => {
    const noxElement = roofElements.find(el => el.id === 'nox');
    if (!noxElement || noxElement.percentage === 0 || year > noxElement.lifespan) {
      return { co2: 0, energy: 0, nox: 0 };
    }

    const area = (noxElement.percentage / 100) * roofSize;
    const reapplicationCycle = Math.floor(year / 2);
    const effectivenessFactor = (year % 2 === 0 ? 1.0 : 0.7) * seasonalMultiplier * weatherImpact;
    
    return {
      co2: area * noxElement.co2PerM2PerYear * effectivenessFactor,
      energy: 0,
      nox: area * noxElement.noxPerM2PerYear * effectivenessFactor
    };
  };

  // Enhanced environmental calculations
  const calculateStormwaterManagement = (): number => {
    return roofElements.reduce((total, element) => {
      const area = (element.percentage / 100) * roofSize;
      return total + (area * element.stormwaterRetention / 100);
    }, 0);
  };

  const calculateTemperatureReduction = (): number => {
    return roofElements.reduce((total, element) => {
      const area = (element.percentage / 100) * roofSize;
      return total + (area * element.environmentalBenefits.heatIslandReduction / roofSize);
    }, 0);
  };

  const calculateNoiseReduction = (): number => {
    return roofElements.reduce((total, element) => {
      const area = (element.percentage / 100) * roofSize;
      return total + (area * element.noiseReduction / roofSize);
    }, 0);
  };

  const calculateBiodiversityIndex = (year: number): number => {
    const baseScore = roofElements.reduce((total, element) => {
      const area = (element.percentage / 100) * roofSize;
      return total + (area * element.environmentalBenefits.biodiversityScore / roofSize);
    }, 0);
    
    // Biodiversity improves over time for green elements
    const maturityBonus = Math.min(20, year * 2);
    return Math.min(100, baseScore + maturityBonus);
  };

  const calculateAirQualityImprovement = (): number => {
    return roofElements.reduce((total, element) => {
      const area = (element.percentage / 100) * roofSize;
      return total + (area * element.environmentalBenefits.airPurification);
    }, 0);
  };

  const calculateStructuralStress = (): number => {
    return roofElements.reduce((total, element) => {
      const area = (element.percentage / 100) * roofSize;
      return total + (area * element.structuralRequirements.additionalLoad);
    }, 0);
  };

  const calculateWeatherRiskFactor = (weather: WeatherImpact): number => {
    const tempRisk = Math.abs(weather.temperature - 20) / 20;
    const windRisk = weather.windSpeed / 100;
    const rainRisk = Math.max(0, (weather.rainfall - 800) / 800);
    
    return (tempRisk + windRisk + rainRisk) / 3;
  };

  // CORRECTED RISK ASSESSMENT with realistic costs
  const performRiskAssessment = () => {
    const risks: RiskAssessment[] = [];
    
    // Structural risk assessment with realistic costs
    const totalLoad = calculateStructuralStress();
    if (totalLoad > 100) {
      const structuralCost = Math.min(25000, totalLoad * 15); // Cap at €25k, realistic €10-20/kg load
      risks.push({
        category: 'Structural',
        level: totalLoad > 200 ? 'critical' : 'high',
        probability: Math.min(90, totalLoad / 3),
        impact: 'Building structural integrity may be compromised',
        mitigation: ['Structural engineering assessment (€2,000-5,000)', 'Reinforcement installation if needed', 'Load distribution systems'],
        cost: structuralCost
      });
    }

    // Weather risk assessment with realistic costs
    const weatherRisk = calculateWeatherRiskFactor(WEATHER_SCENARIOS[weatherScenario]);
    if (weatherRisk > 0.3) {
      const weatherCost = Math.min(15000, weatherRisk * roofSize * 5); // Realistic weather protection costs
      risks.push({
        category: 'Weather',
        level: weatherRisk > 0.6 ? 'high' : 'medium',
        probability: weatherRisk * 100,
        impact: 'Reduced performance and increased maintenance needs',
        mitigation: ['Weather protection systems', 'Enhanced drainage', 'Wind-resistant installation'],
        cost: weatherCost
      });
    }

    // Maintenance complexity risk with realistic costs
    const complexElements = roofElements.filter(el => 
      el.percentage > 0 && el.installationComplexity === 'complex'
    );
    if (complexElements.length > 0) {
      const maintenanceCost = complexElements.length * 3000; // Realistic maintenance setup cost
      risks.push({
        category: 'Maintenance',
        level: 'medium',
        probability: 70,
        impact: 'Higher than expected maintenance costs and complexity',
        mitigation: ['Maintenance training (€1,000)', 'Service contracts', 'Access system installation (€2,000-5,000)'],
        cost: maintenanceCost
      });
    }

    setRiskAssessments(risks);
  };

  const analyzeInteractions = () => {
    const activeElements = roofElements.filter(el => el.percentage > 0);
    const newConflicts: string[] = [];
    const newSynergies: string[] = [];

    activeElements.forEach(element => {
      element.conflicts.forEach(conflict => {
        if (!newConflicts.includes(conflict)) {
          newConflicts.push(conflict);
        }
      });
      
      element.synergies.forEach(synergy => {
        if (!newSynergies.includes(synergy)) {
          newSynergies.push(synergy);
        }
      });
    });

    // Advanced interaction analysis
    const hasSolar = activeElements.some(el => el.id === 'solar');
    const hasGreen = activeElements.some(el => el.id === 'green');
    const hasWhite = activeElements.some(el => el.id === 'white');
    const hasNox = activeElements.some(el => el.id === 'nox');

    if (hasSolar && hasGreen) {
      const solarPercentage = roofElements.find(el => el.id === 'solar')?.percentage || 0;
      const greenPercentage = roofElements.find(el => el.id === 'green')?.percentage || 0;
      
      if (solarPercentage > 50 && greenPercentage > 30) {
        newConflicts.push('High solar coverage may significantly limit green roof growth and biodiversity benefits');
      } else {
        newSynergies.push('Balanced solar-green configuration provides optimal cooling and energy generation');
      }
    }

    if (hasWhite && hasNox) {
      newSynergies.push('White roof provides optimal UV exposure for NOx treatment activation');
    }

    setConflicts(newConflicts);
    setSynergies(newSynergies);
  };

  const optimizeConfiguration = () => {
    // Simple optimization algorithm
    const objectives = {
      maxCo2Offset: true,
      maxEnergyGeneration: true,
      minCost: true,
      minRisk: true
    };

    // This would implement a more sophisticated optimization algorithm
    // For now, provide a simple recommendation
    alert('Optimization feature coming soon! This would use multi-objective optimization to suggest the best configuration based on your priorities.');
  };

  const exportConfiguration = () => {
    const config = {
      roofElements: roofElements.filter(el => el.percentage > 0),
      environmentalData: environmentalData.slice(0, 26),
      riskAssessments,
      totalCoverage,
      roofSize,
      location,
      weatherScenario,
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `custom-roof-config-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const saveConfiguration = () => {
    const config = {
      id: Date.now(),
      name: `Configuration ${savedConfigurations.length + 1}`,
      elements: roofElements.filter(el => el.percentage > 0),
      totalCoverage,
      createdAt: new Date()
    };
    setSavedConfigurations(prev => [...prev, config]);
  };

  const getTotalCosts = () => {
    const initialCost = roofElements.reduce((sum, element) => 
      sum + (element.percentage / 100) * roofSize * element.costPerM2, 0
    );
    
    const annualMaintenance = roofElements.reduce((sum, element) => 
      sum + (element.percentage / 100) * roofSize * element.maintenancePerM2PerYear, 0
    );

    const riskMitigationCost = riskAssessments.reduce((sum, risk) => sum + risk.cost, 0);

    return { initialCost, annualMaintenance, riskMitigationCost };
  };

  const getEnvironmentalScore = () => {
    if (environmentalData.length === 0) return 0;
    
    const firstYearData = environmentalData[1] || environmentalData[0];
    const co2Score = Math.min(100, (firstYearData?.totalBenefits || 0) / 100);
    const biodiversityScore = firstYearData?.biodiversityIndex || 0;
    const stormwaterScore = Math.min(100, (firstYearData?.stormwaterManaged || 0) / roofSize * 100);
    
    return Math.round((co2Score + biodiversityScore + stormwaterScore) / 3);
  };

  const pieChartData = roofElements
    .filter(el => el.percentage > 0)
    .map(el => ({
      name: el.name,
      value: el.percentage,
      color: el.color
    }));

  const costs = getTotalCosts();
  const environmentalScore = getEnvironmentalScore();

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Settings className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">Enhanced Custom Roof Environmental Impact Analysis</h2>
          <HelpTooltip content="Advanced environmental impact analysis with realistic industry-standard costs, weather modeling, risk assessment, and comprehensive performance metrics." />
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={optimizeConfiguration}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
          >
            <Target className="w-4 h-4" />
            <span>Optimize</span>
          </button>
          <button
            onClick={exportConfiguration}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={saveConfiguration}
            className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Enhanced View Tabs */}
      <div className="flex flex-wrap gap-2 bg-gray-50 rounded-xl p-2 mb-6">
        {[
          { id: 'design', label: 'Roof Design', icon: Settings },
          { id: 'analysis', label: 'Impact Analysis', icon: BarChart3 },
          { id: 'environmental', label: 'Environmental Metrics', icon: Leaf },
          { id: 'risk', label: 'Risk Assessment', icon: Shield },
          { id: 'timeline', label: 'Timeline View', icon: TrendingUp },
          { id: 'optimization', label: 'Optimization', icon: Target }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeView === tab.id
                  ? 'bg-white text-green-600 shadow-md border border-green-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Weather Scenario Selector */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-blue-900">Weather Scenario Analysis</h3>
          <div className="flex items-center space-x-2">
            <Thermometer className="w-4 h-4 text-blue-600" />
            <select
              value={weatherScenario}
              onChange={(e) => setWeatherScenario(e.target.value as keyof typeof WEATHER_SCENARIOS)}
              className="px-3 py-1 bg-white border border-blue-200 rounded text-sm"
            >
              <option value="mild">Mild Climate</option>
              <option value="moderate">Moderate Climate</option>
              <option value="harsh">Harsh Climate</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-4 text-sm">
          {Object.entries(WEATHER_SCENARIOS[weatherScenario]).map(([key, value]) => (
            <div key={key} className="text-center">
              <div className="font-medium text-blue-900">{value}{key === 'temperature' ? '°C' : key === 'rainfall' ? 'mm' : key === 'windSpeed' ? 'km/h' : key === 'solarHours' ? 'h' : '%'}</div>
              <div className="text-xs text-blue-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Design View */}
      {activeView === 'design' && (
        <div className="space-y-6">
          {/* Coverage Status with Enhanced Metrics */}
          <div className={`p-6 rounded-xl border-2 ${
            totalCoverage === 100 ? 'border-green-500 bg-green-50' :
            totalCoverage > 100 ? 'border-red-500 bg-red-50' :
            'border-yellow-500 bg-yellow-50'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{totalCoverage.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Total Coverage</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{environmentalScore}</div>
                <div className="text-sm text-gray-600">Environmental Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{calculateStructuralStress().toFixed(0)} kg/m²</div>
                <div className="text-sm text-gray-600">Structural Load</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">€{costs.initialCost.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Initial Investment</div>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
              <div 
                className={`h-4 rounded-full transition-all duration-300 ${
                  totalCoverage === 100 ? 'bg-green-500' :
                  totalCoverage > 100 ? 'bg-red-500' :
                  'bg-yellow-500'
                }`}
                style={{ width: `${Math.min(100, totalCoverage)}%` }}
              />
            </div>
            
            {totalCoverage !== 100 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {totalCoverage < 100 ? 
                    `${(100 - totalCoverage).toFixed(1)}% remaining` : 
                    `${(totalCoverage - 100).toFixed(1)}% over capacity`
                  }
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      const activeElements = roofElements.filter(el => el.percentage > 0);
                      if (activeElements.length > 0) {
                        const adjustment = (100 - totalCoverage) / activeElements.length;
                        setRoofElements(prev => prev.map(element => 
                          element.percentage > 0 
                            ? { ...element, percentage: Math.max(0, Math.min(100, element.percentage + adjustment)) }
                            : element
                        ));
                      }
                    }}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    Auto Balance
                  </button>
                  <button
                    onClick={() => setRoofElements(ENHANCED_ROOF_ELEMENTS)}
                    className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Roof Element Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {roofElements.map((element) => (
              <div 
                key={element.id} 
                className={`border-2 rounded-xl p-6 transition-all duration-200 ${
                  selectedElement === element.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedElement(selectedElement === element.id ? null : element.id)}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div 
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: element.color }}
                  />
                  <h3 className="font-semibold text-gray-900">{element.name}</h3>
                  <span className="text-sm text-gray-500">
                    {element.percentage.toFixed(1)}%
                  </span>
                  {element.percentage > 0 && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Active
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mb-4">{element.description}</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Coverage Percentage
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="0.1"
                      value={element.percentage}
                      onChange={(e) => updateElementPercentage(element.id, parseFloat(e.target.value))}
                      className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, ${element.color} 0%, ${element.color} ${element.percentage}%, #e5e7eb ${element.percentage}%, #e5e7eb 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  
                  {/* Enhanced Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-50 rounded p-2">
                      <span className="text-gray-500">Area:</span>
                      <div className="font-medium">{((element.percentage / 100) * roofSize).toFixed(0)} m²</div>
                    </div>
                    <div className="bg-gray-50 rounded p-2">
                      <span className="text-gray-500">Cost:</span>
                      <div className="font-medium">€{((element.percentage / 100) * roofSize * element.costPerM2).toLocaleString()}</div>
                    </div>
                    <div className="bg-gray-50 rounded p-2">
                      <span className="text-gray-500">CO₂ Offset:</span>
                      <div className="font-medium text-green-600">{((element.percentage / 100) * roofSize * element.co2PerM2PerYear).toFixed(0)} kg/yr</div>
                    </div>
                    <div className="bg-gray-50 rounded p-2">
                      <span className="text-gray-500">Complexity:</span>
                      <div className={`font-medium capitalize ${
                        element.installationComplexity === 'simple' ? 'text-green-600' :
                        element.installationComplexity === 'moderate' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {element.installationComplexity}
                      </div>
                    </div>
                  </div>

                  {/* Advanced Metrics Toggle */}
                  {selectedElement === element.id && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Advanced Properties</h4>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-gray-500">Thermal Performance:</span>
                          <div className="font-medium">{element.thermalPerformance} R-value</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Stormwater Retention:</span>
                          <div className="font-medium">{element.stormwaterRetention}%</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Noise Reduction:</span>
                          <div className="font-medium">{element.noiseReduction} dB</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Fire Resistance:</span>
                          <div className={`font-medium capitalize ${
                            element.fireResistance === 'high' ? 'text-green-600' :
                            element.fireResistance === 'medium' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {element.fireResistance}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Structural Load:</span>
                          <div className="font-medium">{element.structuralRequirements.additionalLoad} kg/m²</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Biodiversity Score:</span>
                          <div className="font-medium">{element.environmentalBenefits.biodiversityScore}/100</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Assessment View with Corrected Costs */}
      {activeView === 'risk' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Shield className="w-5 h-5 text-red-600" />
              <span>Comprehensive Risk Assessment</span>
            </h3>
            
            {riskAssessments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                <p>No significant risks identified with current configuration</p>
              </div>
            ) : (
              <div className="space-y-4">
                {riskAssessments.map((risk, index) => (
                  <div key={index} className={`border-l-4 p-4 rounded-r-lg ${
                    risk.level === 'critical' ? 'border-red-500 bg-red-50' :
                    risk.level === 'high' ? 'border-orange-500 bg-orange-50' :
                    risk.level === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                    'border-blue-500 bg-blue-50'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{risk.category} Risk</h4>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            risk.level === 'critical' ? 'bg-red-200 text-red-800' :
                            risk.level === 'high' ? 'bg-orange-200 text-orange-800' :
                            risk.level === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                            'bg-blue-200 text-blue-800'
                          }`}>
                            {risk.level} risk
                          </span>
                          <span className="text-sm text-gray-600">{risk.probability.toFixed(0)}% probability</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">€{risk.cost.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">Mitigation cost</div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3">{risk.impact}</p>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Mitigation Strategies:</h5>
                      <ul className="list-disc list-inside space-y-1">
                        {risk.mitigation.map((strategy, strategyIndex) => (
                          <li key={strategyIndex} className="text-sm text-gray-600">{strategy}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
                
                {/* Total Risk Mitigation Cost */}
                <div className="bg-gray-100 rounded-lg p-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total Risk Mitigation Cost:</span>
                    <span className="text-xl font-bold text-gray-900">
                      €{riskAssessments.reduce((sum, risk) => sum + risk.cost, 0).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    This represents the estimated cost to address all identified risks. Actual costs may vary based on specific site conditions and chosen mitigation strategies.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Other views would continue with similar corrections... */}

      {/* Warning for incomplete design */}
      {totalCoverage !== 100 && activeView !== 'design' && (
        <div className="text-center py-12">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Complete Your Roof Design</h3>
          <p className="text-gray-600 mb-4">
            Please allocate 100% of your roof area to access advanced analysis features.
          </p>
          <button
            onClick={() => setActiveView('design')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Return to Design
          </button>
        </div>
      )}
    </div>
  );
}