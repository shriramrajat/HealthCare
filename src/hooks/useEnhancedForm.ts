import { useState, useCallback, useRef } from 'react';

interface UseEnhancedFormOptions<T> {
  onSubmit: (data: T) => Promise<void>;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface UseEnhancedFormReturn<T> {
  submit: (data: T) => Promise<void>;
  isSubmitting: boolean;
  error: Error | null;
  retry: () => Promise<void>;
  reset: () => void;
}

const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff: 1s, 2s, 4s
const MAX_RETRIES = 3;

export function useEnhancedForm<T>({
  onSubmit,
  onSuccess,
  onError,
}: UseEnhancedFormOptions<T>): UseEnhancedFormReturn<T> {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Store the last submission data for retry
  const lastSubmissionData = useRef<T | null>(null);
  const submissionInProgress = useRef(false);

  const executeSubmission = useCallback(
    async (data: T, attemptNumber: number = 0): Promise<void> => {
      try {
        await onSubmit(data);
        
        // Success - reset state
        setError(null);
        lastSubmissionData.current = null;
        
        if (onSuccess) {
          onSuccess();
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Submission failed');
        
        // Check if we should retry
        if (attemptNumber < MAX_RETRIES) {
          const delay = RETRY_DELAYS[attemptNumber];
          
          console.log(
            `Submission failed (attempt ${attemptNumber + 1}/${MAX_RETRIES + 1}). Retrying in ${delay}ms...`,
            error
          );
          
          // Wait for the delay before retrying
          await new Promise(resolve => setTimeout(resolve, delay));
          
          // Retry the submission
          return executeSubmission(data, attemptNumber + 1);
        } else {
          // Max retries reached - set error state
          setError(error);
          
          if (onError) {
            onError(error);
          }
          
          throw error;
        }
      }
    },
    [onSubmit, onSuccess, onError]
  );

  const submit = useCallback(
    async (data: T): Promise<void> => {
      // Prevent duplicate submissions
      if (submissionInProgress.current) {
        console.warn('Submission already in progress. Ignoring duplicate request.');
        return;
      }

      try {
        submissionInProgress.current = true;
        setIsSubmitting(true);
        setError(null);
        
        // Store data for potential retry
        lastSubmissionData.current = data;
        
        await executeSubmission(data, 0);
      } finally {
        setIsSubmitting(false);
        submissionInProgress.current = false;
      }
    },
    [executeSubmission]
  );

  const retry = useCallback(async (): Promise<void> => {
    if (!lastSubmissionData.current) {
      console.warn('No previous submission data to retry');
      return;
    }

    if (submissionInProgress.current) {
      console.warn('Submission already in progress. Ignoring retry request.');
      return;
    }

    try {
      submissionInProgress.current = true;
      setIsSubmitting(true);
      setError(null);
      
      await executeSubmission(lastSubmissionData.current, 0);
    } finally {
      setIsSubmitting(false);
      submissionInProgress.current = false;
    }
  }, [executeSubmission]);

  const reset = useCallback(() => {
    setIsSubmitting(false);
    setError(null);
    lastSubmissionData.current = null;
    submissionInProgress.current = false;
  }, []);

  return {
    submit,
    isSubmitting,
    error,
    retry,
    reset,
  };
}
