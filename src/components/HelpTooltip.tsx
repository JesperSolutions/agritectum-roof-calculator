import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface HelpTooltipProps {
  content: string;
  iconColor?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function HelpTooltip({ content, iconColor = "text-gray-400", position = "left" }: HelpTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return '-top-2 left-1/2 transform -translate-x-1/2 -translate-y-full';
      case 'bottom':
        return '-bottom-2 left-1/2 transform -translate-x-1/2 translate-y-full';
      case 'right':
        return '-top-2 right-6 transform';
      case 'left':
      default:
        return '-top-2 left-6 transform';
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case 'top':
        return 'absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45';
      case 'bottom':
        return 'absolute bottom-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45';
      case 'right':
        return 'absolute -right-1 top-3 w-2 h-2 bg-gray-900 rotate-45';
      case 'left':
      default:
        return 'absolute -left-1 top-3 w-2 h-2 bg-gray-900 rotate-45';
    }
  };
  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className={`${iconColor} hover:text-gray-600 transition-colors focus:outline-none hover:scale-110 transform duration-200`}
        type="button"
        aria-label="Help information"
      >
        <HelpCircle className="w-4 h-4" />
      </button>
      
      {isVisible && (
        <div className={`absolute z-50 w-80 p-4 bg-gray-900 text-white text-sm rounded-lg shadow-xl ${getPositionClasses()}`}>
          <div className={getArrowClasses()}></div>
          <div className="leading-relaxed">{content}</div>
        </div>
      )}
    </div>
  );
}