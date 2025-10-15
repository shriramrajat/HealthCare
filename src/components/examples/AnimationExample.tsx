import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AnimatedButton,
  AnimatedModal,
  AnimatedCard,
  BaseForm,
  AnimatedInput,
  AnimatedSelect,
  AnimatedTextarea,
  LoadingSpinner,
  Toast
} from '../ui';
import { useFormValidation } from '../ui';
import { animationVariants } from '../../utils/animations';

interface ExampleFormData {
  name: string;
  email: string;
  category: string;
  message: string;
}

const AnimationExample: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const { schemas } = useFormValidation();

  const categoryOptions = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'support', label: 'Technical Support' },
    { value: 'billing', label: 'Billing Question' },
    { value: 'feedback', label: 'Feedback' }
  ];

  const handleFormSubmit = async (data: ExampleFormData) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    setIsModalOpen(false);
    setShowToast(true);
    console.log('Form submitted:', data);
  };

  return (
    <div className="p-8 space-y-8">
      <motion.div
        className="text-center"
        variants={animationVariants.slideUp}
        initial="hidden"
        animate="visible"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Animation System Demo
        </h1>
        <p className="text-gray-600 mb-8">
          Demonstrating the enhanced animation system and form components
        </p>
      </motion.div>

      {/* Button Examples */}
      <AnimatedCard className="p-6">
        <h2 className="text-xl font-semibold mb-4">Animated Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <AnimatedButton variant="primary" onClick={() => setIsModalOpen(true)}>
            Open Modal
          </AnimatedButton>
          <AnimatedButton variant="secondary" isLoading={isLoading}>
            Loading Button
          </AnimatedButton>
          <AnimatedButton variant="success">
            Success Button
          </AnimatedButton>
          <AnimatedButton variant="danger">
            Danger Button
          </AnimatedButton>
          <AnimatedButton variant="outline">
            Outline Button
          </AnimatedButton>
        </div>
      </AnimatedCard>

      {/* Card Examples */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((index) => (
          <AnimatedCard key={index} className="p-6" delay={index * 0.1}>
            <h3 className="text-lg font-semibold mb-2">Card {index}</h3>
            <p className="text-gray-600">
              This is an animated card with hover effects and smooth transitions.
            </p>
          </AnimatedCard>
        ))}
      </div>

      {/* Loading Spinner Examples */}
      <AnimatedCard className="p-6">
        <h2 className="text-xl font-semibold mb-4">Loading Spinners</h2>
        <div className="flex items-center space-x-8">
          <LoadingSpinner size="sm" text="Small" />
          <LoadingSpinner size="md" text="Medium" />
          <LoadingSpinner size="lg" text="Large" />
          <LoadingSpinner color="white" className="bg-blue-600 p-4 rounded" />
        </div>
      </AnimatedCard>

      {/* Toast Example */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50">
          <Toast
            id="example-toast"
            type="success"
            title="Form Submitted!"
            message="Your form has been successfully submitted."
            isVisible={showToast}
            onClose={() => setShowToast(false)}
          />
        </div>
      )}

      {/* Modal with Form */}
      <AnimatedModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Contact Form Example"
        size="md"
      >
        <BaseForm<ExampleFormData>
          onSubmit={handleFormSubmit}
          onCancel={() => setIsModalOpen(false)}
          submitText="Send Message"
          isLoading={isLoading}
        >
          {(methods) => (
            <>
              <AnimatedInput
                name="name"
                label="Full Name"
                placeholder="Enter your full name"
                methods={methods}
                required
                helpText="Please enter your first and last name"
              />

              <AnimatedInput
                name="email"
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                methods={methods}
                required
              />

              <AnimatedSelect
                name="category"
                label="Category"
                options={categoryOptions}
                placeholder="Select a category"
                methods={methods}
                required
                searchable
              />

              <AnimatedTextarea
                name="message"
                label="Message"
                placeholder="Enter your message here..."
                methods={methods}
                required
                rows={4}
                maxLength={500}
                showCharCount
                helpText="Please provide as much detail as possible"
              />
            </>
          )}
        </BaseForm>
      </AnimatedModal>
    </div>
  );
};

export default AnimationExample;