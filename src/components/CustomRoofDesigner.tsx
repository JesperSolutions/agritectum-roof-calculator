import React, { useState, useEffect } from 'react';
import { Plus, Minus, Settings, Palette, Sun, Leaf, Droplets, Wind, Zap, Calculator, Info, RotateCcw, Save, Eye, EyeOff, Edit3, Check, X, AlertCircle, TrendingUp, Award, Shield } from 'lucide-react';
import { LocationData } from '../types/project';

interface RoofElement {
  id: string;
  type: 'photocatalytic' | 'cool-roof' | 'green-roof' | 'solar' | 'standard';
  name: string;
  percentage: number;
  color: string;
  benefits: string[];
  cost: number; // € per m²
  co2Impact: number; // kg CO₂ per m² per year
  energyImpact: number; // kWh per m² per year
  maintenanceLevel: 'low' | 'medium' | 'high';
}

interface RoofConfiguration {
  elements: RoofElement[];
  totalArea: number;
  isValid: boolean;
}

interface CustomRoofDesignerProps {
  roofSize: number;
  location?: LocationData;
  onConfigurationChange: (config: RoofConfiguration) => void;
}

const ROOF_ELEMENT_TYPES = {
  photocatalytic: {
    name: 'Photocatalytic Coating',
    color: '#5C9323',
    benefits: ['NOₓ reduction', 'Air purification', 'Self-cleaning'],
    cost: 3.12,
    co2Impact: 1.94,
    energyImpact: 0,
    maintenanceLevel: 'medium' as const,
    icon: Wind,
    description: 'Advanced coating that breaks down air pollutants and purifies the air',
    efficiency: 85,
    lifespan: 15
  },
  'cool-roof': {
    name: 'Cool Roof Coating',
    color: '#8B5CF6',
    benefits: ['Heat reflection', 'Energy savings', 'Urban cooling'],
    cost: 55.55,
    co2Impact: 6.65,
    energyImpact: 8.5,
    maintenanceLevel: 'low' as const,
    icon: Sun,
    description: 'High-reflectance coating that reduces cooling costs and urban heat',
    efficiency: 92,
    lifespan: 20
  },
  'green-roof': {
    name: 'Green Roof System',
    color: '#34D399',
    benefits: ['Biodiversity', 'Stormwater management', 'Insulation'],
    cost: 45.00,
    co2Impact: 2.1,
    energyImpact: 1.5,
    maintenanceLevel: 'high' as const,
    icon: Leaf,
    description: 'Living roof system with vegetation that supports biodiversity',
    efficiency: 78,
    lifespan: 40
  },
  solar: {
    name: 'Solar Panels',
    color: '#F59E0B',
    benefits: ['Energy generation', 'Grid independence', 'Long-term savings'],
    cost: 150.00,
    co2Impact: 0,
    energyImpact: 200, // Will be calculated based on location
    maintenanceLevel: 'low' as const,
    icon: Zap,
    description: 'Photovoltaic panels for renewable energy generation',
    efficiency: 95,
    lifespan: 25
  },
  standard: {
    name: 'Standard Roofing',
    color: '#6B7280',
    benefits: ['Basic protection', 'Cost-effective', 'Low maintenance'],
    cost: 0,
    co2Impact: 0,
    energyImpact: 0,
    maintenanceLevel: 'low' as const,
    icon: Settings,
    description: 'Conventional roofing material providing basic weather protection',
    efficiency: 60,
    lifespan: 15
  }
};

export default function CustomRoofDesigner({ roofSize, location, onConfigurationChange }: CustomRoofDesignerProps) {
  const [elements, setElements] = useState<RoofElement[]>([
    {
      id: '1',
      type: 'standard',
      name: ROOF_ELEMENT_TYPES.standard.name,
      percentage: 100,
      color: ROOF_ELEMENT_TYPES.standard.color,
      benefits: ROOF_ELEMENT_TYPES.standard.benefits,
      cost: ROOF_ELEMENT_TYPES.standard.cost,
      co2Impact: ROOF_ELEMENT_TYPES.standard.co2Impact,
      energyImpact: ROOF_ELEMENT_TYPES.standard.energyImpact,
      maintenanceLevel: ROOF_ELEMENT_TYPES.standard.maintenanceLevel
    }
  ]);
  
  const [showPreview, setShowPreview] = useState(true);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [editingPercentage, setEditingPercentage] = useState<string | null>(null);
  const [tempPercentage, setTempPercentage] = useState<string>('');
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);

  useEffect(() => {
    // Calculate solar energy impact based on location
    const updatedElements = elements.map(element => {
      if (element.type === 'solar' && location) {
        const solarIrradiance = location.solarIrradiance;
        const energyPerM2 = (solarIrradiance * 0.2 * 0.75) / 1000; // 20% efficiency, 75% performance ratio
        return {
          ...element,
          energyImpact: energyPerM2 * 1000 // Convert back to Wh for display
        };
      }
      return element;
    });
    
    if (JSON.stringify(updatedElements) !== JSON.stringify(elements)) {
      setElements(updatedElements);
    }
  }, [location, elements]);

  useEffect(() => {
    const totalPercentage = elements.reduce((sum, el) => sum + el.percentage, 0);
    const isValid = Math.abs(totalPercentage - 100) < 0.1;
    
    onConfigurationChange({
      elements,
      totalArea: roofSize,
      isValid
    });
  }, [elements, roofSize, onConfigurationChange]);

  const addElement = (type: keyof typeof ROOF_ELEMENT_TYPES) => {
    const typeData = ROOF_ELEMENT_TYPES[type];
    const newElement: RoofElement = {
      id: Date.now().toString(),
      type,
      name: typeData.name,
      percentage: 0,
      color: typeData.color,
      benefits: typeData.benefits,
      cost: typeData.cost,
      co2Impact: typeData.co2Impact,
      energyImpact: typeData.energyImpact,
      maintenanceLevel: typeData.maintenanceLevel
    };
    
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
  };

  const updateElement = (id: string, updates: Partial<RoofElement>) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  };

  const removeElement = (id: string) => {
    if (elements.length > 1) {
      setElements(elements.filter(el => el.id !== id));
      if (selectedElement === id) {
        setSelectedElement(null);
      }
    }
  };

  const handlePercentageInputChange = (id: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      updateElement(id, { percentage: numValue });
    }
  };

  const startEditingPercentage = (id: string, currentPercentage: number) => {
    setEditingPercentage(id);
    setTempPercentage(currentPercentage.toString());
  };

  const savePercentage = (id: string) => {
    const newPercentage = parseFloat(tempPercentage);
    if (!isNaN(newPercentage) && newPercentage >= 0 && newPercentage <= 100) {
      updateElement(id, { percentage: newPercentage });
    }
    setEditingPercentage(null);
    setTempPercentage('');
  };

  const cancelEditingPercentage = () => {
    setEditingPercentage(null);
    setTempPercentage('');
  };

  const normalizePercentages = () => {
    const total = elements.reduce((sum, el) => sum + el.percentage, 0);
    if (total > 0) {
      setElements(elements.map(el => ({
        ...el,
        percentage: (el.percentage / total) * 100
      })));
    }
  };

  const resetToDefault = () => {
    setElements([
      {
        id: '1',
        type: 'standard',
        name: ROOF_ELEMENT_TYPES.standard.name,
        percentage: 100,
        color: ROOF_ELEMENT_TYPES.standard.color,
        benefits: ROOF_ELEMENT_TYPES.standard.benefits,
        cost: ROOF_ELEMENT_TYPES.standard.cost,
        co2Impact: ROOF_ELEMENT_TYPES.standard.co2Impact,
        energyImpact: ROOF_ELEMENT_TYPES.standard.energyImpact,
        maintenanceLevel: ROOF_ELEMENT_TYPES.standard.maintenanceLevel
      }
    ]);
    setSelectedElement(null);
  };

  const totalPercentage = elements.reduce((sum, el) => sum + el.percentage, 0);
  const isValid = Math.abs(totalPercentage - 100) < 0.1;

  // Calculate totals
  const totalCost = elements.reduce((sum, el) => sum + (el.cost * el.percentage / 100 * roofSize), 0);
  const totalCo2Impact = elements.reduce((sum, el) => sum + (el.co2Impact * el.percentage / 100 * roofSize), 0);
  const totalEnergyImpact = elements.reduce((sum, el) => sum + (el.energyImpact * el.percentage / 100 * roofSize), 0);

  // Calculate advanced metrics
  const averageEfficiency = elements.reduce((sum, el) => {
    const typeData = ROOF_ELEMENT_TYPES[el.type];
    return sum + (typeData.efficiency * el.percentage / 100);
  }, 0);

  const averageLifespan = elements.reduce((sum, el) => {
    const typeData = ROOF_ELEMENT_TYPES[el.type];
    return sum + (typeData.lifespan * el.percentage / 100);
  }, 0);

  const sustainabilityScore = Math.min(100, Math.round(
    (totalCo2Impact / 100) * 20 + 
    (totalEnergyImpact / 1000) * 15 + 
    (averageEfficiency / 100) * 25 + 
    (averageLifespan / 40) * 20 + 
    (elements.length > 1 ? 20 : 0) // Bonus for diversity
  ));

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-3xl font-bold text-gray-900 mb-3">Custom Roof Designer</h3>
          <p className="text-lg text-gray-600 max-w-2xl">
            Design your roof by combining different sustainable technologies. Mix and match elements to create the perfect solution for your needs.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Advanced Metrics</span>
          </button>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showPreview ? 'Hide' : 'Show'} Preview</span>
          </button>
          <button
            onClick={resetToDefault}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Enhanced Configuration Panel */}
        <div className="space-y-6">
          {/* Add Element Buttons */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Plus className="w-5 h-5 text-green-600" />
              <span>Add Roof Elements</span>
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {Object.entries(ROOF_ELEMENT_TYPES).map(([type, data]) => {
                const Icon = data.icon;
                const hasElement = elements.some(el => el.type === type);
                return (
                  <button
                    key={type}
                    onClick={() => !hasElement && addElement(type as keyof typeof ROOF_ELEMENT_TYPES)}
                    disabled={hasElement}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${
                      hasElement 
                        ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-md cursor-pointer hover:scale-105'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: hasElement ? '#9CA3AF' : data.color }}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">{data.name}</div>
                        <div className="text-sm text-gray-500">{data.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">€{data.cost}/m²</div>
                      <div className="text-xs text-gray-500">{data.lifespan}y lifespan</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Enhanced Element Configuration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900 text-xl">Roof Configuration</h4>
              <div className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm ${
                isValid ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {totalPercentage.toFixed(1)}% {isValid ? '✓' : '⚠️'}
              </div>
            </div>

            {elements.map((element, index) => (
              <div 
                key={element.id}
                className={`border-2 rounded-xl p-6 transition-all duration-300 ${
                  selectedElement === element.id 
                    ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105' 
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-8 h-8 rounded-full shadow-sm"
                      style={{ backgroundColor: element.color }}
                    />
                    <div>
                      <h5 className="font-bold text-gray-900 text-lg">{element.name}</h5>
                      <p className="text-sm text-gray-600">
                        {(element.percentage / 100 * roofSize).toFixed(0)} m² • €{element.cost}/m²
                        {element.type !== 'standard' && (
                          <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            Sustainable
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedElement(selectedElement === element.id ? null : element.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        selectedElement === element.id 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Info className="w-4 h-4" />
                    </button>
                    {elements.length > 1 && (
                      <button
                        onClick={() => removeElement(element.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Enhanced Percentage Control */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Coverage</span>
                    <div className="flex items-center space-x-2">
                      {editingPercentage === element.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={tempPercentage}
                            onChange={(e) => setTempPercentage(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') savePercentage(element.id);
                              if (e.key === 'Escape') cancelEditingPercentage();
                            }}
                            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            min="0"
                            max="100"
                            step="0.1"
                            autoFocus
                          />
                          <span className="text-sm text-gray-500">%</span>
                          <button
                            onClick={() => savePercentage(element.id)}
                            className="p-1 text-green-600 hover:bg-green-100 rounded"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEditingPercentage}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditingPercentage(element.id, element.percentage)}
                          className="flex items-center space-x-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <span className="font-bold">{element.percentage.toFixed(1)}%</span>
                          <Edit3 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Enhanced Slider */}
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={element.percentage}
                      onChange={(e) => updateElement(element.id, { percentage: parseFloat(e.target.value) })}
                      className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, ${element.color} 0%, ${element.color} ${element.percentage}%, #e5e7eb ${element.percentage}%, #e5e7eb 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>

                {/* Enhanced Element Details */}
                {selectedElement === element.id && (
                  <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 rounded-lg p-3">
                        <span className="text-xs text-green-600 font-medium">CO₂ Impact</span>
                        <div className="text-lg font-bold text-green-700">{element.co2Impact} kg/m²/year</div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <span className="text-xs text-blue-600 font-medium">Energy Impact</span>
                        <div className="text-lg font-bold text-blue-700">{element.energyImpact} kWh/m²/year</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <span className="text-xs text-purple-600 font-medium">Maintenance</span>
                        <div className={`text-lg font-bold capitalize ${
                          element.maintenanceLevel === 'low' ? 'text-green-600' :
                          element.maintenanceLevel === 'medium' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {element.maintenanceLevel}
                        </div>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-3">
                        <span className="text-xs text-orange-600 font-medium">Cost</span>
                        <div className="text-lg font-bold text-orange-700">€{element.cost}/m²</div>
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-700 mb-2 block">Benefits</span>
                      <div className="flex flex-wrap gap-2">
                        {element.benefits.map((benefit, index) => (
                          <span key={index} className="px-3 py-1 bg-gradient-to-r from-green-100 to-blue-100 text-gray-700 text-sm rounded-full border border-green-200">
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Performance Indicators */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h6 className="font-medium text-gray-900 mb-3">Performance Indicators</h6>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Efficiency Rating</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${ROOF_ELEMENT_TYPES[element.type].efficiency}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{ROOF_ELEMENT_TYPES[element.type].efficiency}%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Expected Lifespan</span>
                          <span className="text-sm font-medium">{ROOF_ELEMENT_TYPES[element.type].lifespan} years</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {!isValid && (
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">
                    Total coverage must equal 100% (currently {totalPercentage.toFixed(1)}%)
                  </span>
                </div>
                <button
                  onClick={normalizePercentages}
                  className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Auto-adjust
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Preview and Summary */}
        <div className="space-y-6">
          {/* Enhanced Visual Preview */}
          {showPreview && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Eye className="w-5 h-5 text-blue-600" />
                <span>Roof Preview</span>
              </h4>
              <div className="relative">
                {/* Enhanced Roof Shape */}
                <div className="w-full h-56 bg-gradient-to-b from-gray-100 to-gray-200 rounded-xl overflow-hidden relative border-4 border-gray-300 shadow-inner">
                  {elements.map((element, index) => {
                    const startPercentage = elements.slice(0, index).reduce((sum, el) => sum + el.percentage, 0);
                    return (
                      <div
                        key={element.id}
                        className="absolute top-0 h-full transition-all duration-500 hover:opacity-90 cursor-pointer group"
                        style={{
                          left: `${startPercentage}%`,
                          width: `${element.percentage}%`,
                          backgroundColor: element.color,
                          backgroundImage: element.type === 'solar' ? 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)' : 'none'
                        }}
                        onClick={() => setSelectedElement(selectedElement === element.id ? null : element.id)}
                        title={`${element.name}: ${element.percentage.toFixed(1)}%`}
                      >
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                          <div className="text-white font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-center">
                            {element.name}<br/>
                            {element.percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Roof details overlay */}
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg text-xs">
                    {roofSize.toLocaleString()} m² total
                  </div>
                </div>
                
                {/* Enhanced Legend */}
                <div className="mt-6 space-y-3">
                  {elements.map((element) => (
                    <div key={element.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-5 h-5 rounded shadow-sm"
                          style={{ backgroundColor: element.color }}
                        />
                        <span className="font-medium text-gray-900">{element.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{element.percentage.toFixed(1)}%</div>
                        <div className="text-xs text-gray-500">{(element.percentage / 100 * roofSize).toFixed(0)} m²</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Summary */}
          <div className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 rounded-xl border-2 border-green-200 p-6 shadow-lg">
            <h4 className="font-bold text-gray-900 mb-6 flex items-center space-x-2 text-xl">
              <Calculator className="w-6 h-6 text-green-600" />
              <span>Configuration Summary</span>
            </h4>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-green-200">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  €{totalCost.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 font-medium">Total Investment</div>
                <div className="text-xs text-gray-500 mt-1">€{(totalCost/roofSize).toFixed(2)}/m²</div>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-blue-200">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {totalCo2Impact.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 font-medium">kg CO₂/year</div>
                <div className="text-xs text-gray-500 mt-1">Carbon offset</div>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-purple-200">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {totalEnergyImpact.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 font-medium">kWh/year</div>
                <div className="text-xs text-gray-500 mt-1">Energy impact</div>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-orange-200">
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  {roofSize.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 font-medium">m² Total</div>
                <div className="text-xs text-gray-500 mt-1">Roof area</div>
              </div>
            </div>

            {/* Advanced Metrics */}
            {showAdvancedMetrics && (
              <div className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
                <h5 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <Award className="w-4 h-4 text-purple-600" />
                  <span>Advanced Performance Metrics</span>
                </h5>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{sustainabilityScore}</div>
                    <div className="text-xs text-gray-600">Sustainability Score</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{averageEfficiency.toFixed(0)}%</div>
                    <div className="text-xs text-gray-600">Avg Efficiency</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{averageLifespan.toFixed(0)}y</div>
                    <div className="text-xs text-gray-600">Avg Lifespan</div>
                  </div>
                </div>
              </div>
            )}

            {location && (
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h5 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>Location Optimization</span>
                </h5>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Solar Irradiance:</span>
                    <span className="font-medium">{location.solarIrradiance} kWh/m²/year</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Climate Zone:</span>
                    <span className="font-medium">{location.climateZone}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    📍 {location.address}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom CSS for enhanced slider */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
}