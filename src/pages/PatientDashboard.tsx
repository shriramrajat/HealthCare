import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import HealthMetricCard from '../components/HealthMetricCard';
import { HealthMetric, Medication, Appointment } from '../types';
import { 
  Plus, 
  TrendingUp, 
  Calendar, 
  Pill, 
  Activity, 
  Heart,
  AlertCircle,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [recentMedications, setRecentMedications] = useState<Medication[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    // Mock data - Replace with actual API calls
    setHealthMetrics([
      {
        id: '1',
        type: 'blood_sugar',
        value: '120',
        unit: 'mg/dL',
        recordedAt: new Date().toISOString(),
        notes: 'Fasting glucose level'
      },
      {
        id: '2',
        type: 'blood_pressure',
        value: '130/85',
        unit: 'mmHg',
        recordedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        notes: 'Slightly elevated'
      },
      {
        id: '3',
        type: 'weight',
        value: '75.2',
        unit: 'kg',
        recordedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '4',
        type: 'heart_rate',
        value: '72',
        unit: 'bpm',
        recordedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      }
    ]);

    setRecentMedications([
      {
        id: '1',
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        startDate: '2024-01-01',
        reminders: ['08:00', '20:00'],
        adherence: [true, true, false, true],
        notes: 'Take with meals'
      },
      {
        id: '2',
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        startDate: '2024-01-15',
        reminders: ['08:00'],
        adherence: [true, true, true, true],
        notes: 'For blood pressure'
      }
    ]);

    setUpcomingAppointments([
      {
        id: '1',
        doctorId: '1',
        patientId: user?.id || '1',
        doctorName: 'Dr. Sarah Johnson',
        patientName: user?.name || '',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '14:30',
        type: 'teleconsultation',
        status: 'confirmed',
        notes: 'Routine follow-up for diabetes management'
      }
    ]);

    // Only show welcome notification once per session
    const hasShownWelcome = sessionStorage.getItem('hasShownWelcome');
    if (!hasShownWelcome) {
      addNotification({
        title: 'Welcome to your Dashboard',
        message: 'Track your health metrics and stay on top of your care.',
        type: 'info'
      });
      sessionStorage.setItem('hasShownWelcome', 'true');
    }
  }, [user, addNotification]);

  const calculateAdherenceRate = (medications: Medication[]) => {
    const totalDoses = medications.reduce((acc, med) => acc + med.adherence.length, 0);
    const takenDoses = medications.reduce((acc, med) => 
      acc + med.adherence.filter(taken => taken).length, 0
    );
    return totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;
  };

  const adherenceRate = calculateAdherenceRate(recentMedications);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-blue-100 mb-6">Here's your health overview for today</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <Heart className="h-8 w-8 text-white" />
              <div>
                <p className="text-sm text-blue-100">Health Score</p>
                <p className="text-2xl font-bold">Good</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <Pill className="h-8 w-8 text-white" />
              <div>
                <p className="text-sm text-blue-100">Medication Adherence</p>
                <p className="text-2xl font-bold">{adherenceRate}%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <Calendar className="h-8 w-8 text-white" />
              <div>
                <p className="text-sm text-blue-100">Next Appointment</p>
                <p className="text-2xl font-bold">
                  {upcomingAppointments.length > 0 ? 'Tomorrow' : 'None'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Health Metrics */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Health Metrics</h2>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" />
            <span>Add Reading</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {healthMetrics.map((metric, index) => (
            <HealthMetricCard 
              key={metric.id} 
              metric={metric} 
              trend={index % 3 === 0 ? 'up' : index % 3 === 1 ? 'down' : 'stable'}
            />
          ))}
        </div>
      </div>

      {/* Quick Actions & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Medication Reminders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Today's Medications</h3>
            <Link 
              to="/medications" 
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All
            </Link>
          </div>
          
          <div className="space-y-3">
            {recentMedications.map((medication) => (
              <div key={medication.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Pill className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{medication.name}</p>
                    <p className="text-sm text-gray-600">{medication.dosage}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    Next: {medication.reminders[0]}
                  </span>
                  {medication.adherence[medication.adherence.length - 1] ? (
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  ) : (
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h3>
            <Link 
              to="/appointments" 
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All
            </Link>
          </div>
          
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-3">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{appointment.doctorName}</h4>
                    <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      {appointment.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(appointment.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{appointment.time}</span>
                    </div>
                  </div>
                  {appointment.notes && (
                    <p className="text-sm text-gray-600 mt-2">{appointment.notes}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No upcoming appointments</p>
              <Link 
                to="/appointments" 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block"
              >
                Schedule an appointment
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Health Insights */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Insights</h3>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Blood Pressure Alert</p>
              <p className="text-sm text-yellow-700">
                Your blood pressure reading is slightly elevated. Consider reducing salt intake and monitor closely.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800">Medication Adherence</p>
              <p className="text-sm text-green-700">
                Great job maintaining {adherenceRate}% medication adherence this week!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          to="/symptoms"
          className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
        >
          <Activity className="h-8 w-8 text-blue-600 group-hover:text-blue-700 mb-2" />
          <span className="text-sm font-medium text-gray-900">Log Symptoms</span>
        </Link>
        
        <Link
          to="/teleconsultation"
          className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
        >
          <Calendar className="h-8 w-8 text-green-600 group-hover:text-green-700 mb-2" />
          <span className="text-sm font-medium text-gray-900">Start Consult</span>
        </Link>
        
        <Link
          to="/education"
          className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
        >
          <Plus className="h-8 w-8 text-purple-600 group-hover:text-purple-700 mb-2" />
          <span className="text-sm font-medium text-gray-900">Learn More</span>
        </Link>
        
        <button className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group">
          <Heart className="h-8 w-8 text-red-600 group-hover:text-red-700 mb-2" />
          <span className="text-sm font-medium text-gray-900">Emergency</span>
        </button>
      </div>
    </div>
  );
};

export default PatientDashboard;