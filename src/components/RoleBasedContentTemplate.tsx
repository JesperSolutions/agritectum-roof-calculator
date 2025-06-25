import React from 'react';
import { Award, Wrench, Home, TrendingUp, DollarSign, Clock, Leaf, Zap, Settings } from 'lucide-react';
import { UserRole } from './UserRoleSelector';

interface ContentSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  priority: number;
  content: React.ReactNode;
  compact?: boolean;
}

interface RoleBasedContentTemplateProps {
  userRole: UserRole;
  sections: ContentSection[];
  layout?: 'grid' | 'stack' | 'masonry';
}

const getRoleConfig = (role: UserRole) => {
  switch (role) {
    case 'esg-expert':
      return {
        title: 'ESG Impact Dashboard',
        subtitle: 'Environmental metrics and sustainability analysis',
        primaryColor: 'green',
        accentColor: 'emerald'
      };
    case 'roofing-specialist':
      return {
        title: 'Technical Specifications',
        subtitle: 'Installation requirements and performance data',
        primaryColor: 'blue',
        accentColor: 'indigo'
      };
    case 'private-individual':
      return {
        title: 'Cost & Benefits Overview',
        subtitle: 'Simple breakdown of savings and benefits',
        primaryColor: 'purple',
        accentColor: 'violet'
      };
    default:
      return {
        title: 'Project Overview',
        subtitle: 'Complete analysis and recommendations',
        primaryColor: 'gray',
        accentColor: 'slate'
      };
  }
};

export default function RoleBasedContentTemplate({ 
  userRole, 
  sections, 
  layout = 'grid' 
}: RoleBasedContentTemplateProps) {
  const config = getRoleConfig(userRole);
  
  // Sort sections by priority for the user role
  const sortedSections = sections.sort((a, b) => a.priority - b.priority);
  
  // Split into primary and secondary sections
  const primarySections = sortedSections.slice(0, 3);
  const secondarySections = sortedSections.slice(3);

  const getLayoutClasses = () => {
    switch (layout) {
      case 'stack':
        return 'space-y-4';
      case 'masonry':
        return 'columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4';
      default:
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
    }
  };

  const SectionCard = ({ section, isPrimary = false }: { section: ContentSection; isPrimary?: boolean }) => {
    const Icon = section.icon;
    
    return (
      <div className={`bg-white rounded-xl border transition-all duration-200 hover:shadow-md ${
        isPrimary 
          ? `border-${config.primaryColor}-200 shadow-sm` 
          : 'border-gray-200'
      } ${section.compact ? 'p-4' : 'p-6'}`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className={`w-10 h-10 rounded-lg bg-${config.primaryColor}-100 flex items-center justify-center ${
            isPrimary ? 'ring-2 ring-' + config.primaryColor + '-200' : ''
          }`}>
            <Icon className={`w-5 h-5 text-${config.primaryColor}-600`} />
          </div>
          <div className="flex-1">
            <h3 className={`font-semibold text-gray-900 ${section.compact ? 'text-sm' : 'text-base'}`}>
              {section.title}
            </h3>
            {isPrimary && (
              <span className={`text-xs text-${config.primaryColor}-600 font-medium`}>
                Priority Section
              </span>
            )}
          </div>
        </div>
        
        <div className={section.compact ? 'text-sm' : ''}>
          {section.content}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Compact Header */}
      <div className={`bg-gradient-to-r from-${config.primaryColor}-50 to-${config.accentColor}-50 rounded-xl p-6 border border-${config.primaryColor}-200`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">{config.title}</h2>
            <p className="text-sm text-gray-600">{config.subtitle}</p>
          </div>
          <div className={`w-12 h-12 rounded-xl bg-${config.primaryColor}-100 flex items-center justify-center`}>
            {userRole === 'esg-expert' && <Award className={`w-6 h-6 text-${config.primaryColor}-600`} />}
            {userRole === 'roofing-specialist' && <Wrench className={`w-6 h-6 text-${config.primaryColor}-600`} />}
            {userRole === 'private-individual' && <Home className={`w-6 h-6 text-${config.primaryColor}-600`} />}
          </div>
        </div>
      </div>

      {/* Primary Sections */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-gray-600" />
          <span>Key Insights</span>
        </h3>
        <div className={getLayoutClasses()}>
          {primarySections.map((section) => (
            <SectionCard key={section.id} section={section} isPrimary={true} />
          ))}
        </div>
      </div>

      {/* Secondary Sections */}
      {secondarySections.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Settings className="w-5 h-5 text-gray-600" />
            <span>Additional Details</span>
          </h3>
          <div className={getLayoutClasses()}>
            {secondarySections.map((section) => (
              <SectionCard key={section.id} section={section} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}