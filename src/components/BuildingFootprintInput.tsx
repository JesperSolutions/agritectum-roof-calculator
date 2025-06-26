import React from 'react';
import { Ruler, HelpCircle } from 'lucide-react';
import HelpTooltip from './HelpTooltip';

interface BuildingFootprintInputProps {
  value: number;
  onChange: (value: number) => void;
  useMetric: boolean;
  onUnitToggle: () => void;
  userRole?: string;
}

export default function BuildingFootprintInput({ 
  value, 
  onChange, 
  useMetric, 
  onUnitToggle,
  userRole 
}: BuildingFootprintInputProps) {
  const quickSizes = useMetric 
    ? [500, 1000, 2000, 5000] 
    : [5382, 10764, 21528, 53820];

  const getLabel = () => {
    switch (userRole) {
      case 'esg-expert':
        return 'Building Footprint Area';
      case 'roofing-specialist':
        return 'Installation Area';
      case 'private-individual':
        return 'Your Roof Size';
      default:
        return 'Building Footprint Area';
    }
  };

  const getDescription = () => {
    switch (userRole) {
      case 'esg-expert':
        return 'Total building area for environmental impact assessment and carbon footprint calculations';
      case 'roofing-specialist':
        return 'Precise measurement of installation area for material calculations and project planning';
      case 'private-individual':
        return 'Approximate size of your roof - use our quick size buttons for common home sizes';
      default:
        return 'Enter the total roof area for accurate calculations';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Ruler className="w-5 h-5 text-blue-600" />
          <label className="block text-lg font-semibold text-gray-900">
            {getLabel()}
          </label>
          <HelpTooltip content={getDescription()} />
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onUnitToggle}
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
          value={value}
          onChange={(e) => onChange(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg font-medium pr-16"
          min="1"
          step={useMetric ? "50" : "500"}
          placeholder={`Enter area in ${useMetric ? 'm²' : 'sq ft'}`}
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
            onClick={() => onChange(size)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              value === size 
                ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            {size.toLocaleString()}
          </button>
        ))}
      </div>
      
      {!useMetric && (
        <div className="text-xs text-gray-500">
          ≈ {Math.round(value / 10.764).toLocaleString()} m² for calculations
        </div>
      )}
    </div>
  );
}