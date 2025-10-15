import React, { useEffect, useState } from 'react';
import { motion, useTransform, useScroll } from 'framer-motion';

interface ParallaxScrollProps {
  children: React.ReactNode;
  speed?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

const ParallaxScroll: React.FC<ParallaxScrollProps> = ({
  children,
  speed = 0.5,
  direction = 'up',
  className = ''
}) => {
  const { scrollY } = useScroll();
  const [elementTop, setElementTop] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);

  useEffect(() => {
    const element = document.getElementById('parallax-element');
    if (element) {
      const onResize = () => {
        setElementTop(element.offsetTop);
        setClientHeight(window.innerHeight);
      };
      
      onResize();
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }
  }, []);

  const getTransform = () => {
    const start = elementTop - clientHeight;
    const end = elementTop + clientHeight;
    
    switch (direction) {
      case 'up':
        return useTransform(scrollY, [start, end], [0, -speed * 100]);
      case 'down':
        return useTransform(scrollY, [start, end], [0, speed * 100]);
      case 'left':
        return useTransform(scrollY, [start, end], [0, -speed * 100]);
      case 'right':
        return useTransform(scrollY, [start, end], [0, speed * 100]);
      default:
        return useTransform(scrollY, [start, end], [0, -speed * 100]);
    }
  };

  const transform = getTransform();

  const getMotionStyle = () => {
    if (direction === 'left' || direction === 'right') {
      return { x: transform };
    }
    return { y: transform };
  };

  return (
    <motion.div
      id="parallax-element"
      className={className}
      style={getMotionStyle()}
    >
      {children}
    </motion.div>
  );
};

export default ParallaxScroll;