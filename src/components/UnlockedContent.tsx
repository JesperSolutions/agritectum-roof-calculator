import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';
import { TrendingUp, BarChart3, Users, Calendar, Brain, Settings, FileText, Download, Unlock } from 'lucide-react';
import EnhancedCharts from './EnhancedCharts';
import SmartRecommendations from './SmartRecommendations';
import ProjectManager from './ProjectManager';
import { LocationData, ROOF_TYPES } from '../types/project';

interface UnlockedContentProps {
  appState: any;
  calculatedMetrics: any;
  chartData: any[];
}

export default function UnlockedContent({ appState, calculatedMetrics, chartData }: UnlockedContentProps) {
  const [activeTab, setActiveTab] = useState<'charts' | 'recommendations' | 'projects' | 'reports'>('charts');

  const tabs = [
    { id: 'charts', label: 'Advanced Charts', icon: BarChart3 },
    { id: 'recommendations', label: 'AI Recommendations', icon: Brain },
    { id: 'projects', label: 'Project Management', icon: Settings },
    { id: 'reports', label: 'Professional Reports', icon: FileText }
  ];

  return (
    <div className="max-w-7xl mx-auto mt-12">
      {/* Unlocked Banner */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-xl p-6 mb-8 text-white text-center">
        <Unlock className="w-12 h-12 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">🎉 Full Analysis Unlocked!</h2>
        <p className="text-lg opacity-90">
          You now have access to all advanced features, detailed analysis, and professional tools.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        {activeTab === 'charts' && (
          <EnhancedCharts 
            chartData={chartData}
            roofType={appState.roofType}
            includeSolar={appState.includeSolar}
            totalCo2PerYear={calculatedMetrics.totalCo2PerYear}
            totalEnergyPerYear={calculatedMetrics.totalEnergyPerYear}
            noxPerYear={calculatedMetrics.noxPerYear}
            location={appState.location}
          />
        )}

        {activeTab === 'recommendations' && (
          <SmartRecommendations
            roofSize={appState.roofSize}
            roofType={appState.roofType}
            includeSolar={appState.includeSolar}
            location={appState.location}
            totalCo2PerYear={calculatedMetrics.totalCo2PerYear}
            totalEnergyPerYear={calculatedMetrics.totalEnergyPerYear}
            totalInstallationCost={calculatedMetrics.totalInstallationCost}
            onRecommendationApply={() => {}}
          />
        )}

        {activeTab === 'projects' && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Project Management</h3>
            <ProjectManager 
              currentProject={{
                id: 'current',
                roofSize: appState.roofSize,
                roofType: appState.roofType,
                includeSolar: appState.includeSolar,
                location: appState.location,
                createdAt: new Date()
              }}
              onProjectLoad={() => {}}
              onNewProject={() => {}}
            />
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Professional Reports</h3>
            <p className="text-gray-600 mb-8">
              Generate comprehensive PDF reports with all your calculations, recommendations, and analysis.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-2">Executive Summary</h4>
                <p className="text-sm text-gray-600 mb-4">High-level overview for decision makers</p>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Generate PDF
                </button>
              </div>
              <div className="border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-2">Technical Report</h4>
                <p className="text-sm text-gray-600 mb-4">Detailed specifications and analysis</p>
                <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Generate PDF
                </button>
              </div>
              <div className="border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-2">Financial Analysis</h4>
                <p className="text-sm text-gray-600 mb-4">ROI, costs, and financial projections</p>
                <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  Generate PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}