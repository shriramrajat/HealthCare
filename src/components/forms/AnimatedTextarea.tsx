import { motion } from 'framer-motion';
import { UseFormReturn, FieldPath, FieldValues } from 'react-hook-form';
import { useState } from 'react';

interface AnimatedTextareaProps<T extends FieldValues> {
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  methods: UseFormReturn<T>;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  helpText?: string;
  rows?: number;
  maxLength?: number;
  showCharCount?: boolean;
}

function AnimatedTextarea<T extends FieldValues>({
  name,
  label,
  placeholder,
  methods,
  required = false,
  disabled = false,
  className = '',
  helpText,
  rows = 4,
  maxLength,
  showCharCount = false
}: AnimatedTextareaProps<T>) {
  const { register, formState: { errors }, watch } = methods;
  const [isFocused, setIsFocused] = useState(false);
  const error = errors[name];
  const value = watch(name) || '';
  const charCount = value.toString().length;

  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <motion.div
        className="relative"
        whileFocus={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <textarea
          {...register(name)}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          maxLength={maxLength}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full px-3 py-3 border rounded-lg transition-all duration-200 resize-none
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${error 
              ? 'border-red-300 bg-red-50 focus:ring-red-500' 
              : 'border-gray-300 focus:border-blue-500 hover:border-gray-400'
            }
          `}
        />

        {/* Focus Ring Animation */}
        <motion.div
          className="absolute inset-0 rounded-lg border-2 border-blue-500 pointer-events-none"
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ 
            opacity: isFocused ? 0.3 : 0, 
            scale: isFocused ? 1.01 : 1 
          }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>

      {/* Character Count */}
      {showCharCount && maxLength && (
        <motion.div
          className="flex justify-end mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className={`text-xs ${
            charCount > maxLength * 0.9 
              ? charCount >= maxLength 
                ? 'text-red-500' 
                : 'text-yellow-500'
              : 'text-gray-400'
          }`}>
            {charCount}/{maxLength}
          </span>
        </motion.div>
      )}

      {/* Help Text */}
      {helpText && !error && (
        <motion.p
          className="mt-2 text-sm text-gray-500"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          {helpText}
        </motion.p>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          className="mt-2 flex items-center space-x-1 text-sm text-red-600"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 500 }}
          >
            ⚠️
          </motion.span>
          <span>{error.message as string}</span>
        </motion.div>
      )}
    </motion.div>
  );
}

export default AnimatedTextarea;