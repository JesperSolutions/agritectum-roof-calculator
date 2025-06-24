import React, { useState } from 'react';
import { User, Briefcase, Home, ChevronRight, Award, Wrench, Heart } from 'lucide-react';

export type UserRole = 'esg-expert' | 'roofing-specialist' | 'private-individual' | null;

interface UserRoleSelectorProps {
  selectedRole: UserRole;
  onRoleSelect: (role: UserRole) => void;
}

const USER_ROLES = [
  {
    id: 'esg-expert' as const,
    title: 'ESG Expert',
    subtitle: 'Environmental, Social & Governance Professional',
    description: 'Focus on sustainability metrics, carbon footprint analysis, and environmental compliance',
    icon: Award,
    color: 'from-green-500 to-emerald-600',
    features: [
      'Advanced environmental impact metrics',
      'Carbon footprint calculations',
      'Sustainability reporting data',
      'Regulatory compliance insights'
    ]
  },
  {
    id: 'roofing-specialist' as const,
    title: 'Roofing Specialist',
    subtitle: 'Construction & Installation Professional',
    description: 'Technical specifications, installation requirements, and material performance data',
    icon: Wrench,
    color: 'from-blue-500 to-indigo-600',
    features: [
      'Technical specifications & requirements',
      'Installation timelines & processes',
      'Material costs & performance',
      'Maintenance schedules'
    ]
  },
  {
    id: 'private-individual' as const,
    title: 'Private Individual',
    subtitle: 'Homeowner or Property Owner',
    description: 'Simple, clear information about costs, savings, and benefits for your property',
    icon: Home,
    color: 'from-purple-500 to-pink-600',
    features: [
      'Cost savings & payback periods',
      'Energy bill reductions',
      'Simple installation timeline',
      'Easy maintenance overview'
    ]
  }
];

export default function UserRoleSelector({ selectedRole, onRoleSelect }: UserRoleSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(!selectedRole);

  if (selectedRole && !isExpanded) {
    const role = USER_ROLES.find(r => r.id === selectedRole);
    if (!role) return null;

    const Icon = role.icon;
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${role.color} flex items-center justify-center`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{role.title}</h3>
              <p className="text-sm text-gray-600">{role.subtitle}</p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(true)}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Change Role
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div className="text-center mb-6">
        <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to the Roof Impact Calculator</h2>
        <p className="text-gray-600">
          Let's personalize your experience. What best describes your role?
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {USER_ROLES.map((role) => {
          const Icon = role.icon;
          return (
            <button
              key={role.id}
              onClick={() => {
                onRoleSelect(role.id);
                setIsExpanded(false);
              }}
              className="group relative bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-gray-300 hover:shadow-lg transition-all duration-200 text-left"
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${role.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{role.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{role.subtitle}</p>
              <p className="text-sm text-gray-700 mb-4">{role.description}</p>
              
              <ul className="space-y-2 mb-4">
                {role.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Select this role</span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
            </button>
          );
        })}
      </div>

      {selectedRole && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsExpanded(false)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Continue with Selected Role
          </button>
        </div>
      )}
    </div>
  );
}