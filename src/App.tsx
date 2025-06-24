import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';
import { Leaf, Zap, Wind, Calendar, TrendingUp, Calculator, Info, Euro, Sun, FileText, ToggleLeft, ToggleRight, Save, FolderOpen, HelpCircle } from 'lucide-react';
import LeadCaptureModal from './components/LeadCaptureModal';
import LocationSelector from './components/LocationSelector';
import ProjectManager from './components/ProjectManager';
import EnhancedCharts from './components/EnhancedCharts';
import SmartRecommendations from './components/SmartRecommendations';
import HelpTooltip from './components/HelpTooltip';
import { Project, LocationData, ROOF_TYPES } from './types/project';
import { generateProjectId } from './utils/projectStorage';

// Add realistic performance and degradation factors to SOLAR_SPECS
const SOLAR_SPECS = {
  powerPerM2: 200,           // Watts per m² (monocrystalline panel at STC)
  hoursPerDay: 4.5,          // Avg peak sun hours per day (base value)
  daysPerYear: 365,
  performanceFactor: 0.75,   // Derating for losses (orientation, weather, etc.)
  degradationRate: 0.005,    // 0.5% output loss per year (monocrystalline panels)
  co2PerKwh: 0.4,
  costPerM2: 150,
  maintenanceCost: 2,
  lifespan: 25 // years
};

// Conversion factor: 1 m² = 10.764 sq ft
const M2_TO_SQFT = 10.764;

export default function RoofImpactDashboard() {
  const [roofSize, setRoofSize] = useState(1000);
  const [roofType, setRoofType] = useState<keyof typeof ROOF_TYPES>("Photocatalytic Coating");
  const [includeSolar, setIncludeSolar] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [useMetric, setUseMetric] = useState(true); // true = m², false = sq ft
  const [location, setLocation] = useState<LocationData | null>(null);
  const [currentProject, setCurrentProject] = useState<Partial<Project>>({
    id: generateProjectId(),
    createdAt: new Date()
  });

  const data = ROOF_TYPES[roofType];

  // Convert roof size for calculations (always use m² internally)
  const roofSizeM2 = useMetric ? roofSize : roofSize / M2_TO_SQFT;

  const initialCo2 = 19 * roofSizeM2;
  const co2PerYear = data.co2 * roofSizeM2;
  const noxPerYear = data.nox * roofSizeM2;
  const energyPerYear = data.energy * roofSizeM2;

  // Adjust solar calculations based on location
  const locationMultiplier = location ? (location.solarIrradiance / 1100) : 1; // 1100 is base irradiance
  const adjustedSolarHours = SOLAR_SPECS.hoursPerDay * locationMultiplier;

  // Calculate annual solar generation (kWh/year) with performance factor and location adjustment
  const solarEnergyPerYear = includeSolar 
    ? (SOLAR_SPECS.powerPerM2 * roofSizeM2 * adjustedSolarHours 
        * SOLAR_SPECS.daysPerYear * SOLAR_SPECS.performanceFactor) / 1000 
    : 0;  // kWh/year (includes derating for real conditions)

  const solarCo2PerYear = includeSolar ? solarEnergyPerYear * SOLAR_SPECS.co2PerKwh : 0;
  const solarCost = includeSolar ? SOLAR_SPECS.costPerM2 * roofSizeM2 : 0;

  // Combined totals
  const totalEnergyPerYear = energyPerYear + solarEnergyPerYear;
  const totalCo2PerYear = co2PerYear + solarCo2PerYear;

  // Recalculate neutralYear with updated totalCo2PerYear
  const neutralYear = totalCo2PerYear > 0 ? Math.ceil(initialCo2 / totalCo2PerYear) : null;

  const totalInstallationCost = (data.totalCost * roofSizeM2) + solarCost;
  const installationTimeHours = data.installationRate > 0 ? roofSizeM2 / data.installationRate : 0;
  const solarInstallationHours = includeSolar ? roofSizeM2 / 20 : 0; // 20 m²/hour for solar
  const totalInstallationHours = installationTimeHours + solarInstallationHours;
  const installationDays = Math.ceil(totalInstallationHours / 8);

  // Update current project when settings change
  useEffect(() => {
    setCurrentProject(prev => ({
      ...prev,
      roofSize: roofSizeM2,
      roofType,
      includeSolar,
      useMetric,
      location,
      updatedAt: new Date()
    }));
  }, [roofSizeM2, roofType, includeSolar, useMetric, location]);

  // If we want to factor panel degradation into the 50-year chart:
  const chartData = [];
  let cumulativeCo2 = 0;

  for (let year = 0; year <= 50; year++) {
    let solarGenThisYear = 0;
    if (includeSolar && year <= SOLAR_SPECS.lifespan) {
      solarGenThisYear = solarEnergyPerYear * Math.pow(1 - SOLAR_SPECS.degradationRate, year);
    }

    const energyThisYear = energyPerYear + solarGenThisYear;
    const co2OffsetThisYear = co2PerYear + (solarGenThisYear * SOLAR_SPECS.co2PerKwh);

    cumulativeCo2 += co2OffsetThisYear;
    const netCo2 = Math.max(0, initialCo2 - cumulativeCo2);

    chartData.push({
      year,
      cumulativeOffset: cumulativeCo2,
      netCo2,
      energySavings: energyThisYear,
      noxReduction: noxPerYear,
      solarGeneration: solarGenThisYear
    });
  }

  const comparisonData = Object.entries(ROOF_TYPES).map(([name, typeData]) => ({
    name,
    co2Offset: typeData.co2 * roofSizeM2 + (includeSolar ? solarCo2PerYear : 0),
    energySavings: typeData.energy * roofSizeM2 + (includeSolar ? solarEnergyPerYear : 0),
    noxReduction: typeData.nox * roofSizeM2,
    totalCost: typeData.totalCost * roofSizeM2 + (includeSolar ? solarCost : 0),
    color: typeData.color
  }));

  // Calculator data for the modal
  const calculatorData = {
    roofSize: roofSizeM2, // Always pass m² to modal
    roofSizeDisplay: roofSize, // Display value in current unit
    unit: useMetric ? 'm²' : 'sq ft',
    roofType,
    includeSolar,
    totalCo2PerYear,
    totalEnergyPerYear,
    noxPerYear,
    neutralYear,
    totalInstallationCost,
    solarEnergyPerYear
  };

  // Handle unit conversion when toggling
  const handleUnitToggle = () => {
    if (useMetric) {
      // Converting from m² to sq ft
      setRoofSize(Math.round(roofSize * M2_TO_SQFT));
    } else {
      // Converting from sq ft to m²
      setRoofSize(Math.round(roofSize / M2_TO_SQFT));
    }
    setUseMetric(!useMetric);
  };

  // Quick size buttons based on current unit
  const quickSizes = useMetric 
    ? [500, 1000, 2000, 5000] 
    : [5382, 10764, 21528, 53820]; // Equivalent in sq ft

  const handleProjectLoad = (project: Project) => {
    setRoofSize(project.useMetric ? project.roofSize : Math.round(project.roofSize * M2_TO_SQFT));
    setRoofType(project.roofType);
    setIncludeSolar(project.includeSolar);
    setUseMetric(project.useMetric);
    setLocation(project.location || null);
    setCurrentProject(project);
  };

  const handleNewProject = () => {
    setRoofSize(1000);
    setRoofType("Photocatalytic Coating");
    setIncludeSolar(false);
    setUseMetric(true);
    setLocation(null);
    setCurrentProject({
      id: generateProjectId(),
      createdAt: new Date()
    });
  };

  const handleRecommendationApply = (recommendation: any) => {
    if (recommendation.type === 'add_solar') {
      setIncludeSolar(recommendation.data.includeSolar);
    } else if (recommendation.type === 'change_roof_type') {
      setRoofType(recommendation.data.roofType);
    }
    // Add more recommendation types as needed
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-20 h-12">
                <img
                  src="/logo.webp"
                  alt="Agritectum logo"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Project Management */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <FolderOpen className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Project Management</h2>
            <HelpTooltip content="Save your current roof configuration as a project to compare different scenarios or return to later. You can manage multiple projects and track your progress through the decision-making process." />
          </div>
          <ProjectManager 
            currentProject={currentProject}
            onProjectLoad={handleProjectLoad}
            onNewProject={handleNewProject}
          />
        </div>

        {/* Location Selector */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center space-x-3 mb-4">
            <HelpTooltip content="Location affects solar panel efficiency and climate-specific benefits. Enter your building's location to get more accurate calculations based on local solar irradiance, climate zone, and temperature ranges." />
          </div>
          <LocationSelector 
            location={location}
            onLocationChange={setLocation}
          />
        </div>

        {/* Smart Recommendations */}
        <SmartRecommendations
          roofSize={roofSizeM2}
          roofType={roofType}
          includeSolar={includeSolar}
          location={location}
          totalCo2PerYear={totalCo2PerYear}
          totalEnergyPerYear={totalEnergyPerYear}
          totalInstallationCost={totalInstallationCost}
          onRecommendationApply={handleRecommendationApply}
        />

        {/* Controls Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Calculator className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Roof For Good CO2, Impact Calculator.</h2>
            <HelpTooltip content="Configure your roof specifications to calculate environmental impact, energy savings, and installation costs. Adjust the roof size, select the type of sustainable roofing solution, and optionally add solar panels for maximum benefit." />
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Roof Size Input */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Estimated size of roof ({useMetric ? 'm²' : 'sq ft'})
                  </label>
                  <HelpTooltip content="Enter the approximate size of your roof area. You can toggle between square meters (m²) and square feet (sq ft). Use the quick size buttons for common roof sizes, or enter a custom value." />
                </div>
                <button
                  onClick={handleUnitToggle}
                  className="flex items-center space-x-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
                >
                  <span className={useMetric ? 'font-semibold text-green-600' : 'text-gray-500'}>m²</span>
                  {useMetric ? <ToggleLeft className="w-4 h-4 text-green-600" /> : <ToggleRight className="w-4 h-4 text-gray-500" />}
                  <span className={!useMetric ? 'font-semibold text-green-600' : 'text-gray-500'}>sq ft</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={roofSize}
                  onChange={(e) => setRoofSize(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-lg font-medium"
                  min="1"
                  step={useMetric ? "50" : "500"}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <span className="text-gray-500 text-sm font-medium">{useMetric ? 'm²' : 'sq ft'}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                {quickSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setRoofSize(size)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                      roofSize === size 
                        ? 'bg-green-100 text-green-700 border border-green-300' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                    }`}
                  >
                    {size.toLocaleString()}
                  </button>
                ))}
              </div>
              {!useMetric && (
                <div className="text-xs text-gray-500">
                  ≈ {Math.round(roofSizeM2).toLocaleString()} m² for calculations
                </div>
              )}
            </div>

            {/* Roof Type Selection */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <label className="block text-sm font-medium text-gray-700">
                  Roof Type
                </label>
                <HelpTooltip content="Choose from different sustainable roofing solutions. Each type offers different environmental benefits, costs, and lifespans. Photocatalytic coating reduces air pollution, cool roof coating saves energy, and green roofs provide insulation and biodiversity benefits." />
              </div>
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(ROOF_TYPES).map(([type, typeData]) => (
                  <button
                    key={type}
                    onClick={() => setRoofType(type as keyof typeof ROOF_TYPES)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      roofType === type
                        ? 'border-green-500 bg-green-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: typeData.color }}
                        />
                        <div>
                          <div className="font-medium text-gray-900">{type}</div>
                          <div className="text-xs text-gray-500">{typeData.lifespan} year lifespan</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          {typeData.totalCost > 0 ? `€${typeData.totalCost.toFixed(2)}/m²` : 'Baseline'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {typeData.installationRate > 0 ? `${typeData.installationRate} m²/h` : 'Standard'}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Solar Panel Option */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-xl">
                  <Sun className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900">Add Solar Panels</h3>
                    <HelpTooltip content="Solar panels generate clean electricity and significantly increase your CO₂ offset. The system includes performance degradation over time and location-based efficiency adjustments. Installation cost is additional to the roof system." />
                  </div>
                  <p className="text-sm text-gray-600">
                    Generate clean energy and increase CO₂ offset (+€{SOLAR_SPECS.costPerM2}/m²)
                  </p>
                  <div className="mt-1 text-xs text-gray-500">
                    Performance factor: {(SOLAR_SPECS.performanceFactor * 100)}% • Degradation: {(SOLAR_SPECS.degradationRate * 100)}%/year
                    {location && ` • Location adjusted: ${(locationMultiplier * 100).toFixed(0)}%`}
                  </div>
                  {includeSolar && (
                    <div className="mt-2 text-sm text-yellow-700 font-medium">
                      Expected generation: {solarEnergyPerYear.toLocaleString()} kWh/year (Year 1)
                      {location && ` • Irradiance: ${location.solarIrradiance} kWh/m²/year`}
                    </div>
                  )}
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSolar}
                  onChange={(e) => setIncludeSolar(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-yellow-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Key Environmental & Financial Metrics</h2>
            <HelpTooltip content="These metrics show the annual environmental impact and financial investment for your selected roof configuration. Values are calculated based on your roof size, type, location (if selected), and solar panel inclusion." />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Leaf className="w-8 h-8 opacity-80" />
                  <HelpTooltip 
                    content="Annual CO₂ offset from your roof system. This includes CO₂ absorbed or prevented by the roof coating/system plus CO₂ offset from solar energy generation (if included)." 
                    iconColor="text-green-100"
                  />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{totalCo2PerYear.toLocaleString()}</div>
                  <div className="text-green-100 text-sm">kg CO₂/year</div>
                </div>
              </div>
              <div className="text-green-100 text-sm">
                Carbon Offset Annual
                {includeSolar && (
                  <div className="text-xs mt-1 opacity-80">
                    (incl. {solarCo2PerYear.toLocaleString()} kg from solar)
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Zap className="w-8 h-8 opacity-80" />
                  <HelpTooltip 
                    content="Annual energy impact from your roof system. This includes energy savings from cooling effects (cool roofs) plus electricity generated by solar panels (if included)." 
                    iconColor="text-blue-100"
                  />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{totalEnergyPerYear.toLocaleString()}</div>
                  <div className="text-blue-100 text-sm">kWh/year</div>
                </div>
              </div>
              <div className="text-blue-100 text-sm">
                {includeSolar ? 'Energy Generated + Saved' : 'Energy Savings'}
                {includeSolar && (
                  <div className="text-xs mt-1 opacity-80">
                    ({solarEnergyPerYear.toLocaleString()} kWh solar generation)
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Wind className="w-8 h-8 opacity-80" />
                  <HelpTooltip 
                    content="Annual nitrogen oxide (NOₓ) reduction from photocatalytic coatings. NOₓ are harmful air pollutants that contribute to smog and respiratory problems. This metric shows how much cleaner air your roof creates." 
                    iconColor="text-purple-100"
                  />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{noxPerYear.toLocaleString()}</div>
                  <div className="text-purple-100 text-sm">kg NOₓ/year</div>
                </div>
              </div>
              <div className="text-purple-100 text-sm">
                Air Quality Improvement
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-8 h-8 opacity-80" />
                  <HelpTooltip 
                    content="Time it takes for your roof to offset its initial carbon footprint from manufacturing and installation. This is when your roof becomes carbon-neutral and starts providing net environmental benefits." 
                    iconColor="text-orange-100"
                  />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {neutralYear ? neutralYear : '∞'}
                  </div>
                  <div className="text-orange-100 text-sm">years</div>
                </div>
              </div>
              <div className="text-orange-100 text-sm">
                Carbon Neutral Timeline
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Euro className="w-8 h-8 opacity-80" />
                  <HelpTooltip 
                    content="Total upfront investment including materials, labor, and installation for your selected roof system and solar panels (if included). This is a one-time cost that provides benefits over the system's entire lifespan." 
                    iconColor="text-emerald-100"
                  />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    €{totalInstallationCost.toLocaleString()}
                  </div>
                  <div className="text-emerald-100 text-sm">total cost</div>
                </div>
              </div>
              <div className="text-emerald-100 text-sm">
                Installation Investment
                {includeSolar && (
                  <div className="text-xs mt-1 opacity-80">
                    (incl. €{solarCost.toLocaleString()} solar)
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Charts Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Long-term Impact Analysis</h2>
            <HelpTooltip content="Detailed charts showing how your roof's environmental impact evolves over time. View 50-year projections, monthly breakdowns, seasonal variations, and comprehensive impact analysis with multiple visualization options." />
          </div>
          <EnhancedCharts 
            chartData={chartData}
            roofType={roofType}
            includeSolar={includeSolar}
            totalCo2PerYear={totalCo2PerYear}
            totalEnergyPerYear={totalEnergyPerYear}
            noxPerYear={noxPerYear}
            location={location}
          />
        </div>

        {/* Simple Comparison Chart */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Info className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-900">Roof Type Comparison</h3>
            <HelpTooltip content="Compare all available roof types side by side. Green bars show annual CO₂ offset (environmental benefit), while blue bars show total installation cost. This helps you choose the best option for your priorities and budget." />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#666" angle={-45} textAnchor="end" height={80} />
                <YAxis yAxisId="left" stroke="#666" />
                <YAxis yAxisId="right" orientation="right" stroke="#666" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: any, name: string) => [
                    name === 'totalCost' ? `€${Number(value).toLocaleString()}` : `${Number(value).toLocaleString()} kg`,
                    name === 'co2Offset' ? 'Annual CO₂ Offset' : 'Total Installation Cost'
                  ]}
                />
                <Bar 
                  yAxisId="left"
                  dataKey="co2Offset" 
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  name="Annual CO₂ Offset"
                />
                <Bar 
                  yAxisId="right"
                  dataKey="totalCost" 
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  name="Total Installation Cost"
                  opacity={0.7}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl shadow-xl p-8 text-white">
          <div className="text-center max-w-3xl mx-auto">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-90" />
            <h2 className="text-3xl font-bold mb-4">
              Ready to Transform Your Roof?
            </h2>
            <p className="text-xl text-green-100 mb-8">
              Get a personalized assessment and detailed report based on your specific building and requirements.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-white text-green-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-green-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Get Your Personal Roof Assessment
            </button>
            <p className="text-sm text-green-200 mt-4">
              Free consultation • No commitment • Expert guidance
            </p>
          </div>
        </div>

        {/* Detailed Information */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Comprehensive Analysis</h3>
            <HelpTooltip content="Detailed breakdown of all calculations, costs, and technical specifications for your selected roof configuration. This section provides transparency into how all metrics are calculated and what maintenance requirements you can expect." />
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-6">
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <h4 className="font-semibold text-gray-900">Environmental Impact</h4>
                  <HelpTooltip content="Complete environmental impact analysis including initial carbon footprint from manufacturing, annual benefits, and long-term projections over 50 years." />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="text-gray-700">Initial CO₂ Footprint</span>
                    <span className="font-semibold text-red-700">{initialCo2.toLocaleString()} kg</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-gray-700">50-Year CO₂ Offset</span>
                    <span className="font-semibold text-green-700">{(totalCo2PerYear * 50).toLocaleString()} kg</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-gray-700">50-Year Energy Impact</span>
                    <span className="font-semibold text-blue-700">{(totalEnergyPerYear * 50).toLocaleString()} kWh</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="text-gray-700">50-Year NOₓ Reduction</span>
                    <span className="font-semibold text-purple-700">{(noxPerYear * 50).toLocaleString()} kg</span>
                  </div>
                  {includeSolar && (
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <span className="text-gray-700">50-Year Solar Generation</span>
                      <span className="font-semibold text-yellow-700">{(solarEnergyPerYear * 25).toLocaleString()} kWh</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <h4 className="font-semibold text-gray-900">Cost Analysis</h4>
                  <HelpTooltip content="Complete cost breakdown including materials, labor, installation time, and potential energy savings value. All costs are upfront investments with benefits realized over the system lifespan." />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                    <span className="text-gray-700">Roof Installation Cost</span>
                    <span className="font-semibold text-emerald-700">€{(data.totalCost * roofSizeM2).toLocaleString()}</span>
                  </div>
                  {includeSolar && (
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <span className="text-gray-700">Solar Installation Cost</span>
                      <span className="font-semibold text-yellow-700">€{solarCost.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-gray-700">Total Investment</span>
                    <span className="font-semibold text-blue-700">€{totalInstallationCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="text-gray-700">Installation Time</span>
                    <span className="font-semibold text-orange-700">
                      {installationDays > 0 ? `${installationDays} days` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-gray-700">Annual Energy Value</span>
                    <span className="font-semibold text-green-700">€{(totalEnergyPerYear * 0.25).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <h4 className="font-semibold text-gray-900">Technical Specifications</h4>
                  <HelpTooltip content="Technical details about system performance, lifespan, installation rates, and maintenance requirements. These specifications help you understand what to expect from your chosen roof system." />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Roof System Lifespan</span>
                    <span className="font-semibold text-gray-700">{data.lifespan} years</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">CO₂ Offset Rate</span>
                    <span className="font-semibold text-gray-700">{data.co2} kg/m²/year</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Energy Efficiency</span>
                    <span className="font-semibold text-gray-700">{data.energy} kWh/m²/year</span>
                  </div>
                  {includeSolar && (
                    <>
                      <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                        <span className="text-gray-700">Solar Power Density</span>
                        <span className="font-semibold text-yellow-700">{SOLAR_SPECS.powerPerM2} W/m²</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                        <span className="text-gray-700">Solar Performance Factor</span>
                        <span className="font-semibold text-yellow-700">{(SOLAR_SPECS.performanceFactor * 100)}%</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                        <span className="text-gray-700">Solar Lifespan</span>
                        <span className="font-semibold text-yellow-700">{SOLAR_SPECS.lifespan} years</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Installation Rate</span>
                    <span className="font-semibold text-gray-700">
                      {data.installationRate > 0 ? `${data.installationRate} m²/hour` : 'Standard'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center space-x-2 mb-3">
              <h4 className="font-semibold text-gray-900">Maintenance Requirements</h4>
              <HelpTooltip content="Ongoing maintenance requirements to ensure optimal performance throughout the system lifespan. Regular maintenance preserves environmental benefits and extends system life." />
            </div>
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-gray-700 text-sm leading-relaxed"><strong>Roof System:</strong> {data.maintenance}</p>
              </div>
              {includeSolar && (
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    <strong>Solar Panels:</strong> Clean panels twice yearly, inspect electrical connections annually. 
                    Expected maintenance cost: €{(SOLAR_SPECS.maintenanceCost * roofSizeM2).toLocaleString()}/year.
                    Performance degrades by {(SOLAR_SPECS.degradationRate * 100)}% annually.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-gray-600 text-sm">
            © 2025 Agritectum - Sustainable Building Solutions | 
            <a href="mailto:jesper.aggerholm@agritectum.com" className="text-green-600 hover:text-green-700 ml-1">
              info@agritectum.com
            </a>
          </p>
        </div>
      </div>

      {/* Lead Capture Modal */}
      <LeadCaptureModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        calculatorData={calculatorData}
      />
    </div>
  );
}