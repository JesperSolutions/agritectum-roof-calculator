import React from 'react';
import { CheckCircle, Circle, Clock } from 'lucide-react';

interface ProgressStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
  required: boolean;
}

interface ProgressIndicatorProps {
  steps: ProgressStep[];
  currentStep: string;
}

export default function ProgressIndicator({ steps, currentStep }: ProgressIndicatorProps) {
  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const totalSteps = steps.length;
  const progress = (completedSteps / totalSteps) * 100;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Project Progress</h3>
        <div className="text-sm text-gray-600">
          {completedSteps} of {totalSteps} steps completed
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div 
          className="bg-green-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
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
                <h4 className={`text-sm font-medium ${
                  step.status === 'completed' ? 'text-green-900' :
                  step.status === 'current' ? 'text-blue-900' :
                  'text-gray-500'
                }`}>
                  {step.title}
                </h4>
                {step.required && (
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                    Required
                  </span>
                )}
              </div>
              <p className={`text-xs mt-1 ${
                step.status === 'completed' ? 'text-green-700' :
                step.status === 'current' ? 'text-blue-700' :
                'text-gray-500'
              }`}>
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Completion Status */}
      {progress === 100 && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">
              Project configuration complete!
            </span>
          </div>
          <p className="text-xs text-green-700 mt-1">
            You're ready to get your personalized roof assessment.
          </p>
        </div>
      )}
    </div>
  );
}