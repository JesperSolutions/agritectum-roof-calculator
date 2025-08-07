import { useState } from 'react';
import { TrendingUp, ChevronRight, ChevronLeft, Lock, Unlock, MapPin, Home, Award, Wrench, User, Settings, Sun, Plus, Minus, BarChart3, Brain, HelpCircle, Calculator, Zap, Leaf, Euro, Clock, TreePine } from 'lucide-react';
import EnhancedLeadCaptureModal from './components/EnhancedLeadCaptureModal';
import LocationSelector from './components/LocationSelector';
import EnhancedCharts from './components/EnhancedCharts';
import SmartRecommendations from './components/SmartRecommendations';
import HelpTooltip from './components/HelpTooltip';
import { UserRole } from './components/UserRoleSelector';
import { Project, LocationData, ROOF_TYPES } from './types/project';

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

interface RoofSegment {
  id: string;
  name: string;
  percentage: number;
  roofType: keyof typeof ROOF_TYPES;
  includeSolar: boolean;
}

interface AppState {
  totalRoofSize: number;
  roofSegments: RoofSegment[];
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
  const [totalRoofSize, setTotalRoofSize] = useState(data.totalRoofSize || 1000);
  const [roofSegments, setRoofSegments] = useState<RoofSegment[]>(data.roofSegments || []);

  const addSegment = () => {
    const usedPercentage = roofSegments.reduce((sum, segment) => sum + segment.percentage, 0);
    const remainingPercentage = Math.max(0, 100 - usedPercentage);
    
    if (remainingPercentage <= 0) {
      alert('You have already allocated 100% of your roof area. Please adjust existing segments first.');
      return;
    }
    
    const newSegment: RoofSegment = {
      id: Date.now().toString(),
      name: `Section ${roofSegments.length + 1}`,
      percentage: Math.min(remainingPercentage, 25),
      roofType: 'Photocatalytic Coating',
      includeSolar: false
    };
    const newSegments = [...roofSegments, newSegment];
    setRoofSegments(newSegments);
    onUpdate({ roofSegments: newSegments, totalRoofSize });
  };

  const removeSegment = (id: string) => {
    const newSegments = roofSegments.filter(segment => segment.id !== id);
    setRoofSegments(newSegments);
    onUpdate({ roofSegments: newSegments, totalRoofSize });
  };

  const updateSegment = (id: string, updates: Partial<RoofSegment>) => {
    const newSegments = roofSegments.map(segment =>
      segment.id === id ? { ...segment, ...updates } : segment
    );
    setRoofSegments(newSegments);
    onUpdate({ roofSegments: newSegments, totalRoofSize });
  };

  const updateTotalRoofSize = (newSize: number) => {
    setTotalRoofSize(newSize);
    onUpdate({ roofSegments, totalRoofSize: newSize });
  };

  const totalPercentage = roofSegments.reduce((sum, segment) => sum + segment.percentage, 0);
  const remainingPercentage = 100 - totalPercentage;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <Settings className="w-16 h-16 mx-auto mb-4 text-purple-600" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Configure Your Roof System</h2>
        <p className="text-lg text-gray-600">
          Enter your total roof size, then add segments with percentages for different solutions.
        </p>
        <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-500">
          <HelpCircle className="w-4 h-4" />
          <span>Hover over the question marks for helpful explanations</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
        {/* Total Roof Size Input */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Total Roof Size</h3>
            <HelpTooltip content="Enter the total area of your roof in square meters. You can measure this from architectural plans or estimate based on building dimensions. This will be divided into segments below." />
          </div>
          <div className="flex items-center space-x-4">
            <input
              type="number"
              value={totalRoofSize}
              onChange={(e) => updateTotalRoofSize(parseInt(e.target.value) || 0)}
              className="w-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
              min="1"
              placeholder="1000"
            />
            <span className="text-lg text-gray-600">m²</span>
          </div>
        </div>

        {/* Total Roof Size Display */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 mb-8 text-center relative">
          <div className="absolute top-4 right-4">
            <HelpTooltip content="This shows your total roof area. Below you can divide this into segments with different roofing solutions and solar configurations." />
          </div>
          <div className="text-5xl font-bold text-gray-900 mb-2">
            {totalRoofSize.toLocaleString()} m²
          </div>
          <div className="text-lg text-gray-600 mb-1">Total Roof Area</div>
          <div className="text-sm text-gray-500">
            {roofSegments.length} segment{roofSegments.length !== 1 ? 's' : ''} • {totalPercentage}% allocated
          </div>
          {remainingPercentage > 0 && (
            <div className="text-sm text-orange-600 mt-1">
              {remainingPercentage}% remaining
            </div>
          )}
          {totalPercentage > 100 && (
            <div className="text-sm text-red-600 mt-1">
              ⚠️ Over-allocated by {totalPercentage - 100}%
            </div>
          )}
        </div>

        {/* Percentage Allocation Bar */}
        {roofSegments.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Roof Allocation</span>
              <span className="text-sm text-gray-500">{totalPercentage}% of 100%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              {roofSegments.map((segment, index) => {
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
                return (
                  <div
                    key={segment.id}
                    className={`h-full float-left ${colors[index % colors.length]}`}
                    style={{ width: `${Math.min(segment.percentage, 100 - roofSegments.slice(0, index).reduce((sum, s) => sum + s.percentage, 0))}%` }}
                    title={`${segment.name}: ${segment.percentage}%`}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Roof Sections */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <h3 className="text-xl font-semibold text-gray-900">Roof Segments</h3>
              <HelpTooltip content="Add segments to allocate percentages of your roof to different solutions. For example: 60% photocatalytic coating, 40% solar panels. Each segment shows its area and impact." />
            </div>
            <button
              onClick={addSegment}
              disabled={remainingPercentage <= 0}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Segment</span>
            </button>
          </div>

          {roofSegments.map((segment, index) => {
            const roofData = ROOF_TYPES[segment.roofType];
            const segmentSize = (segment.percentage / 100) * totalRoofSize;
            const segmentCost = roofData.totalCost * segmentSize + (segment.includeSolar ? 150 * segmentSize : 0);
            const segmentCo2 = Math.round(roofData.co2 * segmentSize + (segment.includeSolar ? segmentSize * 0.2 * 1100 * 0.75 * 0.4 / 1000 : 0));
            const segmentEnergy = Math.round(roofData.energy * segmentSize + (segment.includeSolar ? segmentSize * 0.2 * 1100 * 0.75 / 1000 : 0));

            return (
              <div key={segment.id} className="border border-gray-200 rounded-xl p-6 space-y-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-lg font-bold text-white">{index + 1}</span>
                    </div>
                    <input
                      type="text"
                      value={segment.name}
                      onChange={(e) => updateSegment(segment.id, { name: e.target.value })}
                      className="text-xl font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                      placeholder="Enter segment name..."
                    />
                    <div className="text-sm text-gray-500">
                      ({Math.round(segmentSize).toLocaleString()} m²)
                    </div>
                  </div>
                  <button
                    onClick={() => removeSegment(segment.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors hover:scale-110"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {/* Percentage Input */}
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                      <span>Percentage (%)</span>
                      <HelpTooltip content="What percentage of your total roof should this segment cover? All segments should add up to 100% or less." />
                    </label>
                    <input
                      type="number"
                      value={segment.percentage}
                      onChange={(e) => updateSegment(segment.id, { percentage: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg transition-all duration-200"
                      min="1"
                      max="100"
                      placeholder="25"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      = {Math.round(segmentSize).toLocaleString()} m²
                    </div>
                  </div>

                  {/* Roof Type Selection */}
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                      <span>Roof Solution</span>
                      <HelpTooltip content="Choose the roofing solution for this segment. Each option provides different environmental benefits like CO₂ offset, energy savings, and air quality improvements." />
                    </label>
                    <select
                      value={segment.roofType}
                      onChange={(e) => updateSegment(segment.id, { roofType: e.target.value as keyof typeof ROOF_TYPES })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg transition-all duration-200"
                    >
                      {Object.entries(ROOF_TYPES).map(([type, typeData]) => (
                        <option key={type} value={type}>
                          {type} {typeData.totalCost > 0 ? `(€${typeData.totalCost}/m²)` : ''}
                        </option>
                      ))}
                    </select>
                    {roofData.description && (
                      <div className="mt-2 text-xs text-gray-600 bg-gray-50 rounded p-2">
                        <strong>Benefits:</strong> {roofData.description}
                      </div>
                    )}
                  </div>

                  {/* Solar Toggle */}
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                      <span>Solar Panels</span>
                      <HelpTooltip content="Add solar panels to this segment. Solar panels generate clean electricity, reduce your energy bills, and provide additional CO₂ offset. About 70% of the segment area can be used for solar panels." />
                    </label>
                    <div className="flex items-center space-x-3 h-12">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={segment.includeSolar}
                          onChange={(e) => updateSegment(segment.id, { includeSolar: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                      </label>
                      <span className={`text-sm font-medium ${segment.includeSolar ? 'text-yellow-600' : 'text-gray-600'}`}>
                        {segment.includeSolar ? '☀️ Included' : 'Not included'}
                      </span>
                    </div>
                    {segment.includeSolar && (
                      <div className="mt-2 text-xs text-yellow-700 bg-yellow-50 rounded p-2">
                        <strong>Solar Area:</strong> ~{Math.round(segmentSize * 0.7)} m² usable for panels
                      </div>
                    )}
                  </div>
                </div>

                {/* Segment Metrics - Matching Original Design */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-100">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    <div className="flex flex-col items-center">
                      <Euro className="w-6 h-6 text-gray-600 mb-2" />
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        €{segmentCost.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Total Cost</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <Leaf className="w-6 h-6 text-green-600 mb-2" />
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {segmentCo2}
                      </div>
                      <div className="text-sm text-gray-600">kg CO₂/year</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <Zap className="w-6 h-6 text-blue-600 mb-2" />
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {segmentEnergy.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">kWh/year</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <Clock className="w-6 h-6 text-purple-600 mb-2" />
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        {roofData.lifespan}
                      </div>
                      <div className="text-sm text-gray-600">Years Lifespan</div>
                    </div>
                  </div>
                  
                  {/* Special info for social activities */}
                  {segment.roofType === 'Social Activities Area' && (
                    <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="text-sm text-orange-800">
                        <strong>Social Benefits:</strong> This area can accommodate up to 20 people for meetings and relaxation activities. 
                        Includes furniture, plants, and creates valuable community space.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {roofSegments.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">🏠</div>
              <h3 className="text-xl font-semibold mb-2">No segments added yet</h3>
              <p className="text-gray-600 mb-4">Add your first segment to start configuring your roof system</p>
              <button
                onClick={addSegment}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add First Segment
              </button>
            </div>
          )}
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
          disabled={totalRoofSize < 1 || roofSegments.length === 0 || totalPercentage > 100}
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
  const [activeTab, setActiveTab] = useState<'metrics' | 'charts' | 'recommendations'>('metrics');

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
    }
  ];

  // Generate chart data for unlocked content
  const generateChartData = () => {
    const chartData = [];
    const initialCo2 = 19 * calculatedMetrics.totalRoofSize;
    let cumulativeOffset = 0;
    
    for (let year = 0; year <= 50; year++) {
      cumulativeOffset += calculatedMetrics.totalCo2PerYear;
      const netCo2 = Math.max(0, initialCo2 - cumulativeOffset);
      
      chartData.push({
        year,
        cumulativeOffset,
        netCo2,
        solarGeneration: calculatedMetrics.totalSolarEnergyPerYear || 0
      });
    }
    
    return chartData;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
          <TrendingUp className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Roof System Analysis</h2>
        <p className="text-lg text-gray-600">
          Comprehensive analysis of your {data.roofSegments?.length || 1} roof section{(data.roofSegments?.length || 1) !== 1 ? 's' : ''} and environmental impact.
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
              {/* Key Financial Metrics - Enhanced Design */}
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="text-center p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200 shadow-lg relative">
                  <div className="absolute top-3 right-3">
                    <HelpTooltip content="Total upfront investment including all roofing materials, solar panels, and installation costs. This is a one-time expense." iconColor="text-green-500" />
                  </div>
                  <div className="text-5xl font-bold text-green-600 mb-3">
                    €{calculatedMetrics.totalInstallationCost.toLocaleString()}
                  </div>
                  <div className="text-lg text-green-700 font-semibold">Total Investment</div>
                  <div className="text-sm text-green-600 mt-1">One-time cost</div>
                </div>
                <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 shadow-lg relative">
                  <div className="absolute top-3 right-3">
                    <HelpTooltip content="Annual savings from reduced energy bills and solar energy generation. This includes both energy efficiency improvements and solar electricity production." iconColor="text-blue-500" />
                  </div>
                  <div className="text-5xl font-bold text-blue-600 mb-3">
                    €{calculatedMetrics.totalAnnualSavings.toLocaleString()}
                  </div>
                  <div className="text-lg text-blue-700 font-semibold">Annual Savings</div>
                  <div className="text-sm text-blue-600 mt-1">Per year</div>
                </div>
                <div className="text-center p-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200 shadow-lg relative">
                  <div className="absolute top-3 right-3">
                    <HelpTooltip content="Time it takes for annual savings to equal the initial investment. ∞ means no financial payback (environmental benefits only)." iconColor="text-purple-500" />
                  </div>
                  <div className="text-5xl font-bold text-purple-600 mb-3">
                    {calculatedMetrics.paybackYears === 999 ? '∞' : calculatedMetrics.paybackYears.toFixed(1)}
                  </div>
                  <div className="text-lg text-purple-700 font-semibold">Payback Period</div>
                  <div className="text-sm text-purple-600 mt-1">Years</div>
                </div>
                <div className="text-center p-8 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-200 shadow-lg relative">
                  <div className="absolute top-3 right-3">
                    <HelpTooltip content="Amount of CO₂ emissions offset annually through your roof system. This includes benefits from roofing materials and solar energy generation." iconColor="text-orange-500" />
                  </div>
                  <div className="text-5xl font-bold text-orange-600 mb-3">
                    {calculatedMetrics.totalCo2PerYear.toLocaleString()}
                  </div>
                  <div className="text-lg text-orange-700 font-semibold">Annual CO₂ Offset</div>
                  <div className="text-sm text-orange-600 mt-1">kg per year</div>
                </div>
              </div>

              {/* Roof Segments Breakdown - Matching Original Design */}
              <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8 shadow-lg">
                <div className="flex items-center space-x-3 mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Roof Segments Breakdown</h3>
                  <HelpTooltip content="Detailed breakdown showing the contribution of each roof segment to your total environmental and financial impact." />
                </div>
                <div className="space-y-6">
                  {data.roofSegments?.map((segment: RoofSegment, index: number) => {
                    const segmentData = ROOF_TYPES[segment.roofType];
                    const segmentSize = (segment.percentage / 100) * data.totalRoofSize;
                    const segmentCost = segmentData.totalCost * segmentSize + (segment.includeSolar ? 150 * segmentSize : 0);
                    const segmentCo2 = Math.round(segmentData.co2 * segmentSize + (segment.includeSolar ? segmentSize * 0.2 * 1100 * 0.75 * 0.4 / 1000 : 0));
                    const segmentEnergy = Math.round(segmentData.energy * segmentSize + (segment.includeSolar ? segmentSize * 0.2 * 1100 * 0.75 / 1000 : 0));
                    
                    // Skip segments with no benefits (like Standard Roofing without solar)
                    if (segmentCost === 0 && segmentCo2 === 0 && segmentEnergy === 0) {
                      return null;
                    }
                    
                    return (
                      <div key={segment.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                              <span className="text-lg font-bold text-white">{index + 1}</span>
                            </div>
                            <div>
                              <h4 className="text-xl font-bold text-gray-900">{segment.name}</h4>
                              <p className="text-gray-600">
                                {segment.percentage}% ({Math.round(segmentSize).toLocaleString()} m²) • {segment.roofType}
                                {segment.includeSolar && ' • Solar Panels'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          <div className="text-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                            <Euro className="w-5 h-5 text-gray-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-gray-900 mb-1">€{segmentCost.toLocaleString()}</div>
                            <div className="text-sm text-gray-600">Total Cost</div>
                          </div>
                          <div className="text-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                            <Leaf className="w-5 h-5 text-green-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-green-600 mb-1">{segmentCo2}</div>
                            <div className="text-sm text-green-700">kg CO₂/year</div>
                          </div>
                          <div className="text-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                            <Zap className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-blue-600 mb-1">{segmentEnergy.toLocaleString()}</div>
                            <div className="text-sm text-blue-700">kWh/year</div>
                          </div>
                          <div className="text-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
                            <Clock className="w-5 h-5 text-purple-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-purple-600 mb-1">{segmentData.lifespan}</div>
                            <div className="text-sm text-purple-700">Years Lifespan</div>
                          </div>
                        </div>
                      </div>
                    );
                  }).filter(Boolean)}
                </div>
              </div>

              {/* Environmental Benefits */}
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border border-green-200 p-8 mb-8">
                <div className="flex items-center space-x-3 mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                    <div className="w-8 h-8 text-green-600">🌱</div>
                    <span>Environmental Benefits</span>
                  </h3>
                  <HelpTooltip content="Environmental impact of your roof system expressed in relatable terms. These benefits accumulate year after year." />
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <TreePine className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {Math.round(calculatedMetrics.totalCo2PerYear / 22)}
                    </div>
                    <div className="text-lg text-gray-700 font-medium">Trees equivalent per year</div>
                    <div className="text-sm text-gray-500 mt-1">CO₂ absorption equivalent</div>
                  </div>
                  <div className="text-center">
                    <Zap className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {calculatedMetrics.totalEnergyPerYear.toLocaleString()}
                    </div>
                    <div className="text-lg text-gray-700 font-medium">kWh energy impact per year</div>
                    <div className="text-sm text-gray-500 mt-1">Savings + generation combined</div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🌬️</span>
                    </div>
                    <div className="text-4xl font-bold text-purple-600 mb-2">
                      {calculatedMetrics.totalNoxPerYear.toFixed(1)}
                    </div>
                    <div className="text-lg text-gray-700 font-medium">kg NOₓ reduction per year</div>
                    <div className="text-sm text-gray-500 mt-1">Air quality improvement</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Locked Content Preview */}
          {(activeTab === 'charts' || activeTab === 'recommendations') && !data.hasProvidedContact && (
            <div className="text-center py-16">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl opacity-50 blur-sm"></div>
                <div className="relative bg-white rounded-xl border-2 border-dashed border-gray-300 p-12">
                  <Lock className="w-20 h-20 mx-auto mb-6 text-gray-400" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {activeTab === 'charts' && 'Advanced Charts & Analysis'}
                    {activeTab === 'recommendations' && 'AI-Powered Recommendations'}
                  </h3>
                  <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                    {activeTab === 'charts' && 'Unlock detailed 50-year projections, seasonal analysis, and interactive charts showing your roof\'s long-term environmental impact.'}
                    {activeTab === 'recommendations' && 'Get personalized AI recommendations, expert insights, market trends, and connections to certified professionals in your area.'}
                  </p>
                  <div className="bg-blue-50 rounded-lg p-4 mb-6 max-w-md mx-auto">
                    <div className="flex items-center space-x-2 text-sm text-blue-800">
                      <HelpCircle className="w-4 h-4" />
                      <span>Provide your contact details to unlock advanced features and receive a detailed analysis report</span>
                    </div>
                  </div>
                  
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
                roofType="Mixed Configuration"
                includeSolar={data.roofSegments?.some((s: RoofSegment) => s.includeSolar) || false}
                totalCo2PerYear={calculatedMetrics.totalCo2PerYear}
                totalEnergyPerYear={calculatedMetrics.totalEnergyPerYear}
                noxPerYear={calculatedMetrics.totalNoxPerYear}
                location={data.location}
              />
            </div>
          )}

          {data.hasProvidedContact && activeTab === 'recommendations' && (
            <div className="space-y-6">
              <SmartRecommendations
                roofSize={calculatedMetrics.totalRoofSize}
                roofType="Mixed Configuration"
                includeSolar={data.roofSegments?.some((s: RoofSegment) => s.includeSolar) || false}
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
          roofSize: calculatedMetrics.totalRoofSize,
          roofSizeDisplay: calculatedMetrics.totalRoofSize,
          unit: 'm²',
          roofType: 'Mixed Configuration',
          includeSolar: data.roofSegments?.some((s: RoofSegment) => s.includeSolar) || false,
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
    totalRoofSize: 1000,
    roofSegments: [
      {
        id: '1',
        name: 'Photocatalytic Coating',
        percentage: 60,
        roofType: 'Photocatalytic Coating',
        includeSolar: false
      },
      {
        id: '2',
        name: 'Solar Panels',
        percentage: 40,
        roofType: 'Standard Roofing',
        includeSolar: true
      }
    ],
    location: null,
    userRole: null,
    hasProvidedContact: false
  });

  const updateAppState = (updates: Partial<AppState>) => {
    setAppState(prev => ({ ...prev, ...updates }));
  };

  // Calculate metrics for all roof segments with improved accuracy
  const calculateMetrics = () => {
    let totalInstallationCost = 0;
    let totalCo2PerYear = 0;
    let totalEnergyPerYear = 0;
    let totalNoxPerYear = 0;
    let totalSolarEnergyPerYear = 0;
    let totalAnnualSavings = 0;

    // Location multiplier for solar calculations
    const locationMultiplier = appState.location ? (appState.location.solarIrradiance / 1100) : 1;
    const adjustedSolarHours = SOLAR_SPECS.hoursPerDay * locationMultiplier;

    appState.roofSegments.forEach(segment => {
      const roofData = ROOF_TYPES[segment.roofType];
      const segmentSize = (segment.percentage / 100) * appState.totalRoofSize;

      // Base roof calculations
      const segmentCo2 = roofData.co2 * segmentSize;
      const segmentNox = roofData.nox * segmentSize;
      const segmentEnergy = roofData.energy * segmentSize;
      const segmentCost = roofData.totalCost * segmentSize;

      // Solar calculations for this segment
      let segmentSolarEnergy = 0;
      let segmentSolarCo2 = 0;
      let segmentSolarCost = 0;

      if (segment.includeSolar) {
        // More accurate solar calculation
        const solarArea = segmentSize * 0.7; // 70% of roof area usable for solar
        segmentSolarEnergy = (SOLAR_SPECS.powerPerM2 * solarArea * adjustedSolarHours 
          * SOLAR_SPECS.daysPerYear * SOLAR_SPECS.performanceFactor) / 1000;
        segmentSolarCo2 = segmentSolarEnergy * SOLAR_SPECS.co2PerKwh;
        segmentSolarCost = SOLAR_SPECS.costPerM2 * solarArea;
      }

      // Add to totals
      totalInstallationCost += segmentCost + segmentSolarCost;
      totalCo2PerYear += segmentCo2 + segmentSolarCo2;
      totalEnergyPerYear += segmentEnergy + segmentSolarEnergy;
      totalNoxPerYear += segmentNox;
      totalSolarEnergyPerYear += segmentSolarEnergy;

      // Calculate savings for this segment (energy savings + solar generation value)
      const energySavingsValue = segmentEnergy * 0.25; // €0.25 per kWh saved
      const solarGenerationValue = segmentSolarEnergy * 0.20; // €0.20 per kWh generated
      totalAnnualSavings += energySavingsValue + solarGenerationValue;
    });

    // Calculate payback period
    const paybackYears = totalInstallationCost > 0 && totalAnnualSavings > 0 
      ? totalInstallationCost / totalAnnualSavings 
      : 999;

    // Carbon neutral calculation
    const initialCo2 = 19 * appState.totalRoofSize; // Manufacturing footprint
    const neutralYear = totalCo2PerYear > 0 ? Math.ceil(initialCo2 / totalCo2PerYear) : null;

    // Installation time calculation
    let totalInstallationHours = 0;
    appState.roofSegments.forEach(segment => {
      const roofData = ROOF_TYPES[segment.roofType];
      const segmentSize = (segment.percentage / 100) * appState.totalRoofSize;
      const roofHours = roofData.installationRate > 0 ? segmentSize / roofData.installationRate : 0;
      const solarHours = segment.includeSolar ? (segmentSize * 0.7) / 20 : 0; // 20 m²/hour for solar
      totalInstallationHours += roofHours + solarHours;
    });
    const installationDays = Math.ceil(totalInstallationHours / 8);

    return {
      totalRoofSize: appState.totalRoofSize,
      totalInstallationCost: Math.round(totalInstallationCost),
      totalCo2PerYear: Math.round(totalCo2PerYear),
      totalEnergyPerYear: Math.round(totalEnergyPerYear),
      totalNoxPerYear: Math.round(totalNoxPerYear * 10) / 10,
      totalSolarEnergyPerYear: Math.round(totalSolarEnergyPerYear),
      totalAnnualSavings: Math.round(totalAnnualSavings),
      paybackYears: Math.round(paybackYears * 10) / 10,
      neutralYear,
      installationDays: Math.max(1, installationDays),
      maintenanceCost: Math.round(appState.totalRoofSize * 2)
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
      isComplete: (data: AppState) => {
        const totalPercentage = data.roofSegments.reduce((sum, s) => sum + s.percentage, 0);
        return data.totalRoofSize > 0 && data.roofSegments.length > 0 && totalPercentage <= 100;
      }
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