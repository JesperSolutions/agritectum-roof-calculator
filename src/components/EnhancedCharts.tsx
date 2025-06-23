import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, RadialBarChart, RadialBar } from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Calendar, Sun, Leaf, Zap } from 'lucide-react';

interface EnhancedChartsProps {
  chartData: any[];
  roofType: string;
  includeSolar: boolean;
  totalCo2PerYear: number;
  totalEnergyPerYear: number;
  noxPerYear: number;
  location?: {
    solarIrradiance: number;
    climateZone: string;
  };
}

export default function EnhancedCharts({ 
  chartData, 
  roofType, 
  includeSolar, 
  totalCo2PerYear, 
  totalEnergyPerYear, 
  noxPerYear,
  location 
}: EnhancedChartsProps) {
  const [activeChart, setActiveChart] = useState<'timeline' | 'monthly' | 'seasonal' | 'breakdown'>('timeline');

  // Generate monthly data based on seasonal variations
  const generateMonthlyData = () => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    // Seasonal multipliers for different effects
    const solarMultipliers = [0.3, 0.5, 0.7, 0.9, 1.2, 1.4, 1.5, 1.3, 1.0, 0.7, 0.4, 0.2];
    const coolingMultipliers = [0.2, 0.3, 0.5, 0.7, 1.0, 1.4, 1.6, 1.5, 1.2, 0.8, 0.4, 0.2];
    const baseMultipliers = [0.9, 0.9, 1.0, 1.1, 1.2, 1.2, 1.1, 1.1, 1.0, 1.0, 0.9, 0.9];

    return months.map((month, index) => {
      const solarGeneration = includeSolar 
        ? (totalEnergyPerYear / 12) * solarMultipliers[index]
        : 0;
      
      const energySavings = roofType === 'White - Cool Roof Coating'
        ? (totalEnergyPerYear / 12) * coolingMultipliers[index]
        : (totalEnergyPerYear / 12) * baseMultipliers[index];

      const co2Offset = (totalCo2PerYear / 12) * baseMultipliers[index];
      const noxReduction = (noxPerYear / 12) * baseMultipliers[index];

      return {
        month,
        solarGeneration: Math.round(solarGeneration),
        energySavings: Math.round(energySavings),
        co2Offset: Math.round(co2Offset),
        noxReduction: Math.round(noxReduction * 100) / 100,
        totalEnergy: Math.round(solarGeneration + energySavings)
      };
    });
  };

  // Generate seasonal breakdown
  const generateSeasonalData = () => {
    const seasons = [
      { name: 'Spring', months: [2, 3, 4], color: '#10b981' },
      { name: 'Summer', months: [5, 6, 7], color: '#f59e0b' },
      { name: 'Autumn', months: [8, 9, 10], color: '#ef4444' },
      { name: 'Winter', months: [11, 0, 1], color: '#3b82f6' }
    ];

    const monthlyData = generateMonthlyData();
    
    return seasons.map(season => {
      const seasonData = season.months.map(monthIndex => monthlyData[monthIndex]);
      const totalEnergy = seasonData.reduce((sum, month) => sum + month.totalEnergy, 0);
      const totalCo2 = seasonData.reduce((sum, month) => sum + month.co2Offset, 0);
      const totalNox = seasonData.reduce((sum, month) => sum + month.noxReduction, 0);

      return {
        name: season.name,
        energy: totalEnergy,
        co2: totalCo2,
        nox: totalNox,
        color: season.color
      };
    });
  };

  // Generate impact breakdown pie chart data
  const generateBreakdownData = () => {
    const data = [];
    
    if (totalCo2PerYear > 0) {
      data.push({
        name: 'CO₂ Offset',
        value: totalCo2PerYear,
        color: '#10b981'
      });
    }
    
    if (totalEnergyPerYear > 0) {
      data.push({
        name: 'Energy Impact',
        value: totalEnergyPerYear * 0.4, // Convert to CO₂ equivalent
        color: '#3b82f6'
      });
    }
    
    if (noxPerYear > 0) {
      data.push({
        name: 'NOₓ Reduction',
        value: noxPerYear * 10, // Scale for visibility
        color: '#8b5cf6'
      });
    }

    return data;
  };

  const monthlyData = generateMonthlyData();
  const seasonalData = generateSeasonalData();
  const breakdownData = generateBreakdownData();

  const chartTabs = [
    { id: 'timeline', label: '50-Year Timeline', icon: TrendingUp },
    { id: 'monthly', label: 'Monthly Breakdown', icon: Calendar },
    { id: 'seasonal', label: 'Seasonal Analysis', icon: Sun },
    { id: 'breakdown', label: 'Impact Breakdown', icon: PieChartIcon }
  ];

  const renderChart = () => {
    switch (activeChart) {
      case 'timeline':
        return (
          <ResponsiveContainer width="100%" height={400}>
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
        );

      case 'monthly':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: any, name: string) => [
                  name === 'noxReduction' ? `${Number(value)} kg` : `${Number(value).toLocaleString()} ${name.includes('co2') ? 'kg' : 'kWh'}`,
                  name === 'solarGeneration' ? 'Solar Generation' :
                  name === 'energySavings' ? 'Energy Savings' :
                  name === 'co2Offset' ? 'CO₂ Offset' :
                  name === 'noxReduction' ? 'NOₓ Reduction' : name
                ]}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="co2Offset" 
                stackId="1"
                stroke="#10b981" 
                fill="#10b981"
                fillOpacity={0.6}
                name="CO₂ Offset"
              />
              <Area 
                type="monotone" 
                dataKey="energySavings" 
                stackId="2"
                stroke="#3b82f6" 
                fill="#3b82f6"
                fillOpacity={0.6}
                name="Energy Savings"
              />
              {includeSolar && (
                <Area 
                  type="monotone" 
                  dataKey="solarGeneration" 
                  stackId="2"
                  stroke="#f59e0b" 
                  fill="#f59e0b"
                  fillOpacity={0.6}
                  name="Solar Generation"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'seasonal':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={seasonalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: any, name: string) => [
                  name === 'nox' ? `${Number(value)} kg` : `${Number(value).toLocaleString()} ${name === 'co2' ? 'kg' : 'kWh'}`,
                  name === 'energy' ? 'Total Energy' :
                  name === 'co2' ? 'CO₂ Offset' :
                  name === 'nox' ? 'NOₓ Reduction' : name
                ]}
              />
              <Legend />
              <Bar dataKey="energy" fill="#3b82f6" name="Total Energy" radius={[4, 4, 0, 0]} />
              <Bar dataKey="co2" fill="#10b981" name="CO₂ Offset" radius={[4, 4, 0, 0]} />
              <Bar dataKey="nox" fill="#8b5cf6" name="NOₓ Reduction" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'breakdown':
        return (
          <div className="grid md:grid-cols-2 gap-8 h-96">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={breakdownData}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                >
                  {breakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    `${Number(value).toLocaleString()}`,
                    name
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Environmental Impact Summary</h4>
              <div className="space-y-3">
                {breakdownData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium text-gray-900">{item.name}</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {item.name === 'CO₂ Offset' ? `${item.value.toLocaleString()} kg/year` :
                       item.name === 'Energy Impact' ? `${(item.value / 0.4).toLocaleString()} kWh/year` :
                       `${(item.value / 10).toLocaleString()} kg/year`}
                    </span>
                  </div>
                ))}
              </div>
              
              {location && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Location Factors</h5>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Solar Irradiance:</span>
                      <span>{location.solarIrradiance} kWh/m²/year</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Climate Zone:</span>
                      <span>{location.climateZone}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-900">Enhanced Impact Analysis</h3>
        </div>
        
        {/* Chart Type Selector */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {chartTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveChart(tab.id as any)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeChart === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Description */}
      <div className="mb-6">
        {activeChart === 'timeline' && (
          <p className="text-sm text-gray-600">
            Long-term environmental impact showing cumulative CO₂ offset and remaining carbon debt over 50 years.
            {includeSolar && ' Includes solar panel degradation effects.'}
          </p>
        )}
        {activeChart === 'monthly' && (
          <p className="text-sm text-gray-600">
            Monthly breakdown showing seasonal variations in energy generation, savings, and environmental impact.
          </p>
        )}
        {activeChart === 'seasonal' && (
          <p className="text-sm text-gray-600">
            Seasonal analysis comparing environmental benefits across different times of the year.
          </p>
        )}
        {activeChart === 'breakdown' && (
          <p className="text-sm text-gray-600">
            Comprehensive breakdown of all environmental impacts with location-specific factors.
          </p>
        )}
      </div>

      {/* Chart Container */}
      <div className="w-full">
        {renderChart()}
      </div>

      {/* Additional Insights */}
      {activeChart === 'monthly' && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Leaf className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-900">Peak CO₂ Offset</span>
            </div>
            <div className="text-2xl font-bold text-green-700">
              {Math.max(...monthlyData.map(d => d.co2Offset)).toLocaleString()} kg
            </div>
            <div className="text-sm text-green-600">
              {monthlyData.find(d => d.co2Offset === Math.max(...monthlyData.map(d => d.co2Offset)))?.month}
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">Peak Energy</span>
            </div>
            <div className="text-2xl font-bold text-blue-700">
              {Math.max(...monthlyData.map(d => d.totalEnergy)).toLocaleString()} kWh
            </div>
            <div className="text-sm text-blue-600">
              {monthlyData.find(d => d.totalEnergy === Math.max(...monthlyData.map(d => d.totalEnergy)))?.month}
            </div>
          </div>
          
          {includeSolar && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Sun className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-900">Peak Solar</span>
              </div>
              <div className="text-2xl font-bold text-yellow-700">
                {Math.max(...monthlyData.map(d => d.solarGeneration)).toLocaleString()} kWh
              </div>
              <div className="text-sm text-yellow-600">
                {monthlyData.find(d => d.solarGeneration === Math.max(...monthlyData.map(d => d.solarGeneration)))?.month}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}