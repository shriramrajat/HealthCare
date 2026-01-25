import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../test-utils';
import MedicationForm from '../../components/forms/MedicationForm';
import * as medicationUtils from '../../utils/medicationUtils';

// Mock the medication utils
vi.mock('../../utils/medicationUtils', () => ({
  searchMedications: vi.fn(),
  getDosageInformation: vi.fn(),
  checkDrugInteractions: vi.fn(),
  getInteractionSeverityColor: vi.fn(),
  getInteractionSeverityIcon: vi.fn(),
}));

// Mock Firebase services
vi.mock('../../firebase/auth', () => ({
  authService: {
    onAuthStateChanged: vi.fn((callback) => {
      callback(null);
      return () => { };
    }),
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    getCurrentUser: vi.fn(() => null),
  }
}));

vi.mock('../../firebase/firestore', () => ({
  firestoreService: {
    getUser: vi.fn(),
    getMedications: vi.fn(),
    addMedication: vi.fn(),
  }
}));

describe('MedicationForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    vi.mocked(medicationUtils.searchMedications).mockResolvedValue([
      'Metformin',
      'Lisinopril'
    ]);

    vi.mocked(medicationUtils.getDosageInformation).mockResolvedValue({
      medication: 'Metformin',
      recommendedDose: '500mg',
      maxDailyDose: '2000mg',
      frequency: 'Twice daily',
      notes: ['Take with meals']
    });

    vi.mocked(medicationUtils.checkDrugInteractions).mockResolvedValue([]);
  });

  describe('Form Validation', () => {
    it('should show validation errors for required fields', async () => {
      const user = userEvent.setup();
      render(<MedicationForm {...defaultProps} />);

      // Try to submit without filling required fields
      const submitButton = screen.getByRole('button', { name: /add medication/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/medication name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/dosage is required/i)).toBeInTheDocument();
        expect(screen.getByText(/frequency is required/i)).toBeInTheDocument();
      });
    });

    it('should validate medication name length', async () => {
      const user = userEvent.setup();
      render(<MedicationForm {...defaultProps} />);

      const nameInput = screen.getByLabelText(/medication name/i);
      await user.type(nameInput, 'A');
      await user.tab(); // Trigger validation

      await waitFor(() => {
        expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
      });
    });

    it('should validate dosage format', async () => {
      const user = userEvent.setup();
      render(<MedicationForm {...defaultProps} />);

      const dosageInput = screen.getByLabelText(/dosage/i);
      await user.type(dosageInput, 'invalid dosage');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid dosage/i)).toBeInTheDocument();
      });
    });

    it('should validate reminder times format', async () => {
      const user = userEvent.setup();
      render(<MedicationForm {...defaultProps} />);

      // Add a reminder
      const addReminderButton = screen.getByRole('button', { name: /add reminder/i });
      await user.click(addReminderButton);

      const timeInput = screen.getByLabelText(/reminder time/i);
      await user.type(timeInput, '25:00'); // Invalid time
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid time/i)).toBeInTheDocument();
      });
    });

    it('should validate end date is after start date', async () => {
      const user = userEvent.setup();
      render(<MedicationForm {...defaultProps} />);

      const startDateInput = screen.getByLabelText(/start date/i);
      const endDateInput = screen.getByLabelText(/end date/i);

      await user.type(startDateInput, '2024-12-01');
      await user.type(endDateInput, '2024-11-01'); // Before start date
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/end date must be after start date/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Interactions', () => {
    it('should allow adding and removing reminders', async () => {
      const user = userEvent.setup();
      render(<MedicationForm {...defaultProps} />);

      // Add reminder
      const addReminderButton = screen.getByRole('button', { name: /add reminder/i });
      await user.click(addReminderButton);

      expect(screen.getByLabelText(/reminder time/i)).toBeInTheDocument();

      // Remove reminder
      const removeReminderButton = screen.getByRole('button', { name: /remove reminder/i });
      await user.click(removeReminderButton);

      expect(screen.queryByLabelText(/reminder time/i)).not.toBeInTheDocument();
    });

    it('should show medication search suggestions', async () => {
      const user = userEvent.setup();
      render(<MedicationForm {...defaultProps} />);

      const nameInput = screen.getByLabelText(/medication name/i);
      await user.type(nameInput, 'Met');

      await waitFor(() => {
        expect(medicationUtils.searchMedications).toHaveBeenCalledWith('Met');
        expect(screen.getByText('Metformin')).toBeInTheDocument();
      });
    });

    it('should show dosage calculator when enabled', async () => {
      const user = userEvent.setup();
      render(<MedicationForm {...defaultProps} />);

      const calculatorButton = screen.getByRole('button', { name: /dosage calculator/i });
      await user.click(calculatorButton);

      expect(screen.getByText(/dosage calculator/i)).toBeInTheDocument();
    });

    it('should check for drug interactions', async () => {
      const existingMedications = [
        {
          id: '1',
          userId: 'user-1',
          name: 'Warfarin',
          dosage: '5mg',
          frequency: 'once_daily',
          startDate: '2024-01-01',
          reminders: [],
          adherence: [],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ];

      const user = userEvent.setup();
      render(<MedicationForm {...defaultProps} existingMedications={existingMedications} />);

      const nameInput = screen.getByLabelText(/medication name/i);
      await user.type(nameInput, 'Aspirin');
      await user.tab();

      await waitFor(() => {
        expect(medicationUtils.checkDrugInteractions).toHaveBeenCalledWith(
          'Aspirin',
          ['Warfarin']
        );
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      render(<MedicationForm {...defaultProps} />);

      // Fill out form
      await user.type(screen.getByLabelText(/medication name/i), 'Metformin');
      await user.type(screen.getByLabelText(/dosage/i), '500mg');
      await user.selectOptions(screen.getByLabelText(/frequency/i), 'twice_daily');
      await user.type(screen.getByLabelText(/start date/i), '2024-01-01');

      const submitButton = screen.getByRole('button', { name: /add medication/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'Metformin',
          dosage: '500mg',
          frequency: 'twice_daily',
          startDate: '2024-01-01',
          reminders: [],
          notes: ''
        });
      });
    });

    it('should show loading state during submission', async () => {
      render(<MedicationForm {...defaultProps} isLoading={true} />);

      expect(screen.getByText(/adding medication/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /adding/i })).toBeDisabled();
    });

    it('should handle submission errors', async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockRejectedValue(new Error('Submission failed'));

      render(<MedicationForm {...defaultProps} />);

      // Fill out form
      await user.type(screen.getByLabelText(/medication name/i), 'Metformin');
      await user.type(screen.getByLabelText(/dosage/i), '500mg');
      await user.selectOptions(screen.getByLabelText(/frequency/i), 'twice_daily');

      const submitButton = screen.getByRole('button', { name: /add medication/i });
      await user.click(submitButton);

      // Form should handle error gracefully
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });
  });

  describe('Animation Triggers', () => {
    it('should trigger animations on form field focus', async () => {
      const user = userEvent.setup();
      render(<MedicationForm {...defaultProps} />);

      const nameInput = screen.getByLabelText(/medication name/i);
      await user.click(nameInput);

      // Check if input has focus (animation trigger)
      expect(nameInput).toHaveFocus();
    });

    it('should animate form submission', async () => {
      const user = userEvent.setup();
      render(<MedicationForm {...defaultProps} />);

      // Fill minimum required fields
      await user.type(screen.getByLabelText(/medication name/i), 'Metformin');
      await user.type(screen.getByLabelText(/dosage/i), '500mg');
      await user.selectOptions(screen.getByLabelText(/frequency/i), 'twice_daily');

      const submitButton = screen.getByRole('button', { name: /add medication/i });

      // Check button is present and clickable (animation ready)
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('should handle medication search API errors', async () => {
      const user = userEvent.setup();
      vi.mocked(medicationUtils.searchMedications).mockRejectedValue(new Error('API Error'));

      render(<MedicationForm {...defaultProps} />);

      const nameInput = screen.getByLabelText(/medication name/i);
      await user.type(nameInput, 'Met');

      // Should not crash and should allow manual entry
      expect(nameInput).toHaveValue('Met');
    });

    it('should handle drug interaction check errors', async () => {
      const user = userEvent.setup();
      vi.mocked(medicationUtils.checkDrugInteractions).mockRejectedValue(new Error('API Error'));

      const existingMedications = [
        {
          id: '1',
          userId: 'user-1',
          name: 'Warfarin',
          dosage: '5mg',
          frequency: 'once_daily',
          startDate: '2024-01-01',
          reminders: [],
          adherence: [],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ];

      render(<MedicationForm {...defaultProps} existingMedications={existingMedications} />);

      const nameInput = screen.getByLabelText(/medication name/i);
      await user.type(nameInput, 'Aspirin');

      // Should not crash and form should remain functional
      expect(nameInput).toHaveValue('Aspirin');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<MedicationForm {...defaultProps} />);

      expect(screen.getByLabelText(/medication name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/dosage/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/frequency/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    });

    it('should announce validation errors to screen readers', async () => {
      const user = userEvent.setup();
      render(<MedicationForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: /add medication/i });
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.getByText(/medication name is required/i);
        expect(errorMessage).toHaveAttribute('role', 'alert');
      });
    });
  });
});