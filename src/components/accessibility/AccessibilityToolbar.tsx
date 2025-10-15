import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Eye, Type, Volume2, Keyboard, X } from 'lucide-react';
import { useAccessibility } from './AccessibilityProvider';
import AnimatedButton from '../ui/AnimatedButton';

interface AccessibilityToolbarProps {
  className?: string;
}

export const AccessibilityToolbar: React.FC<AccessibilityToolbarProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    highContrast, 
    fontSize, 
    prefersReducedMotion,
    setHighContrast, 
    setFontSize,
    announce 
  } = useAccessibility();

  const handleToggleToolbar = () => {
    setIsOpen(!isOpen);
    announce(isOpen ? 'Accessibility toolbar closed' : 'Accessibility toolbar opened');
  };

  const handleHighContrastToggle = () => {
    setHighContrast(!highContrast);
  };

  const handleFontSizeChange = (size: 'small' | 'medium' | 'large') => {
    setFontSize(size);
  };

  const handleKeyboardShortcuts = () => {
    announce('Keyboard shortcuts: Tab to navigate, Enter or Space to activate, Escape to close dialogs, Arrow keys to navigate lists');
  };

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      {/* Toggle Button */}
      <AnimatedButton
        onClick={handleToggleToolbar}
        variant="primary"
        size="sm"
        className="rounded-full p-3 shadow-lg"
        aria-label={isOpen ? 'Close accessibility toolbar' : 'Open accessibility toolbar'}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Settings className="h-5 w-5" />}
      </AnimatedButton>

      {/* Toolbar Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: prefersReducedMotion ? 0.01 : 0.2 }}
            className="absolute top-16 right-0 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80"
            role="dialog"
            aria-label="Accessibility settings"
          >
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Accessibility Settings
              </h3>

              {/* High Contrast Toggle */}
              <div className="flex items-center justify-between">
                <label htmlFor="high-contrast" className="text-sm font-medium text-gray-700">
                  High Contrast Mode
                </label>
                <button
                  id="high-contrast"
                  onClick={handleHighContrastToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    highContrast ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={highContrast}
                  aria-label="Toggle high contrast mode"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      highContrast ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Font Size Controls */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  <Type className="h-4 w-4 inline mr-1" />
                  Font Size
                </label>
                <div className="flex space-x-2" role="radiogroup" aria-label="Font size options">
                  {(['small', 'medium', 'large'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => handleFontSizeChange(size)}
                      className={`px-3 py-2 text-sm rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        fontSize === size
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                      role="radio"
                      aria-checked={fontSize === size}
                      aria-label={`Set font size to ${size}`}
                    >
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Motion Preference Display */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Reduced Motion
                </span>
                <span className={`text-sm px-2 py-1 rounded ${
                  prefersReducedMotion 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {prefersReducedMotion ? 'Enabled' : 'Disabled'}
                </span>
              </div>

              {/* Keyboard Shortcuts */}
              <div>
                <AnimatedButton
                  onClick={handleKeyboardShortcuts}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  aria-label="Announce keyboard shortcuts"
                >
                  <Keyboard className="h-4 w-4 mr-2" />
                  Keyboard Shortcuts
                </AnimatedButton>
              </div>

              {/* Screen Reader Info */}
              <div className="text-xs text-gray-500 border-t pt-3">
                <Volume2 className="h-4 w-4 inline mr-1" />
                Screen reader announcements are enabled. 
                Important changes will be announced automatically.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccessibilityToolbar;