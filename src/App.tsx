import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';
import { Leaf, Zap, Wind, Calendar, TrendingUp, Calculator, Info, Euro, Sun, FileText, ToggleLeft, ToggleRight, Save, FolderOpen, HelpCircle, Undo, Redo, Play, Settings, ChevronRight, ChevronLeft, Lock, Unlock, Mail, Phone, User, MapPin, Home, Award, Wrench } from 'lucide-react';
import EnhancedLeadCaptureModal from './components/EnhancedLeadCaptureModal';
import LocationSelector from './components/LocationSelector';
import CustomRoofDesigner from './components/CustomRoofDesigner';
import HelpTooltip from './components/HelpTooltip';
import { UserRole } from './components/UserRoleSelector';
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

interface WizardStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  isComplete: (data: any) => boolean;
  isLocked?: boolean;
}

interface AppState {
  roofSize: number;
  roofType: keyof typeof ROOF_TYPES;
  includeSolar: boolean;
  useMetric: boolean;
  location: LocationData | null;
  userRole: UserRole;
  customRoofElements: any[];
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

const RoofDesignStep = ({ data, onUpdate, onNext, onBack }: any) => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <Settings className="w-16 h-16 mx-auto mb-4 text-purple-600" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Design Your Roof System</h2>
        <p className="text-lg text-gray-600">
          Configure your roof with different sustainable technologies and solar integration.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
        <CustomRoofDesigner 
          roofSize={data.roofSize || 1000}
          location={data.location}
          onConfigurationChange={(config) => onUpdate({ 
            customRoofElements: config.elements,
            roofSize: config.totalArea,
            includeSolar: config.elements.some((el: any) => el.type === 'solar')
          })}
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
          disabled={!data.customRoofElements || data.customRoofElements.length === 0}
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

  const handleLeadCapture = () => {
    setShowLeadModal(true);
  };

  const handleLeadCaptured = () => {
    onUpdate({ hasProvidedContact: true });
    setShowLeadModal(false);
  };

  // Create the environmental impact profile data similar to the image
  const environmentalProfile = {
    'CO₂ Offset': Math.min(100, (calculatedMetrics.totalCo2PerYear / 100) * 10),
    'Energy Gen': Math.min(100, (calculatedMetrics.totalEnergyPerYear / 1000) * 10),
    'Maintenance': 85,
    'Cost Efficiency': Math.min(100, (50000 / calculatedMetrics.totalInstallationCost) * 100),
    'Air Quality': Math.min(100, (calculatedMetrics.noxPerYear / 10) * 20),
    'Durability': 90
  };

  const detailedMetrics = [
    {
      title: 'Stormwater Management',
      value: '50 L/year',
      subtitle: 'Rainwater retention capacity',
      color: 'blue',
      icon: '💧'
    },
    {
      title: 'Heat Island Reduction',
      value: '35.0%',
      subtitle: 'Surface temperature reduction',
      color: 'orange',
      icon: '🌡️'
    },
    {
      title: 'Noise Reduction',
      value: '50.0 dB',
      subtitle: 'Sound insulation improvement',
      color: 'purple',
      icon: '🔇'
    },
    {
      title: 'Biodiversity Index',
      value: '60%',
      subtitle: 'Habitat creation potential',
      color: 'green',
      icon: '🌱'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <TrendingUp className="w-16 h-16 mx-auto mb-4 text-green-600" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Environmental Impact</h2>
        <p className="text-lg text-gray-600">
          Here's what your sustainable roof system will achieve for the environment.
        </p>
      </div>

      {/* Environmental Impact Profile - Similar to the image */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Radar Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Environmental Impact Profile</h3>
          <div className="relative w-80 h-80 mx-auto">
            {/* This would be replaced with an actual radar chart component */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 border-2 border-green-200 rounded-full relative">
                <div className="absolute inset-4 border border-green-300 rounded-full"></div>
                <div className="absolute inset-8 border border-green-400 rounded-full"></div>
                <div className="absolute inset-12 border border-green-500 rounded-full"></div>
                
                {/* Data points */}
                {Object.entries(environmentalProfile).map(([key, value], index) => {
                  const angle = (index * 60) - 90; // 6 points, 60 degrees apart
                  const radian = (angle * Math.PI) / 180;
                  const radius = (value / 100) * 120; // Scale to chart size
                  const x = Math.cos(radian) * radius + 128;
                  const y = Math.sin(radian) * radius + 128;
                  
                  return (
                    <div
                      key={key}
                      className="absolute w-3 h-3 bg-green-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                      style={{ left: x, top: y }}
                    />
                  );
                })}
                
                {/* Labels */}
                {Object.keys(environmentalProfile).map((key, index) => {
                  const angle = (index * 60) - 90;
                  const radian = (angle * Math.PI) / 180;
                  const x = Math.cos(radian) * 140 + 128;
                  const y = Math.sin(radian) * 140 + 128;
                  
                  return (
                    <div
                      key={key}
                      className="absolute text-xs text-gray-600 transform -translate-x-1/2 -translate-y-1/2"
                      style={{ left: x, top: y }}
                    >
                      {key}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Detailed Environmental Metrics</h3>
          <div className="space-y-6">
            {detailedMetrics.map((metric, index) => (
              <div key={index} className={`p-4 rounded-lg bg-${metric.color}-50 border border-${metric.color}-200`}>
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">{metric.icon}</span>
                  <h4 className={`font-semibold text-${metric.color}-900`}>{metric.title}</h4>
                </div>
                <div className={`text-2xl font-bold text-${metric.color}-700 mb-1`}>
                  {metric.value}
                </div>
                <div className={`text-sm text-${metric.color}-600`}>
                  {metric.subtitle}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Financial Metrics */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Financial Overview</h3>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              €{calculatedMetrics.totalInstallationCost.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Investment</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              €{calculatedMetrics.annualSavings.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Annual Savings</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {calculatedMetrics.paybackYears.toFixed(1)} years
            </div>
            <div className="text-sm text-gray-600">Payback Period</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {calculatedMetrics.totalCo2PerYear.toLocaleString()} kg
            </div>
            <div className="text-sm text-gray-600">Annual CO₂ Offset</div>
          </div>
        </div>
      </div>

      {/* Unlock More Content */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-8 text-center">
        <Lock className="w-16 h-16 mx-auto mb-4 text-blue-600" />
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Want to See More?</h3>
        <p className="text-lg text-gray-600 mb-6">
          Get access to detailed analysis, advanced charts, expert recommendations, and project management tools.
        </p>
        <div className="grid md:grid-cols-3 gap-4 mb-8 text-sm">
          <div className="flex items-center space-x-2 text-gray-600">
            <Lock className="w-4 h-4" />
            <span>50-Year Impact Timeline</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Lock className="w-4 h-4" />
            <span>AI-Powered Recommendations</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Lock className="w-4 h-4" />
            <span>Expert Network Access</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Lock className="w-4 h-4" />
            <span>Detailed Financial Analysis</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Lock className="w-4 h-4" />
            <span>Project Management Tools</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Lock className="w-4 h-4" />
            <span>Professional PDF Reports</span>
          </div>
        </div>
        <button
          onClick={handleLeadCapture}
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          Unlock Full Analysis - Get Free Consultation
        </button>
      </div>

      {/* Lead Capture Modal */}
      <EnhancedLeadCaptureModal 
        isOpen={showLeadModal}
        onClose={() => setShowLeadModal(false)}
        calculatorData={{
          roofSize: data.roofSize || 1000,
          roofSizeDisplay: data.roofSize || 1000,
          unit: 'm²',
          roofType: 'Custom Design',
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
    customRoofElements: [],
    hasProvidedContact: false
  });

  const updateAppState = (updates: Partial<AppState>) => {
    setAppState(prev => ({ ...prev, ...updates }));
  };

  // Calculate metrics based on current state
  const calculateMetrics = () => {
    const data = ROOF_TYPES[appState.roofType];
    const roofSizeM2 = appState.roofSize;
    
    const initialCo2 = 19 * roofSizeM2;
    const co2PerYear = data.co2 * roofSizeM2;
    const noxPerYear = data.nox * roofSizeM2;
    const energyPerYear = data.energy * roofSizeM2;
    
    const locationMultiplier = appState.location ? (appState.location.solarIrradiance / 1100) : 1;
    const adjustedSolarHours = SOLAR_SPECS.hoursPerDay * locationMultiplier;
    
    const solarEnergyPerYear = appState.includeSolar 
      ? (SOLAR_SPECS.powerPerM2 * roofSizeM2 * adjustedSolarHours 
          * SOLAR_SPECS.daysPerYear * SOLAR_SPECS.performanceFactor) / 1000 
      : 0;
    
    const solarCo2PerYear = appState.includeSolar ? solarEnergyPerYear * SOLAR_SPECS.co2PerKwh : 0;
    const solarCost = appState.includeSolar ? SOLAR_SPECS.costPerM2 * roofSizeM2 : 0;
    
    const totalEnergyPerYear = energyPerYear + solarEnergyPerYear;
    const totalCo2PerYear = co2PerYear + solarCo2PerYear;
    const neutralYear = totalCo2PerYear > 0 ? Math.ceil(initialCo2 / totalCo2PerYear) : null;
    
    const totalInstallationCost = (data.totalCost * roofSizeM2) + solarCost;
    const installationTimeHours = data.installationRate > 0 ? roofSizeM2 / data.installationRate : 0;
    const solarInstallationHours = appState.includeSolar ? roofSizeM2 / 20 : 0;
    const totalInstallationHours = installationTimeHours + solarInstallationHours;
    const installationDays = Math.ceil(totalInstallationHours / 8);
    
    const annualSavings = totalEnergyPerYear * 0.25;
    const paybackYears = totalInstallationCost > 0 ? totalInstallationCost / annualSavings : 0;
    const maintenanceCost = roofSizeM2 * 2;

    return {
      totalCo2PerYear,
      totalEnergyPerYear,
      noxPerYear,
      neutralYear,
      totalInstallationCost,
      solarEnergyPerYear,
      installationDays,
      annualSavings,
      paybackYears,
      maintenanceCost
    };
  };

  const calculatedMetrics = calculateMetrics();

  const steps: WizardStep[] = [
    {
      id: 'user-role',
      title: 'Select Your Role',
      description: 'Tell us about your expertise level',
      component: UserRoleStep,
      isComplete: (data) => !!data.userRole
    },
    {
      id: 'location',
      title: 'Project Location',
      description: 'Where is your roof located?',
      component: LocationStep,
      isComplete: (data) => !!data.location
    },
    {
      id: 'roof-design',
      title: 'Roof Design',
      description: 'Configure your sustainable roof system',
      component: RoofDesignStep,
      isComplete: (data) => data.customRoofElements && data.customRoofElements.length > 0
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
    // Only allow going to completed steps or the next incomplete step
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