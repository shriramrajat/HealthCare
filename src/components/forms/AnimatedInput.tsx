import { motion } from 'framer-motion';
import { UseFormReturn, FieldPath, FieldValues } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { animationVariants } from '../../utils/animations';

interface AnimatedInputProps<T extends FieldValues> {
  name: FieldPath<T>;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'time' | 'datetime-local';
  placeholder?: string;
  methods: UseFormReturn<T>;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  helpText?: string;
  icon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

function AnimatedInput<T extends FieldValues>({
  name,
  label,
  type = 'text',
  placeholder,
  methods,
  required = false,
  disabled = false,
  className = '',
  helpText,
  icon,
  showPasswordToggle = false
}: AnimatedInputProps<T>) {
  const { register, formState: { errors }, watch } = methods;
  const [showPassword, setShowPassword] = useState(false);
  const error = errors[name];
  const value = watch(name);
  const hasValue = value && value.toString().length > 0;

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <motion.div
      className={`relative ${className}`}
      variants={animationVariants.formField}
      initial="hidden"
      animate="visible"
      whileFocus="focus"
    >
      <div className="relative">
        {/* Floating Label */}
        <motion.label
          className={`absolute left-3 transition-all duration-200 pointer-events-none ${
            hasValue || type === 'date' || type === 'time' || type === 'datetime-local'
              ? 'top-2 text-xs text-gray-500'
              : 'top-1/2 -translate-y-1/2 text-gray-400'
          } ${error ? 'text-red-500' : ''}`}
          animate={{
            fontSize: hasValue || type === 'date' || type === 'time' || type === 'datetime-local' ? '0.75rem' : '1rem',
            y: hasValue || type === 'date' || type === 'time' || type === 'datetime-local' ? -8 : 0
          }}
          transition={{ duration: 0.2 }}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </motion.label>

        {/* Input Field */}
        <motion.div
          className="relative"
          whileFocus={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          
          <input
            {...register(name)}
            type={inputType}
            placeholder={hasValue ? '' : placeholder}
            disabled={disabled}
            className={`
              w-full px-3 py-4 pt-6 border rounded-lg transition-all duration-200
              focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
              ${icon ? 'pl-10' : ''}
              ${showPasswordToggle ? 'pr-10' : ''}
              ${error 
                ? 'border-red-300 bg-red-50 focus:ring-red-500' 
                : 'border-gray-300 focus:border-blue-500 hover:border-gray-400'
              }
            `}
          />

          {/* Password Toggle */}
          {showPasswordToggle && type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </motion.div>

        {/* Focus Ring Animation */}
        <motion.div
          className="absolute inset-0 rounded-lg border-2 border-blue-500 pointer-events-none"
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 0, scale: 1 }}
          whileFocus={{ opacity: 0.3, scale: 1.01 }}
          transition={{ duration: 0.2 }}
        />
      </div>

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
          variants={animationVariants.formValidation}
          initial={{ opacity: 0, y: -10 }}
          animate="error"
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

export default AnimatedInput;