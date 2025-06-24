import React, { useState, useEffect } from 'react';
import { Brain, Users, Calendar, Bell, TrendingUp, MapPin, Thermometer, Sun, AlertTriangle, CheckCircle, Clock, Star, Zap, Eye, TreePine, Building } from 'lucide-react';
import { ROOF_TYPES } from '../types/project';
import { EnhancedLocationData } from '../utils/pvgisApi';
import { ShadingCalculator, estimateCommonObstacles, ShadingAnalysis } from '../utils/shadingAnalysis';
import HelpTooltip from './HelpTooltip';

interface SmartRecommendationsProps {
  roofSize: number;
  roofType: keyof typeof ROOF_TYPES;
  includeSolar: boolean;
  location: EnhancedLocationData | null;
  totalCo2PerYear: number;
  totalEnergyPerYear: number;
  totalInstallationCost: number;
  onRecommendationApply: (recommendation: any) => void;
}

interface Recommendation {
  id: string;
  type: 'optimization' | 'alternative' | 'timing' | 'maintenance' | 'shading';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  savings?: {
    cost?: number;
    co2?: number;
    energy?: number;
    percentage?: number;
  };
  action?: {
    type: 'change_roof_type' | 'add_solar' | 'schedule_timing' | 'set_reminder' | 'optimize_placement';
    data: any;
  };
  confidence: number; // 0-100
  reasoning: string[];
  dataSource: 'pvgis' | 'estimated' | 'analysis';
}

interface SimilarProject {
  location: string;
  roofSize: number;
  roofType: keyof typeof ROOF_TYPES;
  includeSolar: boolean;
  satisfaction: number;
  yearInstalled: number;
  climate: string;
  solarYield?: number; // kWh/kWp/year
}

// Enhanced similar projects with real solar yield data
const SIMILAR_PROJECTS: SimilarProject[] = [
  { location: 'Copenhagen, Denmark', roofSize: 1200, roofType: 'White - Cool Roof Coating', includeSolar: true, satisfaction: 4.8, yearInstalled: 2023, climate: 'Continental', solarYield: 1050 },
  { location: 'Stockholm, Sweden', roofSize: 800, roofType: 'Photocatalytic Coating', includeSolar: false, satisfaction: 4.5, yearInstalled: 2022, climate: 'Continental' },
  { location: 'Amsterdam, Netherlands', roofSize: 1500, roofType: 'Green Roof', includeSolar: true, satisfaction: 4.9, yearInstalled: 2023, climate: 'Temperate', solarYield: 980 },
  { location: 'Berlin, Germany', roofSize: 1000, roofType: 'White - Cool Roof Coating', includeSolar: true, satisfaction: 4.7, yearInstalled: 2022, climate: 'Continental', solarYield: 1100 },
  { location: 'Oslo, Norway', roofSize: 900, roofType: 'Photocatalytic Coating', includeSolar: true, satisfaction: 4.6, yearInstalled: 2023, climate: 'Subarctic', solarYield: 950 },
  { location: 'Munich, Germany', roofSize: 1300, roofType: 'Green Roof', includeSolar: true, satisfaction: 4.8, yearInstalled: 2023, climate: 'Continental', solarYield: 1150 },
  { location: 'Vienna, Austria', roofSize: 1100, roofType: 'White - Cool Roof Coating', includeSolar: true, satisfaction: 4.6, yearInstalled: 2022, climate: 'Continental', solarYield: 1200 },
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
  const [shadingAnalysis, setShadingAnalysis] = useState<ShadingAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<'ai' | 'similar' | 'timing' | 'maintenance' | 'shading'>('ai');
  const [currentMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    generateRecommendations();
    findSimilarProjects();
    if (location) {
      performShadingAnalysis();
    }
  }, [roofSize, roofType, includeSolar, location, totalCo2PerYear, totalEnergyPerYear, totalInstallationCost]);

  const performShadingAnalysis = async () => {
    if (!location) return;

    try {
      // Estimate location type based on country and solar irradiance
      const locationType = estimateLocationType(location);
      const obstacles = estimateCommonObstacles(locationType, 10);
      
      const analysis = ShadingCalculator.analyzeAnnualShading(
        location.lat,
        location.lng,
        obstacles,
        { width: Math.sqrt(roofSize), depth: Math.sqrt(roofSize) }
      );

      setShadingAnalysis(analysis);
    } catch (error) {
      console.error('Error performing shading analysis:', error);
    }
  };

  const estimateLocationType = (location: EnhancedLocationData): 'urban' | 'suburban' | 'rural' => {
    // Simple heuristic based on solar irradiance and country
    if (location.solarIrradiance < 950) return 'urban'; // Lower irradiance suggests urban environment
    if (location.solarIrradiance > 1200) return 'rural'; // Higher irradiance suggests rural
    return 'suburban';
  };

  const generateRecommendations = () => {
    const newRecommendations: Recommendation[] = [];

    // PVGIS-powered solar recommendations
    if (!includeSolar && location) {
      const solarPotential = location.pvSystemPotential?.yearlyOutput || 
        (location.solarIrradiance * 0.15 * 0.75); // Fallback calculation

      if (location.dataSource === 'pvgis' && solarPotential > 900) {
        const estimatedGeneration = solarPotential * (roofSize * 0.7 * 0.2); // 70% usable, 200W/m²
        const co2Savings = estimatedGeneration * 0.4; // kg CO2/kWh
        
        newRecommendations.push({
          id: 'pvgis-solar-recommendation',
          type: 'optimization',
          title: 'Excellent Solar Potential Detected',
          description: `PVGIS data shows ${solarPotential.toFixed(0)} kWh/kWp/year potential at your location - well above European average of 1000 kWh/kWp/year.`,
          impact: 'high',
          savings: {
            co2: Math.round(co2Savings),
            energy: Math.round(estimatedGeneration),
            cost: -Math.round(roofSize * 150),
            percentage: Math.round(((solarPotential - 1000) / 1000) * 100)
          },
          action: {
            type: 'add_solar',
            data: { includeSolar: true }
          },
          confidence: 95,
          reasoning: [
            `PVGIS verified solar yield: ${solarPotential.toFixed(0)} kWh/kWp/year`,
            `${Math.round(((solarPotential - 1000) / 1000) * 100)}% above European average`,
            `Optimal tilt: ${location.pvSystemPotential?.optimalTilt || 'calculated'}°`,
            `Performance ratio: ${((location.pvSystemPotential?.performanceRatio || 0.75) * 100).toFixed(1)}%`,
            'European Commission PVGIS data source'
          ],
          dataSource: 'pvgis'
        });
      } else if (location.solarIrradiance > 1000) {
        newRecommendations.push({
          id: 'estimated-solar-recommendation',
          type: 'optimization',
          title: 'Good Solar Potential Based on Location',
          description: `Your location receives ${location.solarIrradiance} kWh/m²/year - suitable for solar installation.`,
          impact: 'medium',
          savings: {
            co2: Math.round(roofSize * 0.2 * 0.4 * 4.5 * 365 * 0.75 / 1000 * 0.4),
            energy: Math.round(roofSize * 0.2 * 4.5 * 365 * 0.75 / 1000),
            cost: -Math.round(roofSize * 150)
          },
          action: {
            type: 'add_solar',
            data: { includeSolar: true }
          },
          confidence: 75,
          reasoning: [
            `Solar irradiance: ${location.solarIrradiance} kWh/m²/year`,
            'Above minimum threshold for viable solar',
            'Climate zone suitable for solar panels',
            'Estimated based on location data'
          ],
          dataSource: 'estimated'
        });
      }
    }

    // Shading-based recommendations
    if (shadingAnalysis && includeSolar) {
      if (shadingAnalysis.annualShadingLoss > 15) {
        newRecommendations.push({
          id: 'shading-mitigation',
          type: 'shading',
          title: 'Significant Shading Detected',
          description: `Analysis shows ${shadingAnalysis.annualShadingLoss.toFixed(1)}% annual shading loss. Consider mitigation strategies.`,
          impact: 'high',
          savings: {
            percentage: Math.round(shadingAnalysis.annualShadingLoss),
            energy: Math.round(totalEnergyPerYear * (shadingAnalysis.annualShadingLoss / 100))
          },
          confidence: 80,
          reasoning: [
            `${shadingAnalysis.annualShadingLoss.toFixed(1)}% annual energy loss from shading`,
            `Winter shading: ${shadingAnalysis.seasonalLosses.winter.toFixed(1)}%`,
            `Summer shading: ${shadingAnalysis.seasonalLosses.summer.toFixed(1)}%`,
            ...shadingAnalysis.recommendations.slice(0, 2)
          ],
          dataSource: 'analysis'
        });
      } else if (shadingAnalysis.annualShadingLoss < 5) {
        newRecommendations.push({
          id: 'minimal-shading',
          type: 'optimization',
          title: 'Excellent Site Conditions',
          description: `Shading analysis shows minimal impact (${shadingAnalysis.annualShadingLoss.toFixed(1)}% loss) - ideal for solar installation.`,
          impact: 'low',
          confidence: 90,
          reasoning: [
            `Only ${shadingAnalysis.annualShadingLoss.toFixed(1)}% annual shading loss`,
            'Consistent performance across seasons',
            'No major obstacles detected',
            'Optimal site for maximum solar yield'
          ],
          dataSource: 'analysis'
        });
      }
    }

    // Enhanced roof type recommendations with real data
    if (location && location.dataSource === 'pvgis') {
      const currentRoofData = ROOF_TYPES[roofType];
      
      // Climate-specific recommendations
      if (location.climateZone === 'Continental' && roofType !== 'Green Roof') {
        const greenRoofData = ROOF_TYPES['Green Roof'];
        const energySavings = (greenRoofData.energy - currentRoofData.energy) * roofSize;
        const co2Savings = (greenRoofData.co2 - currentRoofData.co2) * roofSize;
        
        newRecommendations.push({
          id: 'climate-optimized-roof',
          type: 'alternative',
          title: 'Climate-Optimized Roof Solution',
          description: `Continental climate zones benefit significantly from green roof insulation properties, especially with your ${location.pvgisData?.yearly.avgTemperature.toFixed(1)}°C average temperature.`,
          impact: 'medium',
          savings: {
            co2: Math.round(co2Savings),
            energy: Math.round(energySavings),
            cost: Math.round((greenRoofData.totalCost - currentRoofData.totalCost) * roofSize)
          },
          action: {
            type: 'change_roof_type',
            data: { roofType: 'Green Roof' }
          },
          confidence: 82,
          reasoning: [
            `Continental climate ideal for green roofs`,
            `Average temperature: ${location.pvgisData?.yearly.avgTemperature.toFixed(1)}°C`,
            `40-year lifespan vs ${currentRoofData.lifespan} years`,
            'PVGIS climate data confirms suitability'
          ],
          dataSource: 'pvgis'
        });
      }

      // Temperature-based cooling recommendations
      if (location.pvgisData && location.pvgisData.yearly.avgTemperature > 15 && roofType !== 'White - Cool Roof Coating') {
        const coolRoofData = ROOF_TYPES['White - Cool Roof Coating'];
        const energySavings = (coolRoofData.energy - currentRoofData.energy) * roofSize;
        
        newRecommendations.push({
          id: 'temperature-based-cooling',
          type: 'optimization',
          title: 'Cool Roof for Temperature Management',
          description: `With ${location.pvgisData.yearly.avgTemperature.toFixed(1)}°C average temperature, cool roof coating provides significant energy savings.`,
          impact: 'medium',
          savings: {
            energy: Math.round(energySavings),
            co2: Math.round((coolRoofData.co2 - currentRoofData.co2) * roofSize)
          },
          action: {
            type: 'change_roof_type',
            data: { roofType: 'White - Cool Roof Coating' }
          },
          confidence: 78,
          reasoning: [
            `Average temperature: ${location.pvgisData.yearly.avgTemperature.toFixed(1)}°C`,
            'Cool roof reduces cooling load significantly',
            'PVGIS temperature data confirms benefit',
            '20-year lifespan with minimal maintenance'
          ],
          dataSource: 'pvgis'
        });
      }
    }

    // Performance comparison with similar projects
    const similarProjectsWithSolar = similarProjects.filter(p => 
      p.includeSolar && p.solarYield && p.climate === location?.climateZone
    );
    
    if (similarProjectsWithSolar.length > 0 && location?.pvSystemPotential) {
      const avgYield = similarProjectsWithSolar.reduce((sum, p) => sum + (p.solarYield || 0), 0) / similarProjectsWithSolar.length;
      const yourYield = location.pvSystemPotential.yearlyOutput;
      
      if (yourYield > avgYield * 1.1) {
        newRecommendations.push({
          id: 'above-average-performance',
          type: 'optimization',
          title: 'Above-Average Solar Performance Expected',
          description: `Your location shows ${yourYield.toFixed(0)} kWh/kWp/year potential, ${((yourYield - avgYield) / avgYield * 100).toFixed(1)}% above similar projects in ${location.climateZone} climate.`,
          impact: 'medium',
          confidence: 88,
          reasoning: [
            `Your potential: ${yourYield.toFixed(0)} kWh/kWp/year`,
            `Regional average: ${avgYield.toFixed(0)} kWh/kWp/year`,
            `${((yourYield - avgYield) / avgYield * 100).toFixed(1)}% above average`,
            `Based on ${similarProjectsWithSolar.length} similar projects`
          ],
          dataSource: 'pvgis'
        });
      }
    }

    setRecommendations(newRecommendations);
  };

  const findSimilarProjects = () => {
    if (!location) {
      setSimilarProjects([]);
      return;
    }

    // Enhanced scoring with solar yield data
    const scored = SIMILAR_PROJECTS.map(project => {
      let score = 0;
      
      // Climate match (highest weight)
      if (project.climate === location.climateZone) score += 40;
      
      // Size similarity
      const sizeRatio = Math.min(project.roofSize, roofSize) / Math.max(project.roofSize, roofSize);
      score += sizeRatio * 25;
      
      // Roof type match
      if (project.roofType === roofType) score += 15;
      
      // Solar inclusion match
      if (project.includeSolar === includeSolar) score += 10;
      
      // Solar yield similarity (if both have solar)
      if (project.solarYield && location.pvSystemPotential) {
        const yieldRatio = Math.min(project.solarYield, location.pvSystemPotential.yearlyOutput) / 
                          Math.max(project.solarYield, location.pvSystemPotential.yearlyOutput);
        score += yieldRatio * 10;
      }
      
      return { ...project, score };
    });

    // Sort by score and take top 4
    const topSimilar = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

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

      if (shadingAnalysis && shadingAnalysis.annualShadingLoss > 10) {
        alerts.push({
          type: 'maintenance',
          title: 'Shading Monitoring',
          description: 'Monitor and address shading sources that reduce system performance.',
          urgency: 'medium',
          frequency: 'Annual assessment',
          nextDue: 'Set reminder'
        });
      }
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

  const getDataSourceIcon = (dataSource: string) => {
    switch (dataSource) {
      case 'pvgis': return <Zap className="w-3 h-3 text-green-500" title="PVGIS Data" />;
      case 'analysis': return <Eye className="w-3 h-3 text-blue-500" title="Site Analysis" />;
      default: return <Star className="w-3 h-3 text-gray-500" title="Estimated" />;
    }
  };

  const tabs = [
    { id: 'ai', label: 'AI Recommendations', icon: Brain },
    { id: 'similar', label: 'Similar Projects', icon: Users },
    { id: 'shading', label: 'Shading Analysis', icon: Eye },
    { id: 'timing', label: 'Optimal Timing', icon: Calendar },
    { id: 'maintenance', label: 'Maintenance Alerts', icon: Bell }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      <div className="flex items-center space-x-3 mb-6">
        <Brain className="w-6 h-6 text-purple-600" />
        <h2 className="text-xl font-semibold text-gray-900">Smart Recommendations</h2>
        <HelpTooltip content="AI-powered recommendations using real PVGIS solar data, shading analysis, and similar project comparisons. Get personalized suggestions for optimization, timing, and maintenance to maximize your roof's performance and value." />
        {location?.dataSource === 'pvgis' && (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center space-x-1">
            <Zap className="w-3 h-3" />
            <span>PVGIS Enhanced</span>
          </span>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
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
              <p>Analyzing your configuration...</p>
              <p className="text-sm">
                {location ? 'Processing location-specific data' : 'Add location for enhanced recommendations'}
              </p>
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
                        {getDataSourceIcon(rec.dataSource)}
                        <span className="text-sm text-gray-600">{rec.confidence}% confidence</span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{rec.description}</p>
                    
                    {rec.savings && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
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
                        {rec.savings.percentage && (
                          <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <div className="text-lg font-semibold text-purple-600">
                              {rec.savings.percentage > 0 ? '+' : ''}{rec.savings.percentage}%
                            </div>
                            <div className="text-xs text-purple-600">improvement</div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center space-x-2">
                        <span>Analysis details:</span>
                        {getDataSourceIcon(rec.dataSource)}
                      </h4>
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
            Projects similar to yours based on location, climate, roof specifications, and solar performance:
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
                      {project.solarYield && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          {project.solarYield} kWh/kWp/year
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
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
                      <div>
                        <span className="text-gray-500">Match Score:</span>
                        <div className="font-medium">{project.score?.toFixed(0)}%</div>
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

      {/* Shading Analysis */}
      {activeTab === 'shading' && (
        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-4">
            <Eye className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Site Shading Analysis</h3>
          </div>

          {!location ? (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Add location to perform shading analysis</p>
            </div>
          ) : !shadingAnalysis ? (
            <div className="text-center py-8 text-gray-500">
              <Eye className="w-12 h-12 mx-auto mb-4 opacity-50 animate-pulse" />
              <p>Analyzing site conditions...</p>
            </div>
          ) : (
            <>
              {/* Shading Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`rounded-lg p-4 ${
                  shadingAnalysis.annualShadingLoss < 5 ? 'bg-green-50' :
                  shadingAnalysis.annualShadingLoss < 15 ? 'bg-yellow-50' : 'bg-red-50'
                }`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <Sun className={`w-5 h-5 ${
                      shadingAnalysis.annualShadingLoss < 5 ? 'text-green-600' :
                      shadingAnalysis.annualShadingLoss < 15 ? 'text-yellow-600' : 'text-red-600'
                    }`} />
                    <span className="font-medium text-gray-900">Annual Shading Loss</span>
                  </div>
                  <div className={`text-2xl font-bold ${
                    shadingAnalysis.annualShadingLoss < 5 ? 'text-green-600' :
                    shadingAnalysis.annualShadingLoss < 15 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {shadingAnalysis.annualShadingLoss.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">of potential energy</div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <TreePine className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Winter Impact</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {shadingAnalysis.seasonalLosses.winter.toFixed(1)}%
                  </div>
                  <div className="text-sm text-blue-600">seasonal loss</div>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Sun className="w-5 h-5 text-orange-600" />
                    <span className="font-medium text-orange-900">Summer Impact</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">
                    {shadingAnalysis.seasonalLosses.summer.toFixed(1)}%
                  </div>
                  <div className="text-sm text-orange-600">seasonal loss</div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-purple-900">Critical Periods</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    {shadingAnalysis.criticalPeriods.length}
                  </div>
                  <div className="text-sm text-purple-600">identified</div>
                </div>
              </div>

              {/* Critical Periods */}
              {shadingAnalysis.criticalPeriods.length > 0 && (
                <div className="bg-red-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span>Critical Shading Periods</span>
                  </h4>
                  <div className="space-y-3">
                    {shadingAnalysis.criticalPeriods.slice(0, 3).map((period, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <div>
                            <span className="font-medium">{period.timeOfDay} in {period.season}</span>
                            <div className="text-sm text-gray-600">{period.cause}</div>
                          </div>
                        </div>
                        <span className="text-red-600 font-semibold">
                          {period.shadingPercentage.toFixed(1)}% loss
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span>Shading Mitigation Recommendations</span>
                </h4>
                <div className="space-y-2">
                  {shadingAnalysis.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold mt-0.5">
                        {index + 1}
                      </div>
                      <span className="text-gray-700">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Site Assessment */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Site Assessment Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Seasonal Variation</h5>
                    <div className="space-y-2">
                      {Object.entries(shadingAnalysis.seasonalLosses).map(([season, loss]) => (
                        <div key={season} className="flex items-center justify-between">
                          <span className="capitalize text-gray-600">{season}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  loss < 5 ? 'bg-green-500' :
                                  loss < 15 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(loss, 50) * 2}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{loss.toFixed(1)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Site Suitability</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Overall Rating:</span>
                        <span className={`font-semibold ${
                          shadingAnalysis.annualShadingLoss < 5 ? 'text-green-600' :
                          shadingAnalysis.annualShadingLoss < 15 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {shadingAnalysis.annualShadingLoss < 5 ? 'Excellent' :
                           shadingAnalysis.annualShadingLoss < 15 ? 'Good' : 'Challenging'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Solar Viability:</span>
                        <span className="font-semibold text-blue-600">
                          {shadingAnalysis.annualShadingLoss < 20 ? 'Recommended' : 'Consider alternatives'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
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
                  {shadingAnalysis && shadingAnalysis.annualShadingLoss > 10 && (
                    <li>• Regular shading assessment recommended due to site conditions</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}