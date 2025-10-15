import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { createButtonAnimation } from '../../utils/animations';
import { useButtonAnimation } from '../../hooks/useButtonAnimation';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { animationPerformance } from '../../utils/performance';

interface AnimatedButtonProps extends Omit<HTMLMotionProps<"button">, 'children'> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  enableRipple?: boolean;
  children: React.ReactNode;
}



const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  enableRipple = true,
  children,
  className = '',
  disabled,
  onClick,
  ...props
}) => {
  const { buttonRef, ripples, createRipple } = useButtonAnimation({ enableRipple });
  const prefersReducedMotion = useReducedMotion();
  const optimizedSettings = animationPerformance.getOptimalSettings();

  const baseClasses = 'relative inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden transform-gpu';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    outline: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !isLoading) {
      createRipple(event);
    }
    
    if (onClick) {
      onClick(event);
    }
  };

  // Get variant-specific animations with performance optimizations
  const buttonAnimations = createButtonAnimation(variant);
  const shouldAnimate = !disabled && !isLoading && !prefersReducedMotion && optimizedSettings.enableComplexAnimations;

  return (
    <motion.button
      ref={buttonRef}
      className={combinedClasses}
      whileHover={shouldAnimate ? buttonAnimations.hover : undefined}
      whileTap={shouldAnimate ? buttonAnimations.tap : undefined}
      disabled={disabled || isLoading}
      onClick={handleClick}
      aria-label={typeof children === 'string' ? children : undefined}
      aria-disabled={disabled || isLoading}
      {...props}
    >
      {/* Ripple effects */}
      {enableRipple && shouldAnimate && ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="absolute rounded-full bg-white opacity-30 pointer-events-none"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
          }}
          initial={{ scale: 0, opacity: 0.3 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          aria-hidden="true"
        />
      ))}
      
      {/* Button content */}
      <span className="relative z-10">
        {isLoading ? (
          <motion.div
            className="flex items-center space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <span>Loading...</span>
          </motion.div>
        ) : (
          children
        )}
      </span>
    </motion.button>
  );
};

export default AnimatedButton;