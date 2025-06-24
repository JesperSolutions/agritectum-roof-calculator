import React from 'react';
import { Leaf, Zap, Wind, Euro, Calendar, TrendingUp, Wrench, Home, Award, Clock, DollarSign, Thermometer, Shield, Target, BarChart3 } from 'lucide-react';
import { UserRole } from './UserRoleSelector';
import HelpTooltip from './HelpTooltip';

interface MetricCard {
  id: string;
  title: string;
  value: string;
  unit: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  priority: {
    'esg-expert': number;
    'roofing-specialist': number;
    'private-individual': number;
  };
  category: 'environmental' | 'technical' | 'financial' | 'timeline';
}

interface AdaptiveMetricsDisplayProps {
  userRole: UserRole;
  metrics: {
    totalCo2PerYear: number;
    totalEnergyPerYear: number;
    noxPerYear: number;
    neutralYear: number | null;
    totalInstallationCost: number;
    solarEnergyPerYear: number;
    installationDays: number;
    annualSavings: number;
    paybackYears: number;
    maintenanceCost: number;
  };
  roofType: string;
  includeSolar: boolean;
}

const createMetricCards = (metrics: AdaptiveMetricsDisplayProps['metrics'], roofType: string, includeSolar: boolean): MetricCard[] => [
  {
    id: 'co2-offset',
    title: 'Annual CO₂ Offset',
    value: metrics.totalCo2PerYear.toLocaleString(),
    unit: 'kg CO₂/year',
    description: 'Total carbon dioxide offset from your roof system annually',
    icon: Leaf,
    color: 'from-green-500 to-green-600',
    priority: { 'esg-expert': 1, 'roofing-specialist': 4, 'private-individual': 5 },
    category: 'environmental'
  },
  {
    id: 'energy-impact',
    title: 'Annual Energy Impact',
    value: metrics.totalEnergyPerYear.toLocaleString(),
    unit: 'kWh/year',
    description: includeSolar ? 'Energy generated and saved annually' : 'Energy savings from roof efficiency',
    icon: Zap,
    color: 'from-blue-500 to-blue-600',
    priority: { 'esg-expert': 2, 'roofing-specialist': 3, 'private-individual': 2 },
    category: 'environmental'
  },
  {
    id: 'nox-reduction',
    title: 'Air Quality Improvement',
    value: metrics.noxPerYear.toLocaleString(),
    unit: 'kg NOₓ/year',
    description: 'Nitrogen oxide pollutants removed from the air annually',
    icon: Wind,
    color: 'from-purple-500 to-purple-600',
    priority: { 'esg-expert': 3, 'roofing-specialist': 6, 'private-individual': 6 },
    category: 'environmental'
  },
  {
    id: 'installation-cost',
    title: 'Total Investment',
    value: `€${metrics.totalInstallationCost.toLocaleString()}`,
    unit: 'upfront cost',
    description: 'Complete installation cost including materials and labor',
    icon: Euro,
    color: 'from-emerald-500 to-emerald-600',
    priority: { 'esg-expert': 5, 'roofing-specialist': 1, 'private-individual': 1 },
    category: 'financial'
  },
  {
    id: 'annual-savings',
    title: 'Annual Savings',
    value: `€${metrics.annualSavings.toLocaleString()}`,
    unit: 'per year',
    description: 'Estimated annual savings on energy costs',
    icon: DollarSign,
    color: 'from-yellow-500 to-yellow-600',
    priority: { 'esg-expert': 6, 'roofing-specialist': 5, 'private-individual': 3 },
    category: 'financial'
  },
  {
    id: 'payback-period',
    title: 'Payback Period',
    value: metrics.paybackYears.toFixed(1),
    unit: 'years',
    description: 'Time to recover your investment through savings',
    icon: TrendingUp,
    color: 'from-indigo-500 to-indigo-600',
    priority: { 'esg-expert': 7, 'roofing-specialist': 7, 'private-individual': 4 },
    category: 'financial'
  },
  {
    id: 'carbon-neutral',
    title: 'Carbon Neutral Timeline',
    value: metrics.neutralYear ? metrics.neutralYear.toString() : '∞',
    unit: 'years',
    description: 'Time for roof to offset its manufacturing carbon footprint',
    icon: Target,
    color: 'from-orange-500 to-orange-600',
    priority: { 'esg-expert': 4, 'roofing-specialist': 8, 'private-individual': 7 },
    category: 'environmental'
  },
  {
    id: 'installation-time',
    title: 'Installation Timeline',
    value: metrics.installationDays.toString(),
    unit: 'days',
    description: 'Estimated time for complete installation',
    icon: Clock,
    color: 'from-red-500 to-red-600',
    priority: { 'esg-expert': 8, 'roofing-specialist': 2, 'private-individual': 8 },
    category: 'timeline'
  }
];

const getRoleConfig = (role: UserRole) => {
  switch (role) {
    case 'esg-expert':
      return {
        title: 'Environmental Impact Analysis',
        subtitle: 'Comprehensive sustainability metrics and carbon footprint data',
        primaryCategories: ['environmental', 'technical'],
        showAdvanced: true
      };
    case 'roofing-specialist':
      return {
        title: 'Technical Specifications & Installation',
        subtitle: 'Professional installation requirements and performance data',
        primaryCategories: ['technical', 'timeline'],
        showAdvanced: true
      };
    case 'private-individual':
      return {
        title: 'Cost & Benefits Overview',
        subtitle: 'Simple breakdown of costs, savings, and benefits for your property',
        primaryCategories: ['financial', 'timeline'],
        showAdvanced: false
      };
    default:
      return {
        title: 'Roof Impact Analysis',
        subtitle: 'Complete overview of your roof system benefits',
        primaryCategories: ['environmental', 'financial'],
        showAdvanced: false
      };
  }
};

export default function AdaptiveMetricsDisplay({ userRole, metrics, roofType, includeSolar }: AdaptiveMetricsDisplayProps) {
  const config = getRoleConfig(userRole);
  const metricCards = createMetricCards(metrics, roofType, includeSolar);
  
  // Sort metrics by priority for the selected role
  const sortedMetrics = metricCards.sort((a, b) => {
    if (!userRole) return 0;
    return a.priority[userRole] - b.priority[userRole];
  });

  // Show top 6 metrics for the role, or all if advanced view
  const displayMetrics = config.showAdvanced ? sortedMetrics : sortedMetrics.slice(0, 6);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      <div className="flex items-center space-x-3 mb-6">
        <BarChart3 className="w-6 h-6 text-green-600" />
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{config.title}</h2>
          <p className="text-sm text-gray-600">{config.subtitle}</p>
        </div>
        <HelpTooltip content={`Metrics are prioritized based on your role as ${userRole?.replace('-', ' ')}. The most relevant information for your needs is shown first.`} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayMetrics.map((metric, index) => {
          const Icon = metric.icon;
          const isPrimary = index < 3; // First 3 are primary metrics
          
          return (
            <div 
              key={metric.id} 
              className={`rounded-2xl p-6 text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 ${
                isPrimary ? 'ring-2 ring-white ring-opacity-50' : ''
              }`}
              style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }}
              className={`bg-gradient-to-br ${metric.color} rounded-2xl p-6 text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 ${
                isPrimary ? 'ring-2 ring-white ring-opacity-50' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Icon className="w-8 h-8 opacity-80" />
                  {isPrimary && (
                    <div className="w-2 h-2 bg-white rounded-full opacity-80" />
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="text-white text-opacity-80 text-sm">{metric.unit}</div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">{metric.title}</h3>
                <p className="text-white text-opacity-80 text-sm leading-relaxed">
                  {metric.description}
                </p>
              </div>
              
              {isPrimary && (
                <div className="mt-4 pt-4 border-t border-white border-opacity-20">
                  <span className="text-xs text-white text-opacity-60 uppercase tracking-wide">
                    Priority Metric
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Role-specific additional information */}
      {userRole === 'esg-expert' && (
        <div className="mt-8 p-6 bg-green-50 rounded-xl">
          <h3 className="font-semibold text-green-900 mb-3 flex items-center space-x-2">
            <Award className="w-5 h-5" />
            <span>ESG Reporting Data</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-green-700">Scope 2 Emissions Avoided:</span>
              <div className="font-semibold">{(metrics.totalEnergyPerYear * 0.4).toLocaleString()} kg CO₂e</div>
            </div>
            <div>
              <span className="text-green-700">Renewable Energy %:</span>
              <div className="font-semibold">{includeSolar ? Math.round((metrics.solarEnergyPerYear / metrics.totalEnergyPerYear) * 100) : 0}%</div>
            </div>
            <div>
              <span className="text-green-700">Air Quality Index Impact:</span>
              <div className="font-semibold">+{(metrics.noxPerYear * 2.1).toFixed(1)} points</div>
            </div>
            <div>
              <span className="text-green-700">Sustainability Score:</span>
              <div className="font-semibold">{Math.min(100, Math.round((metrics.totalCo2PerYear / 100) + (includeSolar ? 20 : 0)))}/100</div>
            </div>
          </div>
        </div>
      )}

      {userRole === 'roofing-specialist' && (
        <div className="mt-8 p-6 bg-blue-50 rounded-xl">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center space-x-2">
            <Wrench className="w-5 h-5" />
            <span>Technical Installation Details</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Installation Rate:</span>
              <div className="font-semibold">~50 m²/day</div>
            </div>
            <div>
              <span className="text-blue-700">Crew Size Required:</span>
              <div className="font-semibold">2-3 specialists</div>
            </div>
            <div>
              <span className="text-blue-700">Weather Dependency:</span>
              <div className="font-semibold">Moderate</div>
            </div>
            <div>
              <span className="text-blue-700">Warranty Period:</span>
              <div className="font-semibold">15-25 years</div>
            </div>
          </div>
        </div>
      )}

      {userRole === 'private-individual' && (
        <div className="mt-8 p-6 bg-purple-50 rounded-xl">
          <h3 className="font-semibold text-purple-900 mb-3 flex items-center space-x-2">
            <Home className="w-5 h-5" />
            <span>What This Means for You</span>
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
              <div>
                <span className="font-medium text-purple-900">Monthly Savings: </span>
                <span className="text-purple-700">Approximately €{Math.round(metrics.annualSavings / 12)} per month on energy bills</span>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
              <div>
                <span className="font-medium text-purple-900">Installation Impact: </span>
                <span className="text-purple-700">Minimal disruption, completed in {metrics.installationDays} working days</span>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
              <div>
                <span className="font-medium text-purple-900">Environmental Benefit: </span>
                <span className="text-purple-700">Equivalent to planting {Math.round(metrics.totalCo2PerYear / 22)} trees annually</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}