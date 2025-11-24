import { useState, useEffect, useCallback } from 'react';
import { useEnhancedForm } from './useEnhancedForm';
import { offlineQueueService, QueuedSubmission } from '../services/offlineQueue';

interface UseOfflineFormOptions<T> {
  onSubmit: (data: T) => Promise<void>;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  submissionType: 'medication' | 'symptom' | 'appointment' | 'health-metric';
  userId: string;
}

interface UseOfflineFormReturn<T> {
  submit: (data: T) => Promise<void>;
  isSubmitting: boolean;
  error: Error | null;
  retry: () => Promise<void>;
  reset: () => void;
  isOnline: boolean;
  queuedCount: number;
}

export function useOfflineForm<T>({
  onSubmit,
  onSuccess,
  onError,
  submissionType,
  userId,
}: UseOfflineFormOptions<T>): UseOfflineFormReturn<T> {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queuedCount, setQueuedCount] = useState(0);

  // Update online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update queued count
  useEffect(() => {
    const updateQueuedCount = () => {
      const userQueue = offlineQueueService.getUserQueue(userId);
      setQueuedCount(userQueue.length);
    };

    updateQueuedCount();

    // Listen for online events to update count
    const listener = updateQueuedCount;
    offlineQueueService.addOnlineListener(listener);

    return () => {
      offlineQueueService.removeOnlineListener(listener);
    };
  }, [userId]);

  // Wrap the onSubmit to handle offline queueing
  const wrappedOnSubmit = useCallback(
    async (data: T): Promise<void> => {
      if (!isOnline) {
        // Queue the submission for later
        offlineQueueService.enqueue({
          type: submissionType,
          data,
          userId,
        });

        // Update queued count
        setQueuedCount(offlineQueueService.getUserQueue(userId).length);

        // Call success callback even though it's queued
        if (onSuccess) {
          onSuccess();
        }

        return;
      }

      // If online, proceed with normal submission
      await onSubmit(data);
    },
    [isOnline, onSubmit, onSuccess, submissionType, userId]
  );

  const enhancedForm = useEnhancedForm({
    onSubmit: wrappedOnSubmit,
    onSuccess,
    onError,
  });

  return {
    ...enhancedForm,
    isOnline,
    queuedCount,
  };
}
