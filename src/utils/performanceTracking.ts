/**
 * Performance tracking utilities for API calls
 */

export interface ApiPerformanceMetric {
  operation: string;
  duration: number;
  timestamp: number;
  success: boolean;
  error?: string;
}

const SLOW_QUERY_THRESHOLD = 2000; // 2 seconds

/**
 * Wraps an async function with performance tracking
 */
export function withPerformanceTracking<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  operationName: string
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    const startTime = performance.now();
    const timestamp = Date.now();
    let success = true;
    let error: string | undefined;

    try {
      const result = await fn(...args);
      return result;
    } catch (err) {
      success = false;
      error = err instanceof Error ? err.message : 'Unknown error';
      throw err;
    } finally {
      const endTime = performance.now();
      const duration = endTime - startTime;

      const metric: ApiPerformanceMetric = {
        operation: operationName,
        duration,
        timestamp,
        success,
        error,
      };

      // Log slow queries
      if (duration > SLOW_QUERY_THRESHOLD) {
        console.warn(
          `Slow query detected: ${operationName} took ${duration.toFixed(2)}ms`,
          metric
        );
      }

      // Log all operations in development
      if (import.meta.env.DEV) {
        const logLevel = duration > SLOW_QUERY_THRESHOLD ? 'warn' : 'log';
        console[logLevel](
          `API Performance: ${operationName} - ${duration.toFixed(2)}ms`,
          { success, error }
        );
      }
    }
  };
}

/**
 * Tracks performance of a single operation
 */
export async function trackPerformance<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  const trackedOperation = withPerformanceTracking(operation, operationName);
  return trackedOperation();
}

/**
 * Creates a performance-tracked version of an object's methods
 */
export function createPerformanceTrackedService<T extends Record<string, any>>(
  service: T,
  serviceName: string
): T {
  const trackedService = {} as T;

  for (const key in service) {
    const value = service[key];
    
    if (typeof value === 'function') {
      // Wrap async functions with performance tracking
      trackedService[key] = withPerformanceTracking(
        value.bind(service),
        `${serviceName}.${key}`
      ) as any;
    } else {
      // Copy non-function properties as-is
      trackedService[key] = value;
    }
  }

  return trackedService;
}

/**
 * Get all performance metrics for reporting
 */
export function getPerformanceReport(): {
  slowQueries: ApiPerformanceMetric[];
  averageDuration: number;
  totalOperations: number;
} {
  // This is a simple implementation - in production you might want to store metrics
  return {
    slowQueries: [],
    averageDuration: 0,
    totalOperations: 0,
  };
}
