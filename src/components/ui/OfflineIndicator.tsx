import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, Upload, CheckCircle } from 'lucide-react';
import { offlineQueueService } from '../../services/offlineQueue';

const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queuedCount, setQueuedCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      setIsOnline(navigator.onLine);
      setQueuedCount(offlineQueueService.getQueueCount());
    };

    const handleOnline = async () => {
      setIsOnline(true);
      
      if (offlineQueueService.getQueueCount() > 0) {
        setIsProcessing(true);
        
        try {
          await offlineQueueService.processQueue();
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
          console.error('Error processing queue:', error);
        } finally {
          setIsProcessing(false);
        }
      }
      
      updateStatus();
    };

    const handleOffline = () => {
      setIsOnline(false);
      updateStatus();
    };

    // Initial update
    updateStatus();

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Add listener for queue updates
    offlineQueueService.addOnlineListener(updateStatus);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      offlineQueueService.removeOnlineListener(updateStatus);
    };
  }, []);

  // Don't show anything if online and no queued items
  if (isOnline && queuedCount === 0 && !showSuccess) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-20 right-4 z-50"
      >
        {!isOnline && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg p-4 max-w-sm">
            <div className="flex items-start space-x-3">
              <WifiOff className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-yellow-800">You're Offline</h3>
                <p className="text-xs text-yellow-700 mt-1">
                  Your submissions will be saved and synced when you're back online.
                </p>
                {queuedCount > 0 && (
                  <p className="text-xs text-yellow-600 mt-2 font-medium">
                    {queuedCount} {queuedCount === 1 ? 'item' : 'items'} queued
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {isOnline && isProcessing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg shadow-lg p-4 max-w-sm">
            <div className="flex items-start space-x-3">
              <Upload className="h-5 w-5 text-blue-600 mt-0.5 animate-pulse" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-800">Syncing Data</h3>
                <p className="text-xs text-blue-700 mt-1">
                  Uploading {queuedCount} queued {queuedCount === 1 ? 'submission' : 'submissions'}...
                </p>
              </div>
            </div>
          </div>
        )}

        {isOnline && showSuccess && (
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 max-w-sm"
          >
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-green-800">All Synced!</h3>
                <p className="text-xs text-green-700 mt-1">
                  Your queued submissions have been uploaded successfully.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {isOnline && queuedCount > 0 && !isProcessing && !showSuccess && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg shadow-lg p-4 max-w-sm">
            <div className="flex items-start space-x-3">
              <Wifi className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-800">Back Online</h3>
                <p className="text-xs text-blue-700 mt-1">
                  {queuedCount} {queuedCount === 1 ? 'submission' : 'submissions'} waiting to sync
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default OfflineIndicator;
