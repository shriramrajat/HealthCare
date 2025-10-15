import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Clock, Calendar, Pill, AlertCircle, Calculator } from 'lucide-react';
import BaseForm from './BaseForm';
import FormField from './FormField';
import AnimatedInput from './AnimatedInput';
import { medicationValidationSchema } from '../../hooks/useFormValidation';
import { Medication } from '../../types';
import { 
  searchMedications, 
  getDosageInformation, 
  checkDrugInteractions,
  getInteractionSeverityColor,
  getInteractionSeverityIcon,
  DrugInteraction,
  DosageCalculation
} from '../../utils/medicationUtils';

interface MedicationFormData {
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  reminders: string[];
  notes?: string;
}

interface MedicationFormProps {
  medication?: Medication;
  onSubmit: (data: MedicationFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  existingMedications?: Medication[];
}

const frequencyOptions = [
  { value: 'once_daily', label: 'Once daily' },
  { value: 'twice_daily', label: 'Twice daily' },
  { value: 'three_times_daily', label: 'Three times daily' },
  { value: 'four_times_daily', label: 'Four times daily' },
  { value: 'every_other_day', label: 'Every other day' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'as_needed', label: 'As needed' },
  { value: 'custom', label: 'Custom' }
];

const MedicationForm: React.FC<MedicationFormProps> = ({
  medication,
  onSubmit,
  onCancel,
  isLoading = false,
  existingMedications = []
}) => {
  const [showMedicationSuggestions, setShowMedicationSuggestions] = useState(false);
  const [medicationSearch, setMedicationSearch] = useState('');
  const [dosageInfo, setDosageInfo] = useState<DosageCalculation | null>(null);
  const [interactions, setInteractions] = useState<DrugInteraction[]>([]);
  const [showDosageCalculator, setShowDosageCalculator] = useState(false);

  const defaultValues: MedicationFormData = {
    name: medication?.name || '',
    dosage: medication?.dosage || '',
    frequency: medication?.frequency || '',
    startDate: medication?.startDate ? new Date(medication.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    endDate: medication?.endDate ? new Date(medication.endDate).toISOString().split('T')[0] : '',
    reminders: medication?.reminders || ['08:00'],
    notes: medication?.notes || ''
  };

  const handleFormSubmit = async (data: MedicationFormData) => {
    await onSubmit(data);
  };

  // Check for drug interactions when medication name changes
  useEffect(() => {
    if (medicationSearch) {
      const allMedications = [
        ...existingMedications.map(med => med.name),
        medicationSearch
      ].filter(name => name.trim() !== '');

      const foundInteractions = checkDrugInteractions(allMedications);
      setInteractions(foundInteractions);

      // Get dosage information
      const dosage = getDosageInformation(medicationSearch);
      setDosageInfo(dosage);
    } else {
      setInteractions([]);
      setDosageInfo(null);
    }
  }, [medicationSearch, existingMedications]);

  const addReminderTime = (methods: any) => {
    const currentReminders = methods.getValues('reminders') || [];
    methods.setValue('reminders', [...currentReminders, '12:00']);
  };

  const removeReminderTime = (methods: any, index: number) => {
    const currentReminders = methods.getValues('reminders') || [];
    const newReminders = currentReminders.filter((_: string, i: number) => i !== index);
    methods.setValue('reminders', newReminders);
  };

  const updateReminderTime = (methods: any, index: number, time: string) => {
    const currentReminders = methods.getValues('reminders') || [];
    const newReminders = [...currentReminders];
    newReminders[index] = time;
    methods.setValue('reminders', newReminders);
  };

  const filteredMedications = searchMedications(medicationSearch, 8);

  return (
    <BaseForm
      onSubmit={handleFormSubmit}
      onCancel={onCancel}
      validationSchema={medicationValidationSchema}
      defaultValues={defaultValues}
      submitText={medication ? 'Update Medication' : 'Add Medication'}
      isLoading={isLoading}
      className="max-w-2xl"
    >
      {(methods) => (
        <>
          {/* Medication Name with Autocomplete */}
          <div className="relative">
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <div className="relative">
                  <input
                    {...methods.register('name')}
                    type="text"
                    placeholder="Enter medication name"
                    value={medicationSearch}
                    onChange={(e) => {
                      const value = e.target.value;
                      setMedicationSearch(value);
                      methods.setValue('name', value);
                      setShowMedicationSuggestions(value.length > 0);
                    }}
                    onFocus={() => setShowMedicationSuggestions(medicationSearch.length > 0)}
                    onBlur={() => setTimeout(() => setShowMedicationSuggestions(false), 200)}
                    className="w-full pl-10 pr-3 py-4 pt-6 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Pill className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <label className="absolute left-10 top-2 text-xs text-gray-500">
                    Medication Name <span className="text-red-500">*</span>
                  </label>
                </div>
              </div>
              <motion.button
                type="button"
                onClick={() => setShowDosageCalculator(!showDosageCalculator)}
                className="mt-6 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Dosage Calculator"
              >
                <Calculator className="h-5 w-5" />
              </motion.button>
            </div>
            
            {/* Medication Suggestions */}
            <AnimatePresence>
              {showMedicationSuggestions && filteredMedications.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto"
                >
                  {filteredMedications.map((med, index) => (
                    <motion.button
                      key={med}
                      type="button"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => {
                        methods.setValue('name', med);
                        setShowMedicationSuggestions(false);
                        setMedicationSearch(med);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                    >
                      {med}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Drug Interaction Warnings */}
          <AnimatePresence>
            {interactions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <h4 className="text-sm font-medium text-gray-900 flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <span>Drug Interaction Warnings</span>
                </h4>
                
                {interactions.map((interaction, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border ${getInteractionSeverityColor(interaction.severity)}`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-lg">{getInteractionSeverityIcon(interaction.severity)}</span>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm uppercase tracking-wide">
                            {interaction.severity} Interaction
                          </span>
                        </div>
                        <p className="text-sm font-medium mb-1">
                          {interaction.drug1} + {interaction.drug2}
                        </p>
                        <p className="text-sm mb-2">{interaction.description}</p>
                        <p className="text-xs font-medium">
                          Recommendation: {interaction.recommendation}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dosage Calculator */}
          <AnimatePresence>
            {showDosageCalculator && dosageInfo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-green-50 border border-green-200 rounded-lg p-4"
              >
                <div className="flex items-center space-x-2 mb-3">
                  <Calculator className="h-4 w-4 text-green-600" />
                  <h4 className="text-sm font-medium text-green-800">Dosage Information</h4>
                </div>
                
                <div className="space-y-2 text-sm text-green-700">
                  <div>
                    <span className="font-medium">Recommended Dose:</span> {dosageInfo.recommendedDose}
                  </div>
                  <div>
                    <span className="font-medium">Maximum Daily Dose:</span> {dosageInfo.maxDailyDose}
                  </div>
                  <div>
                    <span className="font-medium">Frequency:</span> {dosageInfo.frequency}
                  </div>
                  
                  {dosageInfo.notes.length > 0 && (
                    <div className="mt-3">
                      <span className="font-medium">Important Notes:</span>
                      <ul className="mt-1 space-y-1">
                        {dosageInfo.notes.map((note, index) => (
                          <li key={index} className="flex items-start space-x-1">
                            <span>•</span>
                            <span>{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <motion.button
                  type="button"
                  onClick={() => {
                    if (dosageInfo.recommendedDose) {
                      methods.setValue('dosage', dosageInfo.recommendedDose);
                    }
                    if (dosageInfo.frequency) {
                      // Try to map frequency to our options
                      const frequencyMap: Record<string, string> = {
                        'once daily': 'once_daily',
                        'twice daily': 'twice_daily',
                        'three times daily': 'three_times_daily',
                        'four times daily': 'four_times_daily'
                      };
                      const mappedFreq = frequencyMap[dosageInfo.frequency.toLowerCase()];
                      if (mappedFreq) {
                        methods.setValue('frequency', mappedFreq);
                      }
                    }
                  }}
                  className="mt-3 px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Use Recommended Dosage
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dosage and Frequency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatedInput
              name="dosage"
              label="Dosage"
              type="text"
              placeholder="e.g., 10mg, 1 tablet"
              methods={methods}
              required
              helpText="Include strength and form"
            />

            <FormField
              name="frequency"
              label="Frequency"
              type="select"
              options={frequencyOptions}
              methods={methods}
              required
              helpText="How often to take this medication"
            />
          </div>

          {/* Start and End Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatedInput
              name="startDate"
              label="Start Date"
              type="date"
              methods={methods}
              required
              icon={<Calendar className="h-4 w-4" />}
            />

            <AnimatedInput
              name="endDate"
              label="End Date (Optional)"
              type="date"
              methods={methods}
              icon={<Calendar className="h-4 w-4" />}
              helpText="Leave empty for ongoing medication"
            />
          </div>

          {/* Reminder Times */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Reminder Times
                <span className="text-red-500 ml-1">*</span>
              </label>
              <motion.button
                type="button"
                onClick={() => addReminderTime(methods)}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="h-3 w-3" />
                <span>Add Time</span>
              </motion.button>
            </div>

            <AnimatePresence>
              {methods.watch('reminders')?.map((time: string, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center space-x-3"
                >
                  <div className="flex-1">
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => updateReminderTime(methods, index, e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  {methods.watch('reminders')?.length > 1 && (
                    <motion.button
                      type="button"
                      onClick={() => removeReminderTime(methods, index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Minus className="h-4 w-4" />
                    </motion.button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            <motion.p
              className="text-sm text-gray-500 flex items-center space-x-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <AlertCircle className="h-3 w-3" />
              <span>You'll receive notifications at these times</span>
            </motion.p>
          </div>

          {/* Notes */}
          <FormField
            name="notes"
            label="Notes (Optional)"
            type="textarea"
            placeholder="Additional notes about this medication..."
            rows={3}
            methods={methods}
            helpText="Include any special instructions or side effects to watch for"
          />

          {/* Medication Information Card */}
          <motion.div
            className="bg-blue-50 border border-blue-200 rounded-lg p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Important Reminders:</p>
                <ul className="space-y-1 text-blue-700">
                  <li>• Take medications as prescribed by your healthcare provider</li>
                  <li>• Set up reminders to maintain consistent timing</li>
                  <li>• Contact your doctor if you experience side effects</li>
                  <li>• Don't stop taking medication without consulting your doctor</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </BaseForm>
  );
};

export default MedicationForm;