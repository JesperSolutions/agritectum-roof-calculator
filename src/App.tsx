import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';
import { Leaf, Zap, Wind, Calendar, TrendingUp, Calculator, Info, Euro, Sun, FileText, ToggleLeft, ToggleRight, Save, FolderOpen, HelpCircle, Undo, Redo, Play, Settings, ChevronRight, ChevronLeft, Lock, Unlock, Mail, Phone, User, MapPin, Home, Award, Wrench } from 'lucide-react';
import EnhancedLeadCaptureModal from './components/EnhancedLeadCaptureModal';
import LocationSelector from './components/LocationSelector';
import EnhancedCharts from './components/EnhancedCharts';
import SmartRecommendations from './components/SmartRecommendations';
import HelpTooltip from './components/HelpTooltip';
import { UserRole } from './components/UserRoleSelector';
import { Project, LocationData, ROOF_TYPES } from './types/project';
import { generateProjectId } from './utils/projectStorage';

// Simplified solar specs with realistic values
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

interface AppState {
  roofSize: number;
  roofType: keyof typeof ROOF_TYPES;
  includeSolar: boolean;
  useMetric: boolean;
  location: LocationData | null;
  userRole: UserRole;
  hasProvidedContact: boolean;
}

// Step Components
const UserRoleStep = ({ data, onUpdate, onNext }: any) => {
  const USER_ROLES = [
    {
      id: 'esg-expert' as const,
      title: 'ESG Expert',
      subtitle: 'Environmental, Social & Governance Professional',
      description: 'Focus on sustainability metrics, carbon footprint analysis, and environmental compliance',
      icon: Award,
      color: 'from-green-500 to-emerald-600',
      features: [
        'Advanced environmental impact metrics',
        'Carbon footprint calculations',
        'Sustainability reporting data',
        'Regulatory compliance insights'
      ]
    },
    {
      id: 'roofing-specialist' as const,
      title: 'Roofing Specialist',
      subtitle: 'Construction & Installation Professional',
      description: 'Technical specifications, installation requirements, and material performance data',
      icon: Wrench,
      color: 'from-blue-500 to-indigo-600',
      features: [
        'Technical specifications & requirements',
        'Installation timelines & processes',
        'Material costs & performance',
        'Maintenance schedules'
      ]
    },
    {
      id: 'private-individual' as const,
      title: 'Private Individual',
      subtitle: 'Homeowner or Property Owner',
      description: 'Simple, clear information about costs, savings, and benefits for your property',
      icon: Home,
      color: 'from-purple-500 to-pink-600',
      features: [
        'Cost savings & payback periods',
        'Energy bill reductions',
        'Simple installation timeline',
        'Easy maintenance overview'
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to the Roof Impact Calculator</h2>
        <p className="text-lg text-gray-600">
          Let's personalize your experience. What best describes your role?
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {USER_ROLES.map((role) => {
          const Icon = role.icon;
          const isSelected = data.userRole === role.id;
          return (
            <button
              key={role.id}
              onClick={() => onUpdate({ userRole: role.id })}
              className={`group relative border-2 rounded-xl p-6 text-left transition-all duration-200 ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50 shadow-lg' 
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg'
              }`}
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${role.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{role.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{role.subtitle}</p>
              <p className="text-sm text-gray-700 mb-4">{role.description}</p>
              
              <ul className="space-y-2 mb-4">
                {role.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  {isSelected ? 'Selected' : 'Select this role'}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
            </button>
          );
        })}
      </div>

      {data.userRole && (
        <div className="text-center">
          <button
            onClick={onNext}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
};

const LocationStep = ({ data, onUpdate, onNext, onBack }: any) => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <MapPin className="w-16 h-16 mx-auto mb-4 text-blue-600" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Where is your project located?</h2>
        <p className="text-lg text-gray-600">
          Location helps us provide accurate solar calculations and climate-specific recommendations.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
        <LocationSelector 
          location={data.location}
          onLocationChange={(location) => onUpdate({ location })}
        />
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <button
          onClick={onNext}
          disabled={!data.location}
          className="flex items-center space-x-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span>Continue</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const RoofConfigurationStep = ({ data, onUpdate, onNext, onBack }: any) => {
  const [roofSize, setRoofSize] = useState(data.roofSize || 1000);
  const [roofType, setRoofType] = useState(data.roofType || 'Photocatalytic Coating');
  const [includeSolar, setIncludeSolar] = useState(data.includeSolar || false);
  const [useMetric, setUseMetric] = useState(data.useMetric !== false);

  const quickSizes = useMetric 
    ? [500, 1000, 2000, 5000] 
    : [5382, 10764, 21528, 53820];

  const handleUpdate = (updates: any) => {
    onUpdate(updates);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <Settings className="w-16 h-16 mx-auto mb-4 text-purple-600" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Configure Your Roof System</h2>
        <p className="text-lg text-gray-600">
          Tell us about your roof size and choose your preferred sustainable solution.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8 space-y-8">
        {/* Roof Size Input */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Home className="w-5 h-5 text-blue-600" />
              <label className="block text-lg font-semibold text-gray-900">
                Roof Size
              </label>
              <HelpTooltip content="Enter the total roof area for accurate calculations" />
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setUseMetric(!useMetric);
                  handleUpdate({ useMetric: !useMetric });
                }}
                className="flex items-center space-x-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
              >
                <span className={useMetric ? 'font-semibold text-blue-600' : 'text-gray-500'}>m²</span>
                <span className={!useMetric ? 'font-semibold text-blue-600' : 'text-gray-500'}>sq ft</span>
              </button>
            </div>
          </div>
          
          <div className="relative">
            <input
              type="number"
              value={roofSize}
              onChange={(e) => {
                const newSize = parseInt(e.target.value) || 0;
                setRoofSize(newSize);
                handleUpdate({ roofSize: newSize });
              }}
              className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg font-medium pr-16"
              placeholder={`Enter area in ${useMetric ? 'm²' : 'sq ft'}`}
              min="1"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
              <span className="text-gray-500 text-sm font-medium">
                {useMetric ? 'm²' : 'sq ft'}
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {quickSizes.map((size) => (
              <button
                key={size}
                onClick={() => {
                  setRoofSize(size);
                  handleUpdate({ roofSize: size });
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  roofSize === size 
                    ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                {size.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Roof Type Selection */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-green-600" />
            <label className="block text-lg font-semibold text-gray-900">
              Sustainable Roof Solution
            </label>
            <HelpTooltip content="Choose the sustainable roofing technology that best fits your needs" />
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {Object.entries(ROOF_TYPES).map(([type, typeData]) => (
              <button
                key={type}
                onClick={() => {
                  setRoofType(type as keyof typeof ROOF_TYPES);
                  handleUpdate({ roofType: type });
                }}
                className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                  roofType === type
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: typeData.color }}
                    />
                    <div>
                      <div className="font-semibold text-gray-900 text-lg">{type}</div>
                      <div className="text-sm text-gray-600 mt-1">{typeData.description}</div>
                      <div className="text-xs text-gray-500 mt-2">
                        {typeData.lifespan} year lifespan • {typeData.maintenance}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {typeData.totalCost > 0 ? `€${typeData.totalCost.toFixed(2)}/m²` : 'Baseline'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {typeData.co2 > 0 ? `${typeData.co2} kg CO₂/m²/year` : 'No CO₂ benefit'}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Solar Panel Option */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-xl">
                <Sun className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-gray-900">Add Solar Panels</h3>
                  <HelpTooltip content="Solar panels generate renewable energy and significantly increase your environmental impact and savings" />
                </div>
                <p className="text-sm text-gray-600">
                  Generate renewable energy and increase your savings (€150/m² additional cost)
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={includeSolar}
                onChange={(e) => {
                  setIncludeSolar(e.target.checked);
                  handleUpdate({ includeSolar: e.target.checked });
                }}
                className="sr-only peer"
              />
              <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-yellow-500"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <button
          onClick={onNext}
          disabled={!roofSize || roofSize < 1}
          className="flex items-center space-x-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span>View Results</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const MetricsStep = ({ data, onUpdate, calculatedMetrics, onUnlockContent }: any) => {
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'metrics' | 'charts' | 'recommendations' | 'reports'>('metrics');

  const handleLeadCapture = () => {
    setShowLeadModal(true);
  };

  const handleLeadCaptured = () => {
    onUpdate({ hasProvidedContact: true });
    setShowLeadModal(false);
    // Switch to charts tab after unlocking
    setActiveTab('charts');
  };

  // Tab configuration with lock status
  const tabs = [
    { 
      id: 'metrics', 
      label: 'Environmental Impact', 
      icon: '🌱', 
      locked: false,
      description: 'Your environmental impact overview'
    },
    { 
      id: 'charts', 
      label: 'Advanced Analysis', 
      icon: '📊', 
      locked: !data.hasProvidedContact,
      description: '50-year projections and detailed charts'
    },
    { 
      id: 'recommendations', 
      label: 'AI Recommendations', 
      icon: '🧠', 
      locked: !data.hasProvidedContact,
      description: 'Smart suggestions and expert insights'
    },
    { 
      id: 'reports', 
      label: 'Professional Reports', 
      icon: '📄', 
      locked: !data.hasProvidedContact,
      description: 'Downloadable PDF reports and documentation'
    }
  ];

  // Generate chart data for unlocked content
  const generateChartData = () => {
    const data = [];
    const initialCo2 = 19 * (calculatedMetrics.roofSizeM2 || 1000);
    let cumulativeOffset = 0;
    
    for (let year = 0; year <= 50; year++) {
      cumulativeOffset += calculatedMetrics.totalCo2PerYear;
      const netCo2 = Math.max(0, initialCo2 - cumulativeOffset);
      
      data.push({
        year,
        cumulativeOffset,
        netCo2,
        solarGeneration: calculatedMetrics.solarEnergyPerYear || 0
      });
    }
    
    return data;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
          <TrendingUp className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Roof System Analysis</h2>
        <p className="text-lg text-gray-600">
          Comprehensive analysis of your roof design and its environmental impact.
        </p>
      </div>

      {/* Enhanced Tab Navigation */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.locked) {
                    handleLeadCapture();
                  } else {
                    setActiveTab(tab.id as any);
                  }
                }}
                className={`relative py-4 px-1 text-center border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === tab.id && !tab.locked
                    ? 'border-green-500 text-green-600'
                    : tab.locked
                    ? 'border-transparent text-gray-400 cursor-pointer hover:text-gray-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.locked && (
                    <Lock className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">{tab.description}</div>
                
                {tab.locked && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'metrics' && (
            <div>
              {/* Key Financial Metrics */}
              <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <Euro className="w-4 h-4 text-white" />
                  </div>
                  <span>Your Roof System Impact</span>
                </h3>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      €{calculatedMetrics.totalInstallationCost.toLocaleString()}
                    </div>
                    <div className="text-sm text-green-700 font-medium">Total Investment</div>
                    <div className="text-xs text-green-600 mt-1">One-time cost</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      €{calculatedMetrics.annualSavings.toLocaleString()}
                    </div>
                    <div className="text-sm text-blue-700 font-medium">Annual Savings</div>
                    <div className="text-xs text-blue-600 mt-1">Per year</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                    <div className="text-4xl font-bold text-purple-600 mb-2">
                      {calculatedMetrics.paybackYears.toFixed(1)}
                    </div>
                    <div className="text-sm text-purple-700 font-medium">Payback Period</div>
                    <div className="text-xs text-purple-600 mt-1">Years</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                    <div className="text-4xl font-bold text-orange-600 mb-2">
                      {calculatedMetrics.totalCo2PerYear.toLocaleString()}
                    </div>
                    <div className="text-sm text-orange-700 font-medium">Annual CO₂ Offset</div>
                    <div className="text-xs text-orange-600 mt-1">kg per year</div>
                  </div>
                </div>
              </div>

              {/* Environmental Benefits */}
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border border-green-200 p-8 mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                  <Leaf className="w-6 h-6 text-green-600" />
                  <span>Environmental Benefits</span>
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl mb-2">🌳</div>
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {Math.round(calculatedMetrics.totalCo2PerYear / 22)}
                    </div>
                    <div className="text-sm text-gray-600">Trees equivalent per year</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">⚡</div>
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {calculatedMetrics.totalEnergyPerYear.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">kWh energy impact per year</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">🌬️</div>
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {calculatedMetrics.noxPerYear.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">kg NOₓ reduction per year</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Locked Content Preview */}
          {(activeTab === 'charts' || activeTab === 'recommendations' || activeTab === 'reports') && !data.hasProvidedContact && (
            <div className="text-center py-16">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl opacity-50 blur-sm"></div>
                <div className="relative bg-white rounded-xl border-2 border-dashed border-gray-300 p-12">
                  <Lock className="w-20 h-20 mx-auto mb-6 text-gray-400" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {activeTab === 'charts' && 'Advanced Charts & Analysis'}
                    {activeTab === 'recommendations' && 'AI-Powered Recommendations'}
                    {activeTab === 'reports' && 'Professional Reports'}
                  </h3>
                  <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                    {activeTab === 'charts' && 'Unlock detailed 50-year projections, seasonal analysis, and interactive charts showing your roof\'s long-term environmental impact.'}
                    {activeTab === 'recommendations' && 'Get personalized AI recommendations, expert insights, market trends, and connections to certified professionals in your area.'}
                    {activeTab === 'reports' && 'Generate comprehensive PDF reports, executive summaries, and technical documentation for stakeholders and contractors.'}
                  </p>
                  
                  <button
                    onClick={handleLeadCapture}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    Unlock Full Analysis - Get Free Consultation
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Unlocked Content */}
          {data.hasProvidedContact && activeTab === 'charts' && (
            <div className="space-y-6">
              <EnhancedCharts 
                chartData={generateChartData()}
                roofType={data.roofType || 'Photocatalytic Coating'}
                includeSolar={data.includeSolar || false}
                totalCo2PerYear={calculatedMetrics.totalCo2PerYear}
                totalEnergyPerYear={calculatedMetrics.totalEnergyPerYear}
                noxPerYear={calculatedMetrics.noxPerYear}
                location={data.location}
              />
            </div>
          )}

          {data.hasProvidedContact && activeTab === 'recommendations' && (
            <div className="space-y-6">
              <SmartRecommendations
                roofSize={data.roofSize || 1000}
                roofType={data.roofType || 'Photocatalytic Coating'}
                includeSolar={data.includeSolar || false}
                location={data.location}
                totalCo2PerYear={calculatedMetrics.totalCo2PerYear}
                totalEnergyPerYear={calculatedMetrics.totalEnergyPerYear}
                totalInstallationCost={calculatedMetrics.totalInstallationCost}
                onRecommendationApply={(recommendation) => {
                  console.log('Applying recommendation:', recommendation);
                }}
              />
            </div>
          )}

          {data.hasProvidedContact && activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Professional Reports</h3>
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                  Generate comprehensive PDF reports with all your calculations, recommendations, and analysis.
                  Perfect for sharing with stakeholders, contractors, and decision makers.
                </p>
                <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Executive Summary</h4>
                    <p className="text-sm text-gray-600 mb-4">High-level overview perfect for decision makers and stakeholders</p>
                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Generate PDF
                    </button>
                  </div>
                  <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Settings className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Technical Report</h4>
                    <p className="text-sm text-gray-600 mb-4">Detailed specifications and technical analysis for contractors</p>
                    <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      Generate PDF
                    </button>
                  </div>
                  <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Financial Analysis</h4>
                    <p className="text-sm text-gray-600 mb-4">ROI calculations, costs, and financial projections</p>
                    <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                      Generate PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Success Message for Unlocked Content */}
      {data.hasProvidedContact && (
        <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-xl p-6 mb-8 text-white text-center">
          <Unlock className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">🎉 Full Analysis Unlocked!</h3>
          <p className="text-lg opacity-90">
            You now have access to all advanced features, detailed analysis, and professional tools.
          </p>
        </div>
      )}

      {/* Lead Capture Modal */}
      <EnhancedLeadCaptureModal 
        isOpen={showLeadModal}
        onClose={() => setShowLeadModal(false)}
        calculatorData={{
          roofSize: data.roofSize || 1000,
          roofSizeDisplay: data.roofSize || 1000,
          unit: 'm²',
          roofType: data.roofType || 'Photocatalytic Coating',
          includeSolar: data.includeSolar || false,
          ...calculatedMetrics,
          location: data.location,
          useMetric: true
        }}
        userRole={data.userRole}
        sessionStartTime={new Date()}
        onLeadCaptured={handleLeadCaptured}
      />
    </div>
  );
};

export default function RoofImpactWizard() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [appState, setAppState] = useState<AppState>({
    roofSize: 1000,
    roofType: "Photocatalytic Coating",
    includeSolar: false,
    useMetric: true,
    location: null,
    userRole: null,
    hasProvidedContact: false
  });

  const updateAppState = (updates: Partial<AppState>) => {
    setAppState(prev => ({ ...prev, ...updates }));
  };

  // Fixed calculation logic
  const calculateMetrics = () => {
    const data = ROOF_TYPES[appState.roofType];
    const roofSizeM2 = appState.roofSize;
    
    // Base roof calculations - only apply benefits if it's not standard roofing
    const co2PerYear = data.co2 * roofSizeM2;
    const noxPerYear = data.nox * roofSizeM2;
    const energyPerYear = data.energy * roofSizeM2;
    
    // Solar calculations
    const locationMultiplier = appState.location ? (appState.location.solarIrradiance / 1100) : 1;
    const adjustedSolarHours = SOLAR_SPECS.hoursPerDay * locationMultiplier;
    
    const solarEnergyPerYear = appState.includeSolar 
      ? (SOLAR_SPECS.powerPerM2 * roofSizeM2 * adjustedSolarHours 
          * SOLAR_SPECS.daysPerYear * SOLAR_SPECS.performanceFactor) / 1000 
      : 0;
    
    const solarCo2PerYear = appState.includeSolar ? solarEnergyPerYear * SOLAR_SPECS.co2PerKwh : 0;
    const solarCost = appState.includeSolar ? SOLAR_SPECS.costPerM2 * roofSizeM2 : 0;
    
    // Total calculations
    const totalEnergyPerYear = energyPerYear + solarEnergyPerYear;
    const totalCo2PerYear = co2PerYear + solarCo2PerYear;
    
    // Carbon neutral calculation - only if there's actual CO2 benefit
    const initialCo2 = 19 * roofSizeM2; // Manufacturing footprint
    const neutralYear = totalCo2PerYear > 0 ? Math.ceil(initialCo2 / totalCo2PerYear) : null;
    
    // Cost calculations
    const totalInstallationCost = (data.totalCost * roofSizeM2) + solarCost;
    const installationTimeHours = data.installationRate > 0 ? roofSizeM2 / data.installationRate : 0;
    const solarInstallationHours = appState.includeSolar ? roofSizeM2 / 20 : 0;
    const totalInstallationHours = installationTimeHours + solarInstallationHours;
    const installationDays = Math.ceil(totalInstallationHours / 8);
    
    // Financial calculations - only count actual energy savings
    const energySavingsValue = totalEnergyPerYear * 0.25; // €0.25 per kWh
    const annualSavings = Math.max(0, energySavingsValue);
    const paybackYears = totalInstallationCost > 0 && annualSavings > 0 
      ? totalInstallationCost / annualSavings 
      : 999; // Very high number if no savings
    
    const maintenanceCost = roofSizeM2 * 2;

    return {
      totalCo2PerYear: Math.round(totalCo2PerYear),
      totalEnergyPerYear: Math.round(totalEnergyPerYear),
      noxPerYear: Math.round(noxPerYear * 10) / 10,
      neutralYear,
      totalInstallationCost: Math.round(totalInstallationCost),
      solarEnergyPerYear: Math.round(solarEnergyPerYear),
      installationDays: Math.max(1, installationDays),
      annualSavings: Math.round(annualSavings),
      paybackYears: Math.round(paybackYears * 10) / 10,
      maintenanceCost: Math.round(maintenanceCost),
      roofSizeM2
    };
  };

  const calculatedMetrics = calculateMetrics();

  const steps = [
    {
      id: 'user-role',
      title: 'Select Your Role',
      description: 'Tell us about your expertise level',
      component: UserRoleStep,
      isComplete: (data: AppState) => !!data.userRole
    },
    {
      id: 'location',
      title: 'Project Location',
      description: 'Where is your roof located?',
      component: LocationStep,
      isComplete: (data: AppState) => !!data.location
    },
    {
      id: 'roof-config',
      title: 'Roof Configuration',
      description: 'Configure your roof system',
      component: RoofConfigurationStep,
      isComplete: (data: AppState) => data.roofSize > 0
    },
    {
      id: 'metrics',
      title: 'Your Impact',
      description: 'See your environmental and financial results',
      component: MetricsStep,
      isComplete: () => true
    }
  ];

  const currentStep = steps[currentStepIndex];
  const StepComponent = currentStep.component;

  const goToNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    const canGoToStep = stepIndex <= currentStepIndex || 
      (stepIndex === currentStepIndex + 1 && steps[currentStepIndex].isComplete(appState));
    
    if (canGoToStep) {
      setCurrentStepIndex(stepIndex);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header with Progress */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-20 h-12">
                <img
                  src="/logo.webp"
                  alt="Agritectum logo"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Step {currentStepIndex + 1} of {steps.length}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => {
              const isCompleted = index < currentStepIndex || step.isComplete(appState);
              const isCurrent = index === currentStepIndex;
              const isAccessible = index <= currentStepIndex || 
                (index === currentStepIndex + 1 && steps[currentStepIndex].isComplete(appState));

              return (
                <div key={step.id} className="flex items-center space-x-4">
                  <button
                    onClick={() => goToStep(index)}
                    disabled={!isAccessible}
                    className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isCurrent 
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-300' 
                        : isCompleted
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : isAccessible
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      isCurrent 
                        ? 'bg-blue-600 text-white' 
                        : isCompleted
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {isCompleted ? '✓' : index + 1}
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{step.title}</div>
                      <div className="text-xs opacity-75">{step.description}</div>
                    </div>
                  </button>
                  {index < steps.length - 1 && (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <StepComponent
          data={appState}
          onUpdate={updateAppState}
          onNext={goToNextStep}
          onBack={goToPreviousStep}
          calculatedMetrics={calculatedMetrics}
          onUnlockContent={() => updateAppState({ hasProvidedContact: true })}
        />
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
  );
}