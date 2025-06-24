import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Play, SkipForward } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  content: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
}

interface GuidedTourProps {
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to the Roof Impact Calculator!',
    content: 'This tool helps you calculate the environmental impact and costs of sustainable roofing solutions. Let\'s take a quick tour to get you started.',
    target: 'header',
    position: 'bottom'
  },
  {
    id: 'project-management',
    title: 'Project Management',
    content: 'Save your configurations as projects to compare different scenarios or return to them later. You can manage multiple projects here.',
    target: 'project-management',
    position: 'bottom'
  },
  {
    id: 'location',
    title: 'Location-Based Optimization',
    content: 'Enter your location to get accurate calculations based on local solar irradiance and climate conditions. This significantly improves calculation accuracy.',
    target: 'location-selector',
    position: 'bottom'
  },
  {
    id: 'smart-recommendations',
    title: 'Smart Recommendations',
    content: 'Get AI-powered suggestions based on your configuration, similar projects in your area, and optimal timing for installation.',
    target: 'smart-recommendations',
    position: 'bottom'
  },
  {
    id: 'roof-size',
    title: 'Configure Your Roof',
    content: 'Enter your roof size and toggle between metric (m²) and imperial (sq ft) units. Use the quick size buttons for common roof sizes.',
    target: 'roof-size-input',
    position: 'right'
  },
  {
    id: 'roof-type',
    title: 'Choose Roof Type',
    content: 'Select from different sustainable roofing solutions. Each offers different environmental benefits, costs, and lifespans.',
    target: 'roof-type-selection',
    position: 'left'
  },
  {
    id: 'solar-panels',
    title: 'Solar Panel Option',
    content: 'Add solar panels to significantly increase your CO₂ offset and energy generation. The system accounts for location-based efficiency.',
    target: 'solar-panel-option',
    position: 'top'
  },
  {
    id: 'metrics',
    title: 'Key Metrics',
    content: 'View your annual environmental impact and financial investment. Hover over the help icons for detailed explanations.',
    target: 'key-metrics',
    position: 'bottom'
  },
  {
    id: 'charts',
    title: 'Impact Analysis',
    content: 'Explore detailed charts showing long-term projections, monthly breakdowns, and seasonal variations of your roof\'s impact.',
    target: 'enhanced-charts',
    position: 'top'
  },
  {
    id: 'get-report',
    title: 'Get Your Report',
    content: 'Ready to move forward? Get a personalized assessment and detailed report for your specific building and requirements.',
    target: 'cta-section',
    position: 'top'
  }
];

export default function GuidedTour({ isActive, onComplete, onSkip }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isActive) {
      setIsVisible(true);
      setCurrentStep(0);
    } else {
      setIsVisible(false);
    }
  }, [isActive]);

  useEffect(() => {
    if (isVisible && currentStep < TOUR_STEPS.length) {
      const step = TOUR_STEPS[currentStep];
      const element = document.querySelector(`[data-tour="${step.target}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add highlight effect
        element.classList.add('tour-highlight');
        return () => element.classList.remove('tour-highlight');
      }
    }
  }, [currentStep, isVisible]);

  const nextStep = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTour = () => {
    setIsVisible(false);
    onComplete();
  };

  const skipTour = () => {
    setIsVisible(false);
    onSkip();
  };

  if (!isVisible || currentStep >= TOUR_STEPS.length) return null;

  const step = TOUR_STEPS[currentStep];
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
      
      {/* Tour Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
              <button
                onClick={skipTour}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Step {currentStep + 1} of {TOUR_STEPS.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-600 leading-relaxed">{step.content}</p>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 flex justify-between">
            <div className="flex space-x-2">
              <button
                onClick={skipTour}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors flex items-center space-x-2"
              >
                <SkipForward className="w-4 h-4" />
                <span>Skip Tour</span>
              </button>
            </div>
            
            <div className="flex space-x-2">
              {currentStep > 0 && (
                <button
                  onClick={prevStep}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
              )}
              
              <button
                onClick={nextStep}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <span>{currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}</span>
                {currentStep === TOUR_STEPS.length - 1 ? (
                  <Play className="w-4 h-4" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}