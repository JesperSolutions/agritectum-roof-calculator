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
import ProgressIndicator from './components/ProgressIndicator';
import KeyboardShortcutsHelp from './components/KeyboardShortcutsHelp';
import UserRoleSelector, { UserRole } from './components/UserRoleSelector';
import AdaptiveMetricsDisplay from './components/AdaptiveMetricsDisplay';
import AdaptiveInputForm from './components/AdaptiveInputForm';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-green-100" data-tour="header">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-20 h-12">
                <img
                  src="/logo.webp"
                  alt="Agritectum logo"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center space-x-4">
              {/* Undo/Redo Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={undoRedoActions.undo}
                  disabled={!undoRedoActions.canUndo}
                  className="p-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo className="w-5 h-5" />
                </button>
                <button
                  onClick={undoRedoActions.redo}
                  disabled={!undoRedoActions.canRedo}
                  className="p-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                  title="Redo (Ctrl+Y)"
                >
                  <Redo className="w-5 h-5" />
                </button>
              </div>

              {/* Tour Button */}
              {hasSeenTour && (
                <button
                  onClick={() => setShowTour(true)}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  title="Start Guided Tour (Ctrl+T)"
                >
                  <Play className="w-4 h-4" />
                  <span className="hidden sm:inline">Tour</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* User Role Selection */}
        <UserRoleSelector 
          selectedRole={appState.userRole}
          onRoleSelect={handleRoleSelect}
        />

        {/* Only show content if user has selected a role */}
        {appState.userRole && (
          <>
            {/* Progress Indicator */}
            <ProgressIndicator steps={progressSteps} currentStep={currentStepId} />

            {/* Adaptive Input Form */}
            <AdaptiveInputForm
              userRole={appState.userRole}
              formData={appState}
              onFormChange={handleFormChange}
              onUnitToggle={handleUnitToggle}
            />

            {/* Project Management */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8" data-tour="project-management">
              <div className="flex items-center space-x-3 mb-6">
                <FolderOpen className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-900">Project Management</h2>
                <HelpTooltip content="Save your current roof configuration as a project to compare different scenarios or return to later. You can manage multiple projects and track your progress through the decision-making process." />
              </div>
              <ProjectManager 
                currentProject={currentProject}
                onProjectLoad={handleProjectLoad}
                onNewProject={handleNewProject}
              />
            </div>

            {/* Adaptive Metrics Display */}
            <AdaptiveMetricsDisplay
              userRole={appState.userRole}
              metrics={adaptiveMetrics}
              roofType={appState.roofType}
              includeSolar={appState.includeSolar}
            />

            {/* Main Calculator Mode Selector */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Calculator className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Advanced Analysis Tools</h2>
                <HelpTooltip content="Choose between standard roof configurations or design a custom mixed-use roof with multiple elements. The custom designer allows percentage-based allocation of different roof technologies." />
              </div>

              {/* Mode Selector */}
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-8">
                <button
                  onClick={() => setActiveMainTab('standard')}
                  className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                    activeMainTab === 'standard'
                      ? 'bg-white text-green-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Calculator className="w-4 h-4" />
                  <span>Enhanced Charts</span>
                </button>
                <button
                  onClick={() => setActiveMainTab('custom')}
                  className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                    activeMainTab === 'custom'
                      ? 'bg-white text-green-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Custom Roof Designer</span>
                </button>
              </div>

              {/* Enhanced Charts */}
              {activeMainTab === 'standard' && (
                <div data-tour="enhanced-charts">
                  <EnhancedCharts 
                    chartData={chartData}
                    roofType={appState.roofType}
                    includeSolar={appState.includeSolar}
                    totalCo2PerYear={totalCo2PerYear}
                    totalEnergyPerYear={totalEnergyPerYear}
                    noxPerYear={noxPerYear}
                    location={appState.location}
                  />
                </div>
              )}

              {/* Custom Roof Designer */}
              {activeMainTab === 'custom' && (
                <CustomRoofDesigner 
                  roofSize={roofSizeM2} 
                  location={appState.location || undefined}
                />
              )}
            </div>

            {/* Simple Comparison Chart - Only for standard mode */}
            {activeMainTab === 'standard' && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <Info className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Roof Type Comparison</h3>
                  <HelpTooltip content="Compare all available roof types side by side. Green bars show annual CO₂ offset (environmental benefit), while blue bars show total installation cost. This helps you choose the best option for your priorities and budget." />
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
            )}

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl shadow-xl p-8 text-white" data-tour="cta-section">
              <div className="text-center max-w-3xl mx-auto">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-90" />
                <h2 className="text-3xl font-bold mb-4">
                  Ready to Transform Your Roof?
                </h2>
                <p className="text-xl text-green-100 mb-8">
                  Get a personalized assessment and detailed report based on your specific building and requirements.
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-white text-green-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-green-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Get Your Personal Roof Assessment
                </button>
                <p className="text-sm text-green-200 mt-4">
                  Free consultation • No commitment • Expert guidance
                </p>
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-gray-600 text-sm">
            © 2025 Agritectum - Sustainable Building Solutions | 
            <a href="mailto:jesper.aggerholm@agritectum.com" className="text-green-600 hover:text-green-700 ml-1">
              info@agritectum.com
            </a>
          </p>
        </div>
      </div>

      {/* Lead Capture Modal */}
      <LeadCaptureModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        calculatorData={calculatorData}
      />

      {/* Guided Tour */}
      <GuidedTour 
        isActive={showTour}
        onComplete={handleTourComplete}
        onSkip={handleTourSkip}
      />

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp shortcuts={shortcuts} />

      {/* Tour Highlight Styles */}
      <style jsx global>{`
        .tour-highlight {
          position: relative;
          z-index: 45;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 8px rgba(59, 130, 246, 0.2);
          border-radius: 12px;
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
}