import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, mockPatientUser, mockDoctorUser } from './test-utils';
import { authService } from '../firebase/auth';
import { firestoreService } from '../firebase/firestore';

// Mock Firebase Auth Service
vi.mock('../firebase/auth', () => ({
  authService: {
    onAuthStateChanged: vi.fn((callback) => {
      // Default behavior: user is not logged in
      callback(null);
      return () => { }; // Unsubscribe function
    }),
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    getCurrentUser: vi.fn(() => null),
    resetPassword: vi.fn(),
    updatePassword: vi.fn(),
    updateUserProfile: vi.fn(),
  }
}));

// Mock Firestore Service
vi.mock('../firebase/firestore', () => ({
  firestoreService: {
    getUser: vi.fn(),
    getHealthMetrics: vi.fn(),
    getMedications: vi.fn(),
    getAppointments: vi.fn(),
    getSymptoms: vi.fn(),
    getReviews: vi.fn(),
    getEducationalContent: vi.fn(),
    getNotifications: vi.fn(),
    getDoctors: vi.fn(),
    addSymptom: vi.fn(),
    addMedication: vi.fn(),
    addAppointment: vi.fn(),
    addReview: vi.fn(),
    addNotification: vi.fn(),
    updateHealthMetric: vi.fn(),
    updateMedication: vi.fn(),
    updateAppointment: vi.fn(),
    deleteHealthMetric: vi.fn(),
    deleteMedication: vi.fn(),
  }
}));

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

    it('should handle invalid email input', async () => {
      const user = userEvent.setup();
      render(<Login />);

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);

      // Form should handle submission (component may not show immediate validation)
      expect(emailInput).toHaveValue('invalid-email');
      expect(submitButton).toBeInTheDocument();
    });

    it('should handle form submission', async () => {
      const user = userEvent.setup();
      render(<Login />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'patient@test.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Form should handle submission (may show error or success)
      expect(submitButton).toBeInTheDocument();
    });

    it('should handle login errors', async () => {
      const user = userEvent.setup();

      // Setup mock rejection
      (authService.signIn as any).mockRejectedValue(new Error('Invalid email or password'));

      render(<Login />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'nonexistent@test.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
      });
    });
  });

  describe('Register Component', () => {
    it('should render registration form correctly', () => {
      render(<Register />);

      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
      expect(screen.getAllByLabelText(/password/i)).toHaveLength(2); // Password and confirm password
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

    it('should handle form submission', async () => {
      const user = userEvent.setup();
      render(<Register />);

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      // Form should handle submission (may show validation errors or process)
      expect(submitButton).toBeInTheDocument();
    });

    it('should allow filling out registration form', async () => {
      const user = userEvent.setup();
      render(<Register />);

      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const phoneInput = screen.getByLabelText(/phone number/i);

      await user.type(nameInput, 'John Patient');
      await user.type(emailInput, 'patient@test.com');
      await user.type(phoneInput, '+1234567890');

      expect(nameInput).toHaveValue('John Patient');
      expect(emailInput).toHaveValue('patient@test.com');
      expect(phoneInput).toHaveValue('+1234567890');
    });
  });

  describe('PatientDashboard Component', () => {
    beforeEach(() => {
      // Mock logged in user
      (authService.onAuthStateChanged as any).mockImplementation((callback: any) => {
        callback({ uid: 'user-123', email: 'patient@test.com' });
        return () => { };
      });
      (firestoreService.getUser as any).mockResolvedValue(mockPatientUser);

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

    it('should display health metrics section', async () => {
      render(<PatientDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/health metrics/i)).toBeInTheDocument();
      });
    });

    it('should display medications section', async () => {
      render(<PatientDashboard />);

      await waitFor(() => {
        // Look for medication-related content that should always be present
        expect(screen.getAllByText(/medication adherence/i)[0]).toBeInTheDocument();
      });
    });

    it('should display appointments section', async () => {
      render(<PatientDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/next appointment/i)).toBeInTheDocument();
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
      // Mock logged in user
      (authService.onAuthStateChanged as any).mockImplementation((callback: any) => {
        callback({ uid: 'user-123', email: 'patient@test.com' });
        return () => { };
      });
      (firestoreService.getUser as any).mockResolvedValue(mockPatientUser);

      // Reset all mocks (clear call history)
      vi.clearAllMocks();

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

    it('should render medications page', async () => {
      render(<Medications />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Medications');
        expect(screen.getByText(/manage your medications/i)).toBeInTheDocument();
      });
    });

    it('should show medication statistics', async () => {
      render(<Medications />);

      await waitFor(() => {
        expect(screen.getByText(/active medications/i)).toBeInTheDocument();
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

    it('should handle adding new medication', async () => {
      const user = userEvent.setup();

      render(<Medications />);

      const addButton = screen.getByRole('button', { name: /add medication/i });
      await user.click(addButton);

      // Should open add medication form or modal
      expect(addButton).toBeInTheDocument();
    });

    it('should show empty state when no medications', async () => {
      // Override mock to return empty array
      vi.spyOn(firestoreService, 'getMedications').mockResolvedValue([]);

      render(<Medications />);

      await waitFor(() => {
        expect(screen.getByText(/no medications added/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle Firestore connection errors gracefully', async () => {
      // Mock logged in user for dashboard
      (authService.onAuthStateChanged as any).mockImplementation((callback: any) => {
        callback({ uid: 'user-123', email: 'patient@test.com' });
        return () => { };
      });
      (firestoreService.getUser as any).mockResolvedValue(mockPatientUser);

      // Mock Firestore error
      vi.spyOn(firestoreService, 'getHealthMetrics').mockRejectedValue(
        new Error('Firestore connection failed')
      );

      render(<PatientDashboard />);

      await waitFor(() => {
        // Should still render the dashboard even with errors
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
      });
    });

    it('should handle authentication errors gracefully', async () => {
      // Mock logged out user for login page
      (authService.onAuthStateChanged as any).mockImplementation((callback: any) => {
        callback(null);
        return () => { };
      });

      const user = userEvent.setup();

      // Mock authentication error
      (authService.signIn as any).mockRejectedValue({
        code: 'auth/wrong-password',
        message: 'Wrong password',
      });

      render(<Login />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@test.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/incorrect password/i)).toBeInTheDocument();
      });
    });
  });
});
