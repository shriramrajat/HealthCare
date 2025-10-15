import React from 'react';
import { motion } from 'framer-motion';
import * as yup from 'yup';
import { MessageCircle } from 'lucide-react';
import BaseForm from './BaseForm';
import AnimatedTextarea from './AnimatedTextarea';
import { Review } from '../../types';

interface ReviewResponseFormData {
  message: string;
}

interface ReviewResponseFormProps {
  review: Review;
  onSubmit: (data: ReviewResponseFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const validationSchema = yup.object({
  message: yup.string()
    .min(10, 'Please provide at least 10 characters')
    .max(300, 'Response cannot exceed 300 characters')
    .required('Please provide a response')
});

const ReviewResponseForm: React.FC<ReviewResponseFormProps> = ({
  review,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const defaultValues: ReviewResponseFormData = {
    message: ''
  };

  const handleFormSubmit = async (data: ReviewResponseFormData) => {
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
        <div className="p-2 bg-green-100 rounded-lg">
          <MessageCircle className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Respond to Review</h2>
          <p className="text-gray-600">
            Responding to {review.anonymous ? 'Anonymous' : review.patientName}'s review
          </p>
        </div>
      </div>

      {/* Original Review */}
      <motion.div
        className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-900">
              {review.anonymous ? 'Anonymous Patient' : review.patientName}
            </span>
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i < review.rating ? 'bg-yellow-400' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          <span className="text-sm text-gray-500">
            {new Date(review.date).toLocaleDateString()}
          </span>
        </div>
        <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
      </motion.div>

      <BaseForm
        onSubmit={handleFormSubmit}
        onCancel={onCancel}
        validationSchema={validationSchema}
        defaultValues={defaultValues}
        submitText="Send Response"
        cancelText="Cancel"
        isLoading={isLoading}
      >
        {(methods) => (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <AnimatedTextarea
              name="message"
              label="Your Response"
              placeholder="Thank you for your feedback. I appreciate you taking the time to share your experience..."
              methods={methods}
              required
              rows={4}
              maxLength={300}
              helpText="Respond professionally and constructively to the patient's feedback"
            />
          </motion.div>
        )}
      </BaseForm>
    </motion.div>
  );
};

export default ReviewResponseForm;