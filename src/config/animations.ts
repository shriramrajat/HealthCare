// Animation configuration for the healthcare app
export const animationConfig = {
  // Global animation settings
  global: {
    reducedMotion: false, // Can be set based on user preference
    defaultDuration: 0.3,
    defaultEasing: "easeOut" as const,
  },

  // Duration presets
  durations: {
    instant: 0,
    fast: 0.15,
    normal: 0.3,
    slow: 0.5,
    slower: 0.75,
  },

  // Easing presets
  easings: {
    linear: "linear" as const,
    easeIn: "easeIn" as const,
    easeOut: "easeOut" as const,
    easeInOut: "easeInOut" as const,
    backOut: [0.34, 1.56, 0.64, 1] as const,
    anticipate: [0.25, 0.1, 0.25, 1] as const,
  },

  // Spring configurations
  springs: {
    gentle: { type: "spring" as const, damping: 25, stiffness: 300 },
    wobbly: { type: "spring" as const, damping: 15, stiffness: 400 },
    stiff: { type: "spring" as const, damping: 30, stiffness: 500 },
    slow: { type: "spring" as const, damping: 20, stiffness: 200 },
  },

  // Stagger settings
  stagger: {
    fast: 0.05,
    normal: 0.1,
    slow: 0.2,
  },

  // Component-specific settings
  components: {
    modal: {
      backdrop: { duration: 0.2 },
      content: { duration: 0.3, spring: "gentle" },
    },
    form: {
      field: { duration: 0.2 },
      validation: { duration: 0.15 },
      submission: { duration: 0.3 },
    },
    button: {
      hover: { duration: 0.2, scale: 1.02 },
      tap: { duration: 0.1, scale: 0.98 },
    },
    card: {
      hover: { duration: 0.2, y: -2 },
      tap: { duration: 0.1, scale: 0.99 },
    },
    list: {
      stagger: 0.1,
      item: { duration: 0.3 },
    },
  },

  // Page transition settings
  pageTransitions: {
    duration: 0.4,
    ease: "easeInOut" as const,
    variants: {
      slideLeft: {
        initial: { x: "100%", opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: "-100%", opacity: 0 },
      },
      slideRight: {
        initial: { x: "-100%", opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: "100%", opacity: 0 },
      },
      fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      },
      slideUp: {
        initial: { y: "100%", opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: "-100%", opacity: 0 },
      },
    },
  },

  // Accessibility settings
  accessibility: {
    respectReducedMotion: true,
    fallbackDuration: 0.01, // Very fast for reduced motion
    fallbackEasing: "linear" as const,
  },
};

// Helper function to get animation settings based on user preferences
export const getAnimationSettings = (prefersReducedMotion: boolean = false) => {
  if (prefersReducedMotion && animationConfig.accessibility.respectReducedMotion) {
    return {
      ...animationConfig,
      global: {
        ...animationConfig.global,
        reducedMotion: true,
        defaultDuration: animationConfig.accessibility.fallbackDuration,
        defaultEasing: animationConfig.accessibility.fallbackEasing,
      },
    };
  }
  return animationConfig;
};

// Helper function to create consistent transition objects
export const createTransition = (
  duration?: number,
  easing?: keyof typeof animationConfig.easings,
  delay?: number
) => ({
  duration: duration || animationConfig.global.defaultDuration,
  ease: easing ? animationConfig.easings[easing] : animationConfig.global.defaultEasing,
  delay: delay || 0,
});

// Helper function for spring transitions
export const createSpringTransition = (
  springType: keyof typeof animationConfig.springs = "gentle",
  delay?: number
) => ({
  ...animationConfig.springs[springType],
  delay: delay || 0,
});

export default animationConfig;