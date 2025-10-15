import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as yup from 'yup';
import { Star, Edit3 } from 'lucide-react';
import BaseForm from './BaseForm';
import AnimatedTextarea from './AnimatedTextarea';
import { Review } from '../../types';

interface EditReviewFormData {
  rating: number;
  comment: string;
  categories: {
    communication: number;
    expertise: number;
    punctuality: number;
    overall: number;
  };
}

interface EditReviewFormProps {
  review: Review;
  onSubmit: (data: EditReviewFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const validationSchema = yup.object({
  rating: yup.number()
    .min(1, 'Please provide a rating')
    .max(5, 'Rating cannot exceed 5 stars')
    .required('Overall rating is required'),
  comment: yup.string()
    .min(10, 'Please provide at least 10 characters')
    .max(500, 'Comment cannot exceed 500 characters')
    .required('Please share your experience'),
  categories: yup.object({
    communication: yup.number().min(1).max(5).required(),
    expertise: yup.number().min(1).max(5).required(),
    punctuality: yup.number().min(1).max(5).required(),
    overall: yup.number().min(1).max(5).required()
  })
});

const StarRating: React.FC<{
  rating: number;
  onRatingChange: (rating: number) => void;
  label: string;
  disabled?: boolean;
}> = ({ rating, onRatingChange, label, disabled = false }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && onRatingChange(star)}
            onMouseEnter={() => !disabled && setHoverRating(star)}
            onMouseLeave={() => !disabled && setHoverRating(0)}
            className={`p-1 transition-colors duration-200 ${
              disabled ? 'cursor-not-allowed' : 'cursor-pointer'
            }`}
            whileHover={!disabled ? { scale: 1.1 } : undefined}
            whileTap={!disabled ? { scale: 0.95 } : undefined}
          >
            <Star
              className={`h-5 w-5 transition-colors duration-200 ${
                star <= (hoverRating || rating)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </motion.button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {rating > 0 ? `${rating} star${rating !== 1 ? 's' : ''}` : 'No rating'}
        </span>
      </div>
    </div>
  );
};

const EditReviewForm: React.FC<EditReviewFormProps> = ({
  review,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const defaultValues: EditReviewFormData = {
    rating: review.rating,
    comment: review.comment,
    categories: review.categories || {
      communication: review.rating,
      expertise: review.rating,
      punctuality: review.rating,
      overall: review.rating
    }
  };

  const handleFormSubmit = async (data: EditReviewFormData) => {
    await onSubmit(data);
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-orange-100 rounded-lg">
          <Edit3 className="h-6 w-6 text-orange-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Edit Review</h2>
          <p className="text-gray-600">Update your review for Dr. {review.doctorName.replace('Dr. ', '')}</p>
        </div>
      </div>

      <BaseForm
        onSubmit={handleFormSubmit}
        onCancel={onCancel}
        validationSchema={validationSchema}
        defaultValues={defaultValues}
        submitText="Update Review"
        cancelText="Cancel"
        isLoading={isLoading}
      >
        {(methods) => {
          const { setValue, watch } = methods;
          const watchedValues = watch();

          return (
            <>
              {/* Overall Rating */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <StarRating
                  rating={watchedValues.rating || 0}
                  onRatingChange={(rating) => {
                    setValue('rating', rating, { shouldValidate: true });
                    setValue('categories.overall', rating, { shouldValidate: true });
                  }}
                  label="Overall Rating *"
                  disabled={isLoading}
                />
              </motion.div>

              {/* Category Ratings */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <h3 className="text-lg font-medium text-gray-900">Detailed Ratings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <StarRating
                    rating={watchedValues.categories?.communication || 0}
                    onRatingChange={(rating) => 
                      setValue('categories.communication', rating, { shouldValidate: true })
                    }
                    label="Communication"
                    disabled={isLoading}
                  />
                  
                  <StarRating
                    rating={watchedValues.categories?.expertise || 0}
                    onRatingChange={(rating) => 
                      setValue('categories.expertise', rating, { shouldValidate: true })
                    }
                    label="Medical Expertise"
                    disabled={isLoading}
                  />
                  
                  <StarRating
                    rating={watchedValues.categories?.punctuality || 0}
                    onRatingChange={(rating) => 
                      setValue('categories.punctuality', rating, { shouldValidate: true })
                    }
                    label="Punctuality"
                    disabled={isLoading}
                  />
                </div>
              </motion.div>

              {/* Comment */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <AnimatedTextarea
                  name="comment"
                  label="Your Experience"
                  placeholder="Share details about your experience with this healthcare provider..."
                  methods={methods}
                  required
                  rows={4}
                  maxLength={500}
                  helpText="Update your review to reflect your current thoughts"
                />
              </motion.div>
            </>
          );
        }}
      </BaseForm>
    </motion.div>
  );
};

export default EditReviewForm;