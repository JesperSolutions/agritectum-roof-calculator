import { UserRole } from '../components/UserRoleSelector';
import { LocationData } from '../types/project';

export interface EmailNotificationData {
  userInfo: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    role?: string;
    userRole: UserRole;
  };
  
  inputParameters: {
    roofSize: number;
    roofSizeDisplay: number;
    unit: string;
    roofType: string;
    includeSolar: boolean;
    location: LocationData | null;
    useMetric: boolean;
  };
  
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
  
  modifications?: {
    customRoofElements?: any[];
    specialRequirements?: string[];
    additionalServices?: string[];
    notes?: string;
  };
  
  metadata: {
    calculationId: string;
    timestamp: Date;
    sessionDuration?: number;
    browserInfo?: string;
    referralSource?: string;
  };
}

export const generateCalculationId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `CALC_${timestamp}_${random}`.toUpperCase();
};

export const getBrowserInfo = (): string => {
  const userAgent = navigator.userAgent;
  let browser = 'Unknown';
  
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';
  
  return browser;
};

export const formatEmailSubject = (data: EmailNotificationData): string => {
  const userName = data.userInfo.name || 'User';
  const date = data.metadata.timestamp.toLocaleDateString();
  const roofType = data.inputParameters.roofType;
  
  return `Roof Impact Calculator Results - ${userName} - ${roofType} - ${date}`;
};

export const generateEmailSummary = (data: EmailNotificationData): string => {
  const { results, inputParameters } = data;
  
  const treesEquivalent = Math.round(results.totalCo2PerYear / 22);
  const monthlyPayback = results.annualSavings / 12;
  
  return `Your ${inputParameters.roofType.toLowerCase()} system will offset ${results.totalCo2PerYear.toLocaleString()} kg of CO₂ annually (equivalent to ${treesEquivalent} trees), save €${monthlyPayback.toFixed(0)} monthly, and pay for itself in ${results.paybackYears.toFixed(1)} years.`;
};

export const validateEmailData = (data: Partial<EmailNotificationData>): string[] => {
  const errors: string[] = [];
  
  if (!data.inputParameters) {
    errors.push('Input parameters are required');
  } else {
    if (!data.inputParameters.roofSize || data.inputParameters.roofSize <= 0) {
      errors.push('Valid roof size is required');
    }
    if (!data.inputParameters.roofType) {
      errors.push('Roof type is required');
    }
  }
  
  if (!data.results) {
    errors.push('Calculation results are required');
  }
  
  if (!data.metadata) {
    errors.push('Metadata is required');
  } else {
    if (!data.metadata.calculationId) {
      errors.push('Calculation ID is required');
    }
    if (!data.metadata.timestamp) {
      errors.push('Timestamp is required');
    }
  }
  
  return errors;
};

export const createEmailNotificationData = (
  userInfo: EmailNotificationData['userInfo'],
  inputParameters: EmailNotificationData['inputParameters'],
  results: EmailNotificationData['results'],
  modifications?: EmailNotificationData['modifications'],
  sessionStartTime?: Date
): EmailNotificationData => {
  const now = new Date();
  const sessionDuration = sessionStartTime ? now.getTime() - sessionStartTime.getTime() : undefined;
  
  return {
    userInfo,
    inputParameters,
    results,
    modifications,
    metadata: {
      calculationId: generateCalculationId(),
      timestamp: now,
      sessionDuration,
      browserInfo: getBrowserInfo(),
      referralSource: document.referrer || 'Direct'
    }
  };
};

// Email template utilities
export const createHTMLEmailTemplate = (data: EmailNotificationData): string => {
  // This would contain the full HTML template
  // For brevity, returning a simplified version
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Roof Calculator Results</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .container { max-width: 800px; margin: 0 auto; }
            .header { background: #10b981; color: white; padding: 20px; text-align: center; }
            .section { margin: 20px 0; padding: 15px; border-left: 4px solid #10b981; }
            .result-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
            .result-card { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Roof Impact Calculator Results</h1>
            </div>
            <!-- Content would be generated here -->
        </div>
    </body>
    </html>
  `;
};

export const createPlainTextEmail = (data: EmailNotificationData): string => {
  const { userInfo, inputParameters, results, metadata } = data;
  
  return `
ROOF IMPACT CALCULATOR RESULTS
==============================

Generated: ${metadata.timestamp.toLocaleString()}
Calculation ID: ${metadata.calculationId}

USER INFORMATION
${userInfo.name ? `Name: ${userInfo.name}` : ''}
${userInfo.email ? `Email: ${userInfo.email}` : ''}
User Type: ${userInfo.userRole || 'Not specified'}

PARAMETERS
Roof Size: ${inputParameters.roofSizeDisplay} ${inputParameters.unit}
Roof Type: ${inputParameters.roofType}
Solar Panels: ${inputParameters.includeSolar ? 'Yes' : 'No'}

RESULTS
CO₂ Offset: ${results.totalCo2PerYear.toLocaleString()} kg/year
Energy Impact: ${results.totalEnergyPerYear.toLocaleString()} kWh/year
Installation Cost: €${results.totalInstallationCost.toLocaleString()}
Annual Savings: €${results.annualSavings.toLocaleString()}
Payback Period: ${results.paybackYears.toFixed(1)} years

---
Generated by Roof Impact Calculator
Contact: info@agritectum.com
  `.trim();
};