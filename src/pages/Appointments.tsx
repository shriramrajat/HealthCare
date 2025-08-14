import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
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
  Search,
  Filter
} from 'lucide-react';

const Appointments: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [showBookingForm, setShowBookingForm] = useState(false);

  // Debug logging
  console.log('Appointments page loaded, user:', user);
  console.log('Current pathname:', window.location.pathname);

  useEffect(() => {
    // Mock data - Replace with actual API calls
    const mockAppointments: Appointment[] = [
      {
        id: '1',
        doctorId: '1',
        patientId: user?.id || '1',
        doctorName: 'Dr. Sarah Johnson',
        patientName: user?.name || 'John Doe',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        type: 'teleconsultation',
        status: 'confirmed',
        notes: 'Routine diabetes check-up'
      },
      {
        id: '2',
        doctorId: '2',
        patientId: user?.id || '1',
        doctorName: 'Dr. Michael Brown',
        patientName: user?.name || 'John Doe',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '14:30',
        type: 'in-person',
        status: 'completed',
        notes: 'Blood pressure management consultation'
      },
      {
        id: '3',
        doctorId: '1',
        patientId: user?.id || '1',
        doctorName: 'Dr. Sarah Johnson',
        patientName: user?.name || 'John Doe',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '11:00',
        type: 'teleconsultation',
        status: 'pending',
        notes: 'Follow-up on medication adjustments'
      }
    ];

    setAppointments(mockAppointments);
    addNotification({
      title: 'Appointments Loaded',
      message: 'Your appointments have been loaded successfully.',
      type: 'success'
    });
  }, [user, addNotification]);

  useEffect(() => {
    let filtered = appointments;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(apt =>
        apt.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
  }, [appointments, searchTerm, statusFilter, typeFilter]);

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
      {/* Test Message */}
      <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded">
        ✅ Appointments page loaded successfully! User: {user?.name} | Role: {user?.role}
      </div>
      
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
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Confirmed</p>
              <p className="text-xl font-semibold text-green-600">{stats.confirmed}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-xl font-semibold text-blue-600">{stats.completed}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <XCircle className="h-5 w-5 text-red-600" />
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
                placeholder="Search by doctor name or notes..."
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
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="in-person">In-Person</option>
              <option value="teleconsultation">Teleconsultation</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {filteredAppointments.length} Appointment{filteredAppointments.length !== 1 ? 's' : ''}
          </h2>
        </div>
        
        {filteredAppointments.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {appointment.doctorName}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(appointment.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>{appointment.time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {appointment.type === 'teleconsultation' ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                        <span className="text-sm text-gray-600">
                          {appointment.type === 'teleconsultation' ? 'Video Call' : 'Clinic Visit'}
                        </span>
                      </div>
                    </div>
                    
                    {appointment.notes && (
                      <p className="text-sm text-gray-600 mt-2">{appointment.notes}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3 ml-4">
                    {user?.role === 'doctor' && appointment.status === 'pending' && (
                      <button
                        onClick={() => handleConfirmAppointment(appointment.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        Confirm
                      </button>
                    )}
                    {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                      <button
                        onClick={() => handleCancelAppointment(appointment.id)}
                        className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'No appointments match your current filters.'
                : 'You haven\'t booked any appointments yet.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Simple Booking Form Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Book New Appointment</h2>
            <p className="text-gray-600 mb-6">
              This is a placeholder for the appointment booking form.
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