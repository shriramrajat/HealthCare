import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import AppointmentCard from '../components/AppointmentCard';
import BookingFormModal from '../components/BookingFormModal';

const Appointments: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
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
    const appointment = appointments.find(a => a.id === appointmentId);
    addNotification({
      title: 'Joining Teleconsultation',
      message: 'Redirecting to video call...',
      type: 'info'
    });

    // Pass the appointment state here too
    navigate('/teleconsultation', { state: { appointment } });
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
      {showBookingForm && (
        <BookingFormModal
          onClose={() => setShowBookingForm(false)}
          onSuccess={() => {
            // Trigger a reload of appointments
            if (user?.id) {
              // We need to re-fetch. Since loadAppointments is inside useEffect, 
              // the cleanest way without heavy refactoring is to toggle a trigger or just duplicate the fetch 
              // call or move loadAppointments out.
              // Let's blindly refetch here for now:
              (async () => {
                try {
                  const userAppointments = await firestoreService.getAppointments(user.id, user.role);
                  setAppointments(userAppointments);
                } catch (e) { console.error(e); }
              })();
            }
          }}
        />
      )}
    </div>
  );
};  // End of Appointments component
export default Appointments;