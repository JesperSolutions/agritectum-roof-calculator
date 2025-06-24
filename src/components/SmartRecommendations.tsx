import React, { useState, useEffect } from 'react';
import { Brain, Users, Calendar, Bell, TrendingUp, MapPin, Thermometer, Sun, AlertTriangle, CheckCircle, Clock, Star } from 'lucide-react';
import { LocationData, ROOF_TYPES } from '../types/project';
import HelpTooltip from './HelpTooltip';

interface SmartRecommendationsProps {
  roofSize: number;
  roofType: keyof typeof ROOF_TYPES;
  includeSolar: boolean;
  location: LocationData | null;
  totalCo2PerYear: number;
  totalEnergyPerYear: number;
  totalInstallationCost: number;
  onRecommendationApply: (recommendation: any) => void;
}

interface Recommendation {
  id: string;
  type: 'optimization' | 'alternative' | 'timing' | 'maintenance';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  savings?: {
    cost?: number;
    co2?: number;
    energy?: number;
  };
  action?: {
    type: 'change_roof_type' | 'add_solar' | 'schedule_timing' | 'set_reminder';
    data: any;
  };
  confidence: number; // 0-100
  reasoning: string[];
}

interface SimilarProject {
  location: string;
  roofSize: number;
  roofType: keyof typeof ROOF_TYPES;
  includeSolar: boolean;
  satisfaction: number;
  yearInstalled: number;
  climate: string;
}

// Mock data for similar projects (in real app, this would come from a database)
const SIMILAR_PROJECTS: SimilarProject[] = [
  { location: 'Copenhagen, Denmark', roofSize: 1200, roofType: 'White - Cool Roof Coating', includeSolar: true, satisfaction: 4.8, yearInstalled: 2023, climate: 'Continental' },
  { location: 'Stockholm, Sweden', roofSize: 800, roofType: 'Photocatalytic Coating', includeSolar: false, satisfaction: 4.5, yearInstalled: 2022, climate: 'Continental' },
  { location: 'Amsterdam, Netherlands', roofSize: 1500, roofType: 'Green Roof', includeSolar: true, satisfaction: 4.9, yearInstalled: 2023, climate: 'Temperate' },
  { location: 'Berlin, Germany', roofSize: 1000, roofType: 'White - Cool Roof Coating', includeSolar: true, satisfaction: 4.7, yearInstalled: 2022, climate: 'Continental' },
  { location: 'Oslo, Norway', roofSize: 900, roofType: 'Photocatalytic Coating', includeSolar: true, satisfaction: 4.6, yearInstalled: 2023, climate: 'Subarctic' },
];

const SEASONAL_FACTORS = {
  spring: { name: 'Spring', months: [3, 4, 5], weatherRisk: 'medium', installationEfficiency: 0.9, description: 'Good installation conditions, moderate weather risks' },
  summer: { name: 'Summer', months: [6, 7, 8], weatherRisk: 'low', installationEfficiency: 1.0, description: 'Optimal installation conditions, minimal weather delays' },
  autumn: { name: 'Autumn', months: [9, 10, 11], weatherRisk: 'medium', installationEfficiency: 0.8, description: 'Acceptable conditions, increasing weather risks' },
  winter: { name: 'Winter', months: [12, 1, 2], weatherRisk: 'high', installationEfficiency: 0.6, description: 'Challenging conditions, high weather delay risk' }
};

export default function SmartRecommendations({
  roofSize,
  roofType,
  includeSolar,
  location,
  totalCo2PerYear,
  totalEnergyPerYear,
  totalInstallationCost,
  onRecommendationApply
}: SmartRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [similarProjects, setSimilarProjects] = useState<SimilarProject[]>([]);
  const [activeTab, setActiveTab] = useState<'ai' | 'similar' | 'timing' | 'maintenance'>('ai');
  const [currentMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    generateRecommendations();
    findSimilarProjects();
  }, [roofSize, roofType, includeSolar, location, totalCo2PerYear, totalEnergyPerYear, totalInstallationCost]);

  const generateRecommendations = () => {
    const newRecommendations: Recommendation[] = [];

    // AI-Powered Optimization Recommendations
    if (!includeSolar && location && location.solarIrradiance > 1000) {
      newRecommendations.push({
        id: 'solar-recommendation',
        type: 'optimization',
        title: 'Add Solar Panels for Maximum Impact',
        description: `Your location receives ${location.solarIrradiance} kWh/m²/year of solar irradiance, which is excellent for solar generation.`,
        impact: 'high',
        savings: {
          co2: Math.round(roofSize * 0.2 * 0.4 * 4.5 * 365 * 0.75 / 1000 * 0.4),
          energy: Math.round(roofSize * 0.2 * 4.5 * 365 * 0.75 / 1000),
          cost: -Math.round(roofSize * 150)
        },
        action: {
          type: 'add_solar',
          data: { includeSolar: true }
        },
        confidence: 85,
        reasoning: [
          `High solar irradiance (${location.solarIrradiance} kWh/m²/year)`,
          'Significant CO₂ offset potential',
          'Long-term energy cost savings',
          'Government incentives likely available'
        ]
      });
    }

    // Alternative roof type recommendations
    if (roofType === 'Photocatalytic Coating' && roofSize > 1500) {
      newRecommendations.push({
        id: 'cool-roof-alternative',
        type: 'alternative',
        title: 'Consider Cool Roof Coating for Large Areas',
        description: 'For larger roofs, cool roof coatings provide better energy savings and cost-effectiveness.',
        impact: 'medium',
        savings: {
          co2: Math.round((ROOF_TYPES['White - Cool Roof Coating'].co2 - ROOF_TYPES[roofType].co2) * roofSize),
          energy: Math.round((ROOF_TYPES['White - Cool Roof Coating'].energy - ROOF_TYPES[roofType].energy) * roofSize)
        },
        action: {
          type: 'change_roof_type',
          data: { roofType: 'White - Cool Roof Coating' }
        },
        confidence: 72,
        reasoning: [
          'Large roof area benefits from energy savings',
          'Better cost per m² for extensive installations',
          'Longer lifespan (20 vs 15 years)',
          'Significant cooling benefits'
        ]
      });
    }

    // Location-specific recommendations
    if (location && location.climateZone === 'Continental' && roofType !== 'Green Roof') {
      newRecommendations.push({
        id: 'green-roof-climate',
        type: 'optimization',
        title: 'Green Roof Ideal for Continental Climate',
        description: 'Your continental climate zone is perfect for green roof systems with excellent insulation benefits.',
        impact: 'medium',
        savings: {
          co2: Math.round((ROOF_TYPES['Green Roof'].co2 - ROOF_TYPES[roofType].co2) * roofSize),
          energy: Math.round((ROOF_TYPES['Green Roof'].energy - ROOF_TYPES[roofType].energy) * roofSize)
        },
        action: {
          type: 'change_roof_type',
          data: { roofType: 'Green Roof' }
        },
        confidence: 68,
        reasoning: [
          'Continental climate ideal for plant growth',
          'Excellent insulation properties',
          'Longest lifespan (40 years)',
          'Biodiversity and urban heat island benefits'
        ]
      });
    }

    // Cost optimization recommendations
    if (totalInstallationCost > 100000 && roofType === 'White - Cool Roof Coating') {
      newRecommendations.push({
        id: 'cost-optimization',
        type: 'optimization',
        title: 'Reduce Costs with Phased Installation',
        description: 'Consider installing in phases to spread costs and validate performance before full implementation.',
        impact: 'low',
        savings: {
          cost: Math.round(totalInstallationCost * 0.15)
        },
        confidence: 60,
        reasoning: [
          'Large investment can be phased',
          'Validate performance before full commitment',
          'Better cash flow management',
          'Opportunity to optimize based on initial results'
        ]
      });
    }

    setRecommendations(newRecommendations);
  };

  const findSimilarProjects = () => {
    if (!location) {
      setSimilarProjects([]);
      return;
    }

    // Filter and score similar projects
    const scored = SIMILAR_PROJECTS.map(project => {
      let score = 0;
      
      // Climate match (highest weight)
      if (project.climate === location.climateZone) score += 40;
      
      // Size similarity
      const sizeRatio = Math.min(project.roofSize, roofSize) / Math.max(project.roofSize, roofSize);
      score += sizeRatio * 30;
      
      // Roof type match
      if (project.roofType === roofType) score += 20;
      
      // Solar inclusion match
      if (project.includeSolar === includeSolar) score += 10;
      
      return { ...project, score };
    });

    // Sort by score and take top 3
    const topSimilar = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    setSimilarProjects(topSimilar);
  };

  const getCurrentSeason = () => {
    const seasons = Object.entries(SEASONAL_FACTORS);
    return seasons.find(([_, data]) => data.months.includes(currentMonth))?.[1] || SEASONAL_FACTORS.summer;
  };

  const getOptimalInstallationTiming = () => {
    const currentSeason = getCurrentSeason();
    const recommendations = [];

    if (currentSeason.weatherRisk === 'high') {
      recommendations.push({
        type: 'timing',
        title: 'Wait for Better Weather',
        description: 'Current season has high weather risks. Consider waiting for spring/summer.',
        urgency: 'medium',
        timeframe: 'Wait 2-4 months'
      });
    }

    if (currentMonth >= 10 && currentMonth <= 12) {
      recommendations.push({
        type: 'timing',
        title: 'Plan for Spring Installation',
        description: 'Start planning now for optimal spring installation conditions.',
        urgency: 'low',
        timeframe: 'Plan for March-May'
      });
    }

    return recommendations;
  };

  const getMaintenanceAlerts = () => {
    const alerts = [];
    const roofData = ROOF_TYPES[roofType];

    // Based on roof type, generate maintenance reminders
    if (roofType === 'Photocatalytic Coating') {
      alerts.push({
        type: 'maintenance',
        title: 'Reapplication Due',
        description: 'Photocatalytic coating should be reapplied every 2 years for optimal NOₓ reduction.',
        urgency: 'medium',
        frequency: 'Every 2 years',
        nextDue: 'Set reminder'
      });
    }

    if (roofType === 'White - Cool Roof Coating') {
      alerts.push({
        type: 'maintenance',
        title: 'Cleaning Schedule',
        description: 'Clean roof surface every 2 years to maintain reflectivity and performance.',
        urgency: 'low',
        frequency: 'Every 2 years',
        nextDue: 'Set reminder'
      });
    }

    if (includeSolar) {
      alerts.push({
        type: 'maintenance',
        title: 'Solar Panel Maintenance',
        description: 'Clean panels twice yearly and inspect electrical connections annually.',
        urgency: 'high',
        frequency: 'Bi-annual cleaning, annual inspection',
        nextDue: 'Set reminder'
      });
    }

    return alerts;
  };

  const applyRecommendation = (recommendation: Recommendation) => {
    if (recommendation.action) {
      onRecommendationApply(recommendation.action);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const tabs = [
    { id: 'ai', label: 'AI Recommendations', icon: Brain },
    { id: 'similar', label: 'Similar Projects', icon: Users },
    { id: 'timing', label: 'Optimal Timing', icon: Calendar },
    { id: 'maintenance', label: 'Maintenance Alerts', icon: Bell }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      <div className="flex items-center space-x-3 mb-6">
        <Brain className="w-6 h-6 text-purple-600" />
        <h2 className="text-xl font-semibold text-gray-900">Smart Recommendations</h2>
        <HelpTooltip content="AI-powered recommendations based on your location, roof specifications, and similar projects. Get personalized suggestions for optimization, timing, and maintenance to maximize your roof's performance and value." />
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
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* AI Recommendations */}
      {activeTab === 'ai' && (
        <div className="space-y-4">
          {recommendations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Your current configuration is well-optimized!</p>
              <p className="text-sm">No major improvements suggested at this time.</p>
            </div>
          ) : (
            recommendations.map((rec) => (
              <div key={rec.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{rec.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${getImpactColor(rec.impact)}`}>
                        {rec.impact} impact
                      </span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-gray-600">{rec.confidence}% confidence</span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{rec.description}</p>
                    
                    {rec.savings && (
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        {rec.savings.co2 && (
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-lg font-semibold text-green-600">
                              +{rec.savings.co2.toLocaleString()}
                            </div>
                            <div className="text-xs text-green-600">kg CO₂/year</div>
                          </div>
                        )}
                        {rec.savings.energy && (
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-lg font-semibold text-blue-600">
                              +{rec.savings.energy.toLocaleString()}
                            </div>
                            <div className="text-xs text-blue-600">kWh/year</div>
                          </div>
                        )}
                        {rec.savings.cost && (
                          <div className="text-center p-3 bg-emerald-50 rounded-lg">
                            <div className="text-lg font-semibold text-emerald-600">
                              {rec.savings.cost > 0 ? '+' : ''}€{rec.savings.cost.toLocaleString()}
                            </div>
                            <div className="text-xs text-emerald-600">
                              {rec.savings.cost > 0 ? 'savings' : 'investment'}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Why this recommendation:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {rec.reasoning.map((reason, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                
                {rec.action && (
                  <button
                    onClick={() => applyRecommendation(rec)}
                    className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Apply Recommendation
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Similar Projects */}
      {activeTab === 'similar' && (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            Projects similar to yours based on location, climate, and roof specifications:
          </div>
          {similarProjects.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No similar projects found</p>
              <p className="text-sm">Add your location to see similar projects in your area.</p>
            </div>
          ) : (
            similarProjects.map((project, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-900">{project.location}</span>
                      <span className="text-sm text-gray-500">({project.climate} climate)</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Size:</span>
                        <div className="font-medium">{project.roofSize.toLocaleString()} m²</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Type:</span>
                        <div className="font-medium">{project.roofType}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Solar:</span>
                        <div className="font-medium">{project.includeSolar ? 'Yes' : 'No'}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Installed:</span>
                        <div className="font-medium">{project.yearInstalled}</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-semibold text-gray-900">{project.satisfaction}</span>
                    </div>
                    <div className="text-xs text-gray-500">satisfaction</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Optimal Timing */}
      {activeTab === 'timing' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Thermometer className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Current Season Analysis</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Season:</span>
                  <span className="font-medium">{getCurrentSeason().name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Weather Risk:</span>
                  <span className={`font-medium ${
                    getCurrentSeason().weatherRisk === 'high' ? 'text-red-600' :
                    getCurrentSeason().weatherRisk === 'medium' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {getCurrentSeason().weatherRisk}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Installation Efficiency:</span>
                  <span className="font-medium">{(getCurrentSeason().installationEfficiency * 100)}%</span>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  {getCurrentSeason().description}
                </p>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Sun className="w-5 h-5 text-yellow-600" />
                <h3 className="font-semibold text-gray-900">Seasonal Recommendations</h3>
              </div>
              <div className="space-y-4">
                {Object.entries(SEASONAL_FACTORS).map(([season, data]) => (
                  <div key={season} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{data.name}</div>
                      <div className="text-sm text-gray-600">
                        {data.installationEfficiency * 100}% efficiency
                      </div>
                    </div>
                    <div className={`px-2 py-1 text-xs rounded-full ${
                      data.weatherRisk === 'low' ? 'bg-green-100 text-green-800' :
                      data.weatherRisk === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {data.weatherRisk} risk
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {getOptimalInstallationTiming().map((timing, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{timing.title}</h3>
                    <p className="text-gray-600 mb-3">{timing.description}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-gray-500">Timeframe:</span>
                      <span className="font-medium">{timing.timeframe}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Maintenance Alerts */}
      {activeTab === 'maintenance' && (
        <div className="space-y-4">
          {getMaintenanceAlerts().map((alert, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <Bell className={`w-5 h-5 mt-1 ${
                    alert.urgency === 'high' ? 'text-red-600' :
                    alert.urgency === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        alert.urgency === 'high' ? 'bg-red-100 text-red-800' :
                        alert.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {alert.urgency} priority
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{alert.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Frequency:</span>
                        <div className="font-medium">{alert.frequency}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Next Due:</span>
                        <div className="font-medium">{alert.nextDue}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  Set Reminder
                </button>
              </div>
            </div>
          ))}
          
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Maintenance Tips</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Keep maintenance records to track system performance over time</li>
                  <li>• Schedule maintenance during optimal weather conditions</li>
                  <li>• Consider professional inspections annually for complex systems</li>
                  <li>• Monitor performance metrics to identify maintenance needs early</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}