import React from 'react';
import {
  Users,
  Calendar,
  Clock,
  Star,
  TrendingUp,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Video,
  Loader
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useDoctorDashboardData } from '../hooks/useDoctorDashboardData';
import { useNotifications } from '../contexts/NotificationContext';
import AppointmentCard from '../components/AppointmentCard';

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const {
    appointments,
    reviews,
    stats,
    loading,
    error,
    confirmAppointment,
    cancelAppointment,
    refresh
  } = useDoctorDashboardData();

  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      await confirmAppointment(appointmentId);
      addNotification({
        title: 'Appointment Confirmed',
        message: 'The appointment has been successfully confirmed.',
        type: 'success',
      });
    } catch (err) {
      addNotification({
        title: 'Error',
        message: 'Failed to confirm appointment.',
        type: 'error',
      });
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      await cancelAppointment(appointmentId);
      addNotification({
        title: 'Appointment Cancelled',
        message: 'The appointment has been cancelled.',
        type: 'info',
      });
    } catch (err) {
      addNotification({
        title: 'Error',
        message: 'Failed to cancel appointment.',
        type: 'error',
      });
    }
  };

  const handleJoinCall = (appointmentId: string) => {
    console.log('Joining call for appointment:', appointmentId);
    addNotification({
      title: 'Joining Call',
      message: 'Redirecting to secure video room...',
      type: 'info',
    });
    // Video implementation pending
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center text-red-700">
          <AlertCircle className="h-5 w-5 mr-2" />
          <p>{error}</p>
          <button onClick={refresh} className="ml-4 underline text-sm">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, Dr. {user?.name}</h1>
        <p className="text-gray-600">Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span>Active patients</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Today's Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.todayAppointments}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-1" />
            <span>Scheduled for today</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Requests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingAppointments}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Activity className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-yellow-600">
            <AlertCircle className="h-4 w-4 mr-1" />
            <span>Action required</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Star className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <span className="text-purple-600 font-medium">{reviews.length} reviews</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Appointments */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Upcoming Appointments</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View all
            </button>
          </div>

          <div className="space-y-4">
            {appointments.length > 0 ? (
              appointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  userRole="doctor"
                  onConfirm={handleConfirmAppointment}
                  onCancel={handleCancelAppointment}
                  onJoinCall={handleJoinCall}
                />
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No appointments scheduled</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Recent Reviews</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View all
            </button>
          </div>

          <div className="space-y-4">
            {reviews.length > 0 ? (
              reviews.slice(0, 5).map((review) => (
                <div key={review.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                        <Users className="h-4 w-4 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {review.anonymous ? 'Anonymous' : review.patientName}
                        </p>
                        <p className="text-xs text-gray-500">{new Date(review.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center bg-yellow-50 px-2 py-1 rounded text-xs">
                      <Star className="h-3 w-3 text-yellow-500 mr-1" />
                      <span className="font-medium text-yellow-700">{review.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3">{review.comment}</p>
                </div>
              ))
            ) : (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
                <Star className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No reviews yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;