import React from 'react';
import { Mail, Download, Share2, Calendar, User, Calculator, MapPin, Zap, Leaf, Euro, Clock, Settings, FileText, Award } from 'lucide-react';
import { UserRole } from './UserRoleSelector';
import { LocationData, ROOF_TYPES } from '../types/project';

interface EmailNotificationData {
  // User Information
  userInfo: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    role?: string;
    userRole: UserRole;
  };
  
  // Calculation Parameters
  inputParameters: {
    roofSize: number;
    roofSizeDisplay: number;
    unit: string;
    roofType: keyof typeof ROOF_TYPES;
    includeSolar: boolean;
    location: LocationData | null;
    useMetric: boolean;
  };
  
  // Calculation Results
  results: {
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
  };
  
  // Additional Modifications
  modifications?: {
    customRoofElements?: any[];
    specialRequirements?: string[];
    additionalServices?: string[];
    notes?: string;
  };
  
  // Metadata
  metadata: {
    calculationId: string;
    timestamp: Date;
    sessionDuration?: number;
    browserInfo?: string;
    referralSource?: string;
  };
}

interface EmailNotificationGeneratorProps {
  data: EmailNotificationData;
  onSendEmail?: (emailContent: string) => void;
  onDownloadPDF?: () => void;
}

export default function EmailNotificationGenerator({ 
  data, 
  onSendEmail, 
  onDownloadPDF 
}: EmailNotificationGeneratorProps) {
  
  const generateEmailContent = (): string => {
    const { userInfo, inputParameters, results, modifications, metadata } = data;
    
    // Email subject
    const subject = `Roof Impact Calculator Results - ${userInfo.name || 'User'} - ${metadata.timestamp.toLocaleDateString()}`;
    
    // Email body in HTML format
    const emailHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Roof Impact Calculator Results</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .email-container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
        }
        .content {
            padding: 30px;
        }
        .section {
            margin-bottom: 30px;
            border-left: 4px solid #10b981;
            padding-left: 20px;
        }
        .section h2 {
            color: #1f2937;
            font-size: 20px;
            margin: 0 0 15px 0;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .section-icon {
            width: 20px;
            height: 20px;
            color: #10b981;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        .info-item {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }
        .info-item strong {
            color: #374151;
            display: block;
            margin-bottom: 5px;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .info-item span {
            font-size: 16px;
            color: #1f2937;
            font-weight: 600;
        }
        .results-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        .result-card {
            background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            border: 1px solid #0ea5e9;
        }
        .result-card.environmental {
            background: linear-gradient(135deg, #f0fdf4, #dcfce7);
            border-color: #22c55e;
        }
        .result-card.financial {
            background: linear-gradient(135deg, #fefce8, #fef3c7);
            border-color: #eab308;
        }
        .result-card.technical {
            background: linear-gradient(135deg, #faf5ff, #f3e8ff);
            border-color: #a855f7;
        }
        .result-value {
            font-size: 24px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 5px;
        }
        .result-label {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .highlight-box {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            text-align: center;
        }
        .highlight-box h3 {
            margin: 0 0 10px 0;
            font-size: 18px;
        }
        .highlight-box p {
            margin: 0;
            opacity: 0.9;
        }
        .modifications-list {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
        }
        .modifications-list ul {
            margin: 0;
            padding-left: 20px;
        }
        .modifications-list li {
            margin-bottom: 8px;
            color: #374151;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }
        .footer a {
            color: #10b981;
            text-decoration: none;
        }
        .metadata {
            background: #f1f5f9;
            padding: 15px;
            border-radius: 8px;
            font-size: 12px;
            color: #64748b;
            margin-top: 20px;
        }
        .role-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .role-esg {
            background: #dcfce7;
            color: #166534;
        }
        .role-specialist {
            background: #dbeafe;
            color: #1e40af;
        }
        .role-individual {
            background: #fce7f3;
            color: #be185d;
        }
        @media (max-width: 600px) {
            .info-grid, .results-grid {
                grid-template-columns: 1fr;
            }
            .content {
                padding: 20px;
            }
            .header {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <h1>🏠 Roof Impact Calculator Results</h1>
            <p>Comprehensive analysis and recommendations for your sustainable roofing project</p>
        </div>
        
        <!-- Content -->
        <div class="content">
            <!-- User Information Section -->
            <div class="section">
                <h2>
                    <span class="section-icon">👤</span>
                    User Information
                </h2>
                <div class="info-grid">
                    ${userInfo.name ? `
                    <div class="info-item">
                        <strong>Name</strong>
                        <span>${userInfo.name}</span>
                    </div>
                    ` : ''}
                    ${userInfo.email ? `
                    <div class="info-item">
                        <strong>Email</strong>
                        <span>${userInfo.email}</span>
                    </div>
                    ` : ''}
                    ${userInfo.company ? `
                    <div class="info-item">
                        <strong>Company</strong>
                        <span>${userInfo.company}</span>
                    </div>
                    ` : ''}
                    <div class="info-item">
                        <strong>User Type</strong>
                        <span class="role-badge role-${userInfo.userRole?.replace('-', '')}">${
                          userInfo.userRole === 'esg-expert' ? 'ESG Expert' :
                          userInfo.userRole === 'roofing-specialist' ? 'Roofing Specialist' :
                          userInfo.userRole === 'private-individual' ? 'Private Individual' :
                          'Not Specified'
                        }</span>
                    </div>
                    <div class="info-item">
                        <strong>Calculation Date</strong>
                        <span>${metadata.timestamp.toLocaleDateString()} at ${metadata.timestamp.toLocaleTimeString()}</span>
                    </div>
                </div>
            </div>
            
            <!-- Input Parameters Section -->
            <div class="section">
                <h2>
                    <span class="section-icon">⚙️</span>
                    Calculation Parameters
                </h2>
                <div class="info-grid">
                    <div class="info-item">
                        <strong>Roof Size</strong>
                        <span>${inputParameters.roofSizeDisplay.toLocaleString()} ${inputParameters.unit}</span>
                    </div>
                    <div class="info-item">
                        <strong>Roof Type</strong>
                        <span>${inputParameters.roofType}</span>
                    </div>
                    <div class="info-item">
                        <strong>Solar Panels</strong>
                        <span>${inputParameters.includeSolar ? '✅ Included' : '❌ Not Included'}</span>
                    </div>
                    ${inputParameters.location ? `
                    <div class="info-item">
                        <strong>Location</strong>
                        <span>${inputParameters.location.address}</span>
                    </div>
                    <div class="info-item">
                        <strong>Solar Irradiance</strong>
                        <span>${inputParameters.location.solarIrradiance} kWh/m²/year</span>
                    </div>
                    <div class="info-item">
                        <strong>Climate Zone</strong>
                        <span>${inputParameters.location.climateZone}</span>
                    </div>
                    ` : ''}
                </div>
            </div>
            
            <!-- Results Section -->
            <div class="section">
                <h2>
                    <span class="section-icon">📊</span>
                    Calculation Results
                </h2>
                
                <!-- Environmental Results -->
                <h3 style="color: #059669; margin-bottom: 15px;">🌱 Environmental Impact</h3>
                <div class="results-grid">
                    <div class="result-card environmental">
                        <div class="result-value">${results.totalCo2PerYear.toLocaleString()}</div>
                        <div class="result-label">kg CO₂ Offset/Year</div>
                    </div>
                    <div class="result-card environmental">
                        <div class="result-value">${results.totalEnergyPerYear.toLocaleString()}</div>
                        <div class="result-label">kWh Energy Impact/Year</div>
                    </div>
                    <div class="result-card environmental">
                        <div class="result-value">${results.noxPerYear.toLocaleString()}</div>
                        <div class="result-label">kg NOₓ Reduction/Year</div>
                    </div>
                    ${results.neutralYear ? `
                    <div class="result-card environmental">
                        <div class="result-value">${results.neutralYear}</div>
                        <div class="result-label">Years to Carbon Neutral</div>
                    </div>
                    ` : ''}
                </div>
                
                <!-- Financial Results -->
                <h3 style="color: #d97706; margin-bottom: 15px;">💰 Financial Analysis</h3>
                <div class="results-grid">
                    <div class="result-card financial">
                        <div class="result-value">€${results.totalInstallationCost.toLocaleString()}</div>
                        <div class="result-label">Total Installation Cost</div>
                    </div>
                    <div class="result-card financial">
                        <div class="result-value">€${results.annualSavings.toLocaleString()}</div>
                        <div class="result-label">Annual Savings</div>
                    </div>
                    <div class="result-card financial">
                        <div class="result-value">${results.paybackYears.toFixed(1)}</div>
                        <div class="result-label">Years Payback Period</div>
                    </div>
                    <div class="result-card financial">
                        <div class="result-value">€${results.maintenanceCost.toLocaleString()}</div>
                        <div class="result-label">Annual Maintenance</div>
                    </div>
                </div>
                
                <!-- Technical Results -->
                <h3 style="color: #7c3aed; margin-bottom: 15px;">🔧 Technical Specifications</h3>
                <div class="results-grid">
                    <div class="result-card technical">
                        <div class="result-value">${results.installationDays}</div>
                        <div class="result-label">Installation Days</div>
                    </div>
                    ${inputParameters.includeSolar ? `
                    <div class="result-card technical">
                        <div class="result-value">${results.solarEnergyPerYear.toLocaleString()}</div>
                        <div class="result-label">kWh Solar Generation/Year</div>
                    </div>
                    ` : ''}
                    <div class="result-card technical">
                        <div class="result-value">${ROOF_TYPES[inputParameters.roofType].lifespan}</div>
                        <div class="result-label">Years System Lifespan</div>
                    </div>
                </div>
            </div>
            
            <!-- Key Highlights -->
            <div class="highlight-box">
                <h3>🎯 Key Highlights</h3>
                <p>
                    Your ${inputParameters.roofType.toLowerCase()} system will offset 
                    <strong>${results.totalCo2PerYear.toLocaleString()} kg of CO₂ annually</strong>, 
                    equivalent to planting <strong>${Math.round(results.totalCo2PerYear / 22)} trees</strong> every year.
                    ${inputParameters.includeSolar ? ` With solar panels, you'll generate <strong>${results.solarEnergyPerYear.toLocaleString()} kWh</strong> of clean energy annually.` : ''}
                </p>
            </div>
            
            ${modifications && (modifications.customRoofElements?.length || modifications.specialRequirements?.length || modifications.additionalServices?.length || modifications.notes) ? `
            <!-- Modifications Section -->
            <div class="section">
                <h2>
                    <span class="section-icon">🔧</span>
                    Additional Modifications & Requirements
                </h2>
                
                ${modifications.customRoofElements?.length ? `
                <div class="modifications-list">
                    <h4>Custom Roof Elements:</h4>
                    <ul>
                        ${modifications.customRoofElements.map(element => `<li>${element.name || element.type}: ${element.percentage}% coverage</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
                
                ${modifications.specialRequirements?.length ? `
                <div class="modifications-list">
                    <h4>Special Requirements:</h4>
                    <ul>
                        ${modifications.specialRequirements.map(req => `<li>${req}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
                
                ${modifications.additionalServices?.length ? `
                <div class="modifications-list">
                    <h4>Additional Services:</h4>
                    <ul>
                        ${modifications.additionalServices.map(service => `<li>${service}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
                
                ${modifications.notes ? `
                <div class="modifications-list">
                    <h4>Additional Notes:</h4>
                    <p>${modifications.notes}</p>
                </div>
                ` : ''}
            </div>
            ` : ''}
            
            <!-- Next Steps -->
            <div class="section">
                <h2>
                    <span class="section-icon">🚀</span>
                    Recommended Next Steps
                </h2>
                <div class="modifications-list">
                    <ol>
                        <li><strong>Site Assessment:</strong> Schedule a professional evaluation of your roof structure and condition</li>
                        <li><strong>Permits & Approvals:</strong> Apply for necessary building permits and utility approvals</li>
                        <li><strong>Contractor Selection:</strong> Get quotes from certified installers in your area</li>
                        <li><strong>Financing Options:</strong> Explore available incentives, rebates, and financing programs</li>
                        <li><strong>Installation Planning:</strong> Schedule installation during optimal weather conditions</li>
                    </ol>
                </div>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p>
                This report was generated by the <strong>Roof Impact Calculator</strong> by 
                <a href="mailto:info@agritectum.com">Agritectum</a>
            </p>
            <p>
                For questions about this analysis or to schedule a consultation, 
                contact us at <a href="mailto:info@agritectum.com">info@agritectum.com</a>
            </p>
            
            <!-- Metadata -->
            <div class="metadata">
                <strong>Calculation Details:</strong><br>
                Calculation ID: ${metadata.calculationId}<br>
                Generated: ${metadata.timestamp.toISOString()}<br>
                ${metadata.sessionDuration ? `Session Duration: ${Math.round(metadata.sessionDuration / 60)} minutes<br>` : ''}
                ${metadata.browserInfo ? `Browser: ${metadata.browserInfo}<br>` : ''}
                ${metadata.referralSource ? `Source: ${metadata.referralSource}` : ''}
            </div>
        </div>
    </div>
</body>
</html>`;

    return emailHTML;
  };

  const generatePlainTextEmail = (): string => {
    const { userInfo, inputParameters, results, modifications, metadata } = data;
    
    return `
ROOF IMPACT CALCULATOR RESULTS
==============================

Generated: ${metadata.timestamp.toLocaleDateString()} at ${metadata.timestamp.toLocaleTimeString()}
Calculation ID: ${metadata.calculationId}

USER INFORMATION
----------------
${userInfo.name ? `Name: ${userInfo.name}\n` : ''}${userInfo.email ? `Email: ${userInfo.email}\n` : ''}${userInfo.company ? `Company: ${userInfo.company}\n` : ''}User Type: ${userInfo.userRole === 'esg-expert' ? 'ESG Expert' : userInfo.userRole === 'roofing-specialist' ? 'Roofing Specialist' : userInfo.userRole === 'private-individual' ? 'Private Individual' : 'Not Specified'}

CALCULATION PARAMETERS
----------------------
Roof Size: ${inputParameters.roofSizeDisplay.toLocaleString()} ${inputParameters.unit}
Roof Type: ${inputParameters.roofType}
Solar Panels: ${inputParameters.includeSolar ? 'Included' : 'Not Included'}
${inputParameters.location ? `Location: ${inputParameters.location.address}\nSolar Irradiance: ${inputParameters.location.solarIrradiance} kWh/m²/year\nClimate Zone: ${inputParameters.location.climateZone}\n` : ''}

ENVIRONMENTAL RESULTS
---------------------
Annual CO₂ Offset: ${results.totalCo2PerYear.toLocaleString()} kg/year
Annual Energy Impact: ${results.totalEnergyPerYear.toLocaleString()} kWh/year
Annual NOₓ Reduction: ${results.noxPerYear.toLocaleString()} kg/year
${results.neutralYear ? `Years to Carbon Neutral: ${results.neutralYear}\n` : ''}

FINANCIAL ANALYSIS
------------------
Total Installation Cost: €${results.totalInstallationCost.toLocaleString()}
Annual Savings: €${results.annualSavings.toLocaleString()}
Payback Period: ${results.paybackYears.toFixed(1)} years
Annual Maintenance: €${results.maintenanceCost.toLocaleString()}

TECHNICAL SPECIFICATIONS
------------------------
Installation Time: ${results.installationDays} days
${inputParameters.includeSolar ? `Solar Generation: ${results.solarEnergyPerYear.toLocaleString()} kWh/year\n` : ''}System Lifespan: ${ROOF_TYPES[inputParameters.roofType].lifespan} years

KEY HIGHLIGHTS
--------------
Your ${inputParameters.roofType.toLowerCase()} system will offset ${results.totalCo2PerYear.toLocaleString()} kg of CO₂ annually, equivalent to planting ${Math.round(results.totalCo2PerYear / 22)} trees every year.${inputParameters.includeSolar ? ` With solar panels, you'll generate ${results.solarEnergyPerYear.toLocaleString()} kWh of clean energy annually.` : ''}

${modifications && (modifications.customRoofElements?.length || modifications.specialRequirements?.length || modifications.additionalServices?.length || modifications.notes) ? `
ADDITIONAL MODIFICATIONS
------------------------
${modifications.customRoofElements?.length ? `Custom Roof Elements:\n${modifications.customRoofElements.map(element => `- ${element.name || element.type}: ${element.percentage}% coverage`).join('\n')}\n\n` : ''}${modifications.specialRequirements?.length ? `Special Requirements:\n${modifications.specialRequirements.map(req => `- ${req}`).join('\n')}\n\n` : ''}${modifications.additionalServices?.length ? `Additional Services:\n${modifications.additionalServices.map(service => `- ${service}`).join('\n')}\n\n` : ''}${modifications.notes ? `Additional Notes:\n${modifications.notes}\n\n` : ''}` : ''}

NEXT STEPS
----------
1. Site Assessment: Schedule a professional evaluation of your roof structure
2. Permits & Approvals: Apply for necessary building permits and utility approvals
3. Contractor Selection: Get quotes from certified installers in your area
4. Financing Options: Explore available incentives, rebates, and financing programs
5. Installation Planning: Schedule installation during optimal weather conditions

---
This report was generated by the Roof Impact Calculator by Agritectum
For questions, contact us at info@agritectum.com
`;
  };

  const handleSendEmail = () => {
    const emailContent = generateEmailContent();
    const plainTextContent = generatePlainTextEmail();
    
    // Create mailto link with the email content
    const subject = encodeURIComponent(`Roof Impact Calculator Results - ${data.userInfo.name || 'User'} - ${data.metadata.timestamp.toLocaleDateString()}`);
    const body = encodeURIComponent(plainTextContent);
    const mailtoLink = `mailto:${data.userInfo.email || ''}?subject=${subject}&body=${body}`;
    
    // Open email client
    window.open(mailtoLink);
    
    // Also call the callback if provided
    if (onSendEmail) {
      onSendEmail(emailContent);
    }
  };

  const handleCopyToClipboard = async () => {
    const emailContent = generatePlainTextEmail();
    try {
      await navigator.clipboard.writeText(emailContent);
      alert('Email content copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback: create a text area and select the text
      const textArea = document.createElement('textarea');
      textArea.value = emailContent;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Email content copied to clipboard!');
    }
  };

  const handleDownloadHTML = () => {
    const emailContent = generateEmailContent();
    const blob = new Blob([emailContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roof-calculator-results-${data.metadata.timestamp.toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Mail className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Email Notification</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSendEmail}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Mail className="w-4 h-4" />
            <span>Send Email</span>
          </button>
          
          <button
            onClick={handleCopyToClipboard}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Copy</span>
          </button>
          
          <button
            onClick={handleDownloadHTML}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
          
          {onDownloadPDF && (
            <button
              onClick={onDownloadPDF}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* Email Preview */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <h4 className="font-medium text-gray-900 mb-3">Email Preview</h4>
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium text-gray-700">To:</span> {data.userInfo.email || 'recipient@example.com'}
          </div>
          <div>
            <span className="font-medium text-gray-700">Subject:</span> Roof Impact Calculator Results - {data.userInfo.name || 'User'} - {data.metadata.timestamp.toLocaleDateString()}
          </div>
          <div>
            <span className="font-medium text-gray-700">Generated:</span> {data.metadata.timestamp.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Content Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <User className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">User Info</span>
          </div>
          <div className="text-sm text-blue-700">
            {data.userInfo.name && <div>Name: {data.userInfo.name}</div>}
            {data.userInfo.email && <div>Email: {data.userInfo.email}</div>}
            <div>Role: {data.userInfo.userRole?.replace('-', ' ') || 'Not specified'}</div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Calculator className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-900">Parameters</span>
          </div>
          <div className="text-sm text-green-700">
            <div>Size: {data.inputParameters.roofSizeDisplay.toLocaleString()} {data.inputParameters.unit}</div>
            <div>Type: {data.inputParameters.roofType}</div>
            <div>Solar: {data.inputParameters.includeSolar ? 'Yes' : 'No'}</div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Award className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-purple-900">Key Results</span>
          </div>
          <div className="text-sm text-purple-700">
            <div>CO₂: {data.results.totalCo2PerYear.toLocaleString()} kg/year</div>
            <div>Cost: €{data.results.totalInstallationCost.toLocaleString()}</div>
            <div>Payback: {data.results.paybackYears.toFixed(1)} years</div>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs text-gray-600">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div>ID: {data.metadata.calculationId}</div>
          <div>Generated: {data.metadata.timestamp.toLocaleTimeString()}</div>
          {data.metadata.sessionDuration && (
            <div>Duration: {Math.round(data.metadata.sessionDuration / 60)}min</div>
          )}
          {data.metadata.browserInfo && (
            <div>Browser: {data.metadata.browserInfo}</div>
          )}
        </div>
      </div>
    </div>
  );
}