import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { firestoreService } from '../firebase/firestore';
import { Appointment } from '../types';
import { 
  Plus, 
  Calendar, 
  Clock, 
  User, 
  Video, 
  Phone, 
  MapPin, 
  CheckCircle, 
  XCircle,
  Clock3,
  AlertCircle,
  Search,
  Filter
} from 'lucide-react';

const Appointments: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Debug logging
  console.log('Appointments page loaded, user:', user);
  console.log('Current pathname:', window.location.pathname);

  useEffect(() => {
    const loadAppointments = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const userAppointments = await firestoreService.getAppointments(user.id, user.role);
        setAppointments(userAppointments);
      } catch (error) {
        console.error('Error loading appointments:', error);
        addNotification({
          title: 'Error Loading Appointments',
          message: 'Failed to load appointments. Please try again.',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, [user, addNotification]);

  useEffect(() => {
    let filtered = appointments;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(apt =>
        (user?.role === 'patient' ? apt.doctorName : apt.patientName)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        apt.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(apt => apt.type === typeFilter);
    }

    setFilteredAppointments(filtered);
  }, [appointments, searchTerm, statusFilter, typeFilter, user]);

  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      await firestoreService.updateAppointment(appointmentId, { status: 'confirmed' });
      
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: 'confirmed' as const }
            : apt
        )
      );
      
      addNotification({
        title: 'Appointment Confirmed',
        message: 'The appointment has been confirmed successfully.',
        type: 'success'
      });
    } catch (error) {
      console.error('Error confirming appointment:', error);
      addNotification({
        title: 'Error',
        message: 'Failed to confirm appointment. Please try again.',
        type: 'error'
      });
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      await firestoreService.updateAppointment(appointmentId, { status: 'cancelled' });
      
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: 'cancelled' as const }
            : apt
        )
      );
      
      addNotification({
        title: 'Appointment Cancelled',
        message: 'The appointment has been cancelled.',
        type: 'warning'
      });
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      addNotification({
        title: 'Error',
        message: 'Failed to cancel appointment. Please try again.',
        type: 'error'
      });
    }
  };

  const handleJoinCall = (appointmentId: string) => {
    addNotification({
      title: 'Joining Teleconsultation',
      message: 'Redirecting to video call...',
      type: 'info'
    });
  };

  const getStatusStats = () => {
    return {
      all: appointments.length,
      pending: appointments.filter(apt => apt.status === 'pending').length,
      confirmed: appointments.filter(apt => apt.status === 'confirmed').length,
      completed: appointments.filter(apt => apt.status === 'completed').length,
      cancelled: appointments.filter(apt => apt.status === 'cancelled').length,
    };
  };

  const stats = getStatusStats();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'patient' 
              ? 'Manage your medical appointments and consultations'
              : 'Manage your patient appointments and consultations'
            }
          </p>
        </div>
        
        {user?.role === 'patient' && (
          <button
            onClick={() => setShowBookingForm(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Book Appointment</span>
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-600" />
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-xl font-semibold text-gray-900">{stats.all}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-xl font-semibold text-yellow-600">{stats.pending}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <p className="text-sm text-gray-600">Confirmed</p>
              <p className="text-xl font-semibold text-green-600">{stats.confirmed}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-xl font-semibold text-blue-600">{stats.completed}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div>
              <p className="text-sm text-gray-600">Cancelled</p>
              <p className="text-xl font-semibold text-red-600">{stats.cancelled}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search by ${user?.role === 'patient' ? 'doctor name' : 'patient name'} or notes...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="in-person">In-Person</option>
            <option value="teleconsultation">Teleconsultation</option>
          </select>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-6">
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading appointments...</p>
          </div>
        ) : filteredAppointments.length > 0 ? (
          filteredAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              userRole={user?.role || 'patient'}
              onConfirm={user?.role === 'doctor' ? handleConfirmAppointment : undefined}
              onCancel={handleCancelAppointment}
              onJoinCall={handleJoinCall}
            />
          ))
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'No appointments match your current filters.'
                : user?.role === 'patient' 
                  ? 'You haven\'t booked any appointments yet.'
                  : 'No appointments scheduled yet.'
              }
            </p>
            {user?.role === 'patient' && !searchTerm && statusFilter === 'all' && typeFilter === 'all' && (
              <button
                onClick={() => setShowBookingForm(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Book Your First Appointment
              </button>
            )}
          </div>
        )}
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && <BookingFormModal />}
    </div>
  );
};

// BookingFormModal Component
const BookingFormModal: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentType, setAppointmentType] = useState<'in-person' | 'teleconsultation'>('in-person');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const doctorsList = await firestoreService.getDoctors();
        setDoctors(doctorsList);
      } catch (error) {
        console.error('Error loading doctors:', error);
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

      // Reset form and close modal
      setSelectedDoctor('');
      setSelectedDate('');
      setSelectedTime('');
      setAppointmentType('in-person');
      setNotes('');
      setShowBookingForm(false);
      
      // Reload appointments
      if (user?.id) {
        const userAppointments = await firestoreService.getAppointments(user.id, user.role);
        setAppointments(userAppointments);
      }
      
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
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} - {doctor.specialization}
                </option>
              ))}
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
              onClick={() => setShowBookingForm(false)}
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

// AppointmentCard Component
interface AppointmentCardProps {
  appointment: Appointment;
  userRole: 'patient' | 'doctor';
  onConfirm?: (id: string) => void;
  onCancel: (id: string) => void;
  onJoinCall: (id: string) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  userRole,
  onConfirm,
  onCancel,
  onJoinCall
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock3 className="h-5 w-5 text-yellow-600" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'completed':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const isUpcoming = () => {
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
    return appointmentDateTime > new Date() && appointment.status !== 'cancelled';
  };

  const canJoinCall = () => {
    if (appointment.type !== 'teleconsultation' || appointment.status !== 'confirmed') {
      return false;
    }
    
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
    const now = new Date();
    const timeDiff = appointmentDateTime.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    
    // Allow joining 15 minutes before and up to 60 minutes after
    return minutesDiff >= -60 && minutesDiff <= 15;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <User className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              {userRole === 'patient' ? appointment.doctorName : appointment.patientName}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">{formatDate(appointment.date)}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">{formatTime(appointment.time)}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {appointment.type === 'teleconsultation' ? (
                <Video className="h-4 w-4 text-gray-500" />
              ) : (
                <MapPin className="h-4 w-4 text-gray-500" />
              )}
              <span className="text-sm text-gray-600">
                {appointment.type === 'teleconsultation' ? 'Video Call' : 'In-Person'}
              </span>
            </div>
          </div>

          {appointment.notes && (
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Notes:</span> {appointment.notes}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 ml-4">
          {getStatusIcon(appointment.status)}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex space-x-2">
          {canJoinCall() && (
            <button
              onClick={() => onJoinCall(appointment.id)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Video className="h-4 w-4" />
              <span>Join Call</span>
            </button>
          )}
          
          {userRole === 'doctor' && appointment.status === 'pending' && onConfirm && (
            <button
              onClick={() => onConfirm(appointment.id)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Confirm</span>
            </button>
          )}
        </div>

        <div className="flex space-x-2">
          {isUpcoming() && appointment.status !== 'cancelled' && (
            <button
              onClick={() => onCancel(appointment.id)}
              className="flex items-center space-x-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <XCircle className="h-4 w-4" />
              <span>Cancel</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointments;