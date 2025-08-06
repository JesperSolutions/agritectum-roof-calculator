import React from 'react';
import { Brain, Sun, Award, Phone, Mail, TrendingUp } from 'lucide-react';
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

  // Calculate potential solar benefits
  const calculateSolarPotential = () => {
    if (!location) return null;
    
    const solarArea = roofSize * 0.7; // 70% of roof usable for solar
    const annualGeneration = (200 * solarArea * 4.5 * 365 * 0.75 * (location.solarIrradiance / 1100)) / 1000;
    const annualSavings = annualGeneration * 0.20; // €0.20 per kWh
    const co2Offset = annualGeneration * 0.4; // 0.4 kg CO₂ per kWh
    const paybackYears = (solarArea * 150) / annualSavings;
    
    return {
      annualGeneration: Math.round(annualGeneration),
      annualSavings: Math.round(annualSavings),
      co2Offset: Math.round(co2Offset),
      paybackYears: Math.round(paybackYears * 10) / 10,
      installationCost: Math.round(solarArea * 150)
    };
  };

  const solarPotential = calculateSolarPotential();

  // Check if user has standard roofing (baseline)
  const hasStandardRoofing = roofType === 'Standard Roofing' || totalCo2PerYear === 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Brain className="w-8 h-8 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">Smart Recommendations</h2>
          <HelpTooltip content="AI-powered recommendations based on your roof configuration, location, and environmental goals." />
        </div>
      </div>

      <div className="space-y-8">
        {/* Solar Recommendation */}
        {!includeSolar && location && location.solarIrradiance > 1000 && solarPotential && (
          <div className="border-2 border-yellow-200 rounded-2xl p-8 bg-gradient-to-r from-yellow-50 to-orange-50 hover:shadow-xl transition-all duration-300">
            <div className="flex items-start space-x-6">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Sun className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">Add Solar Panels</h3>
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    95% Confidence
                  </div>
                </div>
                <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                  Your location has excellent solar potential with {location.solarIrradiance} kWh/m²/year irradiance. 
                  Adding solar panels could transform your roof into a clean energy generator.
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                  <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-yellow-200">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      €{solarPotential.annualSavings.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Annual Savings</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-yellow-200">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {solarPotential.annualGeneration.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">kWh Generated</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-yellow-200">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {solarPotential.co2Offset.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">kg CO₂ Offset</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-yellow-200">
                    <div className="text-2xl font-bold text-orange-600 mb-1">
                      {solarPotential.paybackYears}
                    </div>
                    <div className="text-sm text-gray-600">Years Payback</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => onRecommendationApply({ type: 'add_solar', data: { includeSolar: true } })}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-3 rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    Add Solar Panels
                  </button>
                  <div className="text-sm text-gray-600">
                    Investment: €{solarPotential.installationCost.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Roof Type Upgrade Recommendation */}
        {hasStandardRoofing && (
          <div className="border-2 border-blue-200 rounded-2xl p-8 bg-gradient-to-r from-blue-50 to-indigo-50 hover:shadow-xl transition-all duration-300">
            <div className="flex items-start space-x-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">Upgrade to Cool Roof Coating</h3>
                  <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Recommended
                  </div>
                </div>
                <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                  Cool roof coating offers significant energy savings and CO₂ offset compared to standard roofing. 
                  It's especially effective in warmer climates and provides excellent return on investment.
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-blue-200">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {Math.round(ROOF_TYPES['White - Cool Roof Coating'].co2 * roofSize)}
                    </div>
                    <div className="text-sm text-gray-600">kg CO₂ Offset/year</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {Math.round(ROOF_TYPES['White - Cool Roof Coating'].energy * roofSize).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">kWh Savings/year</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-blue-200">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      €{Math.round(ROOF_TYPES['White - Cool Roof Coating'].totalCost * roofSize).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total Investment</div>
                  </div>
                </div>

                <button
                  onClick={() => onRecommendationApply({ type: 'change_roof_type', data: { roofType: 'White - Cool Roof Coating' } })}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Upgrade to Cool Roof
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Market Trends Insight */}
        <div className="border-2 border-green-200 rounded-2xl p-8 bg-gradient-to-r from-green-50 to-emerald-50 hover:shadow-xl transition-all duration-300">
          <div className="flex items-start space-x-6">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Market Trends & Timing</h3>
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">Solar Panel Prices</span>
                    <span className="text-green-600 font-bold">↓ 23% vs last year</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Solar panel costs have decreased significantly, making now an excellent time to invest.
                  </p>
                </div>
                
                <div className="bg-white rounded-xl p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">Government Incentives</span>
                    <span className="text-blue-600 font-bold">Available until Dec 2025</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Current tax incentives and rebates can reduce your total investment by up to 30%.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">Installation Season</span>
                    <span className="text-orange-600 font-bold">Spring recommended</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Spring installation offers 15% cost savings vs. summer and optimal weather conditions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expert Consultation */}
        <div className="border-2 border-purple-200 rounded-2xl p-8 bg-gradient-to-r from-purple-50 to-pink-50 hover:shadow-xl transition-all duration-300">
          <div className="flex items-start space-x-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Get Expert Consultation</h3>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Connect with certified roofing specialists in your area for personalized advice, 
                detailed site assessment, and professional installation quotes.
              </p>
              
              <div className="bg-white rounded-xl p-4 mb-6 border border-purple-200">
                <h4 className="font-semibold text-gray-900 mb-2">What you'll get:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Free on-site assessment and measurements</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Detailed installation timeline and process</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Financing options and incentive guidance</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Warranty and maintenance information</span>
                  </li>
                </ul>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => window.open('mailto:info@agritectum.com?subject=Roof Consultation Request')}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-2"
                >
                  <Mail className="w-5 h-5" />
                  <span>Contact Expert</span>
                </button>
                <button
                  onClick={() => window.open('tel:+4512345678')}
                  className="bg-white text-purple-600 border-2 border-purple-500 px-8 py-3 rounded-xl hover:bg-purple-50 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-2"
                >
                  <Phone className="w-5 h-5" />
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