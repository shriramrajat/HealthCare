import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from './test-utils';
import { firestoreService } from '../firebase/firestore';

// Import components for integration testing
import MedicationForm from '../components/forms/MedicationForm';
import SymptomForm from '../components/forms/SymptomForm';
import SymptomCalendar from '../components/calendar/SymptomCalendar';
import ReviewForm from '../components/forms/ReviewForm';
import HealthReadingForm from '../components/forms/HealthReadingForm';
import AnimatedModal from '../components/ui/AnimatedModal';
import { Symptoms } from '../pages/Symptoms';
import { Medications } from '../pages/Medications';
import { Reviews } from '../pages/Reviews';

// Mock data
const mockMedications = [
  {
    id: 'med-1',
    userId: 'user-1',
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'twice_daily',
    startDate: '2024-01-01',
    reminders: ['08:00', '20:00'],
    notes: 'Take with meals',
    adherence: [true, true, false, true],
    sideEffects: [],
    interactions: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

const mockSymptoms = [
  {
    id: 'symptom-1',
    userId: 'user-1',
    name: 'Headache',
    severity: 7,
    date: '2024-01-15',
    time: '14:30',
    notes: 'Severe headache after lunch',
    triggers: ['stress', 'lack of sleep'],
    duration: 120,
    location: 'forehead',
    photos: [],
    createdAt: '2024-01-15T14:30:00Z',
    updatedAt: '2024-01-15T14:30:00Z'
  },
  {
    id: 'symptom-2',
    userId: 'user-1',
    name: 'Fatigue',
    severity: 5,
    date: '2024-01-16',
    time: '10:00',
    notes: 'Feeling tired',
    triggers: ['poor sleep'],
    duration: 240,
    location: 'general',
    photos: [],
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z'
  }
];

describe('Integration Tests - Form Submission Workflows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful Firestore operations
    vi.spyOn(firestoreService, 'addMedication').mockResolvedValue('new-med-id');
    vi.spyOn(firestoreService, 'updateMedication').mockResolvedValue();
    vi.spyOn(firestoreService, 'addSymptom').mockResolvedValue('new-symptom-id');
    vi.spyOn(firestoreService, 'addReview').mockResolvedValue('new-review-id');
    vi.spyOn(firestoreService, 'addHealthReading').mockResolvedValue('new-reading-id');
    vi.spyOn(firestoreService, 'getMedications').mockResolvedValue(mockMedications);
    vi.spyOn(firestoreService, 'getSymptoms').mockResolvedValue(mockSymptoms);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Medication Form Submission Workflow', () => {
    it('should complete full medication form submission with validation and database save', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
      const mockOnCancel = vi.fn();

      render(
        <MedicationForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          existingMedications={mockMedications}
        />
      );

      // Fill out medication form
      const nameInput = screen.getByLabelText(/medication name/i);
      await user.type(nameInput, 'Lisinopril');

      // Wait for autocomplete suggestions
      await waitFor(() => {
        expect(screen.getByText(/lisinopril/i)).toBeInTheDocument();
      });

      const dosageInput = screen.getByLabelText(/dosage/i);
      await user.type(dosageInput, '10mg');

      const frequencySelect = screen.getByLabelText(/frequency/i);
      await user.selectOptions(frequencySelect, 'once_daily');

      const startDateInput = screen.getByLabelText(/start date/i);
      await user.type(startDateInput, '2024-01-20');

      // Add reminder time
      const addReminderButton = screen.getByRole('button', { name: /add reminder/i });
      await user.click(addReminderButton);

      const reminderTimeInput = screen.getByLabelText(/reminder time/i);
      await user.type(reminderTimeInput, '08:00');

      const notesTextarea = screen.getByLabelText(/notes/i);
      await user.type(notesTextarea, 'Take in the morning with water');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /add medication/i });
      await user.click(submitButton);

      // Verify form submission
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: 'once_daily',
          startDate: '2024-01-20',
          reminders: ['08:00'],
          notes: 'Take in the morning with water'
        });
      });

      // Verify loading state during submission
      expect(screen.getByRole('button', { name: /adding.../i })).toBeInTheDocument();
    });

    it('should handle form validation errors and prevent submission', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      const mockOnCancel = vi.fn();

      render(
        <MedicationForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // Try to submit empty form
      const submitButton = screen.getByRole('button', { name: /add medication/i });
      await user.click(submitButton);

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/medication name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/dosage is required/i)).toBeInTheDocument();
        expect(screen.getByText(/frequency is required/i)).toBeInTheDocument();
      });

      // Form should not be submitted
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should handle drug interaction warnings during form submission', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

      render(
        <MedicationForm
          onSubmit={mockOnSubmit}
          onCancel={vi.fn()}
          existingMedications={mockMedications}
        />
      );

      // Enter medication that interacts with existing one
      const nameInput = screen.getByLabelText(/medication name/i);
      await user.type(nameInput, 'Warfarin');

      const dosageInput = screen.getByLabelText(/dosage/i);
      await user.type(dosageInput, '5mg');

      const frequencySelect = screen.getByLabelText(/frequency/i);
      await user.selectOptions(frequencySelect, 'once_daily');

      const startDateInput = screen.getByLabelText(/start date/i);
      await user.type(startDateInput, '2024-01-20');

      // Should show interaction warning
      await waitFor(() => {
        expect(screen.getByText(/drug interaction warning/i)).toBeInTheDocument();
      });

      // Should still allow submission with confirmation
      const submitButton = screen.getByRole('button', { name: /add medication/i });
      await user.click(submitButton);

      const confirmButton = screen.getByRole('button', { name: /continue anyway/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });
  });

  describe('Symptom Form Submission Workflow', () => {
    it('should complete full symptom form submission with body diagram and photo attachment', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
      const mockOnCancel = vi.fn();

      render(
        <SymptomForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          selectedDate="2024-01-20"
        />
      );

      // Fill out symptom form
      const nameInput = screen.getByLabelText(/symptom name/i);
      await user.type(nameInput, 'Back pain');

      // Set severity using slider
      const severitySlider = screen.getByLabelText(/severity/i);
      fireEvent.change(severitySlider, { target: { value: '8' } });

      const timeInput = screen.getByLabelText(/time/i);
      await user.type(timeInput, '15:30');

      // Add triggers
      const triggerInput = screen.getByLabelText(/triggers/i);
      await user.type(triggerInput, 'heavy lifting');
      
      const addTriggerButton = screen.getByRole('button', { name: /add trigger/i });
      await user.click(addTriggerButton);

      // Set duration
      const durationInput = screen.getByLabelText(/duration/i);
      await user.type(durationInput, '180');

      // Click on body diagram to set location
      const bodyDiagram = screen.getByTestId('body-diagram');
      fireEvent.click(bodyDiagram, { clientX: 100, clientY: 200 });

      // Add notes
      const notesTextarea = screen.getByLabelText(/notes/i);
      await user.type(notesTextarea, 'Sharp pain in lower back after lifting boxes');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /log symptom/i });
      await user.click(submitButton);

      // Verify form submission
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'Back pain',
          severity: 8,
          date: '2024-01-20',
          time: '15:30',
          triggers: ['heavy lifting'],
          duration: 180,
          location: expect.any(String),
          notes: 'Sharp pain in lower back after lifting boxes'
        });
      });
    });

    it('should handle photo attachment workflow', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

      // Mock file upload
      const mockFile = new File(['test'], 'symptom-photo.jpg', { type: 'image/jpeg' });
      
      render(
        <SymptomForm
          onSubmit={mockOnSubmit}
          onCancel={vi.fn()}
          selectedDate="2024-01-20"
        />
      );

      // Fill required fields
      const nameInput = screen.getByLabelText(/symptom name/i);
      await user.type(nameInput, 'Rash');

      const severitySlider = screen.getByLabelText(/severity/i);
      fireEvent.change(severitySlider, { target: { value: '5' } });

      const timeInput = screen.getByLabelText(/time/i);
      await user.type(timeInput, '10:00');

      // Upload photo
      const fileInput = screen.getByLabelText(/attach photo/i);
      await user.upload(fileInput, mockFile);

      // Should show photo preview
      await waitFor(() => {
        expect(screen.getByAltText(/symptom photo/i)).toBeInTheDocument();
      });

      // Submit form
      const submitButton = screen.getByRole('button', { name: /log symptom/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            photos: expect.arrayContaining([expect.any(String)])
          })
        );
      });
    });
  });

  describe('Review Form Submission Workflow', () => {
    it('should complete full review form submission with star ratings', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
      const mockOnCancel = vi.fn();

      render(
        <ReviewForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          doctorId="doctor-123"
        />
      );

      // Select overall rating
      const overallStars = screen.getAllByTestId('star-rating-overall');
      await user.click(overallStars[3]); // 4 stars

      // Select category ratings
      const communicationStars = screen.getAllByTestId('star-rating-communication');
      await user.click(communicationStars[4]); // 5 stars

      const expertiseStars = screen.getAllByTestId('star-rating-expertise');
      await user.click(expertiseStars[3]); // 4 stars

      const punctualityStars = screen.getAllByTestId('star-rating-punctuality');
      await user.click(punctualityStars[2]); // 3 stars

      // Add comment
      const commentTextarea = screen.getByLabelText(/comment/i);
      await user.type(commentTextarea, 'Dr. Smith was very professional and thorough. The appointment started a bit late but the consultation was excellent.');

      // Submit review
      const submitButton = screen.getByRole('button', { name: /submit review/i });
      await user.click(submitButton);

      // Verify form submission
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          doctorId: 'doctor-123',
          rating: 4,
          comment: 'Dr. Smith was very professional and thorough. The appointment started a bit late but the consultation was excellent.',
          categories: {
            communication: 5,
            expertise: 4,
            punctuality: 3,
            overall: 4
          }
        });
      });
    });

    it('should handle anonymous review submission', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

      render(
        <ReviewForm
          onSubmit={mockOnSubmit}
          onCancel={vi.fn()}
        />
      );

      // Select doctor
      const doctorSelect = screen.getByLabelText(/select doctor/i);
      await user.selectOptions(doctorSelect, 'doctor-456');

      // Enable anonymous review
      const anonymousCheckbox = screen.getByLabelText(/submit anonymously/i);
      await user.click(anonymousCheckbox);

      // Set rating and comment
      const overallStars = screen.getAllByTestId('star-rating-overall');
      await user.click(overallStars[4]); // 5 stars

      const commentTextarea = screen.getByLabelText(/comment/i);
      await user.type(commentTextarea, 'Excellent service');

      // Submit review
      const submitButton = screen.getByRole('button', { name: /submit review/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            doctorId: 'doctor-456',
            anonymous: true
          })
        );
      });
    });
  });

  describe('Health Reading Form Submission Workflow', () => {
    it('should complete blood pressure reading submission with context', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
      const mockOnCancel = vi.fn();

      render(
        <HealthReadingForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          metricType="blood_pressure"
        />
      );

      // Fill blood pressure values
      const systolicInput = screen.getByLabelText(/systolic/i);
      await user.type(systolicInput, '120');

      const diastolicInput = screen.getByLabelText(/diastolic/i);
      await user.type(diastolicInput, '80');

      // Select context
      const contextSelect = screen.getByLabelText(/context/i);
      await user.selectOptions(contextSelect, 'before_meal');

      // Add notes
      const notesTextarea = screen.getByLabelText(/notes/i);
      await user.type(notesTextarea, 'Feeling relaxed, measured after 5 minutes of rest');

      // Submit reading
      const submitButton = screen.getByRole('button', { name: /save reading/i });
      await user.click(submitButton);

      // Verify form submission
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          type: 'blood_pressure',
          value: { systolic: 120, diastolic: 80 },
          unit: 'mmHg',
          timestamp: expect.any(String),
          context: 'before_meal',
          notes: 'Feeling relaxed, measured after 5 minutes of rest'
        });
      });
    });

    it('should handle unit conversion for weight readings', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

      render(
        <HealthReadingForm
          onSubmit={mockOnSubmit}
          onCancel={vi.fn()}
          metricType="weight"
        />
      );

      // Enter weight value
      const weightInput = screen.getByLabelText(/weight/i);
      await user.type(weightInput, '150');

      // Change unit from kg to lbs
      const unitSelect = screen.getByLabelText(/unit/i);
      await user.selectOptions(unitSelect, 'lbs');

      // Submit reading
      const submitButton = screen.getByRole('button', { name: /save reading/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'weight',
            value: 150,
            unit: 'lbs'
          })
        );
      });
    });

    it('should show historical data comparison', async () => {
      const user = userEvent.setup();
      const mockHistoricalData = [
        { date: '2024-01-15', value: 118, unit: 'mmHg' },
        { date: '2024-01-10', value: 122, unit: 'mmHg' }
      ];

      vi.spyOn(firestoreService, 'getHealthReadings').mockResolvedValue(mockHistoricalData);

      render(
        <HealthReadingForm
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
          metricType="blood_pressure"
        />
      );

      // Should show historical comparison
      await waitFor(() => {
        expect(screen.getByText(/recent readings/i)).toBeInTheDocument();
        expect(screen.getByText(/118/)).toBeInTheDocument();
        expect(screen.getByText(/122/)).toBeInTheDocument();
      });
    });
  });
});
descri
be('Integration Tests - Calendar Interaction Flows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(firestoreService, 'getSymptoms').mockResolvedValue(mockSymptoms);
  });

  describe('Symptom Calendar Integration', () => {
    it('shoul