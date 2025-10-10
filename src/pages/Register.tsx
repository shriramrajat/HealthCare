import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { Heart, Eye, EyeOff, Mail, Lock, User, Phone, Stethoscope } from 'lucide-react';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'patient' as 'patient' | 'doctor',
    specialization: '',
    conditions: [] as string[],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const { register } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();

  const commonConditions = [
    'Diabetes Type 1',
    'Diabetes Type 2',
    'Hypertension',
    'Heart Disease',
    'Asthma',
    'COPD',
    'Arthritis',
    'Depression',
    'Anxiety',
    'Other'
  ];

  const specializations = [
    'Cardiology',
    'Endocrinology',
    'Internal Medicine',
    'Family Medicine',
    'Pulmonology',
    'Nephrology',
    'Rheumatology',
    'Psychiatry',
    'Other'
  ];

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.role === 'doctor' && !formData.specialization) {
      newErrors.specialization = 'Specialization is required for doctors';
    }

    if (formData.role === 'patient' && formData.conditions.length === 0) {
      newErrors.conditions = 'Please select at least one condition';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        ...(formData.role === 'doctor' ? {
          specialization: formData.specialization
        } : {
          conditions: formData.conditions
        })
      };

      const newUser = await register(formData.email, formData.password, userData);
      
      addNotification({
        title: 'Registration Successful',
        message: `Welcome to HealthCare+, ${newUser.name}!`,
        type: 'success'
      });

      navigate(newUser.role === 'patient' ? '/dashboard' : '/doctor-dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle different Firebase auth errors
      let errorMessage = 'Registration failed. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleConditionChange = (condition: string) => {
    const updatedConditions = formData.conditions.includes(condition)
      ? formData.conditions.filter(c => c !== condition)
      : [...formData.conditions, condition];
    
    setFormData({ ...formData, conditions: updatedConditions });
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <Heart className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                I am a:
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="patient"
                    checked={formData.role === 'patient'}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'patient' })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Patient</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="doctor"
                    checked={formData.role === 'doctor'}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'doctor' })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Healthcare Provider</span>
                </label>
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`pl-10 block w-full rounded-lg border ${
                    errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  } px-3 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`pl-10 block w-full rounded-lg border ${
                    errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  } px-3 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`pl-10 block w-full rounded-lg border ${
                    errors.phone ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  } px-3 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent`}
                  placeholder="Enter your phone number"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Doctor Specialization */}
            {formData.role === 'doctor' && (
              <div>
                <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization
                </label>
                <div className="relative">
                  <Stethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    id="specialization"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className={`pl-10 block w-full rounded-lg border ${
                      errors.specialization ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    } px-3 py-3 focus:outline-none focus:ring-2 focus:border-transparent`}
                  >
                    <option value="">Select your specialization</option>
                    {specializations.map((spec) => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
                {errors.specialization && (
                  <p className="mt-1 text-sm text-red-600">{errors.specialization}</p>
                )}
              </div>
            )}

            {/* Patient Conditions */}
            {formData.role === 'patient' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chronic Conditions (Select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-3">
                  {commonConditions.map((condition) => (
                    <label key={condition} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.conditions.includes(condition)}
                        onChange={() => handleConditionChange(condition)}
                        className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-xs text-gray-700">{condition}</span>
                    </label>
                  ))}
                </div>
                {errors.conditions && (
                  <p className="mt-1 text-sm text-red-600">{errors.conditions}</p>
                )}
              </div>
            )}

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`pl-10 pr-10 block w-full rounded-lg border ${
                    errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  } px-3 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`pl-10 pr-10 block w-full rounded-lg border ${
                    errors.confirmPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  } px-3 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                I agree to the{' '}
                <a href="#" className="text-blue-600 hover:text-blue-500">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-blue-600 hover:text-blue-500">
                  Privacy Policy
                </a>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating account...</span>
                </div>
              ) : (
                'Create account'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;