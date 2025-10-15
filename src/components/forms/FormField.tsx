
import React, { useId } from 'react';
import { motion } from 'framer-motion';
import { UseFormReturn, FieldPath, FieldValues } from 'react-hook-form';
import { animationVariants } from '../../utils/animations';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useFormAccessibility } from '../../hooks/useAccessibility';

interface FormFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select' | 'date' | 'time' | 'datetime-local';
  placeholder?: string;
  options?: { value: string; label: string }[];
  rows?: number;
  methods: UseFormReturn<T>;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  helpText?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

function FormField<T extends FieldValues>({
  name,
  label,
  type = 'text',
  placeholder,
  options,
  rows = 3,
  methods,
  required = false,
  disabled = false,
  className = '',
  helpText,
  onFocus,
  onBlur
}: FormFieldProps<T>) {
  const { register, formState: { errors } } = methods;
  const error = errors[name];
  const prefersReducedMotion = useReducedMotion();
  const { announceFormError } = useFormAccessibility();
  
  // Generate unique IDs for accessibility
  const fieldId = useId();
  const labelId = useId();
  const errorId = useId();
  const helpId = useId();

  // Announce errors to screen readers
  React.useEffect(() => {
    if (error?.message) {
      announceFormError(label, error.message as string);
    }
  }, [error, label, announceFormError]);

  const baseInputClasses = `
    w-full px-3 py-2 border rounded-lg transition-colors duration-200
    focus:ring-2 focus:ring-blue-500 focus:border-transparent
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    ${error 
      ? 'border-red-300 bg-red-50 focus:ring-red-500' 
      : 'border-gray-300 focus:border-blue-500'
    }
  `;

  // Build describedBy IDs
  const describedByIds = [];
  if (helpText) describedByIds.push(helpId);
  if (error) describedByIds.push(errorId);
  const describedBy = describedByIds.length > 0 ? describedByIds.join(' ') : undefined;

  const renderInput = () => {
    const commonProps = {
      ...register(name),
      id: fieldId,
      disabled,
      onFocus,
      onBlur,
      'aria-labelledby': labelId,
      'aria-describedby': describedBy,
      'aria-invalid': !!error,
      'aria-required': required
    };

    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            placeholder={placeholder}
            rows={rows}
            className={`${baseInputClasses} resize-none`}
          />
        );
      
      case 'select':
        return (
          <select
            {...commonProps}
            className={baseInputClasses}
          >
            <option value="">{placeholder || `Select ${label.toLowerCase()}`}</option>
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      default:
        return (
          <input
            {...commonProps}
            type={type}
            placeholder={placeholder}
            className={baseInputClasses}
          />
        );
    }
  };

  return (
    <motion.div
      className={`space-y-2 ${className}`}
      variants={prefersReducedMotion ? { hidden: {}, visible: {} } : animationVariants.fade}
      layout={!prefersReducedMotion}
    >
      <label 
        id={labelId}
        htmlFor={fieldId}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </label>
      
      <motion.div
        whileFocus={!prefersReducedMotion ? { scale: 1.01 } : undefined}
        transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
      >
        {renderInput()}
      </motion.div>
      
      {helpText && !error && (
        <motion.p
          id={helpId}
          className="text-sm text-gray-500"
          initial={prefersReducedMotion ? {} : { opacity: 0, height: 0 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, height: 'auto' }}
          exit={prefersReducedMotion ? {} : { opacity: 0, height: 0 }}
        >
          {helpText}
        </motion.p>
      )}
      
      {error && (
        <motion.div
          id={errorId}
          className="text-sm text-red-600 flex items-center space-x-1"
          initial={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
          role="alert"
          aria-live="polite"
        >
          <span aria-hidden="true">⚠️</span>
          <span>{error.message as string}</span>
        </motion.div>
      )}
    </motion.div>
  );
}

export default FormField;