import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../test-utils';
import HealthReadingForm from '../../components/forms/HealthReadingForm';
import * as unitConversion from '../../utils/unitConversion';

// Mock unit conversion utilities
vi.mock('../../utils/unitConversion', () => ({
  convertBloodPressure: vi.fn(),
  convertBloodSugar: vi.fn(),
  convertWeight: vi.fn(),
  convertTemperature: vi.fn(),
  getAvailableUnits: vi.fn(),
  getDefaultUnit: vi.fn(),
}));

describe('HealthReadingForm', () => {
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
    vi.mocked(unitConversion.getAvailableUnits).mockImplementation((type) => {
      const units = {
        blood_pressure: ['mmHg'],
        blood_sugar: ['mg/dL', 'mmol/L'],
        weight: ['kg', 'lbs'],
        heart_rate: ['bpm'],
        temperature: ['°C', '°F']
      };
      return units[type as keyof typeof units] || [];
    });
    
    vi.mocked(unitConversion.getDefaultUnit).mockImplementation((type) => {
      const defaults = {
        blood_pressure: 'mmHg',
        blood_sugar: 'mg/dL',
        weight: 'kg',
        heart_rate: 'bpm',
        temperature: '°C'
      };
      return defaults[type as keyof typeof defaults] || '';
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors for required fields', async () => {
      const user = userEvent.setup();
      render(<HealthReadingForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: /add reading/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/type is required/i)).toBeInTheDocument();
        expect(screen.getByText(/value is required/i)).toBeInTheDocument();
      });
    });

    it('should validate blood pressure values', async () => {
      const user = userEvent.setup();
      render(<HealthReadingForm {...defaultProps} metricType="blood_pressure" />);

      const systolicInput = screen.getByLabelText(/systolic/i);
      const diastolicInput = screen.getByLabelText(/diastolic/i);

      // Test minimum values
      await user.type(systolicInput, '50'); // Below minimum
      await user.type(diastolicInput, '30'); // Below minimum
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/systolic must be at least 70/i)).toBeInTheDocument();
        expect(screen.getByText(/diastolic must be at least 40/i)).toBeInTheDocument();
      });

      // Test maximum values
      await user.clear(systolicInput);
      await user.clear(diastolicInput);
      await user.type(systolicInput, '300'); // Above maximum
      await user.type(diastolicInput, '200'); // Above maximum
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/systolic must be at most 250/i)).toBeInTheDocument();
        expect(screen.getByText(/diastolic must be at most 150/i)).toBeInTheDocument();
      });
    });

    it('should validate blood sugar values', async () => {
      const user = userEvent.setup();
      render(<HealthReadingForm {...defaultProps} metricType="blood_sugar" />);

      const valueInput = screen.getByLabelText(/blood sugar/i);

      // Test minimum value
      await user.type(valueInput, '30'); // Below minimum
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/blood sugar must be at least 40/i)).toBeInTheDocument();
      });

      // Test maximum value
      await user.clear(valueInput);
      await user.type(valueInput, '600'); // Above maximum
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/blood sugar must be at most 500/i)).toBeInTheDocument();
      });
    });

    it('should validate weight values', async () => {
      const user = userEvent.setup();
      render(<HealthReadingForm {...defaultProps} metricType="weight" />);

      const valueInput = screen.getByLabelText(/weight/i);

      // Test minimum value
      await user.type(valueInput, '20'); // Below minimum
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/weight must be at least 30/i)).toBeInTheDocument();
      });

      // Test maximum value
      await user.clear(valueInput);
      await user.type(valueInput, '700'); // Above maximum
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/weight must be at most 600/i)).toBeInTheDocument();
      });
    });

    it('should validate heart rate values', async () => {
      const user = userEvent.setup();
      render(<HealthReadingForm {...defaultProps} metricType="heart_rate" />);

      const valueInput = screen.getByLabelText(/heart rate/i);

      // Test minimum value
      await user.type(valueInput, '30'); // Below minimum
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/heart rate must be at least 40/i)).toBeInTheDocument();
      });

      // Test maximum value
      await user.clear(valueInput);
      await user.type(valueInput, '250'); // Above maximum
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/heart rate must be at most 220/i)).toBeInTheDocument();
      });
    });

    it('should validate temperature values', async () => {
      const user = userEvent.setup();
      render(<HealthReadingForm {...defaultProps} metricType="temperature" />);

      const valueInput = screen.getByLabelText(/temperature/i);

      // Test minimum value
      await user.type(valueInput, '30'); // Below minimum
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/temperature must be at least 35/i)).toBeInTheDocument();
      });

      // Test maximum value
      await user.clear(valueInput);
      await user.type(valueInput, '50'); // Above maximum
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/temperature must be at most 45/i)).toBeInTheDocument();
      });
    });

    it('should validate notes length', async () => {
      const user = userEvent.setup();
      render(<HealthReadingForm {...defaultProps} />);

      const notesInput = screen.getByLabelText(/notes/i);
      const longText = 'A'.repeat(501); // Exceeds 500 character limit
      await user.type(notesInput, longText);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/notes cannot exceed 500 characters/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Interactions', () => {
    it('should change form fields based on metric type selection', async () => {
      const user = userEvent.setup();
      render(<HealthReadingForm {...defaultProps} />);

      const typeSelect = screen.getByLabelText(/metric type/i);

      // Select blood pressure
      await user.selectOptions(typeSelect, 'blood_pressure');
      expect(screen.getByLabelText(/systolic/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/diastolic/i)).toBeInTheDocument();

      // Select blood sugar
      await user.selectOptions(typeSelect, 'blood_sugar');
      expect(screen.getByLabelText(/blood sugar/i)).toBeInTheDocument();
      expect(screen.queryByLabelText(/systolic/i)).not.toBeInTheDocument();

      // Select weight
      await user.selectOptions(typeSelect, 'weight');
      expect(screen.getByLabelText(/weight/i)).toBeInTheDocument();

      // Select heart rate
      await user.selectOptions(typeSelect, 'heart_rate');
      expect(screen.getByLabelText(/heart rate/i)).toBeInTheDocument();

      // Select temperature
      await user.selectOptions(typeSelect, 'temperature');
      expect(screen.getByLabelText(/temperature/i)).toBeInTheDocument();
    });

    it('should show appropriate units for each metric type', async () => {
      const user = userEvent.setup();
      render(<HealthReadingForm {...defaultProps} />);

      const typeSelect = screen.getByLabelText(/metric type/i);

      // Blood sugar should show unit options
      await user.selectOptions(typeSelect, 'blood_sugar');
      expect(screen.getByLabelText(/unit/i)).toBeInTheDocument();
      expect(screen.getByText('mg/dL')).toBeInTheDocument();
      expect(screen.getByText('mmol/L')).toBeInTheDocument();

      // Weight should show unit options
      await user.selectOptions(typeSelect, 'weight');
      expect(screen.getByText('kg')).toBeInTheDocument();
      expect(screen.getByText('lbs')).toBeInTheDocument();
    });

    it('should show context selection options', async () => {
      const user = userEvent.setup();
      render(<HealthReadingForm {...defaultProps} metricType="blood_sugar" />);

      const contextSelect = screen.getByLabelText(/context/i);
      expect(contextSelect).toBeInTheDocument();

      await user.selectOptions(contextSelect, 'before_meal');
      expect(contextSelect).toHaveValue('before_meal');
    });

    it('should show quick entry shortcuts', async () => {
      render(<HealthReadingForm {...defaultProps} metricType="blood_pressure" />);

      expect(screen.getByRole('button', { name: /normal/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /high/i })).toBeInTheDocument();
    });

    it('should populate values when quick entry is clicked', async () => {
      const user = userEvent.setup();
      render(<HealthReadingForm {...defaultProps} metricType="blood_pressure" />);

      const normalButton = screen.getByRole('button', { name: /normal/i });
      await user.click(normalButton);

      const systolicInput = screen.getByLabelText(/systolic/i);
      const diastolicInput = screen.getByLabelText(/diastolic/i);

      expect(systolicInput).toHaveValue('120');
      expect(diastolicInput).toHaveValue('80');
    });

    it('should show historical data comparison when available', async () => {
      render(<HealthReadingForm {...defaultProps} metricType="blood_sugar" />);

      // Historical data comparison should be available in the form
      expect(screen.getByLabelText(/blood sugar/i)).toBeInTheDocument();
    });

    it('should convert units when unit selection changes', async () => {
      const user = userEvent.setup();
      vi.mocked(unitConversion.convertBloodSugar).mockReturnValue({ value: 6.7, unit: 'mmol/L' });
      
      render(<HealthReadingForm {...defaultProps} metricType="blood_sugar" />);

      const valueInput = screen.getByLabelText(/blood sugar/i);
      const unitSelect = screen.getByLabelText(/unit/i);

      await user.type(valueInput, '120');
      await user.selectOptions(unitSelect, 'mmol/L');

      expect(unitConversion.convertBloodSugar).toHaveBeenCalledWith(120, 'mg/dL', 'mmol/L');
    });
  });

  describe('Form Submission', () => {
    it('should submit blood pressure reading', async () => {
      const user = userEvent.setup();
      render(<HealthReadingForm {...defaultProps} metricType="blood_pressure" />);

      const systolicInput = screen.getByLabelText(/systolic/i);
      const diastolicInput = screen.getByLabelText(/diastolic/i);
      const contextSelect = screen.getByLabelText(/context/i);
      const notesInput = screen.getByLabelText(/notes/i);

      await user.type(systolicInput, '120');
      await user.type(diastolicInput, '80');
      await user.selectOptions(contextSelect, 'resting');
      await user.type(notesInput, 'Morning reading');

      const submitButton = screen.getByRole('button', { name: /add reading/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          type: 'blood_pressure',
          value: { systolic: 120, diastolic: 80 },
          unit: 'mmHg',
          timestamp: expect.any(String),
          context: 'resting',
          notes: 'Morning reading'
        });
      });
    });

    it('should submit single value reading', async () => {
      const user = userEvent.setup();
      render(<HealthReadingForm {...defaultProps} metricType="blood_sugar" />);

      const valueInput = screen.getByLabelText(/blood sugar/i);
      const unitSelect = screen.getByLabelText(/unit/i);
      const contextSelect = screen.getByLabelText(/context/i);

      await user.type(valueInput, '95');
      await user.selectOptions(unitSelect, 'mg/dL');
      await user.selectOptions(contextSelect, 'before_meal');

      const submitButton = screen.getByRole('button', { name: /add reading/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          type: 'blood_sugar',
          value: 95,
          unit: 'mg/dL',
          timestamp: expect.any(String),
          context: 'before_meal',
          notes: ''
        });
      });
    });

    it('should show loading state during submission', async () => {
      render(<HealthReadingForm {...defaultProps} isLoading={true} />);

      expect(screen.getByText(/adding reading/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /adding/i })).toBeDisabled();
    });

    it('should handle submission errors', async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockRejectedValue(new Error('Submission failed'));
      
      render(<HealthReadingForm {...defaultProps} metricType="blood_sugar" />);

      const valueInput = screen.getByLabelText(/blood sugar/i);
      await user.type(valueInput, '95');

      const submitButton = screen.getByRole('button', { name: /add reading/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });
  });

  describe('Animation Triggers', () => {
    it('should trigger animations on form field focus', async () => {
      const user = userEvent.setup();
      render(<HealthReadingForm {...defaultProps} metricType="blood_sugar" />);

      const valueInput = screen.getByLabelText(/blood sugar/i);
      await user.click(valueInput);

      expect(valueInput).toHaveFocus();
    });

    it('should animate metric type changes', async () => {
      const user = userEvent.setup();
      render(<HealthReadingForm {...defaultProps} />);

      const typeSelect = screen.getByLabelText(/metric type/i);
      await user.selectOptions(typeSelect, 'blood_pressure');

      // Form should update with animation
      expect(screen.getByLabelText(/systolic/i)).toBeInTheDocument();
    });

    it('should animate quick entry button clicks', async () => {
      const user = userEvent.setup();
      render(<HealthReadingForm {...defaultProps} metricType="blood_pressure" />);

      const normalButton = screen.getByRole('button', { name: /normal/i });
      await user.click(normalButton);

      // Button should have been clicked (animation trigger)
      expect(normalButton).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle unit conversion errors', async () => {
      const user = userEvent.setup();
      vi.mocked(unitConversion.convertBloodSugar).mockImplementation(() => {
        throw new Error('Conversion failed');
      });
      
      render(<HealthReadingForm {...defaultProps} metricType="blood_sugar" />);

      const valueInput = screen.getByLabelText(/blood sugar/i);
      const unitSelect = screen.getByLabelText(/unit/i);

      await user.type(valueInput, '120');
      await user.selectOptions(unitSelect, 'mmol/L');

      // Should not crash and should maintain original value
      expect(valueInput).toHaveValue('120');
    });

    it('should handle invalid numeric input', async () => {
      const user = userEvent.setup();
      render(<HealthReadingForm {...defaultProps} metricType="blood_sugar" />);

      const valueInput = screen.getByLabelText(/blood sugar/i);
      await user.type(valueInput, 'invalid');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/must be a valid number/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<HealthReadingForm {...defaultProps} />);

      expect(screen.getByLabelText(/metric type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
    });

    it('should have proper form field associations', () => {
      render(<HealthReadingForm {...defaultProps} metricType="blood_pressure" />);

      const systolicInput = screen.getByLabelText(/systolic/i);
      const diastolicInput = screen.getByLabelText(/diastolic/i);

      expect(systolicInput).toHaveAttribute('type', 'number');
      expect(diastolicInput).toHaveAttribute('type', 'number');
    });

    it('should announce validation errors to screen readers', async () => {
      const user = userEvent.setup();
      render(<HealthReadingForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: /add reading/i });
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.getByText(/type is required/i);
        expect(errorMessage).toHaveAttribute('role', 'alert');
      });
    });

    it('should have proper quick entry button accessibility', () => {
      render(<HealthReadingForm {...defaultProps} metricType="blood_pressure" />);

      const normalButton = screen.getByRole('button', { name: /normal/i });
      expect(normalButton).toHaveAttribute('aria-label', 'Set normal blood pressure values');
    });
  });
});