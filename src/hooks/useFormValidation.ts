import { useCallback } from 'react';
import * as yup from 'yup';

// Common validation schemas
export const commonValidationSchemas = {
  email: yup.string().email('Please enter a valid email address').required('Email is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  name: yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
  phone: yup.string().matches(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number'),
  required: (fieldName: string) => yup.string().required(`${fieldName} is required`),
  number: (min?: number, max?: number) => {
    let schema = yup.number().typeError('Must be a valid number');
    if (min !== undefined) schema = schema.min(min, `Must be at least ${min}`);
    if (max !== undefined) schema = schema.max(max, `Must be at most ${max}`);
    return schema;
  },
  date: yup.date().typeError('Please enter a valid date').required('Date is required'),
  time: yup.string().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time (HH:MM)'),
};

// Medication validation schema
export const medicationValidationSchema = yup.object({
  name: commonValidationSchemas.required('Medication name'),
  dosage: commonValidationSchemas.required('Dosage'),
  frequency: commonValidationSchemas.required('Frequency'),
  startDate: commonValidationSchemas.date,
  endDate: yup.date().min(yup.ref('startDate'), 'End date must be after start date').nullable(),
  reminders: yup.array().of(commonValidationSchemas.time.required('Reminder time is required')),
  notes: yup.string().max(500, 'Notes must be less than 500 characters')
});

// Symptom validation schema
export const symptomValidationSchema = yup.object({
  name: commonValidationSchemas.required('Symptom name'),
  severity: commonValidationSchemas.number(1, 10).required('Severity is required'),
  date: commonValidationSchemas.date,
  time: commonValidationSchemas.time.required('Time is required'),
  notes: yup.string().max(500, 'Notes must be less than 500 characters'),
  triggers: yup.array().of(yup.string()),
  duration: commonValidationSchemas.number(0, 1440), // max 24 hours in minutes
  location: yup.string()
});

// Health reading validation schema
export const healthReadingValidationSchema = yup.object({
  type: yup.string().oneOf(['blood_pressure', 'blood_sugar', 'weight', 'heart_rate', 'temperature']).required('Type is required'),
  value: yup.mixed().when('type', {
    is: 'blood_pressure',
    then: () => yup.object({
      systolic: commonValidationSchemas.number(70, 250).required('Systolic pressure is required'),
      diastolic: commonValidationSchemas.number(40, 150).required('Diastolic pressure is required')
    }),
    otherwise: () => commonValidationSchemas.number(0, 1000).required('Value is required')
  }),
  unit: commonValidationSchemas.required('Unit'),
  timestamp: commonValidationSchemas.date,
  notes: yup.string().max(200, 'Notes must be less than 200 characters'),
  context: yup.string()
});

// Review validation schema
export const reviewValidationSchema = yup.object({
  doctorId: commonValidationSchemas.required('Doctor selection'),
  rating: commonValidationSchemas.number(1, 5).required('Overall rating is required'),
  comment: yup.string().min(10, 'Comment must be at least 10 characters').max(1000, 'Comment must be less than 1000 characters').required('Comment is required'),
  categories: yup.object({
    communication: commonValidationSchemas.number(1, 5).required(),
    expertise: commonValidationSchemas.number(1, 5).required(),
    punctuality: commonValidationSchemas.number(1, 5).required(),
    overall: commonValidationSchemas.number(1, 5).required()
  })
});

// Consultation validation schema
export const consultationValidationSchema = yup.object({
  doctorId: commonValidationSchemas.required('Doctor selection'),
  date: commonValidationSchemas.date,
  time: commonValidationSchemas.time.required('Time is required'),
  duration: commonValidationSchemas.number(15, 120).required('Duration is required'),
  type: yup.string().oneOf(['video', 'audio', 'chat']).required('Consultation type is required'),
  reason: yup.string().min(10, 'Reason must be at least 10 characters').max(500, 'Reason must be less than 500 characters').required('Reason is required')
});

// Custom validation hook
export const useFormValidation = () => {
  const validateField = useCallback(async (schema: yup.Schema, value: any, fieldName: string) => {
    try {
      await schema.validateAt(fieldName, { [fieldName]: value });
      return null;
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        return error.message;
      }
      return 'Validation error';
    }
  }, []);

  const validateForm = useCallback(async (schema: yup.Schema, data: any) => {
    try {
      await schema.validate(data, { abortEarly: false });
      return { isValid: true, errors: {} };
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const errors: Record<string, string> = {};
        error.inner.forEach((err) => {
          if (err.path) {
            errors[err.path] = err.message;
          }
        });
        return { isValid: false, errors };
      }
      return { isValid: false, errors: { general: 'Validation failed' } };
    }
  }, []);

  return {
    validateField,
    validateForm,
    schemas: {
      medication: medicationValidationSchema,
      symptom: symptomValidationSchema,
      healthReading: healthReadingValidationSchema,
      review: reviewValidationSchema,
      consultation: consultationValidationSchema
    }
  };
};

export default useFormValidation;