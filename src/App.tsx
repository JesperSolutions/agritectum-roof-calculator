import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';
import { Leaf, Zap, Wind, Calendar, TrendingUp, Calculator, Info, Euro, Sun, FileText } from 'lucide-react';
import LeadCaptureModal from './components/LeadCaptureModal';

const ROOF_TYPES = {
  "Photocatalytic Coating": { 
    co2: 1.94, 
    nox: 0.1, 
    energy: 0, // Removed default energy savings
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
    energy: 8.5, // Keep energy savings for cool roof (cooling benefits)
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
    energy: 1.5, // Keep energy savings for green roof (insulation benefits)
    lifespan: 40,
    maintenance: 'Trim plants yearly, check drainage twice annually.',
    color: '#34D399',
    materialCost: 38.50,
    laborCost: 6.50,
    totalCost: 45.00,
    installationRate: 12,
    description: 'Extensive green roof system with sedum or grass'
  }
};

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

export default function RoofImpactDashboard() {
  const [roofSize, setRoofSize] = useState(1000);
  const [roofType, setRoofType] = useState<keyof typeof ROOF_TYPES>("Photocatalytic Coating");
  const [includeSolar, setIncludeSolar] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const data = ROOF_TYPES[roofType];

  const initialCo2 = 19 * roofSize;
  const co2PerYear = data.co2 * roofSize;
  const noxPerYear = data.nox * roofSize;
  const energyPerYear = data.energy * roofSize;

  // Calculate annual solar generation (kWh/year) with performance factor
  const solarEnergyPerYear = includeSolar 
    ? (SOLAR_SPECS.powerPerM2 * roofSize * SOLAR_SPECS.hoursPerDay 
        * SOLAR_SPECS.daysPerYear * SOLAR_SPECS.performanceFactor) / 1000 
    : 0;  // kWh/year (includes derating for real conditions)

  const solarCo2PerYear = includeSolar ? solarEnergyPerYear * SOLAR_SPECS.co2PerKwh : 0;
  const solarCost = includeSolar ? SOLAR_SPECS.costPerM2 * roofSize : 0;

  // Combined totals
  const totalEnergyPerYear = energyPerYear + solarEnergyPerYear;
  const totalCo2PerYear = co2PerYear + solarCo2PerYear;

  // Recalculate neutralYear with updated totalCo2PerYear
  const neutralYear = totalCo2PerYear > 0 ? Math.ceil(initialCo2 / totalCo2PerYear) : null;

  const totalInstallationCost = (data.totalCost * roofSize) + solarCost;
  const installationTimeHours = data.installationRate > 0 ? roofSize / data.installationRate : 0;
  const solarInstallationHours = includeSolar ? roofSize / 20 : 0; // 20 m²/hour for solar
  const totalInstallationHours = installationTimeHours + solarInstallationHours;
  const installationDays = Math.ceil(totalInstallationHours / 8);

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
    co2Offset: typeData.co2 * roofSize + (includeSolar ? solarCo2PerYear : 0),
    energySavings: typeData.energy * roofSize + (includeSolar ? solarEnergyPerYear : 0),
    noxReduction: typeData.nox * roofSize,
    totalCost: typeData.totalCost * roofSize + (includeSolar ? solarCost : 0),
    color: typeData.color
  }));

  // Calculator data for the modal
  const calculatorData = {
    roofSize,
    roofType,
    includeSolar,
    totalCo2PerYear,
    totalEnergyPerYear,
    noxPerYear,
    neutralYear,
    totalInstallationCost,
    solarEnergyPerYear
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
        {/* Controls Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Calculator className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Roof For Good CO2, Impact Calculator.</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Roof Size Input */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Estimated size of roof (m²)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={roofSize}
                  onChange={(e) => setRoofSize(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-lg font-medium"
                  min="1"
                  step="50"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <span className="text-gray-500 text-sm font-medium">m²</span>
                </div>
              </div>
              <div className="flex space-x-2">
                {[500, 1000, 2000, 5000].map((size) => (
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
            </div>

            {/* Roof Type Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Roof Type
              </label>
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
                  <h3 className="text-lg font-semibold text-gray-900">Add Solar Panels</h3>
                  <p className="text-sm text-gray-600">
                    Generate clean energy and increase CO₂ offset (+€{SOLAR_SPECS.costPerM2}/m²)
                  </p>
                  <div className="mt-1 text-xs text-gray-500">
                    Performance factor: {(SOLAR_SPECS.performanceFactor * 100)}% • Degradation: {(SOLAR_SPECS.degradationRate * 100)}%/year
                  </div>
                  {includeSolar && (
                    <div className="mt-2 text-sm text-yellow-700 font-medium">
                      Expected generation: {solarEnergyPerYear.toLocaleString()} kWh/year (Year 1)
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Leaf className="w-8 h-8 opacity-80" />
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
              <Zap className="w-8 h-8 opacity-80" />
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
              <Wind className="w-8 h-8 opacity-80" />
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
              <Calendar className="w-8 h-8 opacity-80" />
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
              <Euro className="w-8 h-8 opacity-80" />
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

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* CO₂ Impact Over Time */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-semibold text-gray-900">CO₂ Impact Over 50 Years</h3>
              {includeSolar && (
                <div className="text-xs text-gray-500 bg-yellow-50 px-2 py-1 rounded">
                  Includes solar degradation
                </div>
              )}
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
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
                      name === 'cumulativeOffset' ? 'Cumulative CO₂ Offset' : 
                      name === 'netCo2' ? 'Remaining CO₂ Debt' : name
                    ]}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="cumulativeOffset" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    name="Cumulative CO₂ Offset"
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="netCo2" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    name="Remaining CO₂ Debt"
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                  />
                  {includeSolar && (
                    <Line 
                      type="monotone" 
                      dataKey="solarGeneration" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Annual Solar Generation"
                      dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cost vs Environmental Impact Comparison */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <Info className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-900">Cost vs CO₂ Impact</h3>
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
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Comprehensive Analysis</h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Environmental Impact</h4>
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
                <h4 className="font-semibold text-gray-900 mb-3">Cost Analysis</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                    <span className="text-gray-700">Roof Installation Cost</span>
                    <span className="font-semibold text-emerald-700">€{(data.totalCost * roofSize).toLocaleString()}</span>
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
                <h4 className="font-semibold text-gray-900 mb-3">Technical Specifications</h4>
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
            <h4 className="font-semibold text-gray-900 mb-3">Maintenance Requirements</h4>
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-gray-700 text-sm leading-relaxed"><strong>Roof System:</strong> {data.maintenance}</p>
              </div>
              {includeSolar && (
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    <strong>Solar Panels:</strong> Clean panels twice yearly, inspect electrical connections annually. 
                    Expected maintenance cost: €{(SOLAR_SPECS.maintenanceCost * roofSize).toLocaleString()}/year.
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