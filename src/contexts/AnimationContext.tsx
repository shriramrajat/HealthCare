import React, { createContext, useContext, ReactNode } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { animationConfig, getAnimationSettings } from '../config/animations';

interface AnimationContextType {
  config: ReturnType<typeof getAnimationSettings>;
  prefersReducedMotion: boolean;
  isAnimationEnabled: boolean;
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

interface AnimationProviderProps {
  children: ReactNode;
  forceReducedMotion?: boolean;
}

export const AnimationProvider: React.FC<AnimationProviderProps> = ({
  children,
  forceReducedMotion = false
}) => {
  const systemPrefersReducedMotion = useReducedMotion();
  const prefersReducedMotion = forceReducedMotion || systemPrefersReducedMotion;
  const config = getAnimationSettings(prefersReducedMotion);
  const isAnimationEnabled = !prefersReducedMotion;

  const value: AnimationContextType = {
    config,
    prefersReducedMotion,
    isAnimationEnabled
  };

  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  );
};

export const useAnimation = (): AnimationContextType => {
  const context = useContext(AnimationContext);
  if (context === undefined) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
};

// Helper hook for getting animation variants with reduced motion support
export const useAnimationVariants = () => {
  const { isAnimationEnabled, config } = useAnimation();

  const getVariant = (variantName: keyof typeof animationConfig.components) => {
    if (!isAnimationEnabled) {
      // Return static variants for reduced motion
      return {
        hidden: { opacity: 1 },
        visible: { opacity: 1 },
        exit: { opacity: 1 }
      };
    }
    return config.components[variantName];
  };

  const getTransition = (duration?: number, easing?: string) => {
    if (!isAnimationEnabled) {
      return { duration: 0.01 };
    }
    return {
      duration: duration || config.global.defaultDuration,
      ease: easing || config.global.defaultEasing
    };
  };

  return {
    getVariant,
    getTransition,
    isAnimationEnabled
  };
};

export default AnimationContext;