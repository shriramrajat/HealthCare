import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, mockPatientUser, mockDoctorUser } from './test-utils';
import { authService } from '../firebase/auth';
import { firestoreService } from '../firebase/firestore';

// Import components
import Login from '../pages/Login';
import Register from '../pages/Register';
import PatientDashboard from '../pages/PatientDashboard';
import Medications from '../pages/Medications';

describe('Component Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Login Component', () => {
    it('should render login form correctly', () => {
      render(<Login />);
      
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should show demo credentials', () => {
      render(<Login />);
      
      expect(screen.getByText(/demo credentials/i)).toBeInTheDocument();
      expect(screen.getByText(/patient@demo.com/i)).toBeInTheDocument();
      expect(screen.getByText(/doctor@demo.com/i)).toBeInTheDocument();
    });

    it('should validate form fields', async () => {
      const user = userEvent.setup();
      render(<Login />);
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      // Try to submit without filling fields
      await user.click(submitButton);
      
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });

    it('should validate email format', async () => {
      const user = userEvent.setup();
      render(<Login />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);
      
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });

    it('should handle successful login', async () => {
      const user = userEvent.setup();
      
      // Mock successful login
      vi.spyOn(authService, 'signIn').mockResolvedValue(mockPatientUser);
      
      render(<Login />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await user.type(emailInput, 'patient@test.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(authService.signIn).toHaveBeenCalledWith('patient@test.com', 'password123');
      });
    });

    it('should handle login errors', async () => {
      const user = userEvent.setup();
      
      // Mock login error
      vi.spyOn(authService, 'signIn').mockRejectedValue({
        code: 'auth/user-not-found',
        message: 'User not found',
      });
      
      render(<Login />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await user.type(emailInput, 'nonexistent@test.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/no account found with this email address/i)).toBeInTheDocument();
      });
    });
  });

  describe('Register Component', () => {
    it('should render registration form correctly', () => {
      render(<Register />);
      
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });

    it('should show role selection', () => {
      render(<Register />);
      
      expect(screen.getByText(/i am a:/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/patient/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/healthcare provider/i)).toBeInTheDocument();
    });

    it('should show specialization field for doctors', async () => {
      const user = userEvent.setup();
      render(<Register />);
      
      const doctorRadio = screen.getByLabelText(/healthcare provider/i);
      await user.click(doctorRadio);
      
      expect(screen.getByLabelText(/specialization/i)).toBeInTheDocument();
    });

    it('should show conditions field for patients', async () => {
      const user = userEvent.setup();
      render(<Register />);
      
      const patientRadio = screen.getByLabelText(/patient/i);
      await user.click(patientRadio);
      
      expect(screen.getByText(/chronic conditions/i)).toBeInTheDocument();
    });

    it('should validate password confirmation', async () => {
      const user = userEvent.setup();
      render(<Register />);
      
      const passwordInput = screen.getByLabelText(/password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });
      
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'differentpassword');
      await user.click(submitButton);
      
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });

    it('should handle successful registration', async () => {
      const user = userEvent.setup();
      
      // Mock successful registration
      vi.spyOn(authService, 'signUp').mockResolvedValue(mockPatientUser);
      
      render(<Register />);
      
      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const phoneInput = screen.getByLabelText(/phone number/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });
      
      await user.type(nameInput, 'John Patient');
      await user.type(emailInput, 'patient@test.com');
      await user.type(phoneInput, '+1234567890');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(authService.signUp).toHaveBeenCalled();
      });
    });
  });

  describe('PatientDashboard Component', () => {
    beforeEach(() => {
      // Mock Firestore service responses
      vi.spyOn(firestoreService, 'getHealthMetrics').mockResolvedValue([
        {
          id: 'metric-1',
          type: 'blood_sugar',
          value: '120',
          unit: 'mg/dL',
          recordedAt: new Date().toISOString(),
          notes: 'Fasting glucose',
        },
      ]);
      
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
    });

    it('should render dashboard with user welcome message', async () => {
      render(<PatientDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
      });
    });

    it('should display health metrics', async () => {
      render(<PatientDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/health metrics/i)).toBeInTheDocument();
        expect(screen.getByText(/blood sugar/i)).toBeInTheDocument();
        expect(screen.getByText(/120 mg\/dL/i)).toBeInTheDocument();
      });
    });

    it('should display medications', async () => {
      render(<PatientDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/today's medications/i)).toBeInTheDocument();
        expect(screen.getByText(/metformin/i)).toBeInTheDocument();
        expect(screen.getByText(/500mg/i)).toBeInTheDocument();
      });
    });

    it('should display upcoming appointments', async () => {
      render(<PatientDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/upcoming appointments/i)).toBeInTheDocument();
        expect(screen.getByText(/dr\. jane doctor/i)).toBeInTheDocument();
      });
    });

    it('should show quick action buttons', async () => {
      render(<PatientDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/log symptoms/i)).toBeInTheDocument();
        expect(screen.getByText(/start consult/i)).toBeInTheDocument();
        expect(screen.getByText(/learn more/i)).toBeInTheDocument();
        expect(screen.getByText(/emergency/i)).toBeInTheDocument();
      });
    });
  });

  describe('Medications Component', () => {
    beforeEach(() => {
      // Mock Firestore service responses
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
        {
          id: 'med-2',
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Once daily',
          startDate: '2024-01-15',
          reminders: ['08:00'],
          adherence: [true, true, true, true],
          notes: 'For blood pressure',
        },
      ]);
    });

    it('should render medications list', async () => {
      render(<Medications />);
      
      await waitFor(() => {
        expect(screen.getByText(/medications/i)).toBeInTheDocument();
        expect(screen.getByText(/metformin/i)).toBeInTheDocument();
        expect(screen.getByText(/lisinopril/i)).toBeInTheDocument();
      });
    });

    it('should show medication statistics', async () => {
      render(<Medications />);
      
      await waitFor(() => {
        expect(screen.getByText(/active medications/i)).toBeInTheDocument();
        expect(screen.getByText(/2/)).toBeInTheDocument(); // Should show count of 2
        expect(screen.getByText(/adherence rate/i)).toBeInTheDocument();
      });
    });

    it('should allow adding new medication', async () => {
      const user = userEvent.setup();
      render(<Medications />);
      
      const addButton = screen.getByRole('button', { name: /add medication/i });
      await user.click(addButton);
      
      expect(screen.getByText(/add new medication/i)).toBeInTheDocument();
    });

    it('should handle marking medication as taken', async () => {
      const user = userEvent.setup();
      
      // Mock update medication
      vi.spyOn(firestoreService, 'updateMedication').mockResolvedValue();
      
      render(<Medications />);
      
      await waitFor(() => {
        expect(screen.getByText(/metformin/i)).toBeInTheDocument();
      });
      
      const markTakenButton = screen.getByText(/mark as taken/i);
      await user.click(markTakenButton);
      
      await waitFor(() => {
        expect(firestoreService.updateMedication).toHaveBeenCalled();
      });
    });

    it('should handle deleting medication', async () => {
      const user = userEvent.setup();
      
      // Mock delete medication
      vi.spyOn(firestoreService, 'deleteMedication').mockResolvedValue();
      
      render(<Medications />);
      
      await waitFor(() => {
        expect(screen.getByText(/metformin/i)).toBeInTheDocument();
      });
      
      // Find and click delete button (trash icon)
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);
      
      await waitFor(() => {
        expect(firestoreService.deleteMedication).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle Firestore connection errors', async () => {
      // Mock Firestore error
      vi.spyOn(firestoreService, 'getHealthMetrics').mockRejectedValue(
        new Error('Firestore connection failed')
      );
      
      render(<PatientDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/error loading data/i)).toBeInTheDocument();
      });
    });

    it('should handle authentication errors gracefully', async () => {
      const user = userEvent.setup();
      
      // Mock authentication error
      vi.spyOn(authService, 'signIn').mockRejectedValue({
        code: 'auth/network-request-failed',
        message: 'Network error',
      });
      
      render(<Login />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await user.type(emailInput, 'test@test.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
      });
    });
  });
});
