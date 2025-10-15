import React from 'react';
import { motion, PanInfo } from 'framer-motion';

interface GestureInteractionProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  swipeThreshold?: number;
  className?: string;
  disabled?: boolean;
}

const GestureInteraction: React.FC<GestureInteractionProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onTap,
  onDoubleTap,
  onLongPress,
  swipeThreshold = 50,
  className = '',
  disabled = false
}) => {
  const handlePanEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled) return;

    const { offset, velocity } = info;
    const swipeConfidenceThreshold = 10000;
    const swipePower = (offset: number, velocity: number) => {
      return Math.abs(offset) * velocity;
    };

    // Horizontal swipes
    if (Math.abs(offset.x) > Math.abs(offset.y)) {
      if (swipePower(offset.x, velocity.x) > swipeConfidenceThreshold) {
        if (offset.x > swipeThreshold && onSwipeRight) {
          onSwipeRight();
        } else if (offset.x < -swipeThreshold && onSwipeLeft) {
          onSwipeLeft();
        }
      }
    }
    // Vertical swipes
    else {
      if (swipePower(offset.y, velocity.y) > swipeConfidenceThreshold) {
        if (offset.y > swipeThreshold && onSwipeDown) {
          onSwipeDown();
        } else if (offset.y < -swipeThreshold && onSwipeUp) {
          onSwipeUp();
        }
      }
    }
  };

  const handleTap = () => {
    if (disabled) return;
    if (onTap) onTap();
  };

  const handleDoubleTap = () => {
    if (disabled) return;
    if (onDoubleTap) onDoubleTap();
  };

  const handleLongPress = () => {
    if (disabled) return;
    if (onLongPress) onLongPress();
  };

  return (
    <motion.div
      className={className}
      drag={!disabled && (onSwipeLeft || onSwipeRight || onSwipeUp || onSwipeDown)}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.2}
      onPanEnd={handlePanEnd}
      onTap={handleTap}
      onTapStart={onDoubleTap ? undefined : handleTap}
      whileTap={{ scale: 0.98 }}
      whileDrag={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {children}
    </motion.div>
  );
};

export default GestureInteraction;