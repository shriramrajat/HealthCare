import React from 'react';
import { motion } from 'framer-motion';
import { animationVariants, createStaggeredAnimation } from '../../utils/animations';

interface AnimatedListProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  animationType?: 'fade' | 'slide' | 'scale';
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

const AnimatedList: React.FC<AnimatedListProps> = ({
  children,
  staggerDelay = 0.1,
  animationType = 'slide',
  direction = 'up',
  className = ''
}) => {
  const getItemVariants = () => {
    const baseVariant = {
      hidden: { opacity: 0 },
      visible: { opacity: 1 }
    };

    switch (animationType) {
      case 'slide':
        const slideOffset = 20;
        const slideDirection = {
          up: { y: slideOffset },
          down: { y: -slideOffset },
          left: { x: slideOffset },
          right: { x: -slideOffset }
        };
        
        return {
          hidden: { 
            opacity: 0, 
            ...slideDirection[direction]
          },
          visible: (i: number) => ({
            opacity: 1,
            x: 0,
            y: 0,
            transition: {
              delay: i * staggerDelay,
              duration: 0.4,
              ease: "easeOut"
            }
          })
        };

      case 'scale':
        return {
          hidden: { 
            opacity: 0, 
            scale: 0.8
          },
          visible: (i: number) => ({
            opacity: 1,
            scale: 1,
            transition: {
              delay: i * staggerDelay,
              duration: 0.4,
              type: "spring",
              stiffness: 300,
              damping: 25
            }
          })
        };

      default: // fade
        return {
          hidden: { opacity: 0 },
          visible: (i: number) => ({
            opacity: 1,
            transition: {
              delay: i * staggerDelay,
              duration: 0.3
            }
          })
        };
    }
  };

  const containerVariants = createStaggeredAnimation(staggerDelay);
  const itemVariants = getItemVariants();

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          custom={index}
          variants={itemVariants}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default AnimatedList;