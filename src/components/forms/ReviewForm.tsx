import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as yup from 'yup';
import { Star, User, MessageSquare, Award, Heart } from 'lucide-react';
import BaseForm from './BaseForm';
import AnimatedSelect from './AnimatedSelect';
import AnimatedTextarea from './AnimatedTextarea';
import { firestoreService } from '../../firebase/firestore';
import { User as UserType } from '../../types';

interface ReviewFormData {
  doctorId: string;
  rating: number;
  comment: string;
  categories: {
    communication: number;
    expertise: number;
    punctuality: number;
    overall: number;
  };
  anonymous?: boolean;
}

interface ReviewFormProps {
  onSubmit: (data: ReviewFormData) => Promise<void>;
  onCancel: () => void;
  doctorId?: string;
  isLoading?: boolean;
}

const validationSchema = yup.object({
  doctorId: yup.string().required('Please select a doctor'),
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
  }),
  anonymous: yup.boolean()
});

const StarRating: React.FC<{
  rating: number;
  onRatingChange: (rating: number) => void;
  label: string;
  disabled?: boolean;
}> = ({ rating, onRatingChange, label, disabled = false }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleRatingClick = (star: number) => {
    if (disabled) return;
    
    setIsAnimating(true);
    onRatingChange(star);
    
    // Reset animation state after a short delay
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div className="space-y-3">
      <motion.label 
        className="block text-sm font-medium text-gray-700"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        {label}
      </motion.label>
      
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => handleRatingClick(star)}
            onMouseEnter={() => !disabled && setHoverRating(star)}
            onMouseLeave={() => !disabled && setHoverRating(0)}
            className={`p-1 rounded-full transition-all duration-200 ${
              disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-yellow-50'
            }`}
            whileHover={!disabled ? { 
              scale: 1.15,
              rotate: [0, -5, 5, 0],
              transition: { duration: 0.3 }
            } : undefined}
            whileTap={!disabled ? { 
              scale: 0.9,
              rotate: 360,
              transition: { duration: 0.2 }
            } : undefined}
            animate={isAnimating && star <= rating ? {
              scale: [1, 1.3, 1],
              rotate: [0, 360],
              transition: { 
                duration: 0.4,
                delay: (star - 1) * 0.05,
                ease: "easeOut"
              }
            } : {}}
          >
            <motion.div
              animate={{
                filter: star <= (hoverRating || rating) 
                  ? 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))' 
                  : 'drop-shadow(0 0 0px rgba(251, 191, 36, 0))'
              }}
              transition={{ duration: 0.2 }}
            >
              <Star
                className={`h-7 w-7 transition-all duration-200 ${
                  star <= (hoverRating || rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300 hover:text-gray-400'
                }`}
              />
            </motion.div>
          </motion.button>
        ))}
        
        <motion.span 
          className="ml-3 text-sm text-gray-600 font-medium"
          key={rating} // Force re-render on rating change
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {rating > 0 ? (
            <span className="flex items-center space-x-1">
              <span>{rating} star{rating !== 1 ? 's' : ''}</span>
              {rating >= 4 && <span className="text-green-600">✨</span>}
              {rating === 3 && <span className="text-yellow-600">👍</span>}
              {rating <= 2 && rating > 0 && <span className="text-orange-600">👎</span>}
            </span>
          ) : (
            'No rating'
          )}
        </motion.span>
      </div>
    </div>
  );
};

const SuccessAnimation: React.FC = () => (
  <motion.div
    className="flex flex-col items-center justify-center py-8"
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
  >
    <motion.div
      className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"
      animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 360],
      }}
      transition={{
        duration: 0.8,
        ease: "easeInOut"
      }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        ✓
      </motion.div>
    </motion.div>
    
    <motion.h3
      className="text-lg font-semibold text-green-800 mb-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.3 }}
    >
      Review Submitted!
    </motion.h3>
    
    <motion.p
      className="text-green-600 text-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.3 }}
    >
      Thank you for sharing your experience
    </motion.p>
  </motion.div>
);

const ReviewForm: React.FC<ReviewFormProps> = ({
  onSubmit,
  onCancel,
  doctorId,
  isLoading = false
}) => {
  const [doctors, setDoctors] = useState<UserType[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const doctorsList = await firestoreService.getDoctors();
        setDoctors(doctorsList);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, []);

  const doctorOptions = doctors.map(doctor => ({
    value: doctor.id,
    label: `Dr. ${doctor.name} - ${doctor.specialization || 'General Practice'}`
  }));

  const defaultValues: Partial<ReviewFormData> = {
    doctorId: doctorId || '',
    rating: 0,
    comment: '',
    categories: {
      communication: 0,
      expertise: 0,
      punctuality: 0,
      overall: 0
    },
    anonymous: false
  };

  const handleFormSubmit = async (data: ReviewFormData) => {
    try {
      await onSubmit(data);
      setShowSuccess(true);
      
      // Auto-close after showing success animation
      setTimeout(() => {
        setShowSuccess(false);
        onCancel();
      }, 2000);
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <SuccessAnimation />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          className="flex items-center space-x-3 mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <motion.div 
            className="p-2 bg-blue-100 rounded-lg"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            <MessageSquare className="h-6 w-6 text-blue-600" />
          </motion.div>
          <div>
            <motion.h2 
              className="text-xl font-bold text-gray-900"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              Write a Review
            </motion.h2>
            <motion.p 
              className="text-gray-600"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              Share your experience to help others
            </motion.p>
          </div>
        </motion.div>

        <BaseForm
          onSubmit={handleFormSubmit}
          onCancel={onCancel}
          validationSchema={validationSchema}
          defaultValues={defaultValues}
          submitText="Submit Review"
          cancelText="Cancel"
          isLoading={isLoading}
        >
          {(methods) => {
            const { setValue, watch } = methods;
            const watchedValues = watch();

            return (
              <>
                {/* Doctor Selection */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                  whileHover={{ scale: 1.01 }}
                  className="transform-gpu"
                >
                  <AnimatedSelect
                    name="doctorId"
                    label="Select Doctor"
                    options={doctorOptions}
                    placeholder={loadingDoctors ? "Loading doctors..." : "Choose a doctor to review"}
                    methods={methods}
                    required
                    disabled={loadingDoctors || !!doctorId}
                    searchable
                    helpText="Select the healthcare provider you want to review"
                  />
                </motion.div>

                {/* Overall Rating */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                  className="p-4 rounded-lg border border-gray-100 bg-gradient-to-r from-yellow-50 to-orange-50"
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
                  className="space-y-4 p-4 rounded-lg border border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.3 }}
                >
                  <motion.h3 
                    className="text-lg font-medium text-gray-900 flex items-center space-x-2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.3 }}
                  >
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Award className="h-5 w-5 text-blue-600" />
                    </motion.div>
                    <span>Detailed Ratings</span>
                  </motion.h3>
                  
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.1,
                          delayChildren: 0.8
                        }
                      }
                    }}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 }
                      }}
                    >
                      <StarRating
                        rating={watchedValues.categories?.communication || 0}
                        onRatingChange={(rating) => 
                          setValue('categories.communication', rating, { shouldValidate: true })
                        }
                        label="Communication"
                        disabled={isLoading}
                      />
                    </motion.div>
                    
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 }
                      }}
                    >
                      <StarRating
                        rating={watchedValues.categories?.expertise || 0}
                        onRatingChange={(rating) => 
                          setValue('categories.expertise', rating, { shouldValidate: true })
                        }
                        label="Medical Expertise"
                        disabled={isLoading}
                      />
                    </motion.div>
                    
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 }
                      }}
                      className="md:col-span-2"
                    >
                      <StarRating
                        rating={watchedValues.categories?.punctuality || 0}
                        onRatingChange={(rating) => 
                          setValue('categories.punctuality', rating, { shouldValidate: true })
                        }
                        label="Punctuality"
                        disabled={isLoading}
                      />
                    </motion.div>
                  </motion.div>
                </motion.div>

                {/* Comment */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9, duration: 0.3 }}
                  whileHover={{ scale: 1.01 }}
                  className="transform-gpu"
                >
                  <AnimatedTextarea
                    name="comment"
                    label="Your Experience"
                    placeholder="Share details about your experience with this healthcare provider..."
                    methods={methods}
                    required
                    rows={4}
                    maxLength={500}
                    helpText="Help others by sharing specific details about your experience"
                  />
                </motion.div>

                {/* Anonymous Option */}
                <motion.div
                  className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 bg-gray-50"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0, duration: 0.3 }}
                  whileHover={{ backgroundColor: '#f9fafb', scale: 1.01 }}
                >
                  <motion.input
                    type="checkbox"
                    id="anonymous"
                    checked={watchedValues.anonymous || false}
                    onChange={(e) => setValue('anonymous', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    whileTap={{ scale: 0.9 }}
                  />
                  <motion.label 
                    htmlFor="anonymous" 
                    className="text-sm text-gray-700 flex items-center space-x-2 cursor-pointer"
                    whileHover={{ color: '#374151' }}
                  >
                    <motion.div
                      whileHover={{ rotate: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <User className="h-4 w-4" />
                    </motion.div>
                    <span>Submit anonymously</span>
                  </motion.label>
                </motion.div>

                {/* Review Summary */}
                {watchedValues.rating > 0 && (
                  <motion.div
                    className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 1.1, duration: 0.4, type: "spring" }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <motion.h4 
                      className="text-sm font-medium text-gray-900 mb-3 flex items-center space-x-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.2, duration: 0.3 }}
                    >
                      <motion.div
                        animate={{ 
                          scale: [1, 1.2, 1],
                          rotate: [0, 10, -10, 0]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 3
                        }}
                      >
                        <Heart className="h-4 w-4 text-red-500" />
                      </motion.div>
                      <span>Review Summary</span>
                    </motion.h4>
                    
                    <motion.div 
                      className="grid grid-cols-2 gap-3 text-sm"
                      variants={{
                        hidden: { opacity: 0 },
                        visible: {
                          opacity: 1,
                          transition: {
                            staggerChildren: 0.1,
                            delayChildren: 1.3
                          }
                        }
                      }}
                      initial="hidden"
                      animate="visible"
                    >
                      {[
                        { label: 'Overall', value: watchedValues.rating },
                        { label: 'Communication', value: watchedValues.categories?.communication || 0 },
                        { label: 'Expertise', value: watchedValues.categories?.expertise || 0 },
                        { label: 'Punctuality', value: watchedValues.categories?.punctuality || 0 }
                      ].map((item, index) => (
                        <motion.div 
                          key={item.label}
                          className="flex justify-between items-center p-2 bg-white rounded border border-gray-100"
                          variants={{
                            hidden: { opacity: 0, x: -20 },
                            visible: { opacity: 1, x: 0 }
                          }}
                          whileHover={{ backgroundColor: '#f8fafc', scale: 1.02 }}
                        >
                          <span className="text-gray-600 font-medium">{item.label}:</span>
                          <div className="flex items-center space-x-1">
                            <motion.div
                              animate={item.value > 0 ? {
                                rotate: [0, 360],
                                scale: [1, 1.2, 1]
                              } : {}}
                              transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            </motion.div>
                            <span className="font-bold text-gray-800">{item.value}</span>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                )}
              </>
            );
          }}
        </BaseForm>
      </motion.div>
    </div>
  );
};

export default ReviewForm;