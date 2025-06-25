import React from 'react';
import { Award, Wrench, Home } from 'lucide-react';
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
        icon: Award
      };
    case 'roofing-specialist':
      return {
        title: 'Technical Specifications',
        subtitle: 'Installation requirements and performance data',
        primaryColor: 'blue',
        icon: Wrench
      };
    case 'private-individual':
      return {
        title: 'Cost & Benefits Overview',
        subtitle: 'Simple breakdown of savings and benefits',
        primaryColor: 'purple',
        icon: Home
      };
    default:
      return {
        title: 'Project Overview',
        subtitle: 'Complete analysis and recommendations',
        primaryColor: 'gray',
        icon: Award
      };
  }
};

export default function RoleBasedContentTemplate({ 
  userRole, 
  sections, 
  layout = 'stack' 
}: RoleBasedContentTemplateProps) {
  const config = getRoleConfig(userRole);
  const Icon = config.icon;
  
  // Sort sections by priority
  const sortedSections = sections.sort((a, b) => a.priority - b.priority);

  const SectionCard = ({ section }: { section: ContentSection }) => {
    const SectionIcon = section.icon;
    
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className={`w-8 h-8 rounded-lg bg-${config.primaryColor}-100 flex items-center justify-center`}>
            <SectionIcon className={`w-4 h-4 text-${config.primaryColor}-600`} />
          </div>
          <h3 className="font-medium text-gray-900 text-sm sm:text-base">
            {section.title}
          </h3>
        </div>
        
        <div>
          {section.content}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Simple Role Header */}
      <div className={`bg-gradient-to-r from-${config.primaryColor}-50 to-${config.primaryColor}-100 rounded-lg p-4 border border-${config.primaryColor}-200`}>
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg bg-${config.primaryColor}-100 flex items-center justify-center`}>
            <Icon className={`w-5 h-5 text-${config.primaryColor}-600`} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">
              {config.title}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              {config.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-4">
        {sortedSections.map((section) => (
          <SectionCard key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
}