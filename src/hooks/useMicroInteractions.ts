import { useState, useCallback } from 'react';

interface UseMicroInteractionsOptions {
  enableHaptics?: boolean;
  enableSounds?: boolean;
}

export const useMicroInteractions = (options: UseMicroInteractionsOptions = {}) => {
  const { enableHaptics = false, enableSounds = false } = options;
  const [isInteracting, setIsInteracting] = useState(false);

  // Haptic feedback (for mobile devices)
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!enableHaptics || !navigator.vibrate) return;
    
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30]
    };
    
    navigator.vibrate(patterns[type]);
  }, [enableHaptics]);

  // Sound feedback
  const triggerSound = useCallback((type: 'click' | 'success' | 'error' = 'click') => {
    if (!enableSounds) return;
    
    // Create audio context for sound generation
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    const frequencies = {
      click: 800,
      success: 1000,
      error: 400
    };
    
    oscillator.frequency.setValueAtTime(frequencies[type], audioContext.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  }, [enableSounds]);

  // Combined interaction feedback
  const triggerInteraction = useCallback((type: 'click' | 'success' | 'error' = 'click') => {
    setIsInteracting(true);
    triggerHaptic(type === 'error' ? 'heavy' : 'light');
    triggerSound(type);
    
    setTimeout(() => setIsInteracting(false), 150);
  }, [triggerHaptic, triggerSound]);

  // Animation states
  const getInteractionState = useCallback(() => ({
    isInteracting,
    scale: isInteracting ? 0.95 : 1,
    opacity: isInteracting ? 0.8 : 1
  }), [isInteracting]);

  return {
    triggerHaptic,
    triggerSound,
    triggerInteraction,
    getInteractionState,
    isInteracting
  };
};