import { useState, useEffect } from 'react';

/**
 * Hook to detect user's reduced motion preference
 * Respects the prefers-reduced-motion CSS media query
 */
export const useReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if the browser supports the media query
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      
      // Set initial value
      setPrefersReducedMotion(mediaQuery.matches);

      // Listen for changes
      const handleChange = (event: MediaQueryListEvent) => {
        setPrefersReducedMotion(event.matches);
      };

      // Add listener with modern method
      try {
        mediaQuery.addEventListener('change', handleChange);
      } catch (e) {
        // Fallback for very old browsers
        mediaQuery.addListener(handleChange);
      }

      // Cleanup
      return () => {
        try {
          mediaQuery.removeEventListener('change', handleChange);
        } catch (e) {
          // Fallback for very old browsers
          mediaQuery.removeListener(handleChange);
        }
      };
    }
  }, []);

  return prefersReducedMotion;
};

export default useReducedMotion;