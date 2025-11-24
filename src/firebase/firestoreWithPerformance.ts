import { firestoreService } from './firestore';
import { createPerformanceTrackedService } from '../utils/performanceTracking';

/**
 * Firestore service with performance tracking enabled
 * This wraps all Firestore methods with performance monitoring
 */
export const firestoreServiceWithPerformance = createPerformanceTrackedService(
  firestoreService,
  'firestoreService'
);

// Export as default for easy replacement
export default firestoreServiceWithPerformance;
