import React from 'react';
import { Calculator, MapPin, Sun, Settings, Home, Ruler, Palette, Zap } from 'lucide-react';
import { UserRole } from './UserRoleSelector';
import HelpTooltip from './HelpTooltip';
import LocationSelector from './LocationSelector';
import { ROOF_TYPES } from '../types/project';

interface AdaptiveInputFormProps {
  userRole: UserRole;
  formData: {
    roofSize: number;
    roofType: keyof typeof ROOF_TYPES;
    includeSolar: boolean;
    useMetric: boolean;
    location: any;
  };
  onFormChange: (data: any) => void;
  onUnitToggle: () => void;
}

const getInputPriority = (userRole: UserRole) => {
  switch (userRole) {
    case 'esg-expert':
      return [
        'location',
        'roofType',
        'roofSize',
        'solar',
        'advanced'
      ];
    case 'roofing-specialist':
      return [
        'roofSize',
        'roofType',
        'location',
        'solar',
        'technical'
      ];
    case 'private-individual':
      return [
        'roofSize',
        'solar',
        'roofType',
        'location',
        'simple'
      ];
    default:
      return [
        'roofSize',
        'roofType',
        'solar',
        'location'
      ];
  }
};

const getRoleLabels = (userRole: UserRole) => {
  switch (userRole) {
    case 'esg-expert':
      return {
        roofSize: 'Building Footprint Area',
        roofType: 'Sustainable Roofing Solution',
        solar: 'Renewable Energy Integration',
        location: 'Geographic Assessment Zone'
      };
    case 'roofing-specialist':
      return {
        roofSize: 'Installation Area',
        roofType: 'Roofing System Specification',
        solar: 'Solar Panel Integration',
        location: 'Project Location'
      };
    case 'private-individual':
      return {
        roofSize: 'Your Roof Size',
        roofType: 'Roof Upgrade Option',
        solar: 'Add Solar Panels',
        location: 'Your Address'
      };
    default:
      return {
        roofSize: 'Roof Size',
        roofType: 'Roof Type',
        solar: 'Solar Panels',
        location: 'Location'
      };
  }
};

const getRoleDescriptions = (userRole: UserRole) => {
  switch (userRole) {
    case 'esg-expert':
      return {
        roofSize: 'Total building area for environmental impact assessment and carbon footprint calculations',
        roofType: 'Select sustainable roofing technology based on environmental performance metrics',
        solar: 'Photovoltaic system integration for renewable energy generation and Scope 2 emissions reduction',
        location: 'Geographic coordinates for climate-specific environmental impact modeling'
      };
    case 'roofing-specialist':
      return {
        roofSize: 'Precise measurement of installation area for material calculations and project planning',
        roofType: 'Technical roofing system with specific installation requirements and performance characteristics',
        solar: 'Solar panel system requiring structural assessment and electrical integration',
        location: 'Project site location for local building codes and weather considerations'
      };
    case 'private-individual':
      return {
        roofSize: 'Approximate size of your roof - use our quick size buttons for common home sizes',
        roofType: 'Choose the roof upgrade that best fits your needs and budget',
        solar: 'Solar panels can significantly reduce your electricity bills and increase property value',
        location: 'Your property address helps us provide accurate savings calculations'
      };
    default:
      return {
        roofSize: 'Enter the size of your roof area',
        roofType: 'Select the type of roofing system',
        solar: 'Include solar panels in your system',
        location: 'Specify your location for accurate calculations'
      };
  }
};

export default function AdaptiveInputForm({ userRole, formData, onFormChange, onUnitToggle }: AdaptiveInputFormProps) {
  const priority = getInputPriority(userRole);
  const labels = getRoleLabels(userRole);
  const descriptions = getRoleDescriptions(userRole);

  const quickSizes = formData.useMetric 
    ? [500, 1000, 2000, 5000] 
    : [5382, 10764, 21528, 53820];

  const renderRoofSizeInput = () => (
    <div className="space-y-4" data-tour="roof-size">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Ruler className="w-5 h-5 text-blue-600" />
          <label className="block text-lg font-semibold text-gray-900">
            {labels.roofSize}
          </label>
          <HelpTooltip content={descriptions.roofSize} />
        </div>
        <button
          onClick={onUnitToggle}
          className="flex items-center space-x-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
        >
          <span className={formData.useMetric ? 'font-semibold text-blue-600' : 'text-gray-500'}>m²</span>
          <span className={!formData.useMetric ? 'font-semibold text-blue-600' : 'text-gray-500'}>sq ft</span>
        </button>
      </div>
      
      <div className="relative">
        <input
          type="number"
          value={formData.roofSize}
          onChange={(e) => onFormChange({ 
            ...formData, 
            roofSize: Math.max(1, parseInt(e.target.value) || 1) 
          })}
          className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg font-medium"
          min="1"
          step={formData.useMetric ? "50" : "500"}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
          <span className="text-gray-500 text-sm font-medium">
            {formData.useMetric ? 'm²' : 'sq ft'}
          </span>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {quickSizes.map((size) => (
          <button
            key={size}
            onClick={() => onFormChange({ ...formData, roofSize: size })}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              formData.roofSize === size 
                ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            {size.toLocaleString()}
          </button>
        ))}
      </div>
      
      {!formData.useMetric && (
        <div className="text-xs text-gray-500">
          ≈ {Math.round(formData.roofSize / 10.764).toLocaleString()} m² for calculations
        </div>
      )}
    </div>
  );

  const renderRoofTypeInput = () => (
    <div className="space-y-4" data-tour="roof-type">
      <div className="flex items-center space-x-2">
        <Palette className="w-5 h-5 text-green-600" />
        <label className="block text-lg font-semibold text-gray-900">
          {labels.roofType}
        </label>
        <HelpTooltip content={descriptions.roofType} />
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {Object.entries(ROOF_TYPES).map(([type, typeData]) => (
          <button
            key={type}
            onClick={() => onFormChange({ 
              ...formData, 
              roofType: type as keyof typeof ROOF_TYPES 
            })}
            className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
              formData.roofType === type
                ? 'border-green-500 bg-green-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: typeData.color }}
                />
                <div>
                  <div className="font-medium text-gray-900">{type}</div>
                  <div className="text-xs text-gray-500">{typeData.lifespan} year lifespan</div>
                  {userRole === 'private-individual' && (
                    <div className="text-xs text-gray-600 mt-1">{typeData.description}</div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900">
                  {typeData.totalCost > 0 ? `€${typeData.totalCost.toFixed(2)}/m²` : 'Baseline'}
                </div>
                {userRole === 'roofing-specialist' && (
                  <div className="text-xs text-gray-500">
                    {typeData.installationRate > 0 ? `${typeData.installationRate} m²/h` : 'Standard'}
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderSolarInput = () => (
    <div className="space-y-4" data-tour="solar-panel-option">
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-xl">
            <Sun className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">{labels.solar}</h3>
              <HelpTooltip content={descriptions.solar} />
            </div>
            <p className="text-sm text-gray-600">
              {userRole === 'esg-expert' && 'Renewable energy generation for Scope 2 emissions reduction'}
              {userRole === 'roofing-specialist' && 'Photovoltaic system integration (+€150/m²)'}
              {userRole === 'private-individual' && 'Reduce your electricity bills and increase home value'}
            </p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={formData.includeSolar}
            onChange={(e) => onFormChange({ 
              ...formData, 
              includeSolar: e.target.checked 
            })}
            className="sr-only peer"
          />
          <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-yellow-500"></div>
        </label>
      </div>
    </div>
  );

  const renderLocationInput = () => (
    <div className="space-y-4" data-tour="location-selector">
      <div className="flex items-center space-x-2">
        <MapPin className="w-5 h-5 text-purple-600" />
        <label className="block text-lg font-semibold text-gray-900">
          {labels.location}
        </label>
        <HelpTooltip content={descriptions.location} />
      </div>
      <LocationSelector 
        location={formData.location}
        onLocationChange={(location) => onFormChange({ ...formData, location })}
      />
    </div>
  );

  const inputComponents = {
    roofSize: renderRoofSizeInput,
    roofType: renderRoofTypeInput,
    solar: renderSolarInput,
    location: renderLocationInput
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      <div className="flex items-center space-x-3 mb-6">
        <Calculator className="w-6 h-6 text-blue-600" />
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {userRole === 'esg-expert' && 'Environmental Impact Assessment'}
            {userRole === 'roofing-specialist' && 'Technical Specification Input'}
            {userRole === 'private-individual' && 'Your Roof Configuration'}
            {!userRole && 'Roof Configuration'}
          </h2>
          <p className="text-sm text-gray-600">
            {userRole === 'esg-expert' && 'Configure parameters for comprehensive sustainability analysis'}
            {userRole === 'roofing-specialist' && 'Enter technical specifications for installation planning'}
            {userRole === 'private-individual' && 'Tell us about your roof to get personalized recommendations'}
            {!userRole && 'Configure your roof parameters'}
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {priority.map((inputType, index) => {
          if (inputType in inputComponents) {
            const Component = inputComponents[inputType as keyof typeof inputComponents];
            return (
              <div key={inputType} className={index === 0 ? 'ring-2 ring-blue-200 rounded-xl p-4 -m-4' : ''}>
                <Component />
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}