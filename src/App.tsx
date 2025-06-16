import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';
import { Download, Leaf, Zap, Wind, Calendar, TrendingUp, Calculator, Info, Euro } from 'lucide-react';
import jsPDF from 'jspdf';

const ROOF_TYPES = {
  Bitumen: { 
    co2: 0, 
    nox: 0, 
    energy: 0, 
    lifespan: 25, 
    maintenance: 'Inspect every 5–10 years.', 
    color: '#6B7280',
    materialCost: 0,
    laborCost: 0,
    totalCost: 0,
    installationRate: 0,
    description: 'Standard bitumen roofing (baseline)'
  },
  "Photocat Coating": { 
    co2: 1.94, 
    nox: 0.1, 
    energy: 3.5, 
    lifespan: 15, 
    maintenance: 'Reapply every 2 years to maintain NOₓ effect.', 
    color: '#5C9323',
    materialCost: 3.00,
    laborCost: 0.12,
    totalCost: 3.12,
    installationRate: 500, // m² per hour
    description: 'Photocatalytic coating with NOₓ reduction properties'
  },
  "White Coating": { 
    co2: 4.5, 
    nox: 0.017, 
    energy: 6, 
    lifespan: 15, 
    maintenance: 'Clean every 2–3 years, recoat every 10–15 years.', 
    color: '#3B82F6',
    materialCost: 26.85,
    laborCost: 2.40,
    totalCost: 29.25,
    installationRate: 25, // m² per hour
    description: 'Generic white reflective coating'
  },
  "Triflex (SRI 97)": { 
    co2: 6.65, 
    nox: 0.02, 
    energy: 8.5, 
    lifespan: 20, 
    maintenance: 'Clean every 2 years, recoat every 15–20 years.', 
    color: '#8B5CF6',
    materialCost: 46.98,
    laborCost: 8.57,
    totalCost: 55.55,
    installationRate: 7, // m² per hour
    description: 'High-performance Triflex coating with SRI 97'
  }
};

export default function RoofImpactDashboard() {
  const [roofSize, setRoofSize] = useState(1000);
  const [roofType, setRoofType] = useState<keyof typeof ROOF_TYPES>("Photocat Coating");
  const data = ROOF_TYPES[roofType];

  // Using exact formulas from specifications
  const initialCo2 = 3.33 * roofSize; // Initial CO₂ footprint of bitumen roof
  const co2PerYear = data.co2 * roofSize;
  const noxPerYear = data.nox * roofSize;
  const energyPerYear = data.energy * roofSize;
  const neutralYear = data.co2 > 0 ? Math.ceil(initialCo2 / co2PerYear) : null;
  
  // Cost calculations
  const totalInstallationCost = data.totalCost * roofSize;
  const installationTimeHours = data.installationRate > 0 ? roofSize / data.installationRate : 0;
  const installationDays = data.installationRate > 0 ? Math.ceil(installationTimeHours / 8) : 0; // 8 hour work days

  // Generate chart data for CO₂ impact over 20-year evaluation period
  const chartData = Array.from({ length: 21 }, (_, i) => {
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

  // Comparison data for different roof types
  const comparisonData = Object.entries(ROOF_TYPES).map(([name, typeData]) => ({
    name,
    co2Offset: typeData.co2 * roofSize,
    energySavings: typeData.energy * roofSize,
    noxReduction: typeData.nox * roofSize,
    totalCost: typeData.totalCost * roofSize,
    color: typeData.color
  }));

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Header with gradient background effect
    doc.setFillColor(245, 249, 245);
    doc.rect(0, 0, 210, 297, 'F');
    
    // Title
    doc.setFontSize(24);
    doc.setTextColor(92, 147, 35);
    doc.text('Agritectum CO₂ Roof Impact Report', 20, 25);
    
    // Subtitle
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 32);

    // Main metrics box
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(15, 40, 180, 90, 4, 4, 'F');
    doc.setDrawColor(92, 147, 35);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, 40, 180, 90, 4, 4);

    doc.setTextColor(51, 51, 51);
    doc.setFontSize(14);
    doc.text('Roof Specifications & Impact', 20, 50);
    
    doc.setFontSize(11);
    doc.text(`Roof Type: ${roofType}`, 20, 60);
    doc.text(`Roof Size: ${roofSize.toLocaleString()} m²`, 20, 67);
    doc.text(`Initial CO₂ Footprint: ${initialCo2.toLocaleString()} kg CO₂e`, 20, 74);
    doc.text(`CO₂ Offset per Year: ${co2PerYear.toLocaleString()} kg`, 20, 81);
    doc.text(`20-Year CO₂ Offset: ${(co2PerYear * 20).toLocaleString()} kg`, 20, 88);
    doc.text(`Carbon Neutral After: ${neutralYear ? `${neutralYear} years` : 'Never'}`, 20, 95);
    
    doc.text(`NOₓ Reduction per Year: ${noxPerYear.toLocaleString()} kg`, 110, 67);
    doc.text(`Energy Savings per Year: ${energyPerYear.toLocaleString()} kWh`, 110, 74);
    doc.text(`Expected Lifespan: ${data.lifespan} years`, 110, 81);
    doc.text(`Annual Energy Cost Savings: €${(energyPerYear * 0.25).toLocaleString()}`, 110, 88);
    doc.text(`Installation Time: ${installationDays} days`, 110, 95);

    // Cost Analysis Section
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, 140, 180, 50, 4, 4, 'F');
    doc.setDrawColor(59, 130, 246);
    doc.roundedRect(15, 140, 180, 50, 4, 4);

    doc.setFontSize(14);
    doc.setTextColor(30, 64, 175);
    doc.text('Installation Cost Analysis', 20, 152);
    
    doc.setFontSize(10);
    doc.setTextColor(51, 51, 51);
    doc.text(`Total Installation Cost: €${totalInstallationCost.toLocaleString()}`, 20, 162);
    doc.text(`Cost per m²: €${data.totalCost.toFixed(2)}`, 20, 169);
    doc.text(`Installation Time: ${installationTimeHours.toFixed(1)} hours (${installationDays} days)`, 20, 176);
    doc.text(`Installation Rate: ${data.installationRate} m²/hour`, 110, 162);
    doc.text(`Material Cost: €${data.materialCost.toFixed(2)}/m²`, 110, 169);
    doc.text(`Labor Cost: €${data.laborCost.toFixed(2)}/m²`, 110, 176);

    // Environmental benefits
    doc.setFillColor(240, 253, 240);
    doc.roundedRect(15, 200, 180, 50, 4, 4, 'F');
    doc.setDrawColor(92, 147, 35);
    doc.roundedRect(15, 200, 180, 50, 4, 4);

    doc.setFontSize(14);
    doc.setTextColor(26, 60, 64);
    doc.text('Environmental & Economic Benefits', 20, 212);
    
    doc.setFontSize(10);
    doc.setTextColor(51, 51, 51);
    doc.text('✓ Reduced climate impact and CO₂ footprint', 20, 222);
    doc.text('✓ Cleaner urban air through NOₓ reduction', 20, 229);
    doc.text('✓ Lower energy bills from cooling efficiency', 20, 236);
    doc.text('✓ Compliant with green building standards', 20, 243);
    doc.text('✓ Enhanced property value and ESG rating', 110, 222);
    doc.text('✓ Long-term cost savings and ROI', 110, 229);
    doc.text('✓ Improved building sustainability rating', 110, 236);

    // Maintenance information with proper text wrapping
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(15, 260, 180, 25, 4, 4, 'F');
    doc.setDrawColor(100, 100, 100);
    doc.roundedRect(15, 260, 180, 25, 4, 4);

    doc.setFontSize(12);
    doc.setTextColor(26, 60, 64);
    doc.text('Maintenance Requirements', 20, 270);
    doc.setFontSize(9);
    doc.setTextColor(51, 51, 51);
    
    // Properly wrap maintenance text
    const maintenanceLines = doc.splitTextToSize(data.maintenance, 160);
    let yPosition = 278;
    maintenanceLines.forEach((line: string) => {
      if (yPosition < 285) { // Ensure we don't go off the page
        doc.text(line, 20, yPosition);
        yPosition += 4;
      }
    });

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(92, 147, 35);
    doc.text('Agritectum - Sustainable Building Solutions', 20, 290);
    doc.text('Contact: info@agritectum.com | +45 88 77 66 55', 20, 295);

    doc.save(`Agritectum_Roof_Report_${roofType.replace(/\s+/g, '_')}_${roofSize}m2.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Agritectum</h1>
                <p className="text-sm text-gray-600">Roof CO₂ Impact Calculator</p>
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
            <h2 className="text-xl font-semibold text-gray-900">Roof Configuration</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Roof Size Input */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Roof Size (m²)
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
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Leaf className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-2xl font-bold">{co2PerYear.toLocaleString()}</div>
                <div className="text-green-100 text-sm">kg CO₂/year</div>
              </div>
            </div>
            <div className="text-green-100 text-sm">
              Carbon Offset Annual
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Zap className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-2xl font-bold">{energyPerYear.toLocaleString()}</div>
                <div className="text-blue-100 text-sm">kWh/year</div>
              </div>
            </div>
            <div className="text-blue-100 text-sm">
              Energy Savings
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
                  {totalInstallationCost > 0 ? `€${totalInstallationCost.toLocaleString()}` : '€0'}
                </div>
                <div className="text-emerald-100 text-sm">total cost</div>
              </div>
            </div>
            <div className="text-emerald-100 text-sm">
              Installation Investment
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* CO₂ Impact Over Time */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-semibold text-gray-900">CO₂ Impact Over 20 Years</h3>
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
                    <span className="text-gray-700">20-Year CO₂ Offset</span>
                    <span className="font-semibold text-green-700">{(co2PerYear * 20).toLocaleString()} kg</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-gray-700">20-Year Energy Savings</span>
                    <span className="font-semibold text-blue-700">{(energyPerYear * 20).toLocaleString()} kWh</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="text-gray-700">20-Year NOₓ Reduction</span>
                    <span className="font-semibold text-purple-700">{(noxPerYear * 20).toLocaleString()} kg</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Cost Analysis</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                    <span className="text-gray-700">Total Installation Cost</span>
                    <span className="font-semibold text-emerald-700">€{totalInstallationCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-gray-700">Cost per m²</span>
                    <span className="font-semibold text-blue-700">€{data.totalCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="text-gray-700">Installation Time</span>
                    <span className="font-semibold text-orange-700">
                      {installationDays > 0 ? `${installationDays} days` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-gray-700">Annual Energy Savings</span>
                    <span className="font-semibold text-green-700">€{(energyPerYear * 0.25).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Technical Specifications</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Expected Lifespan</span>
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
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-gray-700 text-sm leading-relaxed">{data.maintenance}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-gray-600 text-sm">
            © 2025 Agritectum - Sustainable Building Solutions | 
            <a href="mailto:info@agritectum.com" className="text-green-600 hover:text-green-700 ml-1">
              info@agritectum.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}