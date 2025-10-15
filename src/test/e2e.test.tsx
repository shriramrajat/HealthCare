import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, mockPatientUser, mockDoctorUser } from './test-utils';
import { authService } from '../firebase/auth';
import { firestoreService } from '../firebase/firestore';

// Import the main App component
import App from '../App';

describe('End-to-End Workflow Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock localStorage and sessionStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });
    
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });
  });

  describe('Complete User Registration and Login Flow', () => {
    it('should complete full patient registration and dashboard access', async () => {
      const user = userEvent.setup();
      
      // Mock successful registration
      vi.spyOn(authService, 'signUp').mockResolvedValue(mockPatientUser);
      
      // Mock Firestore responses for dashboard
      vi.spyOn(firestoreService, 'getHealthMetrics').mockResolvedValue([]);
      vi.spyOn(firestoreService, 'getMedications').mockResolvedValue([]);
      vi.spyOn(firestoreService, 'getAppointments').mockResolvedValue([]);
      
      render(<App />);
      
      // Should redirect to login page initially
      await waitFor(() => {
        expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument();
      });
      
      // Navigate to registration
      const registerLink = screen.getByText(/create a new account/i);
      await user.click(registerLink);
      
      await waitFor(() => {
        expect(screen.getByText(/create your account/i)).toBeInTheDocument();
      });
      
      // Fill registration form
      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const phoneInput = screen.getByLabelText(/phone number/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      
      await user.type(nameInput, 'John Patient');
      await user.type(emailInput, 'john.patient@test.com');
      await user.type(phoneInput, '+1234567890');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      
      // Select patient role
      const patientRadio = screen.getByLabelText(/patient/i);
      await user.click(patientRadio);
      
      // Select some conditions
      const diabetesCheckbox = screen.getByLabelText(/diabetes type 2/i);
      await user.click(diabetesCheckbox);
      
      // Accept terms
      const termsCheckbox = screen.getByLabelText(/i agree to the/i);
      await user.click(termsCheckbox);
      
      // Submit registration
      const createButton = screen.getByRole('button', { name: /create account/i });
      await user.click(createButton);
      
      // Should redirect to dashboard after successful registration
      await waitFor(() => {
        expect(screen.getByText(/welcome back, john patient/i)).toBeInTheDocument();
        expect(screen.getByText(/health metrics/i)).toBeInTheDocument();
      });
      
      expect(authService.signUp).toHaveBeenCalledWith(
        'john.patient@test.com',
        'password123',
        expect.objectContaining({
          name: 'John Patient',
          role: 'patient',
        })
      );
    });

    it('should complete full doctor registration and dashboard access', async () => {
      const user = userEvent.setup();
      
      // Mock successful registration
      vi.spyOn(authService, 'signUp').mockResolvedValue(mockDoctorUser);
      
      // Mock Firestore responses for doctor dashboard
      vi.spyOn(firestoreService, 'getAppointments').mockResolvedValue([]);
      
      render(<App />);
      
      // Navigate to registration
      const registerLink = screen.getByText(/create a new account/i);
      await user.click(registerLink);
      
      // Fill registration form for doctor
      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const phoneInput = screen.getByLabelText(/phone number/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      
      await user.type(nameInput, 'Dr. Jane Doctor');
      await user.type(emailInput, 'dr.jane@test.com');
      await user.type(phoneInput, '+1234567890');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      
      // Select doctor role
      const doctorRadio = screen.getByLabelText(/healthcare provider/i);
      await user.click(doctorRadio);
      
      // Select specialization
      const specializationSelect = screen.getByLabelText(/specialization/i);
      await user.selectOptions(specializationSelect, 'Cardiology');
      
      // Accept terms
      const termsCheckbox = screen.getByLabelText(/i agree to the/i);
      await user.click(termsCheckbox);
      
      // Submit registration
      const createButton = screen.getByRole('button', { name: /create account/i });
      await user.click(createButton);
      
      // Should redirect to doctor dashboard
      await waitFor(() => {
        expect(screen.getByText(/doctor dashboard/i)).toBeInTheDocument();
      });
    });
  });

  describe('Complete Medication Management Workflow', () => {
    it('should allow patient to add, view, and manage medications', async () => {
      const user = userEvent.setup();
      
      // Mock authentication as logged-in patient
      vi.spyOn(authService, 'signIn').mockResolvedValue(mockPatientUser);
      vi.spyOn(firestoreService, 'getMedications').mockResolvedValue([
        {
          id: 'med-1',
          name: 'Metformin',
          dosage: '500mg',
          frequency: 'Twice daily',
          startDate: '2024-01-01',
          reminders: ['08:00', '20:00'],
          adherence: [true, true, false, true],
          notes: 'Take with meals',
        },
      ]);
      
      render(<App />);
      
      // Login first
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /sign in/i });
      
      await user.type(emailInput, 'patient@test.com');
      await user.type(passwordInput, 'password123');
      await user.click(loginButton);
      
      // Should be on patient dashboard
      await waitFor(() => {
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
      });
      
      // Navigate to medications page
      const medicationsLink = screen.getByText(/view all/i);
      await user.click(medicationsLink);
      
      await waitFor(() => {
        expect(screen.getByText(/medications/i)).toBeInTheDocument();
        expect(screen.getByText(/metformin/i)).toBeInTheDocument();
      });
      
      // Test adding new medication
      const addButton = screen.getByRole('button', { name: /add medication/i });
      await user.click(addButton);
      
      expect(screen.getByText(/add new medication/i)).toBeInTheDocument();
      
      // Test marking medication as taken
      vi.spyOn(firestoreService, 'updateMedication').mockResolvedValue();
      
      const markTakenButton = screen.getByText(/mark as taken/i);
      await user.click(markTakenButton);
      
      await waitFor(() => {
        expect(firestoreService.updateMedication).toHaveBeenCalled();
      });
    });
  });

  describe('Complete Appointment Management Workflow', () => {
    it('should allow patient to view and manage appointments', async () => {
      const user = userEvent.setup();
      
      // Mock authentication and data
      vi.spyOn(authService, 'signIn').mockResolvedValue(mockPatientUser);
      vi.spyOn(firestoreService, 'getAppointments').mockResolvedValue([
        {
          id: 'apt-1',
          doctorId: 'doctor-123',
          patientId: 'patient-123',
          doctorName: 'Dr. Jane Doctor',
          patientName: 'John Patient',
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time: '14:30',
          type: 'teleconsultation',
          status: 'confirmed',
          notes: 'Routine check-up',
        },
      ]);
      
      render(<App />);
      
      // Login
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /sign in/i });
      
      await user.type(emailInput, 'patient@test.com');
      await user.type(passwordInput, 'password123');
      await user.click(loginButton);
      
      // Should see upcoming appointments on dashboard
      await waitFor(() => {
        expect(screen.getByText(/upcoming appointments/i)).toBeInTheDocument();
        expect(screen.getByText(/dr\. jane doctor/i)).toBeInTheDocument();
      });
      
      // Navigate to appointments page
      const appointmentsLink = screen.getByText(/view all/i);
      await user.click(appointmentsLink);
      
      await waitFor(() => {
        expect(screen.getByText(/appointments/i)).toBeInTheDocument();
      });
    });
  });

  describe('Authentication State Management', () => {
    it('should maintain authentication state across page refreshes', async () => {
      // Mock localStorage with existing user data
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: vi.fn((key) => {
            if (key === 'user') return JSON.stringify(mockPatientUser);
            if (key === 'token') return 'mock-jwt-token';
            return null;
          }),
          setItem: vi.fn(),
          removeItem: vi.fn(),
          clear: vi.fn(),
        },
        writable: true,
      });
      
      // Mock Firestore responses
      vi.spyOn(firestoreService, 'getHealthMetrics').mockResolvedValue([]);
      vi.spyOn(firestoreService, 'getMedications').mockResolvedValue([]);
      vi.spyOn(firestoreService, 'getAppointments').mockResolvedValue([]);
      
      render(<App />);
      
      // Should automatically log in and show dashboard
      await waitFor(() => {
        expect(screen.getByText(/welcome back, john patient/i)).toBeInTheDocument();
      });
    });

    it('should handle logout correctly', async () => {
      const user = userEvent.setup();
      
      // Mock authentication
      vi.spyOn(authService, 'signIn').mockResolvedValue(mockPatientUser);
      vi.spyOn(authService, 'signOut').mockResolvedValue();
      vi.spyOn(firestoreService, 'getHealthMetrics').mockResolvedValue([]);
      vi.spyOn(firestoreService, 'getMedications').mockResolvedValue([]);
      vi.spyOn(firestoreService, 'getAppointments').mockResolvedValue([]);
      
      render(<App />);
      
      // Login first
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /sign in/i });
      
      await user.type(emailInput, 'patient@test.com');
      await user.type(passwordInput, 'password123');
      await user.click(loginButton);
      
      // Should be on dashboard
      await waitFor(() => {
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
      });
      
      // Find and click logout button (assuming it's in the header)
      const logoutButton = screen.getByText(/logout/i);
      await user.click(logoutButton);
      
      // Should redirect to login page
      await waitFor(() => {
        expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument();
      });
      
      expect(authService.signOut).toHaveBeenCalled();
    });
  });

  describe('Error Recovery and Edge Cases', () => {
    it('should handle network errors gracefully', async () => {
      const user = userEvent.setup();
      
      // Mock network error during login
      vi.spyOn(authService, 'signIn').mockRejectedValue({
        code: 'auth/network-request-failed',
        message: 'Network error',
      });
      
      render(<App />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /sign in/i });
      
      await user.type(emailInput, 'test@test.com');
      await user.type(passwordInput, 'password123');
      await user.click(loginButton);
      
      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
      });
    });

    it('should handle Firestore permission errors', async () => {
      const user = userEvent.setup();
      
      // Mock successful login but Firestore permission error
      vi.spyOn(authService, 'signIn').mockResolvedValue(mockPatientUser);
      vi.spyOn(firestoreService, 'getHealthMetrics').mockRejectedValue(
        new Error('Permission denied')
      );
      
      render(<App />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /sign in/i });
      
      await user.type(emailInput, 'patient@test.com');
      await user.type(passwordInput, 'password123');
      await user.click(loginButton);
      
      await waitFor(() => {
        expect(screen.getByText(/error loading data/i)).toBeInTheDocument();
      });
    });

    it('should handle invalid user data gracefully', async () => {
      // Mock localStorage with corrupted user data
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: vi.fn((key) => {
            if (key === 'user') return 'invalid-json';
            return null;
          }),
          setItem: vi.fn(),
          removeItem: vi.fn(),
          clear: vi.fn(),
        },
        writable: true,
      });
      
      render(<App />);
      
      // Should handle invalid JSON and redirect to login
      await waitFor(() => {
        expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument();
      });
    });
  });

  describe('Role-Based Access Control', () => {
    it('should redirect patients to patient dashboard', async () => {
      const user = userEvent.setup();
      
      vi.spyOn(authService, 'signIn').mockResolvedValue(mockPatientUser);
      vi.spyOn(firestoreService, 'getHealthMetrics').mockResolvedValue([]);
      vi.spyOn(firestoreService, 'getMedications').mockResolvedValue([]);
      vi.spyOn(firestoreService, 'getAppointments').mockResolvedValue([]);
      
      render(<App />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /sign in/i });
      
      await user.type(emailInput, 'patient@test.com');
      await user.type(passwordInput, 'password123');
      await user.click(loginButton);
      
      await waitFor(() => {
        expect(screen.getByText(/health metrics/i)).toBeInTheDocument();
        expect(screen.getByText(/today's medications/i)).toBeInTheDocument();
      });
    });

    it('should redirect doctors to doctor dashboard', async () => {
      const user = userEvent.setup();
      
      vi.spyOn(authService, 'signIn').mockResolvedValue(mockDoctorUser);
      vi.spyOn(firestoreService, 'getAppointments').mockResolvedValue([]);
      
      render(<App />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /sign in/i });
      
      await user.type(emailInput, 'doctor@test.com');
      await user.type(passwordInput, 'password123');
      await user.click(loginButton);
      
      await waitFor(() => {
        expect(screen.getByText(/doctor dashboard/i)).toBeInTheDocument();
      });
    });
  });
});
