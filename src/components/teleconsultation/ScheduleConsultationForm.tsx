import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, Video, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { firestoreService } from '../../firebase/firestore';
import { User as UserType } from '../../types';
import AnimatedButton from '../ui/AnimatedButton';
import AnimatedModal from '../ui/AnimatedModal';

interface ScheduleConsultationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduled?: (appointment: any) => void;
}

interface TimeSlot {
  time: string;
  available: boolean;
}



const ScheduleConsultationForm: React.FC<ScheduleConsultationFormProps> = ({
  isOpen,
  onClose,
  onScheduled
}) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  
  const [formData, setFormData] = useState({
    doctorId: '',
    date: '',
    time: '',
    type: 'teleconsultation' as 'teleconsultation' | 'in-person',
    notes: ''
  });
  
  const [doctors, setDoctors] = useState<UserType[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Generate time slots for a day (9 AM to 5 PM, 30-minute intervals)
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    for (let hour = 9; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({
          time,
          available: Math.random() > 0.3 // Simulate availability
        });
      }
    }
    return slots;
  };

  useEffect(() => {
    if (isOpen) {
      loadDoctors();
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.doctorId && formData.date) {
      loadAvailableSlots();
    }
  }, [formData.doctorId, formData.date]);

  const loadDoctors = async () => {
    try {
      const doctorsList = await firestoreService.getDoctors();
      setDoctors(doctorsList);
    } catch (error) {
      console.error('Error loading doctors:', error);
      addNotification({
        title: 'Error',
        message: 'Failed to load doctors list',
        type: 'error'
      });
    }
  };

  const loadAvailableSlots = async () => {
    setIsLoadingSlots(true);
    try {
      // Simulate API call to get doctor availability
      await new Promise(resolve => setTimeout(resolve, 500));
      const slots = generateTimeSlots();
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error loading available slots:', error);
      addNotification({
        title: 'Error',
        message: 'Failed to load available time slots',
        type: 'error'
      });
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.doctorId) {
      newErrors.doctorId = 'Please select a doctor';
    }
    if (!formData.date) {
      newErrors.date = 'Please select a date';
    }
    if (!formData.time) {
      newErrors.time = 'Please select a time slot';
    }

    // Check if selected date is in the future
    if (formData.date) {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.date = 'Please select a future date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const selectedDoctor = doctors.find(d => d.id === formData.doctorId);
      
      const appointmentData = {
        doctorId: formData.doctorId,
        patientId: user?.id || '',
        doctorName: selectedDoctor?.name || '',
        patientName: user?.name || '',
        date: formData.date,
        time: formData.time,
        type: formData.type,
        status: 'pending' as const,
        notes: formData.notes
      };

      const appointmentId = await firestoreService.addAppointment(appointmentData);
      
      addNotification({
        title: 'Appointment Scheduled',
        message: `Your ${formData.type} with ${selectedDoctor?.name} has been scheduled for ${formData.date} at ${formData.time}`,
        type: 'success'
      });

      onScheduled?.({ id: appointmentId, ...appointmentData });
      handleClose();
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      addNotification({
        title: 'Error',
        message: 'Failed to schedule appointment. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      doctorId: '',
      date: '',
      time: '',
      type: 'teleconsultation',
      notes: ''
    });
    setErrors({});
    setAvailableSlots([]);
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get maximum date (3 months from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <AnimatedModal isOpen={isOpen} onClose={handleClose} size="lg" title="Schedule Consultation">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Schedule Consultation</h2>
              <p className="text-sm text-gray-600">Book an appointment with a healthcare provider</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Doctor Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Select Doctor <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.doctorId}
              onChange={(e) => handleInputChange('doctorId', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.doctorId ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select a doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} {doctor.specialization && `- ${doctor.specialization}`}
                </option>
              ))}
            </select>
            {errors.doctorId && (
              <p className="text-sm text-red-600">{errors.doctorId}</p>
            )}
          </div>

          {/* Consultation Type */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Consultation Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                type="button"
                onClick={() => handleInputChange('type', 'teleconsultation')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  formData.type === 'teleconsultation'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Video className="h-6 w-6 mx-auto mb-2" />
                <div className="text-sm font-medium">Video Call</div>
                <div className="text-xs text-gray-500">Online consultation</div>
              </motion.button>
              
              <motion.button
                type="button"
                onClick={() => handleInputChange('type', 'in-person')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  formData.type === 'in-person'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <User className="h-6 w-6 mx-auto mb-2" />
                <div className="text-sm font-medium">In-Person</div>
                <div className="text-xs text-gray-500">Office visit</div>
              </motion.button>
            </div>
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Select Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              min={getMinDate()}
              max={getMaxDate()}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.date ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.date && (
              <p className="text-sm text-red-600">{errors.date}</p>
            )}
          </div>

          {/* Time Slot Selection */}
          {formData.doctorId && formData.date && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Available Time Slots <span className="text-red-500">*</span>
              </label>
              {isLoadingSlots ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading available slots...</span>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                  {availableSlots.map((slot) => (
                    <motion.button
                      key={slot.time}
                      type="button"
                      onClick={() => slot.available && handleInputChange('time', slot.time)}
                      disabled={!slot.available}
                      className={`p-3 text-sm rounded-lg border transition-all ${
                        formData.time === slot.time
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : slot.available
                          ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                          : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                      }`}
                      whileHover={slot.available ? { scale: 1.05 } : {}}
                      whileTap={slot.available ? { scale: 0.95 } : {}}
                    >
                      <Clock className="h-4 w-4 mx-auto mb-1" />
                      {slot.time}
                    </motion.button>
                  ))}
                </div>
              )}
              {errors.time && (
                <p className="text-sm text-red-600">{errors.time}</p>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Additional Notes
            </label>
            <p className="text-sm text-gray-600">Any specific concerns or information for the doctor</p>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Describe your symptoms, concerns, or any specific topics you'd like to discuss..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <AnimatedButton
              type="button"
              variant="secondary"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </AnimatedButton>
            <AnimatedButton
              type="submit"
              variant="primary"
              isLoading={isLoading}
              disabled={isLoading || !formData.doctorId || !formData.date || !formData.time}
              className="flex-1"
            >
              {isLoading ? 'Scheduling...' : 'Schedule Appointment'}
            </AnimatedButton>
          </div>
        </form>
      </div>
    </AnimatedModal>
  );
};

export default ScheduleConsultationForm;