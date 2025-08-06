import React, { useState, useEffect } from 'react';
import { Plus, Minus, Settings, Palette, Sun, Leaf, Droplets, Wind, Zap, Calculator, Info, RotateCcw, Save, Eye, EyeOff } from 'lucide-react';
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
    description: 'Advanced coating that breaks down air pollutants'
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
    description: 'High-reflectance coating that reduces cooling costs'
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
    description: 'Living roof system with vegetation'
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
    description: 'Photovoltaic panels for renewable energy'
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
    description: 'Conventional roofing material'
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Custom Roof Designer</h3>
          <p className="text-gray-600">
            Design your roof by combining different sustainable technologies. Adjust the coverage percentage for each element.
          </p>
        </div>
        <div className="flex items-center space-x-3">
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
        {/* Configuration Panel */}
        <div className="space-y-6">
          {/* Add Element Buttons */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Add Roof Elements</h4>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(ROOF_ELEMENT_TYPES).map(([type, data]) => {
                const Icon = data.icon;
                const hasElement = elements.some(el => el.type === type);
                return (
                  <button
                    key={type}
                    onClick={() => !hasElement && addElement(type as keyof typeof ROOF_ELEMENT_TYPES)}
                    disabled={hasElement}
                    className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all ${
                      hasElement 
                        ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm cursor-pointer'
                    }`}
                  >
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: hasElement ? '#9CA3AF' : data.color }}
                    >
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-sm">{data.name}</div>
                      <div className="text-xs text-gray-500">€{data.cost}/m²</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Element Configuration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">Roof Configuration</h4>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {totalPercentage.toFixed(1)}% {isValid ? '✓' : '⚠️'}
              </div>
            </div>

            {elements.map((element) => (
              <div 
                key={element.id}
                className={`border-2 rounded-xl p-4 transition-all ${
                  selectedElement === element.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: element.color }}
                    />
                    <div>
                      <h5 className="font-medium text-gray-900">{element.name}</h5>
                      <p className="text-xs text-gray-500">
                        {(element.percentage / 100 * roofSize).toFixed(0)} m² • €{element.cost}/m²
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedElement(selectedElement === element.id ? null : element.id)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                    {elements.length > 1 && (
                      <button
                        onClick={() => removeElement(element.id)}
                        className="p-1 text-red-400 hover:text-red-600"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Percentage Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Coverage</span>
                    <span className="text-sm font-medium">{element.percentage.toFixed(1)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.1"
                    value={element.percentage}
                    onChange={(e) => updateElement(element.id, { percentage: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${element.color} 0%, ${element.color} ${element.percentage}%, #e5e7eb ${element.percentage}%, #e5e7eb 100%)`
                    }}
                  />
                </div>

                {/* Element Details */}
                {selectedElement === element.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <span className="text-xs text-gray-500">CO₂ Impact</span>
                        <div className="font-medium">{element.co2Impact} kg/m²/year</div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Energy Impact</span>
                        <div className="font-medium">{element.energyImpact} kWh/m²/year</div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Maintenance</span>
                        <div className={`font-medium capitalize ${
                          element.maintenanceLevel === 'low' ? 'text-green-600' :
                          element.maintenanceLevel === 'medium' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {element.maintenanceLevel}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Cost</span>
                        <div className="font-medium">€{element.cost}/m²</div>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Benefits</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {element.benefits.map((benefit, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {!isValid && (
              <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <span className="text-sm text-yellow-800">
                  Total coverage must equal 100%
                </span>
                <button
                  onClick={normalizePercentages}
                  className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
                >
                  Auto-adjust
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Preview and Summary */}
        <div className="space-y-6">
          {/* Visual Preview */}
          {showPreview && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Roof Preview</h4>
              <div className="relative">
                {/* Roof Shape */}
                <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden relative border-2 border-gray-300">
                  {elements.map((element, index) => {
                    const startPercentage = elements.slice(0, index).reduce((sum, el) => sum + el.percentage, 0);
                    return (
                      <div
                        key={element.id}
                        className="absolute top-0 h-full transition-all duration-300 hover:opacity-80 cursor-pointer"
                        style={{
                          left: `${startPercentage}%`,
                          width: `${element.percentage}%`,
                          backgroundColor: element.color
                        }}
                        onClick={() => setSelectedElement(selectedElement === element.id ? null : element.id)}
                        title={`${element.name}: ${element.percentage.toFixed(1)}%`}
                      />
                    );
                  })}
                </div>
                
                {/* Legend */}
                <div className="mt-4 space-y-2">
                  {elements.map((element) => (
                    <div key={element.id} className="flex items-center space-x-3 text-sm">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: element.color }}
                      />
                      <span className="flex-1">{element.name}</span>
                      <span className="font-medium">{element.percentage.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border border-green-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Calculator className="w-5 h-5 text-green-600" />
              <span>Configuration Summary</span>
            </h4>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  €{totalCost.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Cost</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {totalCo2Impact.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">kg CO₂/year</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {totalEnergyImpact.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">kWh/year</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {roofSize.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">m² Total</div>
              </div>
            </div>

            {location && (
              <div className="bg-white rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">Location Optimization</h5>
                <div className="text-sm text-gray-600">
                  <div>Solar Irradiance: {location.solarIrradiance} kWh/m²/year</div>
                  <div>Climate Zone: {location.climateZone}</div>
                  <div>Location: {location.address}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}