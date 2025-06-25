import React from 'react';
import { CheckCircle, Circle, Clock } from 'lucide-react';

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
          <h3 className="text-sm font-medium text-gray-900">Progress</h3>
          <span className="text-sm text-gray-600">
            {completedSteps}/{totalSteps}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Simple Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium text-gray-900">Project Progress</h3>
        <span className="text-sm text-gray-600 font-medium">
          {Math.round(progress)}% complete
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div 
          className="bg-green-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Simple Steps List */}
      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center space-x-3">
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
                <span className={`text-sm font-medium ${
                  step.status === 'completed' ? 'text-green-900' :
                  step.status === 'current' ? 'text-blue-900' :
                  'text-gray-500'
                }`}>
                  {step.title}
                </span>
                {step.required && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium">
                    Required
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Completion Message */}
      {progress === 100 && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-900">
              Ready for assessment!
            </span>
          </div>
        </div>
      )}
    </div>
  );
}