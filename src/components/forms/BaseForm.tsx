import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, FieldValues, UseFormReturn, DefaultValues } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { animationVariants } from '../../utils/animations';
import AnimatedButton from '../ui/AnimatedButton';
import LoadingAnimation from '../ui/LoadingAnimation';

interface BaseFormProps<T extends FieldValues> {
  onSubmit: (data: T) => Promise<void> | void;
  onCancel?: () => void;
  validationSchema?: yup.ObjectSchema<any>;
  defaultValues?: DefaultValues<T>;
  children: (methods: UseFormReturn<T>) => React.ReactNode;
  submitText?: string;
  cancelText?: string;
  isLoading?: boolean;
  loadingText?: string;
  showLoadingOverlay?: boolean;
  className?: string;
}

function BaseForm<T extends FieldValues>({
  onSubmit,
  onCancel,
  validationSchema,
  defaultValues,
  children,
  submitText = 'Submit',
  cancelText = 'Cancel',
  isLoading = false,
  loadingText = 'Submitting...',
  showLoadingOverlay = false,
  className = ''
}: BaseFormProps<T>) {
  const methods = useForm<T>({
    resolver: validationSchema ? yupResolver(validationSchema) : undefined,
    defaultValues,
    mode: 'onChange'
  });

  const { handleSubmit, formState: { isValid } } = methods;

  const handleFormSubmit = async (data: T) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <div className="relative">
      <motion.form
        className={`space-y-6 ${className} ${isLoading && showLoadingOverlay ? 'pointer-events-none' : ''}`}
        variants={animationVariants.form}
        initial="hidden"
        animate="visible"
        exit="exit"
        onSubmit={handleSubmit(handleFormSubmit)}
      >
        <motion.div
          className="space-y-4"
          variants={animationVariants.staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {children(methods)}
        </motion.div>

        <motion.div
          className="flex space-x-3 pt-4 border-t border-gray-200"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <AnimatedButton
            type="submit"
            variant="primary"
            isLoading={isLoading}
            disabled={!isValid || isLoading}
            className="flex-1"
          >
            {submitText}
          </AnimatedButton>
          
          {onCancel && (
            <AnimatedButton
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              {cancelText}
            </AnimatedButton>
          )}
        </motion.div>
      </motion.form>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && showLoadingOverlay && (
          <motion.div
            className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <LoadingAnimation type="spinner" size="lg" text={loadingText} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default BaseForm;