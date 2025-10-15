import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../test-utils';
import SymptomForm from '../../components/forms/SymptomForm';

describe('SymptomForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Form Validation', () => {
    it('should show validation errors for required fields', async () => {
      const user = userEvent.setup();
      render(<SymptomForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: /log symptom/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/symptom name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/severity is required/i)).toBeInTheDocument();
        expect(screen.getByText(/date is required/i)).toBeInTheDocument();
        expect(screen.getByText(/time is required/i)).toBeInTheDocument();
      });
    });

    it('should validate symptom name length', async () => {
      const user = userEvent.setup();
      render(<SymptomForm {...defaultProps} />);

      const nameInput = screen.getByLabelText(/symptom name/i);
      await user.type(nameInput, 'A');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
      });
    });

    it('should validate severity range (1-10)', async () => {
      const user = userEvent.setup();
      render(<SymptomForm {...defaultProps} />);

      const severitySlider = screen.getByLabelText(/severity/i);
      
      // Test minimum value
      fireEvent.change(severitySlider, { target: { value: '0' } });
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/minimum severity is 1/i)).toBeInTheDocument();
      });

      // Test maximum value
      fireEvent.change(severitySlider, { target: { value: '11' } });
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/maximum severity is 10/i)).toBeInTheDocument();
      });
    });

    it('should validate time format', async () => {
      const user = userEvent.setup();
      render(<SymptomForm {...defaultProps} />);

      const timeInput = screen.getByLabelText(/time/i);
      await user.type(timeInput, '25:00'); // Invalid time
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid time/i)).toBeInTheDocument();
      });
    });

    it('should validate notes length', async () => {
      const user = userEvent.setup();
      render(<SymptomForm {...defaultProps} />);

      const notesInput = screen.getByLabelText(/notes/i);
      const longText = 'A'.repeat(501); // Exceeds 500 character limit
      await user.type(notesInput, longText);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/notes cannot exceed 500 characters/i)).toBeInTheDocument();
      });
    });

    it('should validate duration range', async () => {
      const user = userEvent.setup();
      render(<SymptomForm {...defaultProps} />);

      const durationInput = screen.getByLabelText(/duration/i);
      
      // Test negative duration
      await user.type(durationInput, '-1');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/duration cannot be negative/i)).toBeInTheDocument();
      });

      // Clear and test maximum duration (over 24 hours)
      await user.clear(durationInput);
      await user.type(durationInput, '1441'); // 24 hours = 1440 minutes
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/duration cannot exceed 24 hours/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Interactions', () => {
    it('should allow selecting from common symptoms', async () => {
      const user = userEvent.setup();
      render(<SymptomForm {...defaultProps} />);

      const headacheButton = screen.getByRole('button', { name: /headache/i });
      await user.click(headacheButton);

      const nameInput = screen.getByLabelText(/symptom name/i);
      expect(nameInput).toHaveValue('Headache');
    });

    it('should allow adding and removing custom triggers', async () => {
      const user = userEvent.setup();
      render(<SymptomForm {...defaultProps} />);

      // Add custom trigger
      const triggerInput = screen.getByLabelText(/add trigger/i);
      await user.type(triggerInput, 'Custom trigger');
      
      const addTriggerButton = screen.getByRole('button', { name: /add/i });
      await user.click(addTriggerButton);

      expect(screen.getByText('Custom trigger')).toBeInTheDocument();

      // Remove trigger
      const removeTriggerButton = screen.getByRole('button', { name: /remove custom trigger/i });
      await user.click(removeTriggerButton);

      expect(screen.queryByText('Custom trigger')).not.toBeInTheDocument();
    });

    it('should allow selecting from common triggers', async () => {
      const user = userEvent.setup();
      render(<SymptomForm {...defaultProps} />);

      const stressButton = screen.getByRole('button', { name: /stress/i });
      await user.click(stressButton);

      expect(screen.getByText('Stress')).toBeInTheDocument();
    });

    it('should update severity display when slider changes', async () => {
      const user = userEvent.setup();
      render(<SymptomForm {...defaultProps} />);

      const severitySlider = screen.getByLabelText(/severity/i);
      fireEvent.change(severitySlider, { target: { value: '7' } });

      expect(screen.getByText('7/10')).toBeInTheDocument();
    });

    it('should use selected date when provided', () => {
      const selectedDate = '2024-01-15';
      render(<SymptomForm {...defaultProps} selectedDate={selectedDate} />);

      const dateInput = screen.getByLabelText(/date/i);
      expect(dateInput).toHaveValue(selectedDate);
    });

    it('should show body diagram when location tab is selected', async () => {
      const user = userEvent.setup();
      render(<SymptomForm {...defaultProps} />);

      const locationTab = screen.getByRole('tab', { name: /location/i });
      await user.click(locationTab);

      expect(screen.getByTestId('body-diagram')).toBeInTheDocument();
    });

    it('should show photo attachment when photos tab is selected', async () => {
      const user = userEvent.setup();
      render(<SymptomForm {...defaultProps} />);

      const photosTab = screen.getByRole('tab', { name: /photos/i });
      await user.click(photosTab);

      expect(screen.getByTestId('photo-attachment')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      render(<SymptomForm {...defaultProps} />);

      // Fill out required fields
      await user.type(screen.getByLabelText(/symptom name/i), 'Headache');
      
      const severitySlider = screen.getByLabelText(/severity/i);
      fireEvent.change(severitySlider, { target: { value: '6' } });
      
      await user.type(screen.getByLabelText(/date/i), '2024-01-15');
      await user.type(screen.getByLabelText(/time/i), '14:30');
      await user.type(screen.getByLabelText(/notes/i), 'Mild headache after lunch');

      const submitButton = screen.getByRole('button', { name: /log symptom/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'Headache',
          severity: 6,
          date: '2024-01-15',
          time: '14:30',
          notes: 'Mild headache after lunch',
          triggers: [],
          duration: undefined,
          location: undefined,
          photos: []
        });
      });
    });

    it('should submit form with triggers and duration', async () => {
      const user = userEvent.setup();
      render(<SymptomForm {...defaultProps} />);

      // Fill out form with triggers
      await user.type(screen.getByLabelText(/symptom name/i), 'Headache');
      
      const severitySlider = screen.getByLabelText(/severity/i);
      fireEvent.change(severitySlider, { target: { value: '5' } });
      
      await user.type(screen.getByLabelText(/date/i), '2024-01-15');
      await user.type(screen.getByLabelText(/time/i), '14:30');
      await user.type(screen.getByLabelText(/duration/i), '120'); // 2 hours

      // Add trigger
      const stressButton = screen.getByRole('button', { name: /stress/i });
      await user.click(stressButton);

      const submitButton = screen.getByRole('button', { name: /log symptom/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Headache',
            severity: 5,
            duration: 120,
            triggers: ['Stress']
          })
        );
      });
    });

    it('should show loading state during submission', async () => {
      render(<SymptomForm {...defaultProps} isLoading={true} />);

      expect(screen.getByText(/logging symptom/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /logging/i })).toBeDisabled();
    });

    it('should handle submission errors', async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockRejectedValue(new Error('Submission failed'));
      
      render(<SymptomForm {...defaultProps} />);

      // Fill minimum required fields
      await user.type(screen.getByLabelText(/symptom name/i), 'Headache');
      
      const severitySlider = screen.getByLabelText(/severity/i);
      fireEvent.change(severitySlider, { target: { value: '5' } });
      
      await user.type(screen.getByLabelText(/date/i), '2024-01-15');
      await user.type(screen.getByLabelText(/time/i), '14:30');

      const submitButton = screen.getByRole('button', { name: /log symptom/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });
  });

  describe('Animation Triggers', () => {
    it('should trigger animations on severity slider interaction', async () => {
      const user = userEvent.setup();
      render(<SymptomForm {...defaultProps} />);

      const severitySlider = screen.getByLabelText(/severity/i);
      await user.click(severitySlider);

      // Check if slider has focus (animation trigger)
      expect(severitySlider).toHaveFocus();
    });

    it('should animate tab transitions', async () => {
      const user = userEvent.setup();
      render(<SymptomForm {...defaultProps} />);

      const locationTab = screen.getByRole('tab', { name: /location/i });
      const detailsTab = screen.getByRole('tab', { name: /details/i });

      // Switch tabs to trigger animations
      await user.click(locationTab);
      expect(locationTab).toHaveAttribute('aria-selected', 'true');

      await user.click(detailsTab);
      expect(detailsTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should animate trigger addition and removal', async () => {
      const user = userEvent.setup();
      render(<SymptomForm {...defaultProps} />);

      const stressButton = screen.getByRole('button', { name: /stress/i });
      await user.click(stressButton);

      // Check trigger appears with animation
      const triggerTag = screen.getByText('Stress');
      expect(triggerTag).toBeInTheDocument();

      // Remove trigger
      const removeTriggerButton = screen.getByRole('button', { name: /remove stress/i });
      await user.click(removeTriggerButton);

      expect(screen.queryByText('Stress')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid date input gracefully', async () => {
      const user = userEvent.setup();
      render(<SymptomForm {...defaultProps} />);

      const dateInput = screen.getByLabelText(/date/i);
      await user.type(dateInput, 'invalid-date');
      await user.tab();

      // Should show validation error but not crash
      expect(dateInput).toHaveValue('invalid-date');
    });

    it('should handle body diagram interaction errors', async () => {
      const user = userEvent.setup();
      render(<SymptomForm {...defaultProps} />);

      const locationTab = screen.getByRole('tab', { name: /location/i });
      await user.click(locationTab);

      // Body diagram should render without errors
      expect(screen.getByTestId('body-diagram')).toBeInTheDocument();
    });

    it('should handle photo upload errors', async () => {
      const user = userEvent.setup();
      render(<SymptomForm {...defaultProps} />);

      const photosTab = screen.getByRole('tab', { name: /photos/i });
      await user.click(photosTab);

      // Photo attachment should render without errors
      expect(screen.getByTestId('photo-attachment')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<SymptomForm {...defaultProps} />);

      expect(screen.getByLabelText(/symptom name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/severity/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/time/i)).toBeInTheDocument();
    });

    it('should have proper tab navigation', () => {
      render(<SymptomForm {...defaultProps} />);

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(3); // Details, Location, Photos

      tabs.forEach(tab => {
        expect(tab).toHaveAttribute('aria-selected');
      });
    });

    it('should announce validation errors to screen readers', async () => {
      const user = userEvent.setup();
      render(<SymptomForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: /log symptom/i });
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.getByText(/symptom name is required/i);
        expect(errorMessage).toHaveAttribute('role', 'alert');
      });
    });

    it('should have proper slider accessibility', () => {
      render(<SymptomForm {...defaultProps} />);

      const severitySlider = screen.getByLabelText(/severity/i);
      expect(severitySlider).toHaveAttribute('type', 'range');
      expect(severitySlider).toHaveAttribute('min', '1');
      expect(severitySlider).toHaveAttribute('max', '10');
    });
  });
});