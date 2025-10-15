import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { X, Activity, Heart, Droplets, Scale, Thermometer, TrendingUp, RefreshCw } from 'lucide-react';
import BaseForm from './BaseForm';
import FormField from './FormField';
import HistoricalDataComparison from './HistoricalDataComparison';
import { 
  getAvailableUnits, 
  getDefaultUnit, 
  formatHealthReading,
  getConversionSuggestion 
} from '../../utils/unitConversion';

interface HealthReadingFormProps {
  onSubmit: (data: HealthReadingFormData) => Promise<void>;
  onCancel: () => void;
  metricType?: string;
  isLoading?: boolean;
}

export interface HealthReadingFormData {
  type: string;
  value: string;
  unit: string;
  timestamp: string;
  notes?: string;
  context?: string;
}

interface MetricConfig {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  units: { value: string; label: string }[];
  placeholder: string;
  validation: (value: string) => string | null;
  formatValue: (value: string, unit: string) => string;
}

const metricConfigs: Record<string, MetricConfig> = {
  blood_pressure: {
    label: 'Blood Pressure',
    icon: Heart,
    units: getAvailableUnits('blood_pressure').map(unit => ({ value: unit, label: unit })),
    placeholder: 'e.g., 120/80',
    validation: (value: string) => {
      const bpRegex = /^\d{2,3}\/\d{2,3}$/;
      if (!bpRegex.test(value)) {
        return 'Please enter blood pressure in format: 120/80';
      }
      const [systolic, diastolic] = value.split('/').map(Number);
      if (systolic < 70 || systolic > 250 || diastolic < 40 || diastolic > 150) {
        return 'Please enter realistic blood pressure values';
      }
      return null;
    },
    formatValue: (value: string, unit: string) => formatHealthReading(value, unit, 'blood_pressure')
  },
  blood_sugar: {
    label: 'Blood Sugar',
    icon: Droplets,
    units: getAvailableUnits('blood_sugar').map(unit => ({ value: unit, label: unit })),
    placeholder: 'e.g., 100',
    validation: (value: string) => {
      const num = parseFloat(value);
      if (isNaN(num) || num <= 0) {
        return 'Please enter a valid blood sugar reading';
      }
      if (num < 20 || num > 600) {
        return 'Please enter a realistic blood sugar value';
      }
      return null;
    },
    formatValue: (value: string, unit: string) => formatHealthReading(parseFloat(value), unit, 'blood_sugar')
  },
  weight: {
    label: 'Weight',
    icon: Scale,
    units: getAvailableUnits('weight').map(unit => ({ value: unit, label: unit })),
    placeholder: 'e.g., 70',
    validation: (value: string) => {
      const num = parseFloat(value);
      if (isNaN(num) || num <= 0) {
        return 'Please enter a valid weight';
      }
      if (num < 20 || num > 500) {
        return 'Please enter a realistic weight value';
      }
      return null;
    },
    formatValue: (value: string, unit: string) => formatHealthReading(parseFloat(value), unit, 'weight')
  },
  heart_rate: {
    label: 'Heart Rate',
    icon: Activity,
    units: getAvailableUnits('heart_rate').map(unit => ({ value: unit, label: unit })),
    placeholder: 'e.g., 72',
    validation: (value: string) => {
      const num = parseInt(value);
      if (isNaN(num) || num <= 0) {
        return 'Please enter a valid heart rate';
      }
      if (num < 30 || num > 220) {
        return 'Please enter a realistic heart rate (30-220 bpm)';
      }
      return null;
    },
    formatValue: (value: string, unit: string) => formatHealthReading(parseInt(value), unit, 'heart_rate')
  },
  temperature: {
    label: 'Temperature',
    icon: Thermometer,
    units: getAvailableUnits('temperature').map(unit => ({ value: unit, label: unit })),
    placeholder: 'e.g., 36.5',
    validation: (value: string) => {
      const num = parseFloat(value);
      if (isNaN(num)) {
        return 'Please enter a valid temperature';
      }
      // Basic range check - will be more specific based on unit
      if (num < 30 || num > 110) {
        return 'Please enter a realistic temperature value';
      }
      return null;
    },
    formatValue: (value: string, unit: string) => formatHealthReading(parseFloat(value), unit, 'temperature')
  },
  steps: {
    label: 'Steps',
    icon: TrendingUp,
    units: getAvailableUnits('steps').map(unit => ({ value: unit, label: unit })),
    placeholder: 'e.g., 8000',
    validation: (value: string) => {
      const num = parseInt(value);
      if (isNaN(num) || num < 0) {
        return 'Please enter a valid step count';
      }
      if (num > 100000) {
        return 'Please enter a realistic step count';
      }
      return null;
    },
    formatValue: (value: string, unit: string) => formatHealthReading(parseInt(value), unit, 'steps')
  }
};

const contextOptions = [
  { value: '', label: 'No specific context' },
  { value: 'fasting', label: 'Fasting' },
  { value: 'before_meal', label: 'Before meal' },
  { value: 'after_meal', label: 'After meal (1-2 hours)' },
  { value: 'before_exercise', label: 'Before exercise' },
  { value: 'after_exercise', label: 'After exercise' },
  { value: 'morning', label: 'Morning' },
  { value: 'evening', label: 'Evening' },
  { value: 'bedtime', label: 'Bedtime' },
  { value: 'medication', label: 'After medication' }
];

// Quick entry presets for common values
const quickEntryPresets: Record<string, { values: string[]; ranges: { label: string; values: string[] }[] }> = {
  blood_pressure: {
    values: ['120/80', '110/70', '130/85', '140/90'],
    ranges: [
      { label: 'Normal', values: ['120/80', '118/78', '115/75'] },
      { label: 'Elevated', values: ['130/85', '135/88', '128/82'] },
      { label: 'High', values: ['140/90', '145/95', '150/100'] }
    ]
  },
  blood_sugar: {
    values: ['100', '120', '140', '180'],
    ranges: [
      { label: 'Normal', values: ['90', '95', '100', '105'] },
      { label: 'Pre-diabetic', values: ['110', '120', '125'] },
      { label: 'Diabetic', values: ['140', '160', '180', '200'] }
    ]
  },
  weight: {
    values: ['70', '75', '80', '85'],
    ranges: [
      { label: 'Light', values: ['50', '55', '60', '65'] },
      { label: 'Medium', values: ['70', '75', '80', '85'] },
      { label: 'Heavy', values: ['90', '95', '100', '105'] }
    ]
  },
  heart_rate: {
    values: ['60', '70', '80', '90'],
    ranges: [
      { label: 'Resting', values: ['60', '65', '70', '75'] },
      { label: 'Active', values: ['80', '90', '100', '110'] },
      { label: 'Exercise', values: ['120', '140', '160', '180'] }
    ]
  },
  temperature: {
    values: ['36.5', '37.0', '37.5', '38.0'],
    ranges: [
      { label: 'Normal', values: ['36.5', '36.8', '37.0'] },
      { label: 'Mild Fever', values: ['37.5', '38.0', '38.2'] },
      { label: 'High Fever', values: ['38.5', '39.0', '39.5'] }
    ]
  },
  steps: {
    values: ['5000', '8000', '10000', '12000'],
    ranges: [
      { label: 'Light Activity', values: ['3000', '5000', '7000'] },
      { label: 'Moderate Activity', values: ['8000', '10000', '12000'] },
      { label: 'High Activity', values: ['15000', '18000', '20000'] }
    ]
  }
};

// Validation schema
const healthReadingSchema: yup.ObjectSchema<HealthReadingFormData> = yup.object({
  type: yup.string().required('Metric type is required'),
  value: yup.string().required('Value is required'),
  unit: yup.string().required('Unit is required'),
  timestamp: yup.string().required('Date and time is required'),
  notes: yup.string().optional(),
  context: yup.string().optional()
});

export const HealthReadingForm: React.FC<HealthReadingFormProps> = ({
  onSubmit,
  onCancel,
  metricType = 'blood_pressure',
  isLoading = false
}) => {
  const [selectedType, setSelectedType] = useState(metricType);
  const [showQuickEntry, setShowQuickEntry] = useState(false);
  const [conversionSuggestion, setConversionSuggestion] = useState<string | null>(null);

  const methods = useForm<HealthReadingFormData>({
    resolver: yupResolver(healthReadingSchema),
    defaultValues: {
      type: metricType,
      value: '',
      unit: getDefaultUnit(metricType) || metricConfigs[metricType]?.units[0]?.value || '',
      timestamp: new Date().toISOString().slice(0, 16),
      notes: '',
      context: ''
    },
    mode: 'onChange'
  });

  const { watch, setValue } = methods;
  const watchedValue = watch('value');
  const watchedUnit = watch('unit');

  // Update form when type changes
  useEffect(() => {
    const config = metricConfigs[selectedType];
    if (config && config.units.length > 0) {
      const newUnit = getDefaultUnit(selectedType) || config.units[0].value;
      setValue('type', selectedType);
      setValue('unit', newUnit);
      setValue('value', ''); // Clear value when type changes
    }
    setShowQuickEntry(false);
  }, [selectedType, setValue]);

  // Update conversion suggestion when value or unit changes
  useEffect(() => {
    if (watchedValue && !isNaN(parseFloat(watchedValue))) {
      const suggestion = getConversionSuggestion(parseFloat(watchedValue), watchedUnit, selectedType);
      setConversionSuggestion(suggestion);
    } else {
      setConversionSuggestion(null);
    }
  }, [watchedValue, watchedUnit, selectedType]);



  const handleQuickEntry = (preset: string) => {
    setValue('value', preset);
    setShowQuickEntry(false);
  };

  const handleFormSubmit = async (formData: HealthReadingFormData) => {
    const config = metricConfigs[selectedType];
    const submissionData: HealthReadingFormData = {
      ...formData,
      value: config.formatValue(formData.value, formData.unit)
    };
    await onSubmit(submissionData);
  };

  const currentConfig = metricConfigs[selectedType];
  const Icon = currentConfig?.icon || Activity;
  const presets = quickEntryPresets[selectedType] || { values: [], ranges: [] };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Icon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Add Health Reading</h3>
            <p className="text-sm text-gray-600">Record your {currentConfig?.label.toLowerCase()}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      <BaseForm<HealthReadingFormData>
        onSubmit={handleFormSubmit}
        onCancel={onCancel}
        validationSchema={healthReadingSchema}
        defaultValues={{
          type: metricType,
          value: '',
          unit: getDefaultUnit(metricType) || metricConfigs[metricType]?.units[0]?.value || '',
          timestamp: new Date().toISOString().slice(0, 16),
          notes: '',
          context: ''
        }}
        submitText="Add Reading"
        isLoading={isLoading}
      >
        {(formMethods) => (
          <>
            {/* Metric Type Selection */}
            <FormField
              name="type"
              label="Metric Type"
              type="select"
              options={Object.entries(metricConfigs).map(([key, config]) => ({
                value: key,
                label: config.label
              }))}
              methods={formMethods}
              required
              onFocus={() => {
                const currentType = formMethods.watch('type');
                if (currentType !== selectedType) {
                  setSelectedType(currentType);
                }
              }}
            />

            {/* Value Input with Quick Entry */}
            <div className="space-y-3">
              <div className="flex space-x-2">
                <div className="flex-1">
                  <FormField
                    name="value"
                    label={`${currentConfig?.label} Reading`}
                    placeholder={currentConfig?.placeholder}
                    methods={formMethods}
                    required
                  />
                </div>
                <div className="w-24">
                  <FormField
                    name="unit"
                    label="Unit"
                    type="select"
                    options={currentConfig?.units || []}
                    methods={formMethods}
                    required
                  />
                </div>
              </div>
              
              {/* Unit Conversion Suggestion */}
              {conversionSuggestion && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2 text-sm text-gray-600 bg-blue-50 p-2 rounded-lg"
                >
                  <RefreshCw className="h-4 w-4 text-blue-500" />
                  <span>Also equals: <strong>{conversionSuggestion}</strong></span>
                </motion.div>
              )}
              
              {/* Quick Entry Buttons */}
              {presets.values.length > 0 && (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowQuickEntry(!showQuickEntry)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {showQuickEntry ? 'Hide' : 'Show'} quick entry
                  </button>
                  
                  {showQuickEntry && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="mt-3 space-y-3"
                    >
                      {/* Common Values */}
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-2">Common Values</p>
                        <div className="flex flex-wrap gap-2">
                          {presets.values.map((preset, index) => (
                            <motion.button
                              key={preset}
                              type="button"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.05 }}
                              onClick={() => handleQuickEntry(preset)}
                              className="px-3 py-1 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full transition-colors"
                            >
                              {preset}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Ranges */}
                      {presets.ranges.map((range, rangeIndex) => (
                        <motion.div
                          key={range.label}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + rangeIndex * 0.1 }}
                        >
                          <p className="text-xs font-medium text-gray-600 mb-2">{range.label}</p>
                          <div className="flex flex-wrap gap-2">
                            {range.values.map((value, valueIndex) => (
                              <motion.button
                                key={value}
                                type="button"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 + rangeIndex * 0.1 + valueIndex * 0.03 }}
                                onClick={() => handleQuickEntry(value)}
                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                              >
                                {value}
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* Timestamp */}
            <FormField
              name="timestamp"
              label="Date & Time"
              type="datetime-local"
              methods={formMethods}
              required
            />

            {/* Context Selection */}
            <FormField
              name="context"
              label="Context"
              type="select"
              options={contextOptions}
              placeholder="Select context (optional)"
              methods={formMethods}
            />

            {/* Notes */}
            <FormField
              name="notes"
              label="Notes"
              type="textarea"
              placeholder="Any additional notes about this reading..."
              rows={3}
              methods={formMethods}
            />

            {/* Historical Data Comparison */}
            <HistoricalDataComparison
              metricType={selectedType}
              currentValue={watchedValue}
              unit={watchedUnit}
            />
          </>
        )}
      </BaseForm>
    </div>
  );
};

export default HealthReadingForm;