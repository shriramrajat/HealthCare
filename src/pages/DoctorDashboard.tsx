import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import AppointmentCard from '../components/AppointmentCard';
import { Appointment, Review } from '../types';
import { 
  Users, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Star,
  AlertCircle,
  CheckCircle,
  Video
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
    averageRating: 0
  });

  useEffect(() => {
    // Mock data - Replace with actual API calls
    const mockAppointments: Appointment[] = [
      {
        id: '1',
        doctorId: user?.id || '1',
        patientId: '2',
        doctorName: user?.name || 'Dr. Sarah Johnson',
        patientName: 'John Doe',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        type: 'teleconsultation',
        status: 'confirmed',
        notes: 'Routine diabetes check-up'
      },
      {
        id: '2',
        doctorId: user?.id || '1',
        patientId: '3',
        doctorName: user?.name || 'Dr. Sarah Johnson',
        patientName: 'Jane Smith',
        date: new Date().toISOString().split('T')[0],
        time: '11:30',
        type: 'in-person',
        status: 'pending',
        notes: 'Blood pressure management consultation'
      },
      {
        id: '3',
        doctorId: user?.id || '1',
        patientId: '4',
        doctorName: user?.name || 'Dr. Sarah Johnson',
        patientName: 'Bob Wilson',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '14:00',
        type: 'teleconsultation',
        status: 'confirmed',
        notes: 'Follow-up on medication adjustments'
      }
    ];

    const mockReviews: Review[] = [
      {
        id: '1',
        doctorId: user?.id || '1',
        patientId: '2',
        doctorName: user?.name || 'Dr. Sarah Johnson',
        patientName: 'John Doe',
        rating: 5,
        comment: 'Excellent care and very attentive to my concerns.',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        doctorId: user?.id || '1',
        patientId: '3',
        doctorName: user?.name || 'Dr. Sarah Johnson',
        patientName: 'Jane Smith',
        rating: 4,
        comment: 'Very knowledgeable and helpful. Would recommend.',
        date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
      }
    ];

    setAppointments(mockAppointments);
    setReviews(mockReviews);

    // Calculate stats
    const todayAppointments = mockAppointments.filter(apt => 
      apt.date === new Date().toISOString().split('T')[0]
    ).length;
    
    const pendingAppointments = mockAppointments.filter(apt => 
      apt.status === 'pending'
    ).length;

    const averageRating = mockReviews.length > 0 
      ? mockReviews.reduce((acc, review) => acc + review.rating, 0) / mockReviews.length
      : 0;

    setStats({
      totalPatients: 124,
      todayAppointments,
      pendingAppointments,
      averageRating
    });

    // Welcome notification
    addNotification({
      title: 'Good morning, Doctor',
      message: `You have ${todayAppointments} appointments today.`,
      type: 'info'
    });
  }, [user, addNotification]);

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
    // In a real app, this would redirect to the video call interface
  };

  const todayAppointments = appointments.filter(apt => 
    apt.date === new Date().toISOString().split('T')[0]
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Good morning, {user?.name}!</h1>
        <p className="text-green-100 mb-6">Here's your practice overview for today</p>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-white" />
              <div>
                <p className="text-sm text-green-100">Total Patients</p>
                <p className="text-2xl font-bold">{stats.totalPatients}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <Calendar className="h-8 w-8 text-white" />
              <div>
                <p className="text-sm text-green-100">Today's Appointments</p>
                <p className="text-2xl font-bold">{stats.todayAppointments}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <Clock className="h-8 w-8 text-white" />
              <div>
                <p className="text-sm text-green-100">Pending Approvals</p>
                <p className="text-2xl font-bold">{stats.pendingAppointments}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <Star className="h-8 w-8 text-white" />
              <div>
                <p className="text-sm text-green-100">Average Rating</p>
                <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Today's Schedule</h2>
          <Link 
            to="/appointments" 
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            View All Appointments
          </Link>
        </div>
        
        {todayAppointments.length > 0 ? (
          <div className="space-y-4">
            {todayAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                userRole="doctor"
                onConfirm={handleConfirmAppointment}
                onCancel={handleCancelAppointment}
                onJoinCall={handleJoinCall}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No appointments scheduled for today</p>
          </div>
        )}
      </div>

      {/* Quick Stats & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Appointments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Pending Approvals</h3>
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm font-medium">
              {stats.pendingAppointments} pending
            </span>
          </div>
          
          {appointments.filter(apt => apt.status === 'pending').length > 0 ? (
            <div className="space-y-3">
              {appointments.filter(apt => apt.status === 'pending').slice(0, 3).map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{appointment.patientName}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleConfirmAppointment(appointment.id)}
                      className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="h-3 w-3 inline mr-1" />
                      Confirm
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">All appointments approved</p>
            </div>
          )}
        </div>

        {/* Recent Reviews */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Reviews</h3>
            <Link 
              to="/reviews" 
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              View All
            </Link>
          </div>
          
          <div className="space-y-4">
            {reviews.slice(0, 2).map((review) => (
              <div key={review.id} className="border-l-4 border-green-500 pl-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">by {review.patientName}</span>
                </div>
                <p className="text-sm text-gray-700 italic">"{review.comment}"</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(review.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Practice Insights */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Practice Insights</h3>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Patient Satisfaction</p>
              <p className="text-sm text-blue-700">
                Your average rating has improved by 0.2 points this month. Keep up the great work!
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <Calendar className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800">Appointment Efficiency</p>
              <p className="text-sm text-green-700">
                You've maintained 95% on-time appointment rate this week. Excellent time management!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          to="/appointments"
          className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
        >
          <Calendar className="h-8 w-8 text-green-600 group-hover:text-green-700 mb-2" />
          <span className="text-sm font-medium text-gray-900">Schedule</span>
        </Link>
        
        <Link
          to="/teleconsultation"
          className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
        >
          <Video className="h-8 w-8 text-blue-600 group-hover:text-blue-700 mb-2" />
          <span className="text-sm font-medium text-gray-900">Video Call</span>
        </Link>
        
        <button className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group">
          <Users className="h-8 w-8 text-purple-600 group-hover:text-purple-700 mb-2" />
          <span className="text-sm font-medium text-gray-900">Patients</span>
        </button>
        
        <button className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group">
          <AlertCircle className="h-8 w-8 text-red-600 group-hover:text-red-700 mb-2" />
          <span className="text-sm font-medium text-gray-900">Alerts</span>
        </button>
      </div>
    </div>
  );
};

export default DoctorDashboard;