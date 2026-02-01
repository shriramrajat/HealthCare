import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { firestoreService } from '../firebase/firestore';
import { Appointment } from '../types';

interface BookingFormModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const BookingFormModal: React.FC<BookingFormModalProps> = ({ onClose, onSuccess }) => {
    const { user } = useAuth();
    const { addNotification } = useNotifications();
    const [doctors, setDoctors] = useState<any[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [appointmentType, setAppointmentType] = useState<'in-person' | 'teleconsultation'>('in-person');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadDoctors = async () => {
            try {
                setError(null); // Reset error
                const doctorsList = await firestoreService.getDoctors();
                console.log('Doctors loaded:', doctorsList);
                setDoctors(doctorsList);
            } catch (error: any) {
                console.error('Error loading doctors:', error);
                // Set visible error message
                setError(error.message || 'Failed to load doctor list');
            }
        };
        loadDoctors();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id || !selectedDoctor || !selectedDate || !selectedTime) return;

        setLoading(true);
        try {
            const selectedDoctorData = doctors.find(doc => doc.id === selectedDoctor);

            const newAppointment: Omit<Appointment, 'id'> = {
                doctorId: selectedDoctor,
                patientId: user.id,
                doctorName: selectedDoctorData?.name || 'Unknown Doctor',
                patientName: user.name,
                date: selectedDate,
                time: selectedTime,
                type: appointmentType,
                status: 'pending',
                notes: notes.trim()
            };

            await firestoreService.addAppointment(newAppointment);

            addNotification({
                title: 'Appointment Requested',
                message: 'Your appointment request has been submitted for approval.',
                type: 'success'
            });

            onSuccess();
            onClose();

        } catch (error) {
            console.error('Error booking appointment:', error);
            addNotification({
                title: 'Booking Failed',
                message: 'Failed to book appointment. Please try again.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const timeSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Book New Appointment</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
                            {error}
                        </div>
                    )}

                    {/* Doctor Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Healthcare Provider
                        </label>
                        <select
                            value={selectedDoctor}
                            onChange={(e) => setSelectedDoctor(e.target.value)}
                            required
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Choose a provider...</option>
                            {doctors.length === 0 ? (
                                <option value="" disabled>No doctors found (Register a Doctor first)</option>
                            ) : (
                                doctors.map((doctor) => (
                                    <option key={doctor.id} value={doctor.id}>
                                        {doctor.name} {doctor.specialization ? `- ${doctor.specialization}` : ''}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>

                    {/* Date Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Appointment Date
                        </label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            required
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Time Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Appointment Time
                        </label>
                        <select
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                            required
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Select time...</option>
                            {timeSlots.map((time) => (
                                <option key={time} value={time}>
                                    {new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
                                        hour: 'numeric',
                                        minute: '2-digit',
                                        hour12: true
                                    })}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Appointment Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Appointment Type
                        </label>
                        <div className="flex space-x-4">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    value="in-person"
                                    checked={appointmentType === 'in-person'}
                                    onChange={(e) => setAppointmentType(e.target.value as 'in-person')}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <span className="ml-2 text-sm text-gray-700">In-Person</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    value="teleconsultation"
                                    checked={appointmentType === 'teleconsultation'}
                                    onChange={(e) => setAppointmentType(e.target.value as 'teleconsultation')}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <span className="ml-2 text-sm text-gray-700">Video Call</span>
                            </label>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notes (Optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any specific concerns or notes for the appointment..."
                            rows={3}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-4">
                        <button
                            type="submit"
                            disabled={loading || !selectedDoctor || !selectedDate || !selectedTime}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Booking...' : 'Book Appointment'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookingFormModal;
