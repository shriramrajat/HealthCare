import React from 'react';
import { motion } from 'framer-motion';
import { createStaggeredAnimation } from '../../utils/animations';

interface AnimatedGridProps {
  children: React.ReactNode[];
  columns?: number;
  gap?: number;
  staggerDelay?: number;
  animationType?: 'fade' | 'scale' | 'slideUp';
  className?: string;
}

const AnimatedGrid: React.FC<AnimatedGridProps> = ({
  children,
  columns = 3,
  gap = 4,
  staggerDelay = 0.1,
  animationType = 'slideUp',
  className = ''
}) => {
  const getItemVariants = () => {
    switch (animationType) {
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

      case 'slideUp':
        return {
          hidden: { 
            opacity: 0, 
            y: 30
          },
          visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
              delay: i * staggerDelay,
              duration: 0.4,
              ease: "easeOut"
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

  const gridClasses = `grid grid-cols-1 md:grid-cols-${Math.min(columns, 3)} lg:grid-cols-${columns} gap-${gap} ${className}`;

  return (
    <motion.div
      className={gridClasses}
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

export default AnimatedGrid;