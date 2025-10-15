import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { animationVariants } from '../../utils/animations';
import { animationPerformance } from '../../utils/performance';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useModalAccessibility } from '../../hooks/useAccessibility';
import AnimatedButton from './AnimatedButton';

interface AnimatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  animationType?: 'default' | 'slideUp' | 'fadeScale';
}

const AnimatedModal: React.FC<AnimatedModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  animationType = 'default'
}) => {
  const prefersReducedMotion = useReducedMotion();
  const modalRef = useModalAccessibility(isOpen);
  const optimizedSettings = animationPerformance.getOptimalSettings();
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const getModalVariants = () => {
    const baseVariants = (() => {
      switch (animationType) {
        case 'slideUp':
          return animationVariants.modalSlideUp;
        case 'fadeScale':
          return animationVariants.modalFadeScale;
        default:
          return animationVariants.modal;
      }
    })();

    return animationPerformance.createOptimizedVariants(baseVariants);
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        event.preventDefault();
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            variants={animationVariants.backdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleOverlayClick}
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            className={`relative bg-white rounded-xl shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden`}
            variants={getModalVariants()}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby="modal-content"
          >
            {/* Header */}
            <motion.div
              className="flex items-center justify-between p-6 border-b border-gray-200"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: prefersReducedMotion ? 0 : 0.1, duration: prefersReducedMotion ? 0.01 : 0.3 }}
            >
              <h2 id="modal-title" className="text-xl font-semibold text-gray-900">{title}</h2>
              {showCloseButton && (
                <AnimatedButton
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="p-2 border-none hover:bg-gray-100"
                  aria-label="Close dialog"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </AnimatedButton>
              )}
            </motion.div>

            {/* Content */}
            <motion.div
              id="modal-content"
              className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: prefersReducedMotion ? 0 : 0.2, duration: prefersReducedMotion ? 0.01 : 0.3 }}
            >
              {children}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnimatedModal;