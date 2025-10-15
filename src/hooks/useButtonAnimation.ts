import { useState, useRef, useCallback } from 'react';

interface RippleEffect {
  id: number;
  x: number;
  y: number;
}

interface UseButtonAnimationOptions {
  enableRipple?: boolean;
  rippleDuration?: number;
}

export const useButtonAnimation = (options: UseButtonAnimationOptions = {}) => {
  const { enableRipple = true, rippleDuration = 600 } = options;
  const [ripples, setRipples] = useState<RippleEffect[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleIdRef = useRef(0);

  const createRipple = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (!enableRipple || !buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const newRipple: RippleEffect = {
      id: rippleIdRef.current++,
      x,
      y
    };
    
    setRipples(prev => [...prev, newRipple]);
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, rippleDuration);
  }, [enableRipple, rippleDuration]);

  const clearRipples = useCallback(() => {
    setRipples([]);
  }, []);

  return {
    buttonRef,
    ripples,
    createRipple,
    clearRipples
  };
};