import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import Welcome from './pages/Welcome';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AnimationProvider } from './contexts/AnimationContext';
import { PageLoadingFallback } from './components/LoadingFallback';
import ErrorBoundary from './components/ErrorBoundary';
import OfflineIndicator from './components/ui/OfflineIndicator';
import { offlineQueueService } from './services/offlineQueue';
import firestoreService from './firebase/firestoreWithPerformance';
import { usePerformanceMonitoring } from './hooks/usePerformanceMonitoring';

// Lazy load route components
const PatientDashboard = lazy(() => import('./pages/PatientDashboard'));
const DoctorDashboard = lazy(() => import('./pages/DoctorDashboard'));
const Appointments = lazy(() => import('./pages/Appointments'));
const Medications = lazy(() => import('./pages/Medications'));
const Symptoms = lazy(() => import('./pages/Symptoms'));
const Teleconsultation = lazy(() => import('./pages/Teleconsultation'));
const Education = lazy(() => import('./pages/Education'));
const Reviews = lazy(() => import('./pages/Reviews'));
const DiagnosticTest = lazy(() => import('./pages/DiagnosticTest'));
const Profile = lazy(() => import('./pages/Profile'));
const NotificationsPage = lazy(() => import('./pages/Notifications')); // Lazy load
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const DebugPage = lazy(() => import('./pages/Debug'));


// Test Firebase connection in development
if (import.meta.env.DEV) {
  import('./firebase/test-connection');
}

function AppContent() {
  const { user, loading } = useAuth();

  // Initialize performance monitoring
  usePerformanceMonitoring();

  // Set up offline queue processor
  useEffect(() => {
    offlineQueueService.setProcessor(async (submission) => {
      switch (submission.type) {
        case 'medication':
          await firestoreService.addMedication(submission.data);
          break;
        case 'symptom':
          await firestoreService.addSymptom(submission.data);
          break;
        case 'appointment':
          await firestoreService.addAppointment(submission.data);
          break;
        case 'health-metric':
          await firestoreService.addHealthMetric(submission.data);
          break;
        default:
          throw new Error(`Unknown submission type: ${submission.type}`);
      }
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <NotificationProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          {user && <Header />}
          {user && <OfflineIndicator />}
          <main className={user ? "container mx-auto px-4 py-6" : ""}>
            <Routes>
              <Route
                path="/login"
                element={user ? <Navigate to={user.role === 'patient' ? '/dashboard' : '/doctor-dashboard'} /> : <Login />}
              />
              <Route
                path="/register"
                element={user ? <Navigate to={user.role === 'patient' ? '/dashboard' : '/doctor-dashboard'} /> : <Register />}
              />
              <Route
                path="/dashboard"
                element={
                  user?.role === 'patient' ? (
                    <ErrorBoundary context={{ component: 'PatientDashboard', action: 'load' }}>
                      <Suspense fallback={<PageLoadingFallback />}>
                        <PatientDashboard />
                      </Suspense>
                    </ErrorBoundary>
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/doctor-dashboard"
                element={
                  user?.role === 'doctor' ? (
                    <ErrorBoundary context={{ component: 'DoctorDashboard', action: 'load' }}>
                      <Suspense fallback={<PageLoadingFallback />}>
                        <DoctorDashboard />
                      </Suspense>
                    </ErrorBoundary>
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/appointments"
                element={
                  user ? (
                    <ErrorBoundary context={{ component: 'Appointments', action: 'load' }}>
                      <Suspense fallback={<PageLoadingFallback />}>
                        <Appointments />
                      </Suspense>
                    </ErrorBoundary>
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/medications"
                element={
                  user?.role === 'patient' ? (
                    <ErrorBoundary context={{ component: 'Medications', action: 'load' }}>
                      <Suspense fallback={<PageLoadingFallback />}>
                        <Medications />
                      </Suspense>
                    </ErrorBoundary>
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/symptoms"
                element={
                  user?.role === 'patient' ? (
                    <ErrorBoundary context={{ component: 'Symptoms', action: 'load' }}>
                      <Suspense fallback={<PageLoadingFallback />}>
                        <Symptoms />
                      </Suspense>
                    </ErrorBoundary>
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/teleconsultation"
                element={
                  user ? (
                    <ErrorBoundary context={{ component: 'Teleconsultation', action: 'load' }}>
                      <Suspense fallback={<PageLoadingFallback />}>
                        <Teleconsultation />
                      </Suspense>
                    </ErrorBoundary>
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/education"
                element={
                  user ? (
                    <ErrorBoundary context={{ component: 'Education', action: 'load' }}>
                      <Suspense fallback={<PageLoadingFallback />}>
                        <Education />
                      </Suspense>
                    </ErrorBoundary>
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/reviews"
                element={
                  user ? (
                    <ErrorBoundary context={{ component: 'Reviews', action: 'load' }}>
                      <Suspense fallback={<PageLoadingFallback />}>
                        <Reviews />
                      </Suspense>
                    </ErrorBoundary>
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/notifications"
                element={
                  user ? (
                    <ErrorBoundary context={{ component: 'Notifications', action: 'load' }}>
                      <Suspense fallback={<PageLoadingFallback />}>
                        <NotificationsPage />
                      </Suspense>
                    </ErrorBoundary>
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/profile"
                element={
                  user ? (
                    <ErrorBoundary context={{ component: 'Profile', action: 'load' }}>
                      <Suspense fallback={<PageLoadingFallback />}>
                        <Profile />
                      </Suspense>
                    </ErrorBoundary>
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/diagnostic"
                element={
                  user ? (
                    <ErrorBoundary context={{ component: 'DiagnosticTest', action: 'load' }}>
                      <Suspense fallback={<PageLoadingFallback />}>
                        <DiagnosticTest />
                      </Suspense>
                    </ErrorBoundary>
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/admin"
                element={
                  user ? (
                    <Suspense fallback={<PageLoadingFallback />}>
                      <AdminDashboard />
                    </Suspense>
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/debug"
                element={
                  <Suspense fallback={<PageLoadingFallback />}>
                    <DebugPage />
                  </Suspense>
                }
              />

              <Route
                path="/"
                element={
                  user ? (
                    <Navigate to={user.role === 'patient' ? '/dashboard' : '/doctor-dashboard'} />
                  ) : (
                    <Welcome />
                  )
                }
              />

            </Routes>
          </main>
        </div>
      </Router>
    </NotificationProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AnimationProvider>
        <AppContent />
      </AnimationProvider>
    </AuthProvider>
  );
}

export default App;