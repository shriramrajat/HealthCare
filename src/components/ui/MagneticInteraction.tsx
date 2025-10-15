import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface MagneticInteractionProps {
  children: React.ReactNode;
  strength?: number;
  className?: string;
  disabled?: boolean;
}

const MagneticInteraction: React.FC<MagneticInteractionProps> = ({
  children,
  strength = 0.3,
  className = '',
  disabled = false
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (disabled || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;
    
    setPosition({ x: deltaX, y: deltaY });
  };

  const handleMouseLeave = () => {
    if (disabled) return;
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        x: position.x,
        y: position.y
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25,
        mass: 0.5
      }}
    >
      {children}
    </motion.div>
  );
};

export default MagneticInteraction;