import React from 'react';
import { ArrowLeft, Settings, Share2, Download, MoreHorizontal } from 'lucide-react';

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
  if (compact) {
    return (
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-gray-600" />
              </button>
            )}
            <div>
              <h1 className="text-lg font-semibold text-gray-900 truncate">{title}</h1>
              {progress && (
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-16 bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    {progress.current}/{progress.total}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {actions?.primary && (
              <button
                onClick={actions.primary.onClick}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center space-x-1"
              >
                {actions.primary.icon && <actions.primary.icon className="w-3 h-3" />}
                <span>{actions.primary.label}</span>
              </button>
            )}
            
            {actions?.secondary && actions.secondary.length > 0 && (
              <div className="relative group">
                <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreHorizontal className="w-4 h-4 text-gray-600" />
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
      </div>
    );
  }

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
              )}
              
              {progress && (
                <div className="flex items-center space-x-3 mt-3">
                  <div className="flex-1 max-w-xs bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 font-medium">
                    {progress.current} of {progress.total} completed
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {actions?.secondary?.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title={action.label}
              >
                {action.icon && <action.icon className="w-5 h-5" />}
              </button>
            ))}
            
            {actions?.primary && (
              <button
                onClick={actions.primary.onClick}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
              >
                {actions.primary.icon && <actions.primary.icon className="w-4 h-4" />}
                <span>{actions.primary.label}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}