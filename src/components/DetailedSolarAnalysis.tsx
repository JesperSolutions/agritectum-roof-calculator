import React, { useState, useEffect } from 'react';
import { Sun, Zap, TrendingUp, Clock, Thermometer, Compass, BarChart3, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { SolarCalculator, HourlyIrradiance, PVGISData } from '../utils/solarCalculations';
import { EnhancedLocationData } from '../utils/pvgisApi';
import HelpTooltip from './HelpTooltip';

interface DetailedSolarAnalysisProps {
  location: EnhancedLocationData | null;
  roofSize: number; // m²
  includeSolar: boolean;
  onSolarDataUpdate?: (data: any) => void;
}

export default function DetailedSolarAnalysis({ 
  location, 
  roofSize, 
  includeSolar,
  onSolarDataUpdate 
}: DetailedSolarAnalysisProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'hourly' | 'monthly' | 'optimization'>('overview');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [hourlyData, setHourlyData] = useState<HourlyIrradiance[]>([]);
  const [solarPosition, setSolarPosition] = useState<any>(null);

  useEffect(() => {
    if (location && location.pvgisData) {
      generateHourlyData();
      calculateCurrentSolarPosition();
    }
  }, [location, selectedMonth]);

  const generateHourlyData = () => {
    if (!location || !location.pvgisData) return;

    const monthData = location.pvgisData.monthly.find(m => m.month === selectedMonth);
    if (!monthData) return;

    const sampleDate = new Date(2024, selectedMonth - 1, 15); // Mid-month
    const hourlyIrradiance = SolarCalculator.getHourlyIrradiance(
      location.lat,
      location.lng,
      sampleDate,
      monthData.avgDailyIrradiance
    );

    setHourlyData(hourlyIrradiance);
  };

  const calculateCurrentSolarPosition = () => {
    if (!location) return;

    const now = new Date();
    const position = SolarCalculator.getSolarPosition(
      location.lat,
      location.lng,
      now
    );

    setSolarPosition(position);
  };

  const calculatePanelOutput = () => {
    if (!location || !location.pvSystemPotential || !includeSolar) return null;

    const panelEfficiency = 0.20; // 20% efficient panels
    const systemEfficiency = 0.85; // 85% system efficiency
    const panelArea = roofSize * 0.7; // 70% of roof area usable for panels

    const yearlyOutput = location.pvSystemPotential.yearlyOutput * (panelArea / 1000 * 200); // Scale by actual panel capacity
    const monthlyOutput = location.pvSystemPotential.monthlyOutput.map(output => 
      output * (panelArea / 1000 * 200)
    );

    return {
      yearlyOutput: Math.round(yearlyOutput),
      monthlyOutput,
      panelArea,
      estimatedCapacity: Math.round(panelArea * 0.2), // kWp
      performanceRatio: location.pvSystemPotential.performanceRatio
    };
  };

  const getOptimizationRecommendations = () => {
    if (!location || !location.pvgisData) return [];

    const recommendations = [];
    const optimalTilt = location.pvSystemPotential?.optimalTilt || location.pvgisData.yearly.optimalTilt;
    const currentTilt = 30; // Assume current tilt

    if (Math.abs(optimalTilt - currentTilt) > 5) {
      recommendations.push({
        type: 'tilt',
        title: 'Optimize Panel Tilt Angle',
        current: currentTilt,
        optimal: optimalTilt,
        improvement: `${((optimalTilt - currentTilt) / currentTilt * 100).toFixed(1)}% better performance`,
        description: `Adjusting tilt from ${currentTilt}° to ${optimalTilt}° could improve annual energy yield.`
      });
    }

    if (location.pvgisData.yearly.optimalAzimuth !== 180) {
      recommendations.push({
        type: 'azimuth',
        title: 'Consider Panel Orientation',
        current: 180,
        optimal: location.pvgisData.yearly.optimalAzimuth,
        improvement: 'Site-specific optimization',
        description: `For your location, ${location.pvgisData.yearly.optimalAzimuth}° azimuth may be better than due south (180°).`
      });
    }

    return recommendations;
  };

  const panelOutput = calculatePanelOutput();
  const optimizationRecommendations = getOptimizationRecommendations();

  if (!location) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="text-center py-8 text-gray-500">
          <Sun className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Select a location to view detailed solar analysis</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Sun },
    { id: 'hourly', label: 'Hourly Profile', icon: Clock },
    { id: 'monthly', label: 'Monthly Data', icon: BarChart3 },
    { id: 'optimization', label: 'Optimization', icon: TrendingUp }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      <div className="flex items-center space-x-3 mb-6">
        <Sun className="w-6 h-6 text-yellow-600" />
        <h2 className="text-xl font-semibold text-gray-900">Detailed Solar Analysis</h2>
        <HelpTooltip content="Advanced solar analysis using PVGIS data from the European Commission. Includes hourly irradiance profiles, monthly variations, and optimization recommendations based on your specific location." />
        {location.dataSource === 'pvgis' && (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
            PVGIS Data
          </span>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 justify-center ${
                activeTab === tab.id
                  ? 'bg-white text-yellow-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Sun className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-900">Annual Irradiance</span>
              </div>
              <div className="text-2xl font-bold text-yellow-700">
                {location.solarIrradiance}
              </div>
              <div className="text-sm text-yellow-600">kWh/m²/year</div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Thermometer className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">Avg Temperature</span>
              </div>
              <div className="text-2xl font-bold text-blue-700">
                {location.pvgisData?.yearly.avgTemperature.toFixed(1) || 'N/A'}
              </div>
              <div className="text-sm text-blue-600">°C</div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Compass className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">Optimal Tilt</span>
              </div>
              <div className="text-2xl font-bold text-green-700">
                {location.pvSystemPotential?.optimalTilt || location.pvgisData?.yearly.optimalTilt || Math.abs(location.lat).toFixed(0)}
              </div>
              <div className="text-sm text-green-600">degrees</div>
            </div>

            {panelOutput && (
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-purple-900">Annual Output</span>
                </div>
                <div className="text-2xl font-bold text-purple-700">
                  {panelOutput.yearlyOutput.toLocaleString()}
                </div>
                <div className="text-sm text-purple-600">kWh/year</div>
              </div>
            )}
          </div>

          {/* Current Solar Position */}
          {solarPosition && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Solar Position</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {solarPosition.elevation.toFixed(1)}°
                  </div>
                  <div className="text-sm text-gray-600">Elevation</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {solarPosition.azimuth.toFixed(1)}°
                  </div>
                  <div className="text-sm text-gray-600">Azimuth</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {solarPosition.zenith.toFixed(1)}°
                  </div>
                  <div className="text-sm text-gray-600">Zenith</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {solarPosition.hourAngle.toFixed(1)}°
                  </div>
                  <div className="text-sm text-gray-600">Hour Angle</div>
                </div>
              </div>
            </div>
          )}

          {/* System Details */}
          {panelOutput && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Solar System Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Usable Roof Area:</span>
                  <div className="font-semibold">{panelOutput.panelArea.toFixed(0)} m²</div>
                </div>
                <div>
                  <span className="text-gray-600">System Capacity:</span>
                  <div className="font-semibold">{panelOutput.estimatedCapacity} kWp</div>
                </div>
                <div>
                  <span className="text-gray-600">Performance Ratio:</span>
                  <div className="font-semibold">{(panelOutput.performanceRatio * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <span className="text-gray-600">Specific Yield:</span>
                  <div className="font-semibold">{(panelOutput.yearlyOutput / panelOutput.estimatedCapacity).toFixed(0)} kWh/kWp</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hourly Profile Tab */}
      {activeTab === 'hourly' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Hourly Solar Profile</h3>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2024, i, 1).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>

          {hourlyData.length > 0 && (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="hour" 
                    stroke="#666"
                    tickFormatter={(hour) => `${hour}:00`}
                  />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value: any, name: string) => [
                      `${Number(value).toLocaleString()} ${name === 'temperature' ? '°C' : 'W/m²'}`,
                      name === 'ghi' ? 'Global Irradiance' :
                      name === 'dni' ? 'Direct Irradiance' :
                      name === 'dhi' ? 'Diffuse Irradiance' :
                      'Temperature'
                    ]}
                    labelFormatter={(hour) => `Time: ${hour}:00`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ghi" 
                    stroke="#f59e0b" 
                    strokeWidth={3}
                    name="Global Irradiance"
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="dni" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Direct Irradiance"
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="dhi" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    name="Diffuse Irradiance"
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Sun className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-900">Peak Irradiance</span>
              </div>
              <div className="text-xl font-bold text-yellow-700">
                {Math.max(...hourlyData.map(h => h.ghi)).toLocaleString()}
              </div>
              <div className="text-sm text-yellow-600">W/m² at solar noon</div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">Daylight Hours</span>
              </div>
              <div className="text-xl font-bold text-blue-700">
                {hourlyData.filter(h => h.ghi > 50).length}
              </div>
              <div className="text-sm text-blue-600">hours with useful sunlight</div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">Daily Total</span>
              </div>
              <div className="text-xl font-bold text-green-700">
                {(hourlyData.reduce((sum, h) => sum + h.ghi, 0) / 1000).toFixed(1)}
              </div>
              <div className="text-sm text-green-600">kWh/m²/day</div>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Data Tab */}
      {activeTab === 'monthly' && location.pvgisData && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Solar Data</h3>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={location.pvgisData.monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="monthName" 
                  stroke="#666"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: any, name: string) => [
                    `${Number(value).toFixed(1)} ${name === 'avgTemperature' ? '°C' : 'kWh/m²'}`,
                    name === 'totalIrradiance' ? 'Monthly Irradiance' : 'Average Temperature'
                  ]}
                />
                <Bar 
                  dataKey="totalIrradiance" 
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                  name="Monthly Irradiance"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Best Months for Solar</h4>
              {location.pvgisData.monthly
                .sort((a, b) => b.totalIrradiance - a.totalIrradiance)
                .slice(0, 3)
                .map((month, index) => (
                  <div key={month.month} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-yellow-400' : 'bg-yellow-300'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="font-medium">{month.monthName}</span>
                    </div>
                    <span className="text-yellow-700 font-semibold">
                      {month.totalIrradiance.toFixed(0)} kWh/m²
                    </span>
                  </div>
                ))}
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Temperature Variation</h4>
              <div className="space-y-2">
                {location.pvgisData.monthly.map((month) => (
                  <div key={month.month} className="flex items-center justify-between text-sm">
                    <span className="w-16">{month.monthName.slice(0, 3)}</span>
                    <div className="flex-1 mx-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-400 to-red-400 h-2 rounded-full"
                          style={{ 
                            width: `${((month.avgTemperature + 20) / 50) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                    <span className="w-12 text-right font-medium">
                      {month.avgTemperature.toFixed(1)}°C
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Optimization Tab */}
      {activeTab === 'optimization' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Solar System Optimization</h3>

          {optimizationRecommendations.length > 0 ? (
            <div className="space-y-4">
              {optimizationRecommendations.map((rec, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{rec.title}</h4>
                      <p className="text-gray-600 mb-4">{rec.description}</p>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center p-3 bg-red-50 rounded-lg">
                          <div className="text-lg font-semibold text-red-600">{rec.current}°</div>
                          <div className="text-red-600">Current</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-lg font-semibold text-green-600">{rec.optimal}°</div>
                          <div className="text-green-600">Optimal</div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-lg font-semibold text-blue-600">{rec.improvement}</div>
                          <div className="text-blue-600">Improvement</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Your current configuration is well-optimized!</p>
              <p className="text-sm">No major improvements suggested for your location.</p>
            </div>
          )}

          {/* Performance Comparison */}
          {location.pvSystemPotential && (
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">System Performance Comparison</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-blue-600">
                    {location.pvgisData?.pvPotential.fixedSystem.toFixed(0) || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">Fixed System</div>
                  <div className="text-xs text-gray-500">kWh/kWp/year</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-green-600">
                    {location.pvgisData?.pvPotential.optimalFixed.toFixed(0) || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">Optimal Fixed</div>
                  <div className="text-xs text-gray-500">kWh/kWp/year</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-purple-600">
                    {location.pvgisData?.pvPotential.trackingSystem.toFixed(0) || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">Tracking System</div>
                  <div className="text-xs text-gray-500">kWh/kWp/year</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}