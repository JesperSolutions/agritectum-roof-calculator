import React, { useState, useEffect } from 'react';
import { Leaf, Zap, Wind, Sun, Calculator, TrendingUp, AlertTriangle, CheckCircle, Info, BarChart3, PieChart, Target, Settings, Menu, X, ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, PieChart as RechartsPieChart, Cell, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
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
}

interface CustomRoofDesignerProps {
  roofSize: number;
  location?: {
    solarIrradiance: number;
    climateZone: string;
    temperatureRange: { min: number; max: number };
  };
}

const ROOF_ELEMENTS: RoofElement[] = [
  {
    id: 'solar',
    name: 'Solar Panels',
    percentage: 0,
    color: '#f59e0b',
    co2PerM2PerYear: 80,
    energyPerM2PerYear: 200,
    noxPerM2PerYear: 0,
    initialCo2PerM2: 45,
    costPerM2: 150,
    lifespan: 25,
    maintenancePerM2PerYear: 2,
    description: 'Photovoltaic panels generating clean electricity',
    synergies: ['Can be combined with green roof substrate', 'Enhanced cooling from white roof underneath'],
    conflicts: ['Reduces available space for other elements', 'Shading affects green roof growth underneath']
  },
  {
    id: 'green',
    name: 'Green Roof',
    percentage: 0,
    color: '#10b981',
    co2PerM2PerYear: 2.1,
    energyPerM2PerYear: 15,
    noxPerM2PerYear: 0.05,
    initialCo2PerM2: 8,
    costPerM2: 45,
    lifespan: 40,
    maintenancePerM2PerYear: 3,
    description: 'Living vegetation providing insulation and biodiversity',
    synergies: ['Natural cooling enhances solar panel efficiency', 'Stormwater management benefits'],
    conflicts: ['Requires structural reinforcement', 'Higher maintenance needs']
  },
  {
    id: 'white',
    name: 'White Cool Roof',
    percentage: 0,
    color: '#6b7280',
    co2PerM2PerYear: 6.65,
    energyPerM2PerYear: 25,
    noxPerM2PerYear: 0.02,
    initialCo2PerM2: 3,
    costPerM2: 55,
    lifespan: 20,
    maintenancePerM2PerYear: 1.5,
    description: 'Highly reflective coating reducing heat absorption',
    synergies: ['Excellent base for solar panels', 'Enhances NOx treatment effectiveness'],
    conflicts: ['May cause glare issues', 'Requires regular cleaning for effectiveness']
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
    costPerM2: 12,
    lifespan: 15,
    maintenancePerM2PerYear: 0.5,
    description: 'Photocatalytic coating breaking down air pollutants',
    synergies: ['Can be applied over white roof coating', 'Works well in high-traffic areas'],
    conflicts: ['Effectiveness reduced by shading', 'Requires UV light activation']
  }
];

export default function CustomRoofDesigner({ roofSize, location }: CustomRoofDesignerProps) {
  const [roofElements, setRoofElements] = useState<RoofElement[]>(ROOF_ELEMENTS);
  const [environmentalData, setEnvironmentalData] = useState<EnvironmentalData[]>([]);
  const [breakEvenYear, setBreakEvenYear] = useState<number | null>(null);
  const [totalCoverage, setTotalCoverage] = useState(0);
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [synergies, setSynergies] = useState<string[]>([]);
  const [activeView, setActiveView] = useState<'design' | 'analysis' | 'timeline' | 'breakdown' | 'metrics' | 'optimization'>('design');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedElements, setExpandedElements] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  useEffect(() => {
    const total = roofElements.reduce((sum, element) => sum + element.percentage, 0);
    setTotalCoverage(total);
    
    if (total === 100) {
      calculateEnvironmentalImpact();
      analyzeInteractions();
    }
  }, [roofElements, roofSize, location]);

  // Touch gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartY) return;
    
    const touchEndY = e.touches[0].clientY;
    const diff = touchStartY - touchEndY;
    
    // Prevent default scrolling on certain gestures
    if (Math.abs(diff) > 50) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    setTouchStartY(null);
  };

  const updateElementPercentage = (id: string, percentage: number) => {
    setRoofElements(prev => prev.map(element => 
      element.id === id ? { ...element, percentage } : element
    ));
  };

  const autoBalance = () => {
    const activeElements = roofElements.filter(el => el.percentage > 0);
    if (activeElements.length === 0) return;

    const remainingPercentage = 100 - totalCoverage;
    const adjustmentPerElement = remainingPercentage / activeElements.length;

    setRoofElements(prev => prev.map(element => {
      if (element.percentage > 0) {
        const newPercentage = Math.max(0, Math.min(100, element.percentage + adjustmentPerElement));
        return { ...element, percentage: Math.round(newPercentage * 10) / 10 };
      }
      return element;
    }));
  };

  const toggleElementExpansion = (id: string) => {
    setExpandedElements(prev => 
      prev.includes(id) 
        ? prev.filter(elementId => elementId !== id)
        : [...prev, id]
    );
  };

  const calculateEnvironmentalImpact = () => {
    const data: EnvironmentalData[] = [];
    let cumulativeCo2Offset = 0;
    
    const initialCo2Impact = roofElements.reduce((sum, element) => 
      sum + (element.percentage / 100) * roofSize * element.initialCo2PerM2, 0
    );

    for (let year = 0; year <= 50; year++) {
      const solarGeneration = calculateSolarBenefits(year);
      const greenRoofBenefits = calculateGreenRoofBenefits(year);
      const coolRoofSavings = calculateCoolRoofBenefits(year);
      const noxTreatment = calculateNoxBenefits(year);

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
        maintenanceCosts
      });

      if (netCo2Impact <= 0 && !breakEvenYear) {
        setBreakEvenYear(year);
      }
    }

    setEnvironmentalData(data);
  };

  const calculateSolarBenefits = (year: number) => {
    const solarElement = roofElements.find(el => el.id === 'solar');
    if (!solarElement || solarElement.percentage === 0 || year > solarElement.lifespan) {
      return { co2: 0, energy: 0, nox: 0 };
    }

    const area = (solarElement.percentage / 100) * roofSize;
    const locationMultiplier = location ? (location.solarIrradiance / 1100) : 1;
    const degradationFactor = Math.pow(0.995, year);
    
    const energy = area * solarElement.energyPerM2PerYear * locationMultiplier * degradationFactor;
    const co2 = energy * 0.4;

    return { co2, energy, nox: 0 };
  };

  const calculateGreenRoofBenefits = (year: number) => {
    const greenElement = roofElements.find(el => el.id === 'green');
    if (!greenElement || greenElement.percentage === 0 || year > greenElement.lifespan) {
      return { co2: 0, energy: 0, nox: 0 };
    }

    const area = (greenElement.percentage / 100) * roofSize;
    const maturityFactor = Math.min(1, year / 3);
    
    return {
      co2: area * greenElement.co2PerM2PerYear * maturityFactor,
      energy: area * greenElement.energyPerM2PerYear * maturityFactor,
      nox: area * greenElement.noxPerM2PerYear * maturityFactor
    };
  };

  const calculateCoolRoofBenefits = (year: number) => {
    const coolElement = roofElements.find(el => el.id === 'white');
    if (!coolElement || coolElement.percentage === 0 || year > coolElement.lifespan) {
      return { co2: 0, energy: 0, nox: 0 };
    }

    const area = (coolElement.percentage / 100) * roofSize;
    const climateMultiplier = location ? 
      (location.temperatureRange.max > 25 ? 1.2 : 
       location.temperatureRange.max > 20 ? 1.0 : 0.8) : 1.0;
    
    return {
      co2: area * coolElement.co2PerM2PerYear * climateMultiplier,
      energy: area * coolElement.energyPerM2PerYear * climateMultiplier,
      nox: area * coolElement.noxPerM2PerYear
    };
  };

  const calculateNoxBenefits = (year: number) => {
    const noxElement = roofElements.find(el => el.id === 'nox');
    if (!noxElement || noxElement.percentage === 0 || year > noxElement.lifespan) {
      return { co2: 0, energy: 0, nox: 0 };
    }

    const area = (noxElement.percentage / 100) * roofSize;
    const effectivenessFactor = year % 2 === 0 ? 1.0 : 0.7;
    
    return {
      co2: area * noxElement.co2PerM2PerYear * effectivenessFactor,
      energy: 0,
      nox: area * noxElement.noxPerM2PerYear * effectivenessFactor
    };
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

    const hasSolar = activeElements.some(el => el.id === 'solar');
    const hasGreen = activeElements.some(el => el.id === 'green');
    const hasWhite = activeElements.some(el => el.id === 'white');
    const hasNox = activeElements.some(el => el.id === 'nox');

    if (hasSolar && hasGreen) {
      newSynergies.push('Solar panels benefit from natural cooling provided by green roof');
      newConflicts.push('Green roof growth may be limited under solar panel shading');
    }

    if (hasWhite && hasNox) {
      newSynergies.push('White roof provides optimal base for NOx treatment coating');
    }

    if (hasSolar && hasWhite) {
      newSynergies.push('White roof reduces heat buildup, improving solar panel efficiency');
    }

    setConflicts(newConflicts);
    setSynergies(newSynergies);
  };

  const getTotalCosts = () => {
    const initialCost = roofElements.reduce((sum, element) => 
      sum + (element.percentage / 100) * roofSize * element.costPerM2, 0
    );
    
    const annualMaintenance = roofElements.reduce((sum, element) => 
      sum + (element.percentage / 100) * roofSize * element.maintenancePerM2PerYear, 0
    );

    return { initialCost, annualMaintenance };
  };

  const getAnnualBenefits = () => {
    if (environmentalData.length === 0) return { co2: 0, energy: 0, nox: 0 };
    
    const firstYearData = environmentalData[1] || environmentalData[0];
    return {
      co2: firstYearData?.totalBenefits || 0,
      energy: firstYearData?.annualEnergyGeneration || 0,
      nox: firstYearData?.annualNoxReduction || 0
    };
  };

  const pieChartData = roofElements
    .filter(el => el.percentage > 0)
    .map(el => ({
      name: el.name,
      value: el.percentage,
      color: el.color
    }));

  const costs = getTotalCosts();
  const benefits = getAnnualBenefits();

  // Mobile-optimized tab configuration
  const tabs = [
    { id: 'design', label: 'Design', icon: Settings, shortLabel: 'Design' },
    { id: 'analysis', label: 'Analysis', icon: BarChart3, shortLabel: 'Analysis' },
    { id: 'timeline', label: 'Timeline', icon: TrendingUp, shortLabel: 'Timeline' },
    { id: 'metrics', label: 'Metrics', icon: Target, shortLabel: 'Metrics' },
    { id: 'breakdown', label: 'Cost-Benefit', icon: Calculator, shortLabel: 'Cost' },
    { id: 'optimization', label: 'Optimize', icon: Zap, shortLabel: 'Optimize' }
  ];

  // Environmental metrics for radar chart
  const environmentalMetrics = [
    { metric: 'CO₂ Offset', value: Math.min(100, (benefits.co2 / 100)), fullMark: 100 },
    { metric: 'Energy Gen', value: Math.min(100, (benefits.energy / 200)), fullMark: 100 },
    { metric: 'Air Quality', value: Math.min(100, (benefits.nox * 1000)), fullMark: 100 },
    { metric: 'Durability', value: Math.min(100, roofElements.filter(el => el.percentage > 0).reduce((avg, el) => avg + el.lifespan, 0) / roofElements.filter(el => el.percentage > 0).length * 2.5), fullMark: 100 },
    { metric: 'Cost Efficiency', value: Math.min(100, 100 - (costs.initialCost / roofSize / 2)), fullMark: 100 },
    { metric: 'Maintenance', value: Math.min(100, 100 - (costs.annualMaintenance / roofSize * 10)), fullMark: 100 }
  ];

  return (
    <div 
      className={`bg-white rounded-2xl shadow-lg border border-gray-100 ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'relative'}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Mobile-Optimized Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
            <span className="hidden sm:inline">Enhanced Custom Roof Environmental Impact Analysis</span>
            <span className="sm:hidden">Custom Roof Analysis</span>
          </h2>
          <div className="hidden sm:block">
            <HelpTooltip content="Design a mixed-use roof by allocating percentages to different elements. The system calculates initial CO2 impact, ongoing benefits, break-even points, and analyzes synergies and conflicts between elements." />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="sm:hidden p-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-gray-50 border-b border-gray-200 p-4">
          <div className="grid grid-cols-3 gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveView(tab.id as any);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex flex-col items-center space-y-1 p-3 rounded-lg text-xs font-medium transition-colors ${
                    activeView === tab.id
                      ? 'bg-green-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Desktop Tab Navigation */}
      <div className="hidden sm:flex space-x-1 bg-gray-100 rounded-lg p-1 m-6 mb-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === tab.id
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-4 sm:p-6">
        {/* Design View */}
        {activeView === 'design' && (
          <div className="space-y-6">
            {/* Mobile-Optimized Coverage Status */}
            <div className={`p-4 rounded-lg border-2 ${
              totalCoverage === 100 ? 'border-green-500 bg-green-50' :
              totalCoverage > 100 ? 'border-red-500 bg-red-50' :
              'border-yellow-500 bg-yellow-50'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-sm sm:text-base">Total Roof Coverage</span>
                <span className="text-xl sm:text-2xl font-bold">{totalCoverage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4">
                <div 
                  className={`h-3 sm:h-4 rounded-full transition-all duration-300 ${
                    totalCoverage === 100 ? 'bg-green-500' :
                    totalCoverage > 100 ? 'bg-red-500' :
                    'bg-yellow-500'
                  }`}
                  style={{ width: `${Math.min(100, totalCoverage)}%` }}
                />
              </div>
              {totalCoverage !== 100 && (
                <div className="mt-3 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                  <span className="text-sm text-gray-600">
                    {totalCoverage < 100 ? 
                      `${(100 - totalCoverage).toFixed(1)}% remaining` : 
                      `${(totalCoverage - 100).toFixed(1)}% over capacity`
                    }
                  </span>
                  {totalCoverage > 0 && totalCoverage !== 100 && (
                    <button
                      onClick={autoBalance}
                      className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Auto Balance
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Mobile-Optimized Roof Element Controls */}
            <div className="space-y-4">
              {roofElements.map((element) => (
                <div key={element.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Element Header - Always Visible */}
                  <div 
                    className="p-4 bg-gray-50 cursor-pointer"
                    onClick={() => toggleElementExpansion(element.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-5 h-5 rounded-full"
                          style={{ backgroundColor: element.color }}
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{element.name}</h3>
                          <p className="text-xs sm:text-sm text-gray-600">{element.percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">
                          {((element.percentage / 100) * roofSize).toFixed(0)} m²
                        </span>
                        {expandedElements.includes(element.id) ? 
                          <ChevronUp className="w-4 h-4 text-gray-500" /> : 
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        }
                      </div>
                    </div>
                  </div>

                  {/* Element Details - Expandable */}
                  {expandedElements.includes(element.id) && (
                    <div className="p-4 space-y-4">
                      <p className="text-sm text-gray-600">{element.description}</p>
                      
                      {/* Mobile-Optimized Slider */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Coverage Percentage
                        </label>
                        <div className="space-y-3">
                          {/* Custom styled range input for better mobile experience */}
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="0.1"
                            value={element.percentage}
                            onChange={(e) => updateElementPercentage(element.id, parseFloat(e.target.value))}
                            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                            style={{
                              background: `linear-gradient(to right, ${element.color} 0%, ${element.color} ${element.percentage}%, #e5e7eb ${element.percentage}%, #e5e7eb 100%)`
                            }}
                          />
                          
                          {/* Mobile-friendly number input */}
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={element.percentage}
                              onChange={(e) => updateElementPercentage(element.id, parseFloat(e.target.value) || 0)}
                              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                            <span className="text-sm text-gray-500">%</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Mobile-Optimized Stats Grid */}
                      <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <span className="text-gray-500 block">Cost</span>
                          <div className="font-medium">
                            €{((element.percentage / 100) * roofSize * element.costPerM2).toLocaleString()}
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <span className="text-gray-500 block">Lifespan</span>
                          <div className="font-medium">{element.lifespan} years</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3">
                          <span className="text-gray-500 block">Annual CO₂</span>
                          <div className="font-medium text-green-600">
                            {((element.percentage / 100) * roofSize * element.co2PerM2PerYear).toFixed(0)} kg
                          </div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-3">
                          <span className="text-gray-500 block">Energy</span>
                          <div className="font-medium text-blue-600">
                            {((element.percentage / 100) * roofSize * element.energyPerM2PerYear).toFixed(0)} kWh
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile-Optimized Roof Visualization */}
            {totalCoverage > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">Roof Composition</h3>
                <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-6">
                  <div className="w-full max-w-xs h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => [`${value.toFixed(1)}%`, 'Coverage']} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="flex-1 w-full space-y-2">
                    {pieChartData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-medium text-sm">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-sm">{item.value.toFixed(1)}%</div>
                          <div className="text-xs text-gray-500">
                            {((item.value / 100) * roofSize).toFixed(0)} m²
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Mobile-Optimized Interactions Analysis */}
            {(synergies.length > 0 || conflicts.length > 0) && (
              <div className="space-y-4">
                {synergies.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <h3 className="font-semibold text-green-900 text-sm">Synergies Detected</h3>
                    </div>
                    <ul className="space-y-2">
                      {synergies.map((synergy, index) => (
                        <li key={index} className="text-xs sm:text-sm text-green-800 flex items-start space-x-2">
                          <span className="text-green-600 mt-1">•</span>
                          <span>{synergy}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {conflicts.length > 0 && (
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      <h3 className="font-semibold text-yellow-900 text-sm">Potential Conflicts</h3>
                    </div>
                    <ul className="space-y-2">
                      {conflicts.map((conflict, index) => (
                        <li key={index} className="text-xs sm:text-sm text-yellow-800 flex items-start space-x-2">
                          <span className="text-yellow-600 mt-1">•</span>
                          <span>{conflict}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Analysis View */}
        {activeView === 'analysis' && totalCoverage === 100 && (
          <div className="space-y-6">
            {/* Mobile-Optimized Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between mb-3">
                  <AlertTriangle className="w-6 h-6 opacity-80" />
                  <div className="text-right">
                    <div className="text-lg sm:text-xl font-bold">
                      {roofElements.reduce((sum, el) => sum + (el.percentage / 100) * roofSize * el.initialCo2PerM2, 0).toLocaleString()}
                    </div>
                    <div className="text-red-100 text-xs">kg CO₂</div>
                  </div>
                </div>
                <div className="text-red-100 text-xs">Initial Environmental Impact</div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between mb-3">
                  <Leaf className="w-6 h-6 opacity-80" />
                  <div className="text-right">
                    <div className="text-lg sm:text-xl font-bold">{benefits.co2.toLocaleString()}</div>
                    <div className="text-green-100 text-xs">kg CO₂/year</div>
                  </div>
                </div>
                <div className="text-green-100 text-xs">Annual CO₂ Offset</div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between mb-3">
                  <Zap className="w-6 h-6 opacity-80" />
                  <div className="text-right">
                    <div className="text-lg sm:text-xl font-bold">{benefits.energy.toLocaleString()}</div>
                    <div className="text-blue-100 text-xs">kWh/year</div>
                  </div>
                </div>
                <div className="text-blue-100 text-xs">Annual Energy Impact</div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between mb-3">
                  <Target className="w-6 h-6 opacity-80" />
                  <div className="text-right">
                    <div className="text-lg sm:text-xl font-bold">
                      {breakEvenYear ? breakEvenYear : '∞'}
                    </div>
                    <div className="text-orange-100 text-xs">years</div>
                  </div>
                </div>
                <div className="text-orange-100 text-xs">Break-Even Point</div>
              </div>
            </div>

            {/* Mobile-Optimized Element Performance */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">Annual Performance by Element</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {roofElements.filter(el => el.percentage > 0).map((element) => {
                  const area = (element.percentage / 100) * roofSize;
                  const annualCo2 = area * element.co2PerM2PerYear;
                  const annualEnergy = area * element.energyPerM2PerYear;
                  
                  return (
                    <div key={element.id} className="bg-white rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: element.color }}
                        />
                        <span className="font-medium text-gray-900 text-sm">{element.name}</span>
                      </div>
                      <div className="space-y-2 text-xs sm:text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">CO₂ Offset:</span>
                          <span className="font-medium text-green-600">{annualCo2.toFixed(0)} kg/year</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Energy:</span>
                          <span className="font-medium text-blue-600">{annualEnergy.toFixed(0)} kWh/year</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Coverage:</span>
                          <span className="font-medium">{element.percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Timeline View */}
        {activeView === 'timeline' && totalCoverage === 100 && environmentalData.length > 0 && (
          <div className="space-y-6">
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={environmentalData.slice(0, 26)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="year" 
                    stroke="#666" 
                    fontSize={12}
                    interval={window.innerWidth < 640 ? 4 : 2}
                  />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px'
                    }}
                    formatter={(value: any, name: string) => [
                      `${Number(value).toLocaleString()} kg`,
                      name === 'cumulativeCo2Offset' ? 'Cumulative CO₂ Offset' : 
                      name === 'netCo2Impact' ? 'Net CO₂ Impact' : name
                    ]}
                  />
                  <Legend fontSize={12} />
                  <Area 
                    type="monotone" 
                    dataKey="cumulativeCo2Offset" 
                    stackId="1"
                    stroke="#10b981" 
                    fill="#10b981"
                    fillOpacity={0.6}
                    name="Cumulative CO₂ Offset"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="netCo2Impact" 
                    stackId="2"
                    stroke="#ef4444" 
                    fill="#ef4444"
                    fillOpacity={0.6}
                    name="Remaining CO₂ Debt"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="h-64 sm:h-80">
              <h3 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">Energy Generation by Element</h3>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={environmentalData.slice(0, 26)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="year" 
                    stroke="#666" 
                    fontSize={12}
                    interval={window.innerWidth < 640 ? 4 : 2}
                  />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ fontSize: '12px' }}
                    formatter={(value: any, name: string) => [
                      `${Number(value).toLocaleString()} kWh`,
                      name
                    ]}
                  />
                  <Legend fontSize={12} />
                  <Area 
                    type="monotone" 
                    dataKey="solarGeneration" 
                    stackId="1"
                    stroke="#f59e0b" 
                    fill="#f59e0b"
                    fillOpacity={0.8}
                    name="Solar Generation"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="coolRoofSavings" 
                    stackId="1"
                    stroke="#6b7280" 
                    fill="#6b7280"
                    fillOpacity={0.8}
                    name="Cool Roof Savings"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="greenRoofBenefits" 
                    stackId="1"
                    stroke="#10b981" 
                    fill="#10b981"
                    fillOpacity={0.8}
                    name="Green Roof Benefits"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Environmental Metrics View */}
        {activeView === 'metrics' && totalCoverage === 100 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Radar Chart */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">Environmental Impact Profile</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={environmentalMetrics}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" fontSize={10} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} fontSize={8} />
                      <Radar
                        name="Performance"
                        dataKey="value"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                      <Tooltip 
                        contentStyle={{ fontSize: '12px' }}
                        formatter={(value: any) => [`${value.toFixed(1)}%`, 'Score']}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Environmental Metrics Cards */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Detailed Environmental Metrics</h3>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Wind className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-900 text-sm">Stormwater Management</span>
                  </div>
                  <div className="text-lg font-bold text-blue-700">
                    {(roofElements.find(el => el.id === 'green')?.percentage || 0 * roofSize * 0.8).toFixed(0)} L/year
                  </div>
                  <div className="text-xs text-blue-600">Rainwater retention capacity</div>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Sun className="w-4 h-4 text-orange-600" />
                    <span className="font-medium text-orange-900 text-sm">Heat Island Reduction</span>
                  </div>
                  <div className="text-lg font-bold text-orange-700">
                    {((roofElements.find(el => el.id === 'white')?.percentage || 0) + 
                      (roofElements.find(el => el.id === 'green')?.percentage || 0) * 0.7).toFixed(1)}%
                  </div>
                  <div className="text-xs text-orange-600">Surface temperature reduction</div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Wind className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-purple-900 text-sm">Noise Reduction</span>
                  </div>
                  <div className="text-lg font-bold text-purple-700">
                    {(roofElements.find(el => el.id === 'green')?.percentage || 0 * 0.4).toFixed(1)} dB
                  </div>
                  <div className="text-xs text-purple-600">Sound insulation improvement</div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Leaf className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-900 text-sm">Biodiversity Index</span>
                  </div>
                  <div className="text-lg font-bold text-green-700">
                    {Math.min(100, (roofElements.find(el => el.id === 'green')?.percentage || 0) * 1.2).toFixed(0)}%
                  </div>
                  <div className="text-xs text-green-600">Habitat creation potential</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cost-Benefit Analysis */}
        {activeView === 'breakdown' && totalCoverage === 100 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cost Analysis */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">Cost Analysis</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-gray-700 text-sm">Initial Investment</span>
                    <span className="font-semibold text-gray-900 text-sm">€{costs.initialCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-gray-700 text-sm">Annual Maintenance</span>
                    <span className="font-semibold text-gray-900 text-sm">€{costs.annualMaintenance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-gray-700 text-sm">25-Year Total Cost</span>
                    <span className="font-semibold text-gray-900 text-sm">
                      €{(costs.initialCost + costs.annualMaintenance * 25).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Benefit Analysis */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">Environmental Benefits</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-gray-700 text-sm">Annual CO₂ Offset</span>
                    <span className="font-semibold text-green-600 text-sm">{benefits.co2.toLocaleString()} kg</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-gray-700 text-sm">25-Year CO₂ Offset</span>
                    <span className="font-semibold text-green-600 text-sm">{(benefits.co2 * 25).toLocaleString()} kg</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-gray-700 text-sm">Annual Energy Impact</span>
                    <span className="font-semibold text-blue-600 text-sm">{benefits.energy.toLocaleString()} kWh</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-gray-700 text-sm">Annual NOₓ Reduction</span>
                    <span className="font-semibold text-purple-600 text-sm">{benefits.nox.toFixed(1)} kg</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ROI Analysis */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">Return on Investment Analysis</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">
                    {breakEvenYear ? `${breakEvenYear} years` : 'N/A'}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">Environmental Break-Even</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">
                    €{((benefits.energy * 0.25 - costs.annualMaintenance) * 25).toLocaleString()}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">25-Year Net Savings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-2">
                    {(benefits.co2 / (costs.initialCost / 1000)).toFixed(1)}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">kg CO₂ per €1000 invested</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Optimization View */}
        {activeView === 'optimization' && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Multi-Objective Optimization</h3>
              <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                Advanced optimization algorithms will help you find the perfect balance between environmental impact, 
                cost efficiency, and performance based on your specific priorities and constraints.
              </p>
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3 text-sm">Optimization Objectives:</h4>
                <ul className="text-left space-y-2 text-xs text-gray-700">
                  <li>• Maximize CO₂ offset potential</li>
                  <li>• Minimize total cost of ownership</li>
                  <li>• Optimize energy generation</li>
                  <li>• Balance maintenance requirements</li>
                  <li>• Consider local climate factors</li>
                </ul>
              </div>
              <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium opacity-75 cursor-not-allowed">
                Coming Soon - Advanced Optimization
              </button>
            </div>
          </div>
        )}

        {/* Warning for incomplete design */}
        {totalCoverage !== 100 && activeView !== 'design' && (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Complete Your Roof Design</h3>
            <p className="text-gray-600 mb-4 text-sm">
              Please allocate 100% of your roof area to see the environmental impact analysis.
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

      {/* Custom CSS for mobile-optimized slider */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid #10b981;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid #10b981;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        @media (max-width: 640px) {
          .slider::-webkit-slider-thumb {
            height: 24px;
            width: 24px;
          }
          
          .slider::-moz-range-thumb {
            height: 24px;
            width: 24px;
          }
        }
      `}</style>
    </div>
  );
}