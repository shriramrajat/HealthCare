// Animation variants for consistent animations across the app
export const animationVariants = {
  // Modal animations
  modal: {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: 20
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: { 
        type: "spring" as const, 
        damping: 25, 
        stiffness: 300,
        duration: 0.3
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      y: 20,
      transition: { duration: 0.2 }
    }
  },

  // Enhanced modal variants
  modalSlideUp: {
    hidden: { 
      opacity: 0, 
      y: 100,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        type: "spring" as const, 
        damping: 30, 
        stiffness: 400,
        duration: 0.4
      }
    },
    exit: { 
      opacity: 0, 
      y: 100,
      scale: 0.95,
      transition: { duration: 0.3, ease: "easeIn" as const }
    }
  },

  modalFadeScale: {
    hidden: { 
      opacity: 0, 
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring" as const, 
        damping: 20, 
        stiffness: 300,
        duration: 0.3
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9,
      transition: { duration: 0.2 }
    }
  },

  // Backdrop animations
  backdrop: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  },

  // Form animations
  form: {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.3, ease: "easeOut" as const }
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      transition: { duration: 0.2 }
    }
  },

  // Form field animations
  formField: {
    hidden: { opacity: 0, x: -10 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3, ease: "easeOut" as const }
    },
    focus: {
      scale: 1.02,
      transition: { duration: 0.2, ease: "easeOut" as const }
    },
    error: {
      x: [-5, 5, -5, 5, 0],
      transition: { duration: 0.4, ease: "easeInOut" as const }
    }
  },

  // Form validation animations
  formValidation: {
    success: {
      scale: [1, 1.05, 1],
      transition: { duration: 0.3, ease: "easeInOut" as const }
    },
    error: {
      x: [-10, 10, -10, 10, 0],
      transition: { duration: 0.5, ease: "easeInOut" as const }
    }
  },

  // Loading animations
  loading: {
    spin: {
      rotate: 360,
      transition: { duration: 1, repeat: Infinity, ease: "linear" as const }
    },
    pulse: {
      scale: [1, 1.1, 1],
      opacity: [0.7, 1, 0.7],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" as const }
    },
    dots: {
      y: [0, -10, 0],
      transition: { 
        duration: 0.6, 
        repeat: Infinity, 
        ease: "easeInOut" as const,
        repeatDelay: 0.2
      }
    }
  },

  // Button animations
  button: {
    hover: { 
      scale: 1.02,
      y: -1,
      transition: { 
        duration: 0.2, 
        ease: "easeInOut" as const,
        type: "spring" as const,
        stiffness: 400,
        damping: 25
      }
    },
    tap: { 
      scale: 0.98,
      y: 0,
      transition: { 
        duration: 0.1,
        type: "spring" as const,
        stiffness: 600,
        damping: 30
      }
    }
  },

  // Enhanced button variants
  buttonPrimary: {
    hover: {
      scale: 1.02,
      y: -2,
      boxShadow: "0 8px 25px rgba(59, 130, 246, 0.3)",
      transition: { duration: 0.2, ease: "easeOut" as const }
    },
    tap: {
      scale: 0.98,
      y: 0,
      transition: { duration: 0.1 }
    }
  },

  buttonSecondary: {
    hover: {
      scale: 1.02,
      y: -1,
      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.2, ease: "easeOut" as const }
    },
    tap: {
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  },

  // List item animations
  listItem: {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { 
        delay: i * 0.1, 
        duration: 0.3,
        ease: "easeOut" as const
      }
    }),
    exit: { 
      opacity: 0, 
      x: 20,
      transition: { duration: 0.2 }
    }
  },

  // Card animations
  card: {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" as const }
    },
    hover: {
      y: -4,
      scale: 1.02,
      boxShadow: "0 12px 30px rgba(0, 0, 0, 0.15)",
      transition: { 
        duration: 0.2,
        type: "spring" as const,
        stiffness: 300,
        damping: 25
      }
    }
  },

  // Enhanced card variants
  cardElevated: {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.4, 
        ease: "easeOut" as const,
        type: "spring" as const,
        stiffness: 300,
        damping: 25
      }
    },
    hover: {
      y: -6,
      scale: 1.03,
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
      transition: { duration: 0.3 }
    }
  },

  cardSubtle: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    },
    hover: {
      y: -2,
      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)",
      transition: { duration: 0.2 }
    }
  },

  // Fade animations
  fade: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  },

  // Slide animations
  slideUp: {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" as const }
    },
    exit: { 
      opacity: 0, 
      y: -30,
      transition: { duration: 0.3 }
    }
  },

  // Stagger container
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  }
};

// Transition presets
export const transitions = {
  spring: {
    type: "spring",
    damping: 25,
    stiffness: 300
  },
  smooth: {
    duration: 0.3,
    ease: "easeInOut"
  },
  quick: {
    duration: 0.2,
    ease: "easeOut"
  },
  slow: {
    duration: 0.5,
    ease: "easeInOut"
  }
};

// Animation utilities
export const createStaggeredAnimation = (delay = 0.1) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: delay,
      delayChildren: 0.1
    }
  }
});

export const createSlideAnimation = (direction: 'up' | 'down' | 'left' | 'right' = 'up') => {
  const directions = {
    up: { y: 30 },
    down: { y: -30 },
    left: { x: 30 },
    right: { x: -30 }
  };

  return {
    hidden: { opacity: 0, ...directions[direction] },
    visible: { 
      opacity: 1, 
      x: 0, 
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      ...directions[direction],
      transition: { duration: 0.2 }
    }
  };
};

// Button animation utilities
export const createButtonAnimation = (variant: 'primary' | 'secondary' | 'success' | 'danger' | 'outline' = 'primary') => {
  const shadowColors = {
    primary: 'rgba(59, 130, 246, 0.3)',
    secondary: 'rgba(107, 114, 128, 0.3)',
    success: 'rgba(34, 197, 94, 0.3)',
    danger: 'rgba(239, 68, 68, 0.3)',
    outline: 'rgba(0, 0, 0, 0.1)'
  };

  return {
    hover: {
      scale: 1.02,
      y: -2,
      boxShadow: `0 8px 25px ${shadowColors[variant]}`,
      transition: { duration: 0.2, ease: "easeOut" as const }
    },
    tap: {
      scale: 0.98,
      y: 0,
      transition: { duration: 0.1 }
    }
  };
};

// Ripple animation
export const rippleAnimation = {
  initial: { scale: 0, opacity: 0.3 },
  animate: { scale: 4, opacity: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

// Click feedback animation
export const clickFeedback = {
  scale: [1, 0.95, 1],
  transition: { duration: 0.15, ease: "easeInOut" }
};

// Micro-interaction animations
export const microInteractions = {
  // Magnetic hover effect
  magnetic: {
    hover: {
      scale: 1.05,
      transition: { 
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }
  },

  // Bounce effect
  bounce: {
    tap: {
      scale: [1, 0.9, 1.1, 1],
      transition: { 
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  },

  // Shake effect
  shake: {
    animate: {
      x: [-2, 2, -2, 2, 0],
      transition: { 
        duration: 0.4,
        ease: "easeInOut"
      }
    }
  },

  // Pulse effect
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      transition: { 
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },

  // Glow effect
  glow: {
    hover: {
      boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
      transition: { duration: 0.3 }
    }
  },

  // Float effect
  float: {
    animate: {
      y: [-5, 5, -5],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }
};

// Gesture animations
export const gestureAnimations = {
  swipeLeft: {
    x: [-100, 0],
    opacity: [0, 1],
    transition: { duration: 0.3, ease: "easeOut" }
  },
  
  swipeRight: {
    x: [100, 0],
    opacity: [0, 1],
    transition: { duration: 0.3, ease: "easeOut" }
  },
  
  swipeUp: {
    y: [100, 0],
    opacity: [0, 1],
    transition: { duration: 0.3, ease: "easeOut" }
  },
  
  swipeDown: {
    y: [-100, 0],
    opacity: [0, 1],
    transition: { duration: 0.3, ease: "easeOut" }
  }
};