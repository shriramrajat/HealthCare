import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../test-utils';
import ReviewForm from '../../components/forms/ReviewForm';
import { firestoreService } from '../../firebase/firestore';

// Mock firestore service
vi.mock('../../firebase/firestore', () => ({
  firestoreService: {
    getDoctors: vi.fn(),
  },
}));

describe('ReviewForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
    isLoading: false,
  };

  const mockDoctors = [
    {
      id: 'doctor-1',
      name: 'Dr. John Smith',
      specialization: 'Cardiology',
      email: 'john.smith@hospital.com',
      role: 'doctor' as const,
      phone: '+1234567890',
      avatar: ''
    },
    {
      id: 'doctor-2',
      name: 'Dr. Jane Doe',
      specialization: 'Neurology',
      email: 'jane.doe@hospital.com',
      role: 'doctor' as const,
      phone: '+1234567890',
      avatar: ''
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(firestoreService.getDoctors).mockResolvedValue(mockDoctors);
  });

  describe('Form Validation', () => {
    it('should show validation errors for required fields', async () => {
      const user = userEvent.setup();
      render(<ReviewForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: /submit review/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please select a doctor/i)).toBeInTheDocument();
        expect(screen.getByText(/please provide a rating/i)).toBeInTheDocument();
        expect(screen.getByText(/please share your experience/i)).toBeInTheDocument();
      });
    });

    it('should validate comment length', async () => {
      const user = userEvent.setup();
      render(<ReviewForm {...defaultProps} />);

      const commentInput = screen.getByLabelText(/your experience/i);
      await user.type(commentInput, 'Short'); // Less than 10 characters
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/please provide at least 10 characters/i)).toBeInTheDocument();
      });

      // Test maximum length
      await user.clear(commentInput);
      const longComment = 'A'.repeat(501); // Exceeds 500 character limit
      await user.type(commentInput, longComment);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/comment cannot exceed 500 characters/i)).toBeInTheDocument();
      });
    });

    it('should validate rating range (1-5)', async () => {
      const user = userEvent.setup();
      render(<ReviewForm {...defaultProps} />);

      // Try to submit without rating
      const submitButton = screen.getByRole('button', { name: /submit review/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please provide a rating/i)).toBeInTheDocument();
      });
    });

    it('should validate all category ratings are provided', async () => {
      const user = userEvent.setup();
      render(<ReviewForm {...defaultProps} />);

      // Select doctor and provide overall rating but miss category ratings
      const doctorSelect = screen.getByLabelText(/select doctor/i);
      await user.selectOptions(doctorSelect, 'doctor-1');

      const overallStars = screen.getAllByRole('button', { name: /rate/i });
      await user.click(overallStars[4]); // 5 stars for overall

      const commentInput = screen.getByLabelText(/your experience/i);
      await user.type(commentInput, 'Great experience with the doctor');

      const submitButton = screen.getByRole('button', { name: /submit review/i });
      await user.click(submitButton);

      // Should require category ratings
      await waitFor(() => {
        expect(screen.getByText(/please rate all categories/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Interactions', () => {
    it('should load and display doctors in dropdown', async () => {
      render(<ReviewForm {...defaultProps} />);

      await waitFor(() => {
        expect(firestoreService.getDoctors).toHaveBeenCalled();
        expect(screen.getByText('Dr. John Smith - Cardiology')).toBeInTheDocument();
        expect(screen.getByText('Dr. Jane Doe - Neurology')).toBeInTheDocument();
      });
    });

    it('should pre-select doctor when doctorId is provided', async () => {
      render(<ReviewForm {...defaultProps} doctorId="doctor-1" />);

      await waitFor(() => {
        const doctorSelect = screen.getByLabelText(/select doctor/i);
        expect(doctorSelect).toHaveValue('doctor-1');
      });
    });

    it('should update star ratings on click', async () => {
      const user = userEvent.setup();
      render(<ReviewForm {...defaultProps} />);

      // Click on 4th star for overall rating
      const overallStars = screen.getAllByTestId('star-rating-overall');
      const fourthStar = overallStars[3]; // 0-indexed, so 3 = 4th star
      await user.click(fourthStar);

      // Check that 4 stars are filled
      const filledStars = screen.getAllByTestId('star-filled-overall');
      expect(filledStars).toHaveLength(4);
    });

    it('should update category ratings independently', async () => {
      const user = userEvent.setup();
      render(<ReviewForm {...defaultProps} />);

      // Rate communication
      const communicationStars = screen.getAllByTestId('star-rating-communication');
      await user.click(communicationStars[4]); // 5 stars

      // Rate expertise
      const expertiseStars = screen.getAllByTestId('star-rating-expertise');
      await user.click(expertiseStars[2]); // 3 stars

      // Check ratings are independent
      expect(screen.getAllByTestId('star-filled-communication')).toHaveLength(5);
      expect(screen.getAllByTestId('star-filled-expertise')).toHaveLength(3);
    });

    it('should show character count for comment', async () => {
      const user = userEvent.setup();
      render(<ReviewForm {...defaultProps} />);

      const commentInput = screen.getByLabelText(/your experience/i);
      await user.type(commentInput, 'Great doctor!');

      expect(screen.getByText('13/500')).toBeInTheDocument();
    });

    it('should toggle anonymous review option', async () => {
      const user = userEvent.setup();
      render(<ReviewForm {...defaultProps} />);

      const anonymousCheckbox = screen.getByLabelText(/submit anonymously/i);
      expect(anonymousCheckbox).not.toBeChecked();

      await user.click(anonymousCheckbox);
      expect(anonymousCheckbox).toBeChecked();
    });

    it('should show hover effects on stars', async () => {
      const user = userEvent.setup();
      render(<ReviewForm {...defaultProps} />);

      const overallStars = screen.getAllByTestId('star-rating-overall');
      const thirdStar = overallStars[2];

      await user.hover(thirdStar);
      
      // Should highlight stars up to hovered star
      const hoveredStars = screen.getAllByTestId('star-hovered-overall');
      expect(hoveredStars).toHaveLength(3);
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      render(<ReviewForm {...defaultProps} />);

      // Wait for doctors to load
      await waitFor(() => {
        expect(screen.getByText('Dr. John Smith - Cardiology')).toBeInTheDocument();
      });

      // Fill out form
      const doctorSelect = screen.getByLabelText(/select doctor/i);
      await user.selectOptions(doctorSelect, 'doctor-1');

      // Rate overall
      const overallStars = screen.getAllByTestId('star-rating-overall');
      await user.click(overallStars[4]); // 5 stars

      // Rate categories
      const communicationStars = screen.getAllByTestId('star-rating-communication');
      await user.click(communicationStars[4]); // 5 stars

      const expertiseStars = screen.getAllByTestId('star-rating-expertise');
      await user.click(expertiseStars[3]); // 4 stars

      const punctualityStars = screen.getAllByTestId('star-rating-punctuality');
      await user.click(punctualityStars[4]); // 5 stars

      // Add comment
      const commentInput = screen.getByLabelText(/your experience/i);
      await user.type(commentInput, 'Excellent doctor with great bedside manner. Highly recommend!');

      const submitButton = screen.getByRole('button', { name: /submit review/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          doctorId: 'doctor-1',
          rating: 5,
          comment: 'Excellent doctor with great bedside manner. Highly recommend!',
          categories: {
            communication: 5,
            expertise: 4,
            punctuality: 5,
            overall: 5
          },
          anonymous: false
        });
      });
    });

    it('should submit anonymous review', async () => {
      const user = userEvent.setup();
      render(<ReviewForm {...defaultProps} />);

      // Wait for doctors to load
      await waitFor(() => {
        expect(screen.getByText('Dr. John Smith - Cardiology')).toBeInTheDocument();
      });

      // Fill minimum required fields
      const doctorSelect = screen.getByLabelText(/select doctor/i);
      await user.selectOptions(doctorSelect, 'doctor-1');

      const overallStars = screen.getAllByTestId('star-rating-overall');
      await user.click(overallStars[3]); // 4 stars

      // Fill category ratings
      const communicationStars = screen.getAllByTestId('star-rating-communication');
      await user.click(communicationStars[3]);

      const expertiseStars = screen.getAllByTestId('star-rating-expertise');
      await user.click(expertiseStars[3]);

      const punctualityStars = screen.getAllByTestId('star-rating-punctuality');
      await user.click(punctualityStars[3]);

      const commentInput = screen.getByLabelText(/your experience/i);
      await user.type(commentInput, 'Good experience overall');

      // Enable anonymous
      const anonymousCheckbox = screen.getByLabelText(/submit anonymously/i);
      await user.click(anonymousCheckbox);

      const submitButton = screen.getByRole('button', { name: /submit review/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            anonymous: true
          })
        );
      });
    });

    it('should show loading state during submission', async () => {
      render(<ReviewForm {...defaultProps} isLoading={true} />);

      expect(screen.getByText(/submitting review/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submitting/i })).toBeDisabled();
    });

    it('should handle submission errors', async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockRejectedValue(new Error('Submission failed'));
      
      render(<ReviewForm {...defaultProps} />);

      // Fill minimum required fields
      await waitFor(() => {
        expect(screen.getByText('Dr. John Smith - Cardiology')).toBeInTheDocument();
      });

      const doctorSelect = screen.getByLabelText(/select doctor/i);
      await user.selectOptions(doctorSelect, 'doctor-1');

      const overallStars = screen.getAllByTestId('star-rating-overall');
      await user.click(overallStars[3]);

      // Fill category ratings
      const communicationStars = screen.getAllByTestId('star-rating-communication');
      await user.click(communicationStars[3]);

      const expertiseStars = screen.getAllByTestId('star-rating-expertise');
      await user.click(expertiseStars[3]);

      const punctualityStars = screen.getAllByTestId('star-rating-punctuality');
      await user.click(punctualityStars[3]);

      const commentInput = screen.getByLabelText(/your experience/i);
      await user.type(commentInput, 'Good experience');

      const submitButton = screen.getByRole('button', { name: /submit review/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });
  });

  describe('Animation Triggers', () => {
    it('should trigger star animation on hover', async () => {
      const user = userEvent.setup();
      render(<ReviewForm {...defaultProps} />);

      const overallStars = screen.getAllByTestId('star-rating-overall');
      const star = overallStars[2];

      await user.hover(star);
      
      // Check if hover state is applied (animation trigger)
      expect(star).toHaveClass('star-hover');
    });

    it('should animate star fill on click', async () => {
      const user = userEvent.setup();
      render(<ReviewForm {...defaultProps} />);

      const overallStars = screen.getAllByTestId('star-rating-overall');
      const star = overallStars[2];

      await user.click(star);
      
      // Check if filled state is applied (animation trigger)
      expect(star).toHaveClass('star-filled');
    });

    it('should animate form field focus', async () => {
      const user = userEvent.setup();
      render(<ReviewForm {...defaultProps} />);

      const commentInput = screen.getByLabelText(/your experience/i);
      await user.click(commentInput);

      expect(commentInput).toHaveFocus();
    });
  });

  describe('Error Handling', () => {
    it('should handle doctor loading errors', async () => {
      vi.mocked(firestoreService.getDoctors).mockRejectedValue(new Error('Failed to load doctors'));
      
      render(<ReviewForm {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load doctors/i)).toBeInTheDocument();
      });
    });

    it('should handle invalid doctor selection', async () => {
      const user = userEvent.setup();
      render(<ReviewForm {...defaultProps} doctorId="invalid-doctor-id" />);

      // Should not crash and should allow manual selection
      await waitFor(() => {
        const doctorSelect = screen.getByLabelText(/select doctor/i);
        expect(doctorSelect).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      render(<ReviewForm {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/select doctor/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/your experience/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/submit anonymously/i)).toBeInTheDocument();
      });
    });

    it('should have proper star rating accessibility', () => {
      render(<ReviewForm {...defaultProps} />);

      const overallStars = screen.getAllByTestId('star-rating-overall');
      overallStars.forEach((star, index) => {
        expect(star).toHaveAttribute('aria-label', `Rate ${index + 1} out of 5 stars`);
        expect(star).toHaveAttribute('role', 'button');
      });
    });

    it('should announce rating changes to screen readers', async () => {
      const user = userEvent.setup();
      render(<ReviewForm {...defaultProps} />);

      const overallStars = screen.getAllByTestId('star-rating-overall');
      await user.click(overallStars[3]); // 4 stars

      const ratingAnnouncement = screen.getByText(/rated 4 out of 5 stars/i);
      expect(ratingAnnouncement).toHaveAttribute('aria-live', 'polite');
    });

    it('should have proper form validation announcements', async () => {
      const user = userEvent.setup();
      render(<ReviewForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: /submit review/i });
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.getByText(/please select a doctor/i);
        expect(errorMessage).toHaveAttribute('role', 'alert');
      });
    });
  });
});