import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as yup from 'yup';
import { Symptom } from '../../types';
import BaseForm from './BaseForm';
import FormField from './FormField';
import BodyDiagram from './BodyDiagram';
import PhotoAttachment from './PhotoAttachment';
import { Tag, Plus, X } from 'lucide-react';

interface SymptomFormData {
  name: string;
  severity: number;
  date: string;
  time: string;
  notes?: string;
  triggers: string[];
  duration?: number;
  location?: string;
  photos?: string[];
}

interface SymptomFormProps {
  onSubmit: (data: SymptomFormData) => Promise<void>;
  onCancel: () => void;
  selectedDate?: string;
  isLoading?: boolean;
  initialData?: Partial<Symptom>;
}

const validationSchema = yup.object({
  name: yup.string().required('Symptom name is required').min(2, 'Name must be at least 2 characters'),
  severity: yup.number().required('Severity is required').min(1, 'Minimum severity is 1').max(10, 'Maximum severity is 10'),
  date: yup.string().required('Date is required'),
  time: yup.string().required('Time is required'),
  notes: yup.string().max(500, 'Notes cannot exceed 500 characters'),
  duration: yup.number().min(0, 'Duration cannot be negative').max(1440, 'Duration cannot exceed 24 hours'),
  location: yup.string().max(100, 'Location cannot exceed 100 characters')
});

const commonSymptoms = [
  'Headache', 'Fatigue', 'Nausea', 'Dizziness', 'Chest pain', 
  'Shortness of breath', 'Fever', 'Cough', 'Joint pain', 'Back pain',
  'Stomach pain', 'Anxiety', 'Insomnia', 'Muscle cramps', 'Blurred vision'
];

const commonTriggers = [
  'Stress', 'Lack of sleep', 'Weather change', 'Exercise', 'Food',
  'Medication', 'Dehydration', 'Bright lights', 'Loud noises', 'Alcohol',
  'Caffeine', 'Hormonal changes', 'Allergies', 'Infection', 'Overexertion'
];

const SymptomForm: React.FC<SymptomFormProps> = ({
  onSubmit,
  onCancel,
  selectedDate,
  isLoading = false,
  initialData
}) => {
  const [customTrigger, setCustomTrigger] = useState('');
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>(initialData?.triggers || []);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(initialData?.location || '');
  const [attachedPhotos, setAttachedPhotos] = useState<string[]>(initialData?.photos || []);

  const defaultValues: Partial<SymptomFormData> = {
    name: initialData?.name || '',
    severity: initialData?.severity || 5,
    date: selectedDate || initialData?.date || new Date().toISOString().split('T')[0],
    time: initialData?.time || new Date().toTimeString().slice(0, 5),
    notes: initialData?.notes || '',
    triggers: selectedTriggers,
    duration: initialData?.duration || undefined,
    location: selectedLocation,
    photos: attachedPhotos
  };

  const handleSubmit = async (data: SymptomFormData) => {
    const formData = {
      ...data,
      triggers: selectedTriggers,
      location: selectedLocation,
      photos: attachedPhotos
    };
    await onSubmit(formData);
  };

  const addTrigger = (trigger: string) => {
    if (trigger && !selectedTriggers.includes(trigger)) {
      setSelectedTriggers([...selectedTriggers, trigger]);
    }
    setCustomTrigger('');
  };

  const removeTrigger = (trigger: string) => {
    setSelectedTriggers(selectedTriggers.filter(t => t !== trigger));
  };

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return 'bg-green-500';
    if (severity <= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getSeverityLabel = (severity: number) => {
    if (severity <= 3) return 'Mild';
    if (severity <= 6) return 'Moderate';
    return 'Severe';
  };

  return (
    <BaseForm
      onSubmit={handleSubmit}
      onCancel={onCancel}
      validationSchema={validationSchema}
      defaultValues={defaultValues}
      submitText="Log Symptom"
      cancelText="Cancel"
      isLoading={isLoading}
      className="max-w-2xl"
    >
      {(methods) => {
        const { watch, setValue } = methods;
        const currentSeverity = watch('severity') || 5;
        const currentName = watch('name') || '';

        return (
          <>
            {/* Symptom Name with Suggestions */}
            <div className="space-y-2">
              <FormField
                name="name"
                label="Symptom Name"
                placeholder="Enter symptom name or select from suggestions"
                methods={methods}
                required
                onFocus={() => setShowSuggestions(true)}
              />
              
              {showSuggestions && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 space-y-2"
                >
                  <p className="text-sm font-medium text-gray-700">Common symptoms:</p>
                  <div className="flex flex-wrap gap-2">
                    {commonSymptoms
                      .filter(symptom => 
                        symptom.toLowerCase().includes(currentName.toLowerCase()) ||
                        currentName === ''
                      )
                      .slice(0, 8)
                      .map((symptom) => (
                        <button
                          key={symptom}
                          type="button"
                          onClick={() => {
                            setValue('name', symptom);
                            setShowSuggestions(false);
                          }}
                          className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
                        >
                          {symptom}
                        </button>
                      ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSuggestions(false)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Hide suggestions
                  </button>
                </motion.div>
              )}
            </div>

            {/* Severity Slider */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Severity Level <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Mild</span>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getSeverityColor(currentSeverity)}`}>
                    {currentSeverity}/10 - {getSeverityLabel(currentSeverity)}
                  </div>
                  <span className="text-sm text-gray-500">Severe</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={currentSeverity}
                  onChange={(e) => setValue('severity', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #10b981 0%, #10b981 30%, #f59e0b 30%, #f59e0b 60%, #ef4444 60%, #ef4444 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-400">
                  {Array.from({ length: 10 }, (_, i) => (
                    <span key={i + 1}>{i + 1}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                name="date"
                label="Date"
                type="date"
                methods={methods}
                required
              />
              <FormField
                name="time"
                label="Time"
                type="time"
                methods={methods}
                required
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <FormField
                name="duration"
                label="Duration (minutes)"
                type="number"
                placeholder="How long did it last?"
                methods={methods}
                helpText="Optional: Enter duration in minutes"
              />
            </div>

            {/* Body Diagram Location */}
            <div className="space-y-4">
              <BodyDiagram
                selectedLocation={selectedLocation}
                onLocationSelect={setSelectedLocation}
              />
              
              {/* Manual location input as fallback */}
              <FormField
                name="location"
                label="Or specify location manually"
                placeholder="e.g., Left temple, Lower back, Chest"
                methods={methods}
                helpText="Optional: You can also type the location if not shown on the diagram"
              />
            </div>

            {/* Triggers */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                <Tag className="inline h-4 w-4 mr-1" />
                Possible Triggers
              </label>
              
              {/* Selected Triggers */}
              {selectedTriggers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedTriggers.map((trigger) => (
                    <motion.span
                      key={trigger}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {trigger}
                      <button
                        type="button"
                        onClick={() => removeTrigger(trigger)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </motion.span>
                  ))}
                </div>
              )}

              {/* Add Custom Trigger */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={customTrigger}
                  onChange={(e) => setCustomTrigger(e.target.value)}
                  placeholder="Add a trigger..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTrigger(customTrigger);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => addTrigger(customTrigger)}
                  disabled={!customTrigger.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Common Triggers */}
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Common triggers:</p>
                <div className="flex flex-wrap gap-2">
                  {commonTriggers
                    .filter(trigger => !selectedTriggers.includes(trigger))
                    .slice(0, 10)
                    .map((trigger) => (
                      <button
                        key={trigger}
                        type="button"
                        onClick={() => addTrigger(trigger)}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                      >
                        + {trigger}
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* Notes */}
            <FormField
              name="notes"
              label="Additional Notes"
              type="textarea"
              placeholder="Describe the symptom, what you were doing when it occurred, or any other relevant details..."
              rows={4}
              methods={methods}
              helpText="Optional: Add any additional details about this symptom"
            />

            {/* Photo Attachments */}
            <PhotoAttachment
              photos={attachedPhotos}
              onPhotosChange={setAttachedPhotos}
              maxPhotos={3}
            />
          </>
        );
      }}
    </BaseForm>
  );
};

export default SymptomForm;