import React, { createContext, useContext, useEffect, useState } from 'react';
import { LiveRegionAnnouncer } from '../../utils/accessibility';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface AccessibilityContextType {
  announcer: LiveRegionAnnouncer;
  prefersReducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  setHighContrast: (enabled: boolean) => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [announcer] = useState(() => LiveRegionAnnouncer.getInstance());
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const prefersReducedMotion = useReducedMotion();

  // Load accessibility preferences from localStorage
  useEffect(() => {
    const savedHighContrast = localStorage.getItem('accessibility-high-contrast') === 'true';
    const savedFontSize = localStorage.getItem('accessibility-font-size') as 'small' | 'medium' | 'large' || 'medium';
    
    setHighContrast(savedHighContrast);
    setFontSize(savedFontSize);
  }, []);

  // Apply accessibility settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    // High contrast mode
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Font size
    root.classList.remove('font-small', 'font-medium', 'font-large');
    root.classList.add(`font-${fontSize}`);

    // Save preferences
    localStorage.setItem('accessibility-high-contrast', highContrast.toString());
    localStorage.setItem('accessibility-font-size', fontSize);
  }, [highContrast, fontSize]);

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    announcer.announce(message, priority);
  };

  const handleSetHighContrast = (enabled: boolean) => {
    setHighContrast(enabled);
    announce(enabled ? 'High contrast mode enabled' : 'High contrast mode disabled');
  };

  const handleSetFontSize = (size: 'small' | 'medium' | 'large') => {
    setFontSize(size);
    announce(`Font size changed to ${size}`);
  };

  const value: AccessibilityContextType = {
    announcer,
    prefersReducedMotion,
    highContrast,
    fontSize,
    announce,
    setHighContrast: handleSetHighContrast,
    setFontSize: handleSetFontSize
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

export default AccessibilityProvider;