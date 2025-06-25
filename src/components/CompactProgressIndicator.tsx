import React from 'react';
import { CheckCircle, Circle, Clock, ChevronRight } from 'lucide-react';

interface ProgressStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
  required: boolean;
}

interface CompactProgressIndicatorProps {
  steps: ProgressStep[];
  currentStep: string;
  variant?: 'compact' | 'minimal' | 'detailed';
}

export default function CompactProgressIndicator({ 
  steps, 
  currentStep, 
  variant = 'compact' 
}: CompactProgressIndicatorProps) {
  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const totalSteps = steps.length;
  const progress = (completedSteps / totalSteps) * 100;

  if (variant === 'minimal') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Project Progress</h3>
          <span className="text-xs text-gray-500 font-medium">
            {completedSteps}/{totalSteps} completed
          </span>
        </div>
        
        {/* Compact Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Horizontal Step Indicators */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                step.status === 'completed' ? 'bg-green-100 text-green-700' :
                step.status === 'current' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-500'
              }`}>
                {step.status === 'completed' ? (
                  <CheckCircle className="w-3 h-3" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span className={`text-xs mt-1 text-center max-w-16 ${
                step.status === 'completed' ? 'text-green-700' :
                step.status === 'current' ? 'text-blue-700' :
                'text-gray-500'
              }`}>
                {step.title.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-gray-900">Project Progress</h3>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-green-700">{completedSteps}</span>
            </div>
            <span className="text-sm text-gray-500">of {totalSteps}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{Math.round(progress)}%</div>
          <div className="text-xs text-gray-500">Complete</div>
        </div>
      </div>

      {/* Enhanced Progress Bar */}
      <div className="relative w-full bg-gray-200 rounded-full h-3 mb-5">
        <div 
          className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-700 relative"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute right-0 top-0 w-3 h-3 bg-white rounded-full border-2 border-green-600 transform translate-x-1/2"></div>
        </div>
      </div>

      {/* Compact Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {steps.map((step, index) => (
          <div key={step.id} className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
            step.status === 'completed' ? 'bg-green-50 border border-green-200' :
            step.status === 'current' ? 'bg-blue-50 border border-blue-200' :
            'bg-gray-50 border border-gray-200'
          }`}>
            <div className="flex-shrink-0">
              {step.status === 'completed' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : step.status === 'current' ? (
                <Clock className="w-5 h-5 text-blue-600" />
              ) : (
                <Circle className="w-5 h-5 text-gray-400" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h4 className={`text-sm font-medium truncate ${
                  step.status === 'completed' ? 'text-green-900' :
                  step.status === 'current' ? 'text-blue-900' :
                  'text-gray-500'
                }`}>
                  {step.title}
                </h4>
                {step.required && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                    Required
                  </span>
                )}
              </div>
              <p className={`text-xs mt-0.5 truncate ${
                step.status === 'completed' ? 'text-green-700' :
                step.status === 'current' ? 'text-blue-700' :
                'text-gray-500'
              }`}>
                {step.description}
              </p>
            </div>
            
            {step.status === 'current' && (
              <ChevronRight className="w-4 h-4 text-blue-600 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Completion Status */}
      {progress === 100 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">
              All steps completed! Ready for assessment.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}