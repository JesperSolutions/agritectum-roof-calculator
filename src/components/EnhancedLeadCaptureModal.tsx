import React, { useState } from 'react';
import { X, Send, CheckCircle, Mail } from 'lucide-react';
import emailjs from '@emailjs/browser';

interface EnhancedLeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadCaptured?: () => void;
  calculatorData: {
    roofSize: number;
    roofSizeDisplay: number;
    unit: string;
    roofType: string;
    includeSolar: boolean;
    totalCo2PerYear: number;
    totalEnergyPerYear: number;
    totalNoxPerYear: number;
    neutralYear: number | null;
    totalInstallationCost: number;
    totalSolarEnergyPerYear: number;
    installationDays: number;
    totalAnnualSavings: number;
    paybackYears: number;
    maintenanceCost: number;
    location?: any;
    useMetric?: boolean;
  };
  userRole?: string;
  sessionStartTime?: Date;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  timeline: string;
  budget: string;
  notes: string;
  acceptPrivacy: boolean;
  acceptNewsletter: boolean;
}

// EmailJS configuration - replace with your actual values
const EMAILJS_SERVICE_ID = 'service_labcoh9';
const EMAILJS_TEMPLATE_ID = 'template_pac9jom';
const EMAILJS_PUBLIC_KEY = 'BCoUz6Ty8c0oza6pZ';

export default function EnhancedLeadCaptureModal({ 
  isOpen, 
  onClose, 
  onLeadCaptured,
  calculatorData, 
  userRole,
  sessionStartTime 
}: EnhancedLeadCaptureModalProps) {
  const [currentStep, setCurrentStep] = useState<'form' | 'success'>('form');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    timeline: '',
    budget: '',
    notes: '',
    acceptPrivacy: false,
    acceptNewsletter: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.acceptPrivacy) {
      newErrors.acceptPrivacy = 'You must accept the privacy policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare email template parameters
      const templateParams = {
        to_email: 'info@agritectum.com',
        from_name: formData.name,
        from_email: formData.email,
        subject: `New Roof Analysis Request from ${formData.name}`,
        
        // Customer information
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone || 'Not provided',
        company_name: formData.companyName || 'Not provided',
        user_role: userRole || 'Not specified',
        timeline: formData.timeline || 'Not specified',
        budget: formData.budget || 'Not specified',
        notes: formData.notes || 'None',
        
        // Calculator results
        calc_roof_size: `${calculatorData.roofSizeDisplay} ${calculatorData.unit}`,
        calc_roof_type: calculatorData.roofType,
        calc_solar_panels: calculatorData.includeSolar ? 'Yes' : 'No',
        annual_co2_offset: `${calculatorData.totalCo2PerYear.toLocaleString()} kg/year`,
        annual_energy_impact: `${calculatorData.totalEnergyPerYear.toLocaleString()} kWh/year`,
        annual_nox_reduction: `${calculatorData.totalNoxPerYear.toLocaleString()} kg/year`,
        carbon_neutral_timeline: calculatorData.neutralYear ? `${calculatorData.neutralYear} years` : 'Not achievable with current configuration',
        total_installation_cost: `€${calculatorData.totalInstallationCost.toLocaleString()}`,
        annual_savings: `€${calculatorData.totalAnnualSavings.toLocaleString()}`,
        payback_period: calculatorData.paybackYears === 999 ? 'No financial payback' : `${calculatorData.paybackYears} years`,
        solar_generation: calculatorData.includeSolar ? `${calculatorData.totalSolarEnergyPerYear.toLocaleString()} kWh/year` : 'No solar panels',
        location: calculatorData.location ? calculatorData.location.address : 'Not provided',
        installation_time: `${calculatorData.installationDays} days`,
        
        newsletter_subscription: formData.acceptNewsletter ? 'Yes' : 'No',
        submission_date: new Date().toLocaleDateString(),
        submission_time: new Date().toLocaleTimeString()
      };

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );
      
      setCurrentStep('success');
      
      // Auto-close after 3 seconds and trigger callback
      setTimeout(() => {
        onClose();
        setCurrentStep('form');
        // Reset form data
        setFormData({
          name: '',
          email: '',
          phone: '',
          companyName: '',
          timeline: '',
          budget: '',
          notes: '',
          acceptPrivacy: false,
          acceptNewsletter: false
        });
        
        // Call the callback after closing
        if (onLeadCaptured) {
          onLeadCaptured();
        }
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: 'There was an error submitting your request. Please try again or contact us directly at info@agritectum.com.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {currentStep === 'form' ? 'Get Your Detailed Roof Analysis' : 'Thank You!'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Success State */}
        {currentStep === 'success' && (
          <div className="p-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Request Submitted Successfully!</h3>
              <p className="text-gray-600 mb-4">
                We've received your roof analysis request and will send you a detailed report within 24 hours.
              </p>
              <div className="bg-green-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-green-800">
                  <strong>What's next:</strong> Our experts will review your configuration and send you a comprehensive analysis including installation recommendations, local contractor contacts, and financing options.
                </p>
              </div>
              <p className="text-sm text-gray-500">
                This window will close automatically in a few seconds...
              </p>
            </div>
          </div>
        )}

        {/* Form Step */}
        {currentStep === 'form' && (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Value Proposition */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">🎯 What you'll receive:</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Detailed 50-year environmental impact analysis</li>
                <li>• Professional installation timeline and cost breakdown</li>
                <li>• Local certified contractor recommendations</li>
                <li>• Financing options and incentive programs</li>
                <li>• Personalized maintenance schedule</li>
              </ul>
            </div>

            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Your full name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="your@email.com"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="+45 12 34 56 78"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Your company name"
                  />
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h3>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Timeline
                  </label>
                  <select
                    value={formData.timeline}
                    onChange={(e) => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select timeline</option>
                    <option value="asap">As soon as possible</option>
                    <option value="3-months">Within 3 months</option>
                    <option value="6-months">Within 6 months</option>
                    <option value="1-year">Within 1 year</option>
                    <option value="planning">Just planning / researching</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Range
                  </label>
                  <select
                    value={formData.budget}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select budget range</option>
                    <option value="under-25k">Under €25,000</option>
                    <option value="25k-50k">€25,000 - €50,000</option>
                    <option value="50k-100k">€50,000 - €100,000</option>
                    <option value="100k-200k">€100,000 - €200,000</option>
                    <option value="over-200k">Over €200,000</option>
                    <option value="not-sure">Not sure yet</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Information (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Any specific requirements, questions, or additional information about your project..."
              />
            </div>

            {/* Privacy & Newsletter */}
            <div className="space-y-3">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.acceptPrivacy}
                  onChange={(e) => setFormData(prev => ({ ...prev, acceptPrivacy: e.target.checked }))}
                  className={`w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-0.5 ${
                    errors.acceptPrivacy ? 'border-red-500' : ''
                  }`}
                />
                <span className="text-sm text-gray-700">
                  I consent to being contacted about my roof project and receiving the detailed analysis report. 
                  Your information will be used solely for providing the requested analysis and will not be shared with third parties. *
                </span>
              </label>
              {errors.acceptPrivacy && <p className="text-red-500 text-sm">{errors.acceptPrivacy}</p>}
              
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.acceptNewsletter}
                  onChange={(e) => setFormData(prev => ({ ...prev, acceptNewsletter: e.target.checked }))}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-0.5"
                />
                <span className="text-sm text-gray-700">
                  Yes, I'd like to receive occasional updates about sustainable roofing solutions, industry insights, and new technologies (you can unsubscribe anytime)
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending Request...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>Get My Free Analysis</span>
                  </>
                )}
              </button>
            </div>

            {errors.submit && (
              <p className="text-red-500 text-sm text-center">{errors.submit}</p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}