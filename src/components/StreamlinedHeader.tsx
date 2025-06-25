import React from 'react';
import { ArrowLeft, MoreHorizontal } from 'lucide-react';

interface StreamlinedHeaderProps {
  title: string;
  subtitle?: string;
  progress?: {
    current: number;
    total: number;
    percentage: number;
  };
  actions?: {
    primary?: { label: string; onClick: () => void; icon?: React.ComponentType<any> };
    secondary?: { label: string; onClick: () => void; icon?: React.ComponentType<any> }[];
  };
  onBack?: () => void;
  compact?: boolean;
}

export default function StreamlinedHeader({ 
  title, 
  subtitle, 
  progress, 
  actions, 
  onBack,
  compact = false 
}: StreamlinedHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-gray-600 truncate">{subtitle}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 flex-shrink-0">
            {actions?.primary && (
              <button
                onClick={actions.primary.onClick}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center space-x-1"
              >
                {actions.primary.icon && <actions.primary.icon className="w-4 h-4" />}
                <span className="hidden sm:inline">{actions.primary.label}</span>
                <span className="sm:hidden">Report</span>
              </button>
            )}
            
            {actions?.secondary && actions.secondary.length > 0 && (
              <div className="relative group">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreHorizontal className="w-5 h-5 text-gray-600" />
                </button>
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  {actions.secondary.map((action, index) => (
                    <button
                      key={index}
                      onClick={action.onClick}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      {action.icon && <action.icon className="w-4 h-4" />}
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Progress Bar - Only show if progress exists */}
        {progress && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-600">
                {progress.current} of {progress.total} steps
              </span>
              <span className="text-xs text-gray-600 font-medium">
                {progress.percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}