import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import Appointments from './pages/Appointments';
import Medications from './pages/Medications';
import Symptoms from './pages/Symptoms';
import Teleconsultation from './pages/Teleconsultation';
import Education from './pages/Education';
import Reviews from './pages/Reviews';
import { User, AuthContextType } from './types';
import { AuthContext } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData: User, token: string) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const authValue: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={authValue}>
      <NotificationProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Header />
            <main className="container mx-auto px-4 py-6">
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
                  element={user?.role === 'patient' ? <PatientDashboard /> : <Navigate to="/login" />} 
                />
                <Route 
                  path="/doctor-dashboard" 
                  element={user?.role === 'doctor' ? <DoctorDashboard /> : <Navigate to="/login" />} 
                />
                <Route 
                  path="/appointments" 
                  element={user ? <Appointments /> : <Navigate to="/login" />} 
                />
                <Route 
                  path="/medications" 
                  element={user?.role === 'patient' ? <Medications /> : <Navigate to="/login" />} 
                />
                <Route 
                  path="/symptoms" 
                  element={user?.role === 'patient' ? <Symptoms /> : <Navigate to="/login" />} 
                />
                <Route 
                  path="/teleconsultation" 
                  element={user ? <Teleconsultation /> : <Navigate to="/login" />} 
                />
                <Route 
                  path="/education" 
                  element={user ? <Education /> : <Navigate to="/login" />} 
                />
                <Route 
                  path="/reviews" 
                  element={user ? <Reviews /> : <Navigate to="/login" />} 
                />
                <Route 
                  path="/" 
                  element={
                    user ? (
                      <Navigate to={user.role === 'patient' ? '/dashboard' : '/doctor-dashboard'} />
                    ) : (
                      <Navigate to="/login" />
                    )
                  } 
                />
              </Routes>
            </main>
          </div>
        </Router>
      </NotificationProvider>
    </AuthContext.Provider>
  );
}

export default App;