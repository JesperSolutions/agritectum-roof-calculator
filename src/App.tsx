import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';
import { Leaf, Zap, Wind, Calendar, TrendingUp, Calculator, Info, Euro, Sun, FileText, ToggleLeft, ToggleRight, Save, FolderOpen, HelpCircle, Undo, Redo, Play, Settings } from 'lucide-react';
import LeadCaptureModal from './components/LeadCaptureModal';
import LocationSelector from './components/LocationSelector';
import ProjectManager from './components/ProjectManager';
import EnhancedCharts from './components/EnhancedCharts';
import SmartRecommendations from './components/SmartRecommendations';
import CustomRoofDesigner from './components/CustomRoofDesigner';
import HelpTooltip from './components/HelpTooltip';
import GuidedTour from './components/GuidedTour';
import CompactProgressIndicator from './components/CompactProgressIndicator';
import KeyboardShortcutsHelp from './components/KeyboardShortcutsHelp';
import UserRoleSelector, { UserRole } from './components/UserRoleSelector';
import AdaptiveMetricsDisplay from './components/AdaptiveMetricsDisplay';
import AdaptiveInputForm from './components/AdaptiveInputForm';
import StreamlinedHeader from './components/StreamlinedHeader';
import RoleBasedContentTemplate from './components/RoleBasedContentTemplate';
import { Project, LocationData, ROOF_TYPES } from './types/project';
import { generateProjectId } from './utils/projectStorage';
import { useUndoRedo } from './hooks/useUndoRedo';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useIframeHeight } from './hooks/useIframeHeight';

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

interface AppState {
  roofSize: number;
  roofType: keyof typeof ROOF_TYPES;
  includeSolar: boolean;
  useMetric: boolean;
  location: LocationData | null;
  userRole: UserRole;
}

export default function RoofImpactDashboard() {
  // Initialize iframe height management
  const { updateHeight } = useIframeHeight();

  // Undo/Redo state management
  const [appState, undoRedoActions] = useUndoRedo<AppState>({
    roofSize: 1000,
    roofType: "Photocatalytic Coating",
    includeSolar: false,
    useMetric: true,
    location: null,
    userRole: null
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Partial<Project>>({
    id: generateProjectId(),
    createdAt: new Date()
  });
  const [showTour, setShowTour] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState<'standard' | 'custom'>('standard');

  // Check if user has seen the tour before
  useEffect(() => {
    const tourSeen = localStorage.getItem('roof-calculator-tour-seen');
    if (!tourSeen) {
      setShowTour(true);
    }
    setHasSeenTour(!!tourSeen);
  }, []);

  // Update iframe height when content changes
  useEffect(() => {
    updateHeight();
  }, [appState, isModalOpen, showTour, activeMainTab, updateHeight]);

  const data = ROOF_TYPES[appState.roofType];

  // Convert roof size for calculations (always use m² internally)
  const roofSizeM2 = appState.useMetric ? appState.roofSize : appState.roofSize / M2_TO_SQFT;

  const initialCo2 = 19 * roofSizeM2;
  const co2PerYear = data.co2 * roofSizeM2;
  const noxPerYear = data.nox * roofSizeM2;
  const energyPerYear = data.energy * roofSizeM2;

  // Adjust solar calculations based on location
  const locationMultiplier = appState.location ? (appState.location.solarIrradiance / 1100) : 1; // 1100 is base irradiance
  const adjustedSolarHours = SOLAR_SPECS.hoursPerDay * locationMultiplier;

  // Calculate annual solar generation (kWh/year) with performance factor and location adjustment
  const solarEnergyPerYear = appState.includeSolar 
    ? (SOLAR_SPECS.powerPerM2 * roofSizeM2 * adjustedSolarHours 
        * SOLAR_SPECS.daysPerYear * SOLAR_SPECS.performanceFactor) / 1000 
    : 0;  // kWh/year (includes derating for real conditions)

  const solarCo2PerYear = appState.includeSolar ? solarEnergyPerYear * SOLAR_SPECS.co2PerKwh : 0;
  const solarCost = appState.includeSolar ? SOLAR_SPECS.costPerM2 * roofSizeM2 : 0;

  // Combined totals
  const totalEnergyPerYear = energyPerYear + solarEnergyPerYear;
  const totalCo2PerYear = co2PerYear + solarCo2PerYear;

  // Recalculate neutralYear with updated totalCo2PerYear
  const neutralYear = totalCo2PerYear > 0 ? Math.ceil(initialCo2 / totalCo2PerYear) : null;

  const totalInstallationCost = (data.totalCost * roofSizeM2) + solarCost;
  const installationTimeHours = data.installationRate > 0 ? roofSizeM2 / data.installationRate : 0;
  const solarInstallationHours = appState.includeSolar ? roofSizeM2 / 20 : 0; // 20 m²/hour for solar
  const totalInstallationHours = installationTimeHours + solarInstallationHours;
  const installationDays = Math.ceil(totalInstallationHours / 8);

  // Calculate financial metrics
  const annualSavings = totalEnergyPerYear * 0.25; // €0.25 per kWh saved/generated
  const paybackYears = totalInstallationCost > 0 ? totalInstallationCost / annualSavings : 0;
  const maintenanceCost = roofSizeM2 * 2; // €2 per m² annually

  // Progress tracking
  const progressSteps = [
    {
      id: 'user-role',
      title: 'Select Your Role',
      description: 'Choose your expertise level for personalized experience',
      status: appState.userRole ? 'completed' : 'pending',
      required: true
    },
    {
      id: 'roof-size',
      title: 'Set Roof Size',
      description: 'Enter your roof dimensions',
      status: appState.roofSize > 0 ? 'completed' : 'pending',
      required: true
    },
    {
      id: 'roof-type',
      title: 'Choose Roof Type',
      description: 'Select sustainable roofing solution',
      status: appState.roofType ? 'completed' : 'pending',
      required: true
    },
    {
      id: 'location',
      title: 'Add Location',
      description: 'Set location for accurate calculations',
      status: appState.location ? 'completed' : 'pending',
      required: false
    },
    {
      id: 'solar',
      title: 'Solar Configuration',
      description: 'Decide on solar panel inclusion',
      status: 'completed', // Always completed as it's optional
      required: false
    }
  ];

  const currentStepId = progressSteps.find(step => step.status === 'pending')?.id || 'completed';

  // Keyboard shortcuts
  const shortcuts = [
    {
      key: 'z',
      ctrlKey: true,
      action: undoRedoActions.undo,
      description: 'Undo last change'
    },
    {
      key: 'y',
      ctrlKey: true,
      action: undoRedoActions.redo,
      description: 'Redo last change'
    },
    {
      key: 's',
      ctrlKey: true,
      action: () => {
        // Trigger save project modal
        const saveButton = document.querySelector('[data-action="save-project"]') as HTMLButtonElement;
        saveButton?.click();
      },
      description: 'Save current project'
    },
    {
      key: 'n',
      ctrlKey: true,
      action: handleNewProject,
      description: 'Create new project'
    },
    {
      key: 't',
      ctrlKey: true,
      action: () => setShowTour(true),
      description: 'Start guided tour'
    },
    {
      key: 'r',
      ctrlKey: true,
      action: () => setIsModalOpen(true),
      description: 'Get roof assessment report'
    },
    {
      key: '?',
      action: () => {
        const helpButton = document.querySelector('[data-action="keyboard-help"]') as HTMLButtonElement;
        helpButton?.click();
      },
      description: 'Show keyboard shortcuts'
    }
  ];

  useKeyboardShortcuts({ shortcuts });

  // Update current project when settings change
  useEffect(() => {
    setCurrentProject(prev => ({
      ...prev,
      roofSize: roofSizeM2,
      roofType: appState.roofType,
      includeSolar: appState.includeSolar,
      useMetric: appState.useMetric,
      location: appState.location,
      updatedAt: new Date()
    }));
  }, [roofSizeM2, appState.roofType, appState.includeSolar, appState.useMetric, appState.location]);

  // If we want to factor panel degradation into the 50-year chart:
  const chartData = [];
  let cumulativeCo2 = 0;

  for (let year = 0; year <= 50; year++) {
    let solarGenThisYear = 0;
    if (appState.includeSolar && year <= SOLAR_SPECS.lifespan) {
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
    co2Offset: typeData.co2 * roofSizeM2 + (appState.includeSolar ? solarCo2PerYear : 0),
    energySavings: typeData.energy * roofSizeM2 + (appState.includeSolar ? solarEnergyPerYear : 0),
    noxReduction: typeData.nox * roofSizeM2,
    totalCost: typeData.totalCost * roofSizeM2 + (appState.includeSolar ? solarCost : 0),
    color: typeData.color
  }));

  // Calculator data for the modal
  const calculatorData = {
    roofSize: roofSizeM2, // Always pass m² to modal
    roofSizeDisplay: appState.roofSize, // Display value in current unit
    unit: appState.useMetric ? 'm²' : 'sq ft',
    roofType: appState.roofType,
    includeSolar: appState.includeSolar,
    totalCo2PerYear,
    totalEnergyPerYear,
    noxPerYear,
    neutralYear,
    totalInstallationCost,
    solarEnergyPerYear
  };

  // Handle unit conversion when toggling
  const handleUnitToggle = () => {
    const newUseMetric = !appState.useMetric;
    const newRoofSize = newUseMetric 
      ? Math.round(appState.roofSize / M2_TO_SQFT)
      : Math.round(appState.roofSize * M2_TO_SQFT);
    
    undoRedoActions.set({
      ...appState,
      roofSize: newRoofSize,
      useMetric: newUseMetric
    });
  };

  const handleProjectLoad = (project: Project) => {
    const newState = {
      roofSize: project.useMetric ? project.roofSize : Math.round(project.roofSize * M2_TO_SQFT),
      roofType: project.roofType,
      includeSolar: project.includeSolar,
      useMetric: project.useMetric,
      location: project.location || null,
      userRole: appState.userRole // Preserve current user role
    };
    undoRedoActions.set(newState);
    setCurrentProject(project);
  };

  function handleNewProject() {
    const newState = {
      roofSize: 1000,
      roofType: "Photocatalytic Coating" as keyof typeof ROOF_TYPES,
      includeSolar: false,
      useMetric: true,
      location: null,
      userRole: appState.userRole // Preserve current user role
    };
    undoRedoActions.set(newState);
    setCurrentProject({
      id: generateProjectId(),
      createdAt: new Date()
    });
    undoRedoActions.clear(); // Clear undo/redo history for new project
  }

  const handleRecommendationApply = (recommendation: any) => {
    if (recommendation.type === 'add_solar') {
      undoRedoActions.set({
        ...appState,
        includeSolar: recommendation.data.includeSolar
      });
    } else if (recommendation.type === 'change_roof_type') {
      undoRedoActions.set({
        ...appState,
        roofType: recommendation.data.roofType
      });
    }
  };

  const handleTourComplete = () => {
    localStorage.setItem('roof-calculator-tour-seen', 'true');
    setHasSeenTour(true);
    setShowTour(false);
  };

  const handleTourSkip = () => {
    localStorage.setItem('roof-calculator-tour-seen', 'true');
    setHasSeenTour(true);
    setShowTour(false);
  };

  const handleFormChange = (newFormData: any) => {
    undoRedoActions.set({
      ...appState,
      ...newFormData
    });
  };

  const handleRoleSelect = (role: UserRole) => {
    undoRedoActions.set({
      ...appState,
      userRole: role
    });
  };

  // Metrics for adaptive display
  const adaptiveMetrics = {
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

  // Progress calculation for header
  const completedSteps = progressSteps.filter(step => step.status === 'completed').length;
  const totalSteps = progressSteps.length;
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simplified Header */}
      <StreamlinedHeader
        title="Roof Impact Calculator"
        subtitle="Sustainable roofing solutions analysis"
        progress={{
          current: completedSteps,
          total: totalSteps,
          percentage: progressPercentage
        }}
        actions={{
          primary: {
            label: 'Get Report',
            onClick: () => setIsModalOpen(true),
            icon: FileText
          },
          secondary: [
            {
              label: 'Save Project',
              onClick: () => {
                const saveButton = document.querySelector('[data-action="save-project"]') as HTMLButtonElement;
                saveButton?.click();
              },
              icon: Save
            },
            {
              label: 'Start Tour',
              onClick: () => setShowTour(true),
              icon: Play
            }
          ]
        }}
      />

      <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
        {/* User Role Selection */}
        <UserRoleSelector 
          selectedRole={appState.userRole}
          onRoleSelect={handleRoleSelect}
        />

        {/* Only show content if user has selected a role */}
        {appState.userRole && (
          <>
            {/* Simple Progress */}
            <CompactProgressIndicator 
              steps={progressSteps} 
              currentStep={currentStepId}
              variant="minimal"
            />

            {/* Clean Content Layout */}
            <RoleBasedContentTemplate
              userRole={appState.userRole}
              layout="stack"
              sections={[
                {
                  id: 'input-form',
                  title: 'Configuration',
                  icon: Calculator,
                  priority: 1,
                  content: (
                    <AdaptiveInputForm
                      userRole={appState.userRole}
                      formData={appState}
                      onFormChange={handleFormChange}
                      onUnitToggle={handleUnitToggle}
                    />
                  )
                },
                {
                  id: 'metrics',
                  title: 'Key Metrics',
                  icon: TrendingUp,
                  priority: 2,
                  content: (
                    <AdaptiveMetricsDisplay
                      userRole={appState.userRole}
                      metrics={adaptiveMetrics}
                      roofType={appState.roofType}
                      includeSolar={appState.includeSolar}
                    />
                  )
                },
                {
                  id: 'project-management',
                  title: 'Project Management',
                  icon: FolderOpen,
                  priority: 3,
                  compact: true,
                  content: (
                    <ProjectManager 
                      currentProject={currentProject}
                      onProjectLoad={handleProjectLoad}
                      onNewProject={handleNewProject}
                    />
                  )
                },
                {
                  id: 'charts',
                  title: 'Analysis Tools',
                  icon: TrendingUp,
                  priority: 4,
                  content: (
                    <div className="space-y-4">
                      {/* Simple Mode Selector */}
                      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => setActiveMainTab('standard')}
                          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            activeMainTab === 'standard'
                              ? 'bg-white text-green-600 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Charts
                        </button>
                        <button
                          onClick={() => setActiveMainTab('custom')}
                          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            activeMainTab === 'custom'
                              ? 'bg-white text-green-600 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Designer
                        </button>
                      </div>

                      {/* Content */}
                      {activeMainTab === 'standard' ? (
                        <EnhancedCharts 
                          chartData={chartData}
                          roofType={appState.roofType}
                          includeSolar={appState.includeSolar}
                          totalCo2PerYear={totalCo2PerYear}
                          totalEnergyPerYear={totalEnergyPerYear}
                          noxPerYear={noxPerYear}
                          location={appState.location}
                        />
                      ) : (
                        <CustomRoofDesigner 
                          roofSize={roofSizeM2} 
                          location={appState.location || undefined}
                        />
                      )}
                    </div>
                  )
                }
              ]}
            />

            {/* Simple CTA */}
            <div className="bg-green-600 rounded-lg p-6 text-white text-center">
              <h2 className="text-xl font-bold mb-2">
                Ready to Transform Your Roof?
              </h2>
              <p className="text-green-100 mb-4">
                Get a personalized assessment and detailed report.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-white text-green-700 px-6 py-3 rounded-lg font-medium hover:bg-green-50 transition-colors"
              >
                Get Your Assessment
              </button>
            </div>
          </>
        )}
      </div>

      {/* Modals and overlays */}
      <LeadCaptureModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        calculatorData={calculatorData}
      />

      <GuidedTour 
        isActive={showTour}
        onComplete={handleTourComplete}
        onSkip={handleTourSkip}
      />

      <KeyboardShortcutsHelp shortcuts={shortcuts} />
    </div>
  );
}