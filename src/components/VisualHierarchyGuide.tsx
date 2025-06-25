import React from 'react';
import { Type, Palette, Layout, Space as Spacing } from 'lucide-react';

export default function VisualHierarchyGuide() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">TUR Layout Design System</h1>
        <p className="text-gray-600">Space-efficient and visually appealing layout guidelines</p>
      </div>

      {/* Typography Hierarchy */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Type className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Typography Hierarchy</h2>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">H1 - Main Title (24px, Bold)</h1>
            <p className="text-sm text-gray-600">Used for primary page titles and main headings</p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">H2 - Section Header (20px, Semibold)</h2>
            <p className="text-sm text-gray-600">Used for major section divisions</p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">H3 - Subsection (18px, Medium)</h3>
            <p className="text-sm text-gray-600">Used for subsections and card titles</p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-base font-medium text-gray-900 mb-2">H4 - Component Title (16px, Medium)</h4>
            <p className="text-sm text-gray-600">Used for component headers and labels</p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700 mb-2">Body Text (14px, Regular)</p>
            <p className="text-xs text-gray-500">Caption/Helper Text (12px, Regular)</p>
          </div>
        </div>
      </section>

      {/* Color System */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Palette className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">Color System</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Primary Colors</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded"></div>
                <span className="text-sm">Blue 600 - Primary Actions</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-600 rounded"></div>
                <span className="text-sm">Green 600 - Success/Complete</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-600 rounded"></div>
                <span className="text-sm">Red 600 - Required/Error</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Background Colors</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-50 rounded border"></div>
                <span className="text-sm">Gray 50 - Light Background</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-50 rounded"></div>
                <span className="text-sm">Blue 50 - Info Background</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-50 rounded"></div>
                <span className="text-sm">Green 50 - Success Background</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Text Colors</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-900 rounded"></div>
                <span className="text-sm">Gray 900 - Primary Text</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-600 rounded"></div>
                <span className="text-sm">Gray 600 - Secondary Text</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-400 rounded"></div>
                <span className="text-sm">Gray 400 - Disabled Text</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spacing System */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Spacing className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-900">Spacing System (8px Grid)</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-2 h-8 bg-blue-200 mx-auto mb-2"></div>
            <span className="text-sm font-medium">8px</span>
            <p className="text-xs text-gray-500">Tight spacing</p>
          </div>
          <div className="text-center">
            <div className="w-4 h-8 bg-blue-300 mx-auto mb-2"></div>
            <span className="text-sm font-medium">16px</span>
            <p className="text-xs text-gray-500">Standard spacing</p>
          </div>
          <div className="text-center">
            <div className="w-6 h-8 bg-blue-400 mx-auto mb-2"></div>
            <span className="text-sm font-medium">24px</span>
            <p className="text-xs text-gray-500">Comfortable spacing</p>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 bg-blue-500 mx-auto mb-2"></div>
            <span className="text-sm font-medium">32px</span>
            <p className="text-xs text-gray-500">Section spacing</p>
          </div>
        </div>
      </section>

      {/* Layout Patterns */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Layout className="w-6 h-6 text-orange-600" />
          <h2 className="text-xl font-semibold text-gray-900">Layout Patterns</h2>
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Compact Header Pattern</h3>
            <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 bg-gray-300 rounded w-32"></div>
                <div className="h-4 bg-blue-300 rounded w-16"></div>
              </div>
              <div className="h-2 bg-gray-200 rounded w-full"></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Title + Progress indicator in minimal vertical space
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Grid Layout Pattern</h3>
            <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
              <div className="grid grid-cols-2 gap-3">
                <div className="h-16 bg-gray-300 rounded"></div>
                <div className="h-16 bg-gray-300 rounded"></div>
                <div className="h-16 bg-gray-300 rounded"></div>
                <div className="h-16 bg-gray-300 rounded"></div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              2-column responsive grid for content sections
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Horizontal Progress Pattern</h3>
            <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
              <div className="flex items-center justify-between space-x-4">
                <div className="w-6 h-6 bg-green-300 rounded-full"></div>
                <div className="flex-1 h-1 bg-gray-300 rounded"></div>
                <div className="w-6 h-6 bg-blue-300 rounded-full"></div>
                <div className="flex-1 h-1 bg-gray-200 rounded"></div>
                <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Horizontal step indicator for space efficiency
            </p>
          </div>
        </div>
      </section>

      {/* Implementation Guidelines */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Implementation Guidelines</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-3">✅ Do</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Use consistent 8px spacing grid</li>
              <li>• Maintain clear visual hierarchy</li>
              <li>• Group related content together</li>
              <li>• Use horizontal layouts for progress</li>
              <li>• Implement responsive breakpoints</li>
              <li>• Keep headers under 80px height</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-3">❌ Don't</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Use arbitrary spacing values</li>
              <li>• Stack too many elements vertically</li>
              <li>• Mix different progress patterns</li>
              <li>• Use more than 3 font weights</li>
              <li>• Create headers taller than 120px</li>
              <li>• Ignore mobile responsiveness</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}