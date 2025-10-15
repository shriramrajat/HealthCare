import React from 'react';
import AccessibilityProvider from './AccessibilityProvider';
import AccessibilityToolbar from './AccessibilityToolbar';
import AccessibilityAudit from './AccessibilityAudit';
import PerformanceMonitor from '../performance/PerformanceMonitor';

interface AccessibilityEnhancementsProps {
  children: React.ReactNode;
  showToolbar?: boolean;
  showAudit?: boolean;
  showPerformanceMonitor?: boolean;
}

/**
 * Comprehensive accessibility and performance enhancement wrapper
 * This component provides all accessibility features and performance monitoring
 */
export const AccessibilityEnhancements: React.FC<AccessibilityEnhancementsProps> = ({
  children,
  showToolbar = true,
  showAudit = process.env.NODE_ENV === 'development',
  showPerformanceMonitor = process.env.NODE_ENV === 'development'
}) => {
  return (
    <AccessibilityProvider>
      {children}
      
      {/* Skip Links */}
      <div className="sr-only focus:not-sr-only">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <a href="#navigation" className="skip-link">
          Skip to navigation
        </a>
      </div>

      {/* Accessibility Toolbar */}
      {showToolbar && <AccessibilityToolbar />}
      
      {/* Development Tools */}
      {showAudit && <AccessibilityAudit />}
      {showPerformanceMonitor && <PerformanceMonitor />}
    </AccessibilityProvider>
  );
};

export default AccessibilityEnhancements;