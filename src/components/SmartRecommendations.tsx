import React, { useState, useEffect } from 'react';
import { Brain, Users, Calendar, TrendingUp, MapPin, Sun, CheckCircle, Star, Target, Zap, DollarSign, Award, ChevronRight, Download, Share2, BarChart3, Calculator, Phone, Mail, ExternalLink, FileText } from 'lucide-react';
import { LocationData, ROOF_TYPES } from '../types/project';
import HelpTooltip from './HelpTooltip';

interface SmartRecommendationsProps {
  roofSize: number;
  roofType: keyof typeof ROOF_TYPES;
  includeSolar: boolean;
  location: LocationData | null;
  totalCo2PerYear: number;
  totalEnergyPerYear: number;
  totalInstallationCost: number;
  onRecommendationApply: (recommendation: any) => void;
}

export default function SmartRecommendations({
  roofSize,
  roofType,
  includeSolar,
  location,
  totalCo2PerYear,
  totalEnergyPerYear,
  totalInstallationCost,
  onRecommendationApply
}: SmartRecommendationsProps) {

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Brain className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-900">Smart Recommendations</h2>
          <HelpTooltip content="Personalized recommendations based on your roof configuration and location." />
        </div>
      </div>

      {/* Simplified Recommendations */}
      <div className="space-y-6">
        {/* Solar Recommendation */}
        {!includeSolar && location && location.solarIrradiance > 1000 && (
          <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Sun className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Solar Panels</h3>
                <p className="text-gray-600 mb-4">
                  Your location has excellent solar potential ({location.solarIrradiance} kWh/m²/year). 
                  Adding solar panels could generate approximately {Math.round(roofSize * 0.2 * location.solarIrradiance * 0.75 / 1000).toLocaleString()} kWh annually.
                </p>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      €{Math.round(roofSize * 0.2 * location.solarIrradiance * 0.75 / 1000 * 0.25).toLocaleString()}
                    </div>
                    <div className="text-xs text-green-700">Annual Savings</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">
                      {Math.round(roofSize * 0.2 * location.solarIrradiance * 0.75 / 1000 * 0.4).toLocaleString()}
                    </div>
                    <div className="text-xs text-blue-700">kg CO₂ Offset</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-lg font-bold text-purple-600">
                      {Math.round((roofSize * 150) / (roofSize * 0.2 * location.solarIrradiance * 0.75 / 1000 * 0.25) * 10) / 10}
                    </div>
                    <div className="text-xs text-purple-700">Years Payback</div>
                  </div>
                </div>
                <button
                  onClick={() => onRecommendationApply({ type: 'add_solar', data: { includeSolar: true } })}
                  className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                >
                  Add Solar Panels
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Roof Type Upgrade Recommendation */}
        {roofType === 'Photocatalytic Coating' && (
          <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Consider Cool Roof Coating</h3>
                <p className="text-gray-600 mb-4">
                  Cool roof coating offers higher energy savings and CO₂ offset compared to photocatalytic coating, 
                  especially in warmer climates.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      +{Math.round((ROOF_TYPES['White - Cool Roof Coating'].co2 - ROOF_TYPES['Photocatalytic Coating'].co2) * roofSize)}
                    </div>
                    <div className="text-xs text-green-700">Additional CO₂ Offset</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">
                      {Math.round(ROOF_TYPES['White - Cool Roof Coating'].energy * roofSize).toLocaleString()}
                    </div>
                    <div className="text-xs text-blue-700">kWh Energy Savings</div>
                  </div>
                </div>
                <button
                  onClick={() => onRecommendationApply({ type: 'change_roof_type', data: { roofType: 'White - Cool Roof Coating' } })}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Upgrade to Cool Roof
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Expert Consultation */}
        <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Phone className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Expert Consultation</h3>
              <p className="text-gray-600 mb-4">
                Connect with certified roofing specialists for personalized advice and professional installation quotes.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => window.open('mailto:info@agritectum.com?subject=Roof Consultation Request')}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center space-x-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Contact Expert</span>
                </button>
                <button
                  onClick={() => window.open('tel:+4512345678')}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}