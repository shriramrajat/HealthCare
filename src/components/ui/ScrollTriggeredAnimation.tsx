import React from 'react';
import { motion } from 'framer-motion';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

interface ScrollTriggeredAnimationProps {
  children: React.ReactNode;
  animationType?: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scale' | 'rotate';
  duration?: number;
  delay?: number;
  threshold?: number;
  triggerOnce?: boolean;
  className?: string;
}

const ScrollTriggeredAnimation: React.FC<ScrollTriggeredAnimationProps> = ({
  children,
  animationType = 'fadeIn',
  duration = 0.6,
  delay = 0,
  threshold = 0.1,
  triggerOnce = true,
  className = ''
}) => {
  const { ref, isInView } = useScrollAnimation({ threshold, triggerOnce });

  const getAnimationVariants = () => {
    const baseTransition = {
      duration,
      delay,
      ease: "easeOut" as const
    };

    switch (animationType) {
      case 'slideUp':
        return {
          hidden: { opacity: 0, y: 50 },
          visible: { opacity: 1, y: 0, transition: baseTransition }
        };

      case 'slideLeft':
        return {
          hidden: { opacity: 0, x: 50 },
          visible: { opacity: 1, x: 0, transition: baseTransition }
        };

      case 'slideRight':
        return {
          hidden: { opacity: 0, x: -50 },
          visible: { opacity: 1, x: 0, transition: baseTransition }
        };

      case 'scale':
        return {
          hidden: { opacity: 0, scale: 0.8 },
          visible: { 
            opacity: 1, 
            scale: 1, 
            transition: { 
              ...baseTransition,
              type: "spring" as const,
              stiffness: 300,
              damping: 25
            }
          }
        };

      case 'rotate':
        return {
          hidden: { opacity: 0, rotate: -10, scale: 0.9 },
          visible: { 
            opacity: 1, 
            rotate: 0, 
            scale: 1,
            transition: baseTransition
          }
        };

      default: // fadeIn
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: baseTransition }
        };
    }
  };

  const variants = getAnimationVariants();

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={variants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {children}
    </motion.div>
  );
};

export default ScrollTriggeredAnimation;