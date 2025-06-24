import React, { useState, useEffect } from 'react';
import { Leaf, Zap, Wind, Sun, Calculator, TrendingUp, AlertTriangle, CheckCircle, Info, BarChart3, PieChart, Target, Settings } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, PieChart as RechartsPieChart, Cell, BarChart, Bar, Pie } from 'recharts';
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
    co2PerM2PerYear: 80, // CO2 offset from electricity generation
    energyPerM2PerYear: 200, // kWh/m²/year
    noxPerM2PerYear: 0,
    initialCo2PerM2: 45, // Manufacturing footprint
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
    energyPerM2PerYear: 15, // Insulation energy savings
    noxPerM2PerYear: 0.05,
    initialCo2PerM2: 8, // Soil and plant materials
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
    energyPerM2PerYear: 25, // Cooling energy savings
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
  const [activeView, setActiveView] = useState<'design' | 'analysis' | 'timeline' | 'breakdown'>('design');

  useEffect(() => {
    const total = roofElements.reduce((sum, element) => sum + element.percentage, 0);
    setTotalCoverage(total);
    
    if (total === 100) {
      calculateEnvironmentalImpact();
      analyzeInteractions();
    }
  }, [roofElements, roofSize, location]);

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

  const calculateEnvironmentalImpact = () => {
    const data: EnvironmentalData[] = [];
    let cumulativeCo2Offset = 0;
    
    // Calculate initial CO2 impact (negative)
    const initialCo2Impact = roofElements.reduce((sum, element) => 
      sum + (element.percentage / 100) * roofSize * element.initialCo2PerM2, 0
    );

    for (let year = 0; year <= 50; year++) {
      // Calculate annual benefits for each element
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

      // Calculate maintenance costs
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

      // Find break-even point
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
    const degradationFactor = Math.pow(0.995, year); // 0.5% annual degradation
    
    const energy = area * solarElement.energyPerM2PerYear * locationMultiplier * degradationFactor;
    const co2 = energy * 0.4; // CO2 offset from clean electricity

    return { co2, energy, nox: 0 };
  };

  const calculateGreenRoofBenefits = (year: number) => {
    const greenElement = roofElements.find(el => el.id === 'green');
    if (!greenElement || greenElement.percentage === 0 || year > greenElement.lifespan) {
      return { co2: 0, energy: 0, nox: 0 };
    }

    const area = (greenElement.percentage / 100) * roofSize;
    const maturityFactor = Math.min(1, year / 3); // Plants reach full benefit after 3 years
    
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
    const reapplicationCycle = Math.floor(year / 2); // Reapply every 2 years
    const effectivenessFactor = year % 2 === 0 ? 1.0 : 0.7; // Effectiveness decreases between applications
    
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

    // Check for conflicts and synergies
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

    // Specific interaction analysis
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

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      <div className="flex items-center space-x-3 mb-6">
        <Settings className="w-6 h-6 text-green-600" />
        <h2 className="text-xl font-semibold text-gray-900">Custom Roof Environmental Impact Analysis</h2>
        <HelpTooltip content="Design a mixed-use roof by allocating percentages to different elements. The system calculates initial CO2 impact, ongoing benefits, break-even points, and analyzes synergies and conflicts between elements." />
      </div>

      {/* View Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
        {[
          { id: 'design', label: 'Roof Design', icon: Settings },
          { id: 'analysis', label: 'Impact Analysis', icon: BarChart3 },
          { id: 'timeline', label: 'Timeline View', icon: TrendingUp },
          { id: 'breakdown', label: 'Cost-Benefit', icon: Calculator }
        ].map((tab) => {
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

      {/* Design View */}
      {activeView === 'design' && (
        <div className="space-y-6">
          {/* Coverage Status */}
          <div className={`p-4 rounded-lg border-2 ${
            totalCoverage === 100 ? 'border-green-500 bg-green-50' :
            totalCoverage > 100 ? 'border-red-500 bg-red-50' :
            'border-yellow-500 bg-yellow-50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Total Roof Coverage</span>
              <span className="text-2xl font-bold">{totalCoverage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  totalCoverage === 100 ? 'bg-green-500' :
                  totalCoverage > 100 ? 'bg-red-500' :
                  'bg-yellow-500'
                }`}
                style={{ width: `${Math.min(100, totalCoverage)}%` }}
              />
            </div>
            {totalCoverage !== 100 && (
              <div className="mt-2 flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {totalCoverage < 100 ? 
                    `${(100 - totalCoverage).toFixed(1)}% remaining` : 
                    `${(totalCoverage - 100).toFixed(1)}% over capacity`
                  }
                </span>
                {totalCoverage > 0 && totalCoverage !== 100 && (
                  <button
                    onClick={autoBalance}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    Auto Balance
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Roof Element Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roofElements.map((element) => (
              <div key={element.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div 
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: element.color }}
                  />
                  <h3 className="font-semibold text-gray-900">{element.name}</h3>
                  <span className="text-sm text-gray-500">
                    {element.percentage.toFixed(1)}%
                  </span>
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
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
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
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Area:</span>
                      <div className="font-medium">
                        {((element.percentage / 100) * roofSize).toFixed(0)} m²
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Cost:</span>
                      <div className="font-medium">
                        €{((element.percentage / 100) * roofSize * element.costPerM2).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Lifespan:</span>
                      <div className="font-medium">{element.lifespan} years</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Annual CO₂:</span>
                      <div className="font-medium text-green-600">
                        {((element.percentage / 100) * roofSize * element.co2PerM2PerYear).toFixed(0)} kg
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Roof Visualization */}
          {totalCoverage > 0 && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Roof Composition</h3>
              <div className="flex items-center space-x-6">
                <div className="w-64 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
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
                
                <div className="flex-1 space-y-3">
                  {pieChartData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{item.value.toFixed(1)}%</div>
                        <div className="text-sm text-gray-500">
                          {((item.value / 100) * roofSize).toFixed(0)} m²
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Interactions Analysis */}
          {(synergies.length > 0 || conflicts.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {synergies.length > 0 && (
                <div className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-green-900">Synergies Detected</h3>
                  </div>
                  <ul className="space-y-2">
                    {synergies.map((synergy, index) => (
                      <li key={index} className="text-sm text-green-800 flex items-start space-x-2">
                        <span className="text-green-600 mt-1">•</span>
                        <span>{synergy}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {conflicts.length > 0 && (
                <div className="bg-yellow-50 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <h3 className="font-semibold text-yellow-900">Potential Conflicts</h3>
                  </div>
                  <ul className="space-y-2">
                    {conflicts.map((conflict, index) => (
                      <li key={index} className="text-sm text-yellow-800 flex items-start space-x-2">
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
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <AlertTriangle className="w-8 h-8 opacity-80" />
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {roofElements.reduce((sum, el) => sum + (el.percentage / 100) * roofSize * el.initialCo2PerM2, 0).toLocaleString()}
                  </div>
                  <div className="text-red-100 text-sm">kg CO₂</div>
                </div>
              </div>
              <div className="text-red-100 text-sm">Initial Environmental Impact</div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <Leaf className="w-8 h-8 opacity-80" />
                <div className="text-right">
                  <div className="text-2xl font-bold">{benefits.co2.toLocaleString()}</div>
                  <div className="text-green-100 text-sm">kg CO₂/year</div>
                </div>
              </div>
              <div className="text-green-100 text-sm">Annual CO₂ Offset</div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <Zap className="w-8 h-8 opacity-80" />
                <div className="text-right">
                  <div className="text-2xl font-bold">{benefits.energy.toLocaleString()}</div>
                  <div className="text-blue-100 text-sm">kWh/year</div>
                </div>
              </div>
              <div className="text-blue-100 text-sm">Annual Energy Impact</div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <Target className="w-8 h-8 opacity-80" />
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {breakEvenYear ? breakEvenYear : '∞'}
                  </div>
                  <div className="text-orange-100 text-sm">years</div>
                </div>
              </div>
              <div className="text-orange-100 text-sm">Break-Even Point</div>
            </div>
          </div>

          {/* Element Performance Breakdown */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Annual Performance by Element</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                      <span className="font-medium text-gray-900">{element.name}</span>
                    </div>
                    <div className="space-y-2 text-sm">
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
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={environmentalData.slice(0, 26)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="year" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: any, name: string) => [
                    `${Number(value).toLocaleString()} kg`,
                    name === 'cumulativeCo2Offset' ? 'Cumulative CO₂ Offset' : 
                    name === 'netCo2Impact' ? 'Net CO₂ Impact' : name
                  ]}
                />
                <Legend />
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
                {breakEvenYear && (
                  <Line 
                    type="monotone" 
                    dataKey={() => 0}
                    stroke="#000000"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    name="Break-Even Point"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Element Contribution Over Time */}
          <div className="h-96">
            <h3 className="font-semibold text-gray-900 mb-4">Energy Generation by Element</h3>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={environmentalData.slice(0, 26)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="year" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    `${Number(value).toLocaleString()} kWh`,
                    name
                  ]}
                />
                <Legend />
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

      {/* Cost-Benefit Analysis */}
      {activeView === 'breakdown' && totalCoverage === 100 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cost Breakdown */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Cost Analysis</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-700">Initial Investment</span>
                  <span className="font-semibold text-gray-900">€{costs.initialCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-700">Annual Maintenance</span>
                  <span className="font-semibold text-gray-900">€{costs.annualMaintenance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-700">25-Year Total Cost</span>
                  <span className="font-semibold text-gray-900">
                    €{(costs.initialCost + costs.annualMaintenance * 25).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Benefit Analysis */}
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Environmental Benefits</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-700">Annual CO₂ Offset</span>
                  <span className="font-semibold text-green-600">{benefits.co2.toLocaleString()} kg</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-700">25-Year CO₂ Offset</span>
                  <span className="font-semibold text-green-600">{(benefits.co2 * 25).toLocaleString()} kg</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-700">Annual Energy Impact</span>
                  <span className="font-semibold text-blue-600">{benefits.energy.toLocaleString()} kWh</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-700">Annual NOₓ Reduction</span>
                  <span className="font-semibold text-purple-600">{benefits.nox.toFixed(1)} kg</span>
                </div>
              </div>
            </div>
          </div>

          {/* ROI Analysis */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Return on Investment Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {breakEvenYear ? `${breakEvenYear} years` : 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Environmental Break-Even</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  €{((benefits.energy * 0.25 - costs.annualMaintenance) * 25).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">25-Year Net Savings</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {(benefits.co2 / (costs.initialCost / 1000)).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">kg CO₂ per €1000 invested</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warning for incomplete design */}
      {totalCoverage !== 100 && activeView !== 'design' && (
        <div className="text-center py-12">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Complete Your Roof Design</h3>
          <p className="text-gray-600 mb-4">
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
  );
}