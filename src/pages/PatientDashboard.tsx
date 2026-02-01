import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import HealthMetricCard from '../components/HealthMetricCard';
import AnimatedModal from '../components/ui/AnimatedModal';
import { HealthReadingForm, HealthReadingFormData } from '../components/forms/HealthReadingForm';
import TrendAnalysis from '../components/analytics/TrendAnalysis';
import HealthGoals from '../components/goals/HealthGoals';
import HealthScore from '../components/analytics/HealthScore';
import { HealthMetric, Medication, Appointment } from '../types';
import { firestoreService } from '../firebase/firestore';
import {
  Plus,
  TrendingUp,
  Calendar,
  Pill,
  Activity,
  Heart,
  AlertCircle,
  Clock,
  Target,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [recentMedications, setRecentMedications] = useState<Medication[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [showHealthReadingForm, setShowHealthReadingForm] = useState(false);
  const [isSubmittingReading, setIsSubmittingReading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'goals' | 'score'>('overview');

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id) return;

      try {
        // Load health metrics
        const metricsResult = await firestoreService.getHealthMetrics(user.id, { limit: 4 });
        setHealthMetrics(metricsResult.data);

        // Load medications
        const medicationsResult = await firestoreService.getMedications(user.id, { limit: 2 });
        setRecentMedications(medicationsResult.data);

        // Load appointments
        const appointments = await firestoreService.getAppointments(user.id, 'patient');
        const upcoming = appointments.filter(apt =>
          new Date(apt.date) >= new Date() && apt.status !== 'cancelled'
        );
        setUpcomingAppointments(upcoming.slice(0, 3)); // Show next 3

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
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        addNotification({
          title: 'Error Loading Data',
          message: 'Failed to load some dashboard information. Please try refreshing.',
          type: 'error'
        });
      }
    };

    loadDashboardData();
  }, [user, addNotification]);

  const calculateAdherenceRate = (medications: Medication[]) => {
    const totalDoses = medications.reduce((acc, med) => acc + med.adherence.length, 0);
    const takenDoses = medications.reduce((acc, med) =>
      acc + med.adherence.filter(taken => taken).length, 0
    );
    return totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;
  };

  const adherenceRate = calculateAdherenceRate(recentMedications);

  const latestBP = healthMetrics.find(m => m.type === 'blood_pressure');
  const isHighBP = React.useMemo(() => {
    if (!latestBP) return false;
    try {
      const parts = latestBP.value.split('/');
      if (parts.length !== 2) return false;
      const [sys, dia] = parts.map(Number);
      return sys > 130 || dia > 85;
    } catch (e) { return false; }
  }, [latestBP]);

  const handleAddHealthReading = async (data: HealthReadingFormData) => {
    if (!user?.id) return;

    setIsSubmittingReading(true);
    try {
      // Create health metric from form data
      const healthMetric: Omit<HealthMetric, 'id'> = {
        type: data.type as any,
        value: data.value,
        unit: data.unit,
        recordedAt: data.timestamp,
        notes: data.notes,
        userId: user.id
      };

      // Add to firestore
      const newMetricId = await firestoreService.addHealthMetric(healthMetric);

      // Update local state immediately
      const newMetric: HealthMetric = {
        id: newMetricId,
        ...healthMetric
      };

      setHealthMetrics(prev => [newMetric, ...prev.slice(0, 3)]); // Keep only latest 4

      // Close form and show success notification
      setShowHealthReadingForm(false);
      addNotification({
        title: 'Health Reading Added',
        message: `Your ${data.type.replace('_', ' ')} reading has been recorded successfully.`,
        type: 'success'
      });
    } catch (error) {
      console.error('Error adding health reading:', error);
      addNotification({
        title: 'Error Adding Reading',
        message: 'Failed to save your health reading. Please try again.',
        type: 'error'
      });
    } finally {
      setIsSubmittingReading(false);
    }
  };

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

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'trends', label: 'Trends & Insights', icon: TrendingUp },
              { id: 'goals', label: 'Health Goals', icon: Target },
              { id: 'score', label: 'Health Score', icon: BarChart3 }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-8">

              {/* Health Metrics */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Health Metrics</h2>
                  <button
                    onClick={() => setShowHealthReadingForm(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
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
                  {isHighBP && (
                    <div className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Blood Pressure Alert</p>
                        <p className="text-sm text-yellow-700">
                          Your latest blood pressure reading ({latestBP?.value}) is slightly elevated. Consider reducing salt intake and monitor closely.
                        </p>
                      </div>
                    </div>
                  )}

                  {recentMedications.length > 0 && (
                    <div className={`flex items-start space-x-3 p-4 rounded-lg border ${adherenceRate >= 80 ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
                      }`}>
                      <TrendingUp className={`h-5 w-5 mt-0.5 ${adherenceRate >= 80 ? 'text-green-600' : 'text-blue-600'
                        }`} />
                      <div>
                        <p className={`text-sm font-medium ${adherenceRate >= 80 ? 'text-green-800' : 'text-blue-800'
                          }`}>Medication Adherence</p>
                        <p className={`text-sm ${adherenceRate >= 80 ? 'text-green-700' : 'text-blue-700'
                          }`}>
                          {adherenceRate >= 80
                            ? `Great job maintaining ${adherenceRate}% medication adherence this week!`
                            : `Your adherence is ${adherenceRate}%. Try to stay consistent with your schedule.`}
                        </p>
                      </div>
                    </div>
                  )}

                  {!isHighBP && recentMedications.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-4">
                      No health insights available yet. Add health metrics to get personalized insights.
                    </p>
                  )}
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
          )}

          {activeTab === 'trends' && (
            <TrendAnalysis />
          )}

          {activeTab === 'goals' && (
            <HealthGoals />
          )}

          {activeTab === 'score' && (
            <HealthScore />
          )}
        </div>
      </div>

      {/* Health Reading Form Modal */}
      <AnimatedModal
        isOpen={showHealthReadingForm}
        onClose={() => setShowHealthReadingForm(false)}
        title="Add Health Reading"
      >
        <HealthReadingForm
          onSubmit={handleAddHealthReading}
          onCancel={() => setShowHealthReadingForm(false)}
          isLoading={isSubmittingReading}
        />
      </AnimatedModal>
    </div>
  );
};

export default PatientDashboard;