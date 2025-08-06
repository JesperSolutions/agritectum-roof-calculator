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
    noxPerYear: number;
    neutralYear: number | null;
    totalInstallationCost: number;
    solarEnergyPerYear: number;
    installationDays: number;
    annualSavings: number;
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

// EmailJS configuration - these should be environment variables in production
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
        subject: `New Report Request from ${formData.name}`,
        
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
        annual_nox_reduction: `${calculatorData.noxPerYear.toLocaleString()} kg/year`,
        carbon_neutral_timeline: calculatorData.neutralYear ? `${calculatorData.neutralYear} years` : 'Not achievable',
        total_installation_cost: `€${calculatorData.totalInstallationCost.toLocaleString()}`,
        annual_savings: `€${calculatorData.annualSavings.toLocaleString()}`,
        payback_period: calculatorData.paybackYears === 999 ? 'No payback' : `${calculatorData.paybackYears} years`,
        solar_generation: calculatorData.includeSolar ? `${calculatorData.solarEnergyPerYear.toLocaleString()} kWh/year` : 'N/A',
        location: calculatorData.location ? calculatorData.location.address : 'Not provided',
        
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
            {currentStep === 'form' ? 'Get Your Personal Roof Assessment' : 'Thank You!'}
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Thank You!</h3>
              <p className="text-gray-600 mb-4">
                We've received your request and will get back to you shortly with a personal evaluation.
              </p>
              <p className="text-sm text-gray-500">
                This window will close automatically in a few seconds...
              </p>
            </div>
          </div>
        )}

        {/* Form Step */}
        {currentStep === 'form' && (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
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
                    Email *
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
                    Phone
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h3>
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
                    <option value="planning">Just planning</option>
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
                    <option value="under-50k">Under €50,000</option>
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
                Additional Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Any additional information or specific requirements..."
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
                  I accept the privacy policy and consent to being contacted about my roof project with detailed analysis results *
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
                  Yes, I'd like to receive updates about sustainable roofing solutions and industry insights
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
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
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