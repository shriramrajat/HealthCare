import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import AppointmentCard from '../components/AppointmentCard';
import { Appointment } from '../types';
import { Calendar, Plus, Filter, Search, Clock } from 'lucide-react';

const Appointments: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    // Mock data - Replace with actual API calls
    const mockAppointments: Appointment[] = [
      {
        id: '1',
        doctorId: user?.role === 'patient' ? '1' : user?.id || '1',
        patientId: user?.role === 'patient' ? user?.id || '2' : '2',
        doctorName: user?.role === 'patient' ? 'Dr. Sarah Johnson' : user?.name || 'Dr. Sarah Johnson',
        patientName: user?.role === 'patient' ? user?.name || 'John Doe' : 'John Doe',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        type: 'teleconsultation',
        status: 'confirmed',
        notes: 'Routine diabetes check-up'
      },
      {
        id: '2',
        doctorId: user?.role === 'patient' ? '2' : user?.id || '1',
        patientId: user?.role === 'patient' ? user?.id || '3' : '3',
        doctorName: user?.role === 'patient' ? 'Dr. Michael Brown' : user?.name || 'Dr. Sarah Johnson',
        patientName: user?.role === 'patient' ? user?.name || 'Jane Smith' : 'Jane Smith',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '14:30',
        type: 'in-person',
        status: 'completed',
        notes: 'Blood pressure management consultation'
      },
      {
        id: '3',
        doctorId: user?.role === 'patient' ? '1' : user?.id || '1',
        patientId: user?.role === 'patient' ? user?.id || '4' : '4',
        doctorName: user?.role === 'patient' ? 'Dr. Sarah Johnson' : user?.name || 'Dr. Sarah Johnson',
        patientName: user?.role === 'patient' ? user?.name || 'Bob Wilson' : 'Bob Wilson',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '11:00',
        type: 'teleconsultation',
        status: 'pending',
        notes: 'Follow-up on medication adjustments'
      },
      {
        id: '4',
        doctorId: user?.role === 'patient' ? '3' : user?.id || '1',
        patientId: user?.role === 'patient' ? user?.id || '5' : '5',
        doctorName: user?.role === 'patient' ? 'Dr. Emily Chen' : user?.name || 'Dr. Sarah Johnson',
        patientName: user?.role === 'patient' ? user?.name || 'Alice Cooper' : 'Alice Cooper',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '15:30',
        type: 'in-person',
        status: 'confirmed',
        notes: 'Regular check-up and lab results review'
      }
    ];

    setAppointments(mockAppointments);
  }, [user]);

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

  const handleConfirmAppointment = (appointmentId: string) => {
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
  };

  const handleCancelAppointment = (appointmentId: string) => {
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
        {filteredAppointments.length > 0 ? (
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

      {/* Booking Form Modal (Placeholder) */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Book New Appointment</h2>
            <p className="text-gray-600 mb-6">
              This is a placeholder for the appointment booking form. In a full implementation, 
              this would include doctor selection, date/time picker, and appointment type selection.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowBookingForm(false);
                  addNotification({
                    title: 'Appointment Requested',
                    message: 'Your appointment request has been submitted for approval.',
                    type: 'success'
                  });
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Submit Request
              </button>
              <button
                onClick={() => setShowBookingForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;