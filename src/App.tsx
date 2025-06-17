import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';
import { Leaf, Zap, Wind, Calendar, TrendingUp, Calculator, Info, Euro } from 'lucide-react';

const ROOF_TYPES = {
  "Photocatalytic Coating": { 
    co2: 1.94, 
    nox: 0.1, 
    energy: 3.5, 
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
};

export default function RoofImpactDashboard() {
  const [roofSize, setRoofSize] = useState(1000);
  const [roofType, setRoofType] = useState<keyof typeof ROOF_TYPES>("Photocatalytic Coating");
  const [includeSolar, setIncludeSolar] = useState(false);
  const data = ROOF_TYPES[roofType];

  const initialCo2 = 19 * roofSize;

  const SOLAR_OFFSET = {
    co2: 12.1425,
    energy: 20.0
  };

  const baseCo2PerYear = data.co2 * roofSize;
  const baseEnergyPerYear = data.energy * roofSize;

  const solarCo2 = includeSolar ? SOLAR_OFFSET.co2 * roofSize : 0;
  const solarEnergy = includeSolar ? SOLAR_OFFSET.energy * roofSize : 0;

  const co2PerYear = baseCo2PerYear + solarCo2;
  const noxPerYear = data.nox * roofSize;
  const energyPerYear = baseEnergyPerYear + solarEnergy;

  const neutralYear = co2PerYear > 0 ? Math.ceil(initialCo2 / co2PerYear) : null;

  const totalInstallationCost = data.totalCost * roofSize;
  const installationTimeHours = data.installationRate > 0 ? roofSize / data.installationRate : 0;
  const installationDays = data.installationRate > 0 ? Math.ceil(installationTimeHours / 8) : 0;

  const chartData = Array.from({ length: 51 }, (_, i) => {
    const year = i;
    const cumulativeCo2 = co2PerYear * year;
    const netCo2 = Math.max(0, initialCo2 - cumulativeCo2);
    return {
      year,
      cumulativeOffset: cumulativeCo2,
      netCo2: netCo2,
      energySavings: energyPerYear * year,
      noxReduction: noxPerYear * year
    };
  });

  const comparisonData = Object.entries(ROOF_TYPES).map(([name, typeData]) => ({
    name,
    co2Offset: typeData.co2 * roofSize,
    energySavings: typeData.energy * roofSize,
    noxReduction: typeData.nox * roofSize,
    totalCost: typeData.totalCost * roofSize,
    color: typeData.color
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      <div className="bg-white shadow-sm border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="20 h-12">
                <img
                  src="/logo.webp"
                  alt="Agritectum logo"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <div></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Calculator className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Roof For Good CO2, Impact Calculator.</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
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

          <div className="pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Optional Add-ons</label>
            <div className="flex items-center space-x-2">
              <input
                id="solarCheckbox"
                type="checkbox"
                checked={includeSolar}
                onChange={() => setIncludeSolar(!includeSolar)}
                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <label htmlFor="solarCheckbox" className="text-sm text-gray-700">
                Include Solar Power in CO₂ and Energy Calculations
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
