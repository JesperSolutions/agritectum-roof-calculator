import React, { useState } from 'react';
import { X, Send, CheckCircle } from 'lucide-react';
import emailjs from '@emailjs/browser';

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  };
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  role: string;
  address: string;
  roofType: string;
  roofAge: string;
  roofArea: number;
  roofAreaUnit: string;
  roofDivision: string;
  timeline: string;
  budget: string;
  goals: string[];
  acceptPrivacy: boolean;
  acceptNewsletter: boolean;
}

const ROOF_TYPE_OPTIONS = [
  'Flat roof with membrane',
  'Pitched roof with tiles',
  'Metal roof',
  'Concrete roof',
  'Green roof (existing)',
  'Other'
];

const TIMELINE_OPTIONS = [
  'As soon as possible',
  '0-6 months',
  '6-12 months',
  '1+ years'
];

const BUDGET_OPTIONS = [
  'Not sure yet',
  'Under 50,000 DKK',
  '50,000–200,000 DKK',
  '200,000–500,000 DKK',
  'Over 500,000 DKK'
];

const GOAL_OPTIONS = [
  'CO₂ reduction',
  'Energy savings',
  'Regulatory compliance',
  'Environmental profile'
];

// EmailJS configuration
const EMAILJS_SERVICE_ID = 'service_labcoh9';
const EMAILJS_TEMPLATE_ID = 'template_pac9jom';
const EMAILJS_PUBLIC_KEY = 'BCoUz6Ty8c0oza6pZ';

export default function LeadCaptureModal({ isOpen, onClose, calculatorData }: LeadCaptureModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    role: '',
    address: '',
    roofType: '',
    roofAge: '',
    roofArea: calculatorData.roofSizeDisplay,
    roofAreaUnit: calculatorData.unit,
    roofDivision: calculatorData.roofType,
    timeline: '',
    budget: '',
    goals: [],
    acceptPrivacy: false,
    acceptNewsletter: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.roofType) {
      newErrors.roofType = 'Roof type is required';
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
        to_email: 'info@agritectum.com', // Your email
        from_name: formData.name,
        from_email: formData.email,
        subject: `New Report Request from ${formData.name}`,
        
        // Personal Information
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone || 'Not provided',
        
        // Company Information
        company_name: formData.companyName || 'Not provided',
        role: formData.role || 'Not provided',
        
        // Roof Information
        address: formData.address,
        roof_type: formData.roofType,
        roof_age: formData.roofAge || 'Not provided',
        roof_area: `${formData.roofArea} ${formData.roofAreaUnit}`,
        current_roof_solution: formData.roofDivision,
        
        // Project Details
        timeline: formData.timeline || 'Not specified',
        budget: formData.budget || 'Not specified',
        goals: formData.goals.length > 0 ? formData.goals.join(', ') : 'Not specified',
        
        // Calculator Settings
        calc_roof_size: `${calculatorData.roofSizeDisplay} ${calculatorData.unit}`,
        calc_roof_type: calculatorData.roofType,
        calc_solar_panels: calculatorData.includeSolar ? 'Yes' : 'No',
        
        // Calculated Results
        annual_co2_offset: `${calculatorData.totalCo2PerYear.toLocaleString()} kg/year`,
        annual_energy_impact: `${calculatorData.totalEnergyPerYear.toLocaleString()} kWh/year`,
        annual_nox_reduction: `${calculatorData.noxPerYear.toLocaleString()} kg/year`,
        carbon_neutral_timeline: calculatorData.neutralYear ? `${calculatorData.neutralYear} years` : 'Not achievable with current setup',
        total_installation_cost: `€${calculatorData.totalInstallationCost.toLocaleString()}`,
        solar_generation: calculatorData.includeSolar ? `${calculatorData.solarEnergyPerYear.toLocaleString()} kWh/year` : 'N/A',
        
        // Marketing Preferences
        newsletter_subscription: formData.acceptNewsletter ? 'Yes' : 'No',
        
        // Timestamp
        submission_date: new Date().toLocaleDateString(),
        submission_time: new Date().toLocaleTimeString()
      };

      // Send email using EmailJS
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );
      
      setIsSuccess(true);
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          companyName: '',
          role: '',
          address: '',
          roofType: '',
          roofAge: '',
          roofArea: calculatorData.roofSizeDisplay,
          roofAreaUnit: calculatorData.unit,
          roofDivision: calculatorData.roofType,
          timeline: '',
          budget: '',
          goals: [],
          acceptPrivacy: false,
          acceptNewsletter: false
        });
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: 'There was an error submitting your request. Please try again or contact us directly.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoalChange = (goal: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({ ...prev, goals: [...prev.goals, goal] }));
    } else {
      setFormData(prev => ({ ...prev, goals: prev.goals.filter(g => g !== goal) }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Get Your Personal Roof Assessment
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Success State */}
        {isSuccess && (
          <div className="p-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Thank You!</h3>
              <p className="text-gray-600">
                We've received your request and will get back to you shortly with a personal evaluation.
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        {!isSuccess && (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
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
              </div>
            </div>

            {/* Company Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information (Optional)</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Your company"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role/Title
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Your role"
                  />
                </div>
              </div>
            </div>

            {/* Roof Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Roof Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Building address"
                  />
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Roof Type *
                    </label>
                    <select
                      value={formData.roofType}
                      onChange={(e) => setFormData(prev => ({ ...prev, roofType: e.target.value }))}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.roofType ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select roof type</option>
                      {ROOF_TYPE_OPTIONS.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    {errors.roofType && <p className="text-red-500 text-sm mt-1">{errors.roofType}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Roof Age
                    </label>
                    <input
                      type="text"
                      value={formData.roofAge}
                      onChange={(e) => setFormData(prev => ({ ...prev, roofAge: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., 5 years, 1990s"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Roof Area ({calculatorData.unit})
                    </label>
                    <input
                      type="number"
                      value={formData.roofArea}
                      onChange={(e) => setFormData(prev => ({ ...prev, roofArea: parseInt(e.target.value) || 0 }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      min="1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Prefilled from calculator ({calculatorData.unit})
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Solution
                    </label>
                    <input
                      type="text"
                      value={formData.roofDivision}
                      onChange={(e) => setFormData(prev => ({ ...prev, roofDivision: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Current roof solution"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timeline
                  </label>
                  <select
                    value={formData.timeline}
                    onChange={(e) => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select timeline</option>
                    {TIMELINE_OPTIONS.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget
                  </label>
                  <select
                    value={formData.budget}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select budget range</option>
                    {BUDGET_OPTIONS.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Project Goals (select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {GOAL_OPTIONS.map(goal => (
                    <label key={goal} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.goals.includes(goal)}
                        onChange={(e) => handleGoalChange(goal, e.target.checked)}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">{goal}</span>
                    </label>
                  ))}
                </div>
              </div>
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
                  I accept the{' '}
                  <a 
                    href="https://www.yourdomain.dk/privacy-policy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-700 underline"
                  >
                    privacy policy
                  </a>{' '}
                  *
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
                  Yes, send me news and relevant updates
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
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Request</span>
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