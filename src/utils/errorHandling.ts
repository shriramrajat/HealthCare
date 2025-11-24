/**
 * Context information for error logging
 */
export interface ErrorContext {
  component: string;
  action: string;
  userId?: string;
  timestamp: number;
  additionalData?: Record<string, any>;
  performance?: {
    metrics?: {
      LCP?: number;
      FID?: number;
      CLS?: number;
      FCP?: number;
      TTFB?: number;
    };
    url?: string;
    userAgent?: string;
  };
}

/**
 * Configuration for retry behavior
 */
export interface RetryConfig {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  jitter?: boolean;
}

/**
 * Maps Firebase error codes to user-friendly error messages
 */
export function getFirebaseErrorMessage(error: any): string {
  const errorCode = error?.code || '';
  
  // Authentication errors
  if (errorCode.startsWith('auth/')) {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/operation-not-allowed':
        return 'This operation is not allowed. Please contact support.';
      case 'auth/requires-recent-login':
        return 'Please log in again to complete this action.';
      default:
        return 'Authentication failed. Please try again.';
    }
  }
  
  // Firestore errors
  if (errorCode.startsWith('firestore/')) {
    switch (errorCode) {
      case 'firestore/permission-denied':
        return 'You do not have permission to perform this action.';
      case 'firestore/not-found':
        return 'The requested data was not found.';
      case 'firestore/already-exists':
        return 'This data already exists.';
      case 'firestore/resource-exhausted':
        return 'Too many requests. Please try again later.';
      case 'firestore/failed-precondition':
        return 'Operation failed. Please refresh and try again.';
      case 'firestore/aborted':
        return 'Operation was aborted. Please try again.';
      case 'firestore/out-of-range':
        return 'Invalid data range provided.';
      case 'firestore/unimplemented':
        return 'This feature is not yet available.';
      case 'firestore/internal':
        return 'An internal error occurred. Please try again.';
      case 'firestore/unavailable':
        return 'Service temporarily unavailable. Please try again.';
      case 'firestore/data-loss':
        return 'Data loss detected. Please contact support.';
      case 'firestore/deadline-exceeded':
        return 'Request timed out. Please try again.';
      default:
        return 'Database operation failed. Please try again.';
    }
  }
  
  // Network errors
  if (errorCode === 'network-request-failed' || error?.message?.includes('network')) {
    return 'Network error. Please check your connection and try again.';
  }
  
  // Generic errors
  if (error?.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Determines if an error is retryable
 */
export function isRetryableError(error: any): boolean {
  const errorCode = error?.code || '';
  
  // Network errors are retryable
  if (errorCode === 'network-request-failed' || error?.message?.includes('network')) {
    return true;
  }
  
  // Temporary Firestore errors are retryable
  const retryableFirestoreCodes = [
    'firestore/unavailable',
    'firestore/aborted',
    'firestore/resource-exhausted',
    'firestore/deadline-exceeded',
  ];
  
  if (retryableFirestoreCodes.includes(errorCode)) {
    return true;
  }
  
  // Auth errors that might be temporary
  const retryableAuthCodes = [
    'auth/network-request-failed',
    'auth/too-many-requests',
  ];
  
  if (retryableAuthCodes.includes(errorCode)) {
    return true;
  }
  
  return false;
}

/**
 * Logs error with context information
 */
export function logError(error: Error, context: ErrorContext): void {
  const errorLog = {
    message: error.message,
    code: (error as any).code,
    stack: error.stack,
    context: {
      ...context,
      userAgent: navigator.userAgent,
      url: window.location.href,
      performance: context.performance || undefined,
    },
  };
  
  // Log to console in development
  if (import.meta.env.DEV) {
    console.error('Error logged:', errorLog);
  } else {
    // In production, you could send to an error tracking service
    console.error('Error:', errorLog.message, 'Context:', errorLog.context);
  }
}

/**
 * Calculates delay for exponential backoff with optional jitter
 */
function calculateBackoffDelay(
  attempt: number,
  baseDelay: number,
  maxDelay: number,
  jitter: boolean
): number {
  // Exponential backoff: baseDelay * 2^attempt
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  
  // Cap at maxDelay
  let delay = Math.min(exponentialDelay, maxDelay);
  
  // Add jitter to prevent thundering herd
  if (jitter) {
    const jitterAmount = Math.random() * 500; // 0-500ms random jitter
    delay += jitterAmount;
  }
  
  return delay;
}

/**
 * Centralized error handler with retry logic
 */
export class ErrorHandler {
  private static instance: ErrorHandler;
  
  private constructor() {}
  
  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }
  
  /**
   * Handles an error with logging and user-friendly message
   */
  handleError(error: Error, context: ErrorContext): string {
    // Log the error with context
    logError(error, context);
    
    // Return user-friendly message
    return getFirebaseErrorMessage(error);
  }
  
  /**
   * Executes an operation with automatic retry logic
   */
  async retry<T>(
    operation: () => Promise<T>,
    context: ErrorContext,
    config: RetryConfig = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      baseDelay = 1000,
      maxDelay = 8000,
      jitter = true,
    } = config;
    
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Attempt the operation
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        // Check if we should retry
        const shouldRetry = attempt < maxRetries && isRetryableError(error);
        
        if (!shouldRetry) {
          // Log the final error
          logError(lastError, {
            ...context,
            additionalData: {
              ...context.additionalData,
              attempts: attempt + 1,
              finalAttempt: true,
            },
          });
          throw lastError;
        }
        
        // Calculate delay for next retry
        const delay = calculateBackoffDelay(attempt, baseDelay, maxDelay, jitter);
        
        // Log retry attempt
        if (import.meta.env.DEV) {
          console.log(
            `Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`,
            context
          );
        }
        
        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    
    // This should never be reached, but TypeScript needs it
    throw lastError || new Error('Operation failed after retries');
  }
  
  /**
   * Wraps an async function with error handling and retry logic
   */
  withRetry<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    context: Omit<ErrorContext, 'timestamp'>,
    config?: RetryConfig
  ): (...args: T) => Promise<R> {
    return async (...args: T): Promise<R> => {
      return this.retry(
        () => fn(...args),
        {
          ...context,
          timestamp: Date.now(),
        },
        config
      );
    };
  }
}
