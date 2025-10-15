import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { animationVariants } from '../../utils/animations';

interface AnimatedCardProps extends Omit<HTMLMotionProps<"div">, 'children'> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'flat';
  size?: 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  clickable?: boolean;
  animationType?: 'fade' | 'slide' | 'scale';
  className?: string;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  variant = 'default',
  size = 'md',
  hoverable = true,
  clickable = false,
  animationType = 'fade',
  className = '',
  ...props
}) => {
  const baseClasses = 'rounded-lg transition-all duration-200';
  
  const variantClasses = {
    default: 'bg-white shadow-sm border border-gray-200',
    elevated: 'bg-white shadow-lg border border-gray-100',
    outlined: 'bg-white border-2 border-gray-300',
    flat: 'bg-gray-50'
  };

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  const getAnimationVariant = () => {
    switch (animationType) {
      case 'slide':
        return animationVariants.slideUp;
      case 'scale':
        return animationVariants.modalFadeScale;
      default:
        return animationVariants.card;
    }
  };

  const hoverAnimation = hoverable ? animationVariants.card.hover : undefined;
  const tapAnimation = clickable ? { scale: 0.98 } : undefined;

  return (
    <motion.div
      className={combinedClasses}
      variants={getAnimationVariant()}
      initial="hidden"
      animate="visible"
      whileHover={hoverAnimation}
      whileTap={tapAnimation}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;