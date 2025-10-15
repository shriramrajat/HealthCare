import React from 'react';
import { motion } from 'framer-motion';
import { animationVariants } from '../../utils/animations';

interface LoadingAnimationProps {
  type?: 'spinner' | 'dots' | 'pulse';
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  text?: string;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  type = 'spinner',
  size = 'md',
  color = 'primary',
  text
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const colorClasses = {
    primary: 'border-blue-600 border-t-transparent',
    secondary: 'border-gray-600 border-t-transparent',
    white: 'border-white border-t-transparent'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  if (type === 'spinner') {
    return (
      <div className="flex items-center space-x-2">
        <motion.div
          className={`border-2 rounded-full ${sizeClasses[size]} ${colorClasses[color]}`}
          variants={animationVariants.loading}
          animate="spin"
        />
        {text && (
          <motion.span
            className={`${textSizeClasses[size]} text-gray-600`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {text}
          </motion.span>
        )}
      </div>
    );
  }

  if (type === 'dots') {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={`${sizeClasses[size]} bg-blue-600 rounded-full`}
              variants={animationVariants.loading}
              animate="dots"
              transition={{ delay: i * 0.2 }}
            />
          ))}
        </div>
        {text && (
          <motion.span
            className={`${textSizeClasses[size]} text-gray-600`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {text}
          </motion.span>
        )}
      </div>
    );
  }

  if (type === 'pulse') {
    return (
      <div className="flex items-center space-x-2">
        <motion.div
          className={`${sizeClasses[size]} bg-blue-600 rounded-full`}
          variants={animationVariants.loading}
          animate="pulse"
        />
        {text && (
          <motion.span
            className={`${textSizeClasses[size]} text-gray-600`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {text}
          </motion.span>
        )}
      </div>
    );
  }

  return null;
};

export default LoadingAnimation;