import { Component, ErrorInfo, ReactNode } from 'react';
import { logError, ErrorContext } from '../utils/errorHandling';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  context?: Omit<ErrorContext, 'timestamp'>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isChunkError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isChunkError: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Check if this is a chunk loading error
    const isChunkError = 
      error.message.includes('Failed to fetch dynamically imported module') ||
      error.message.includes('Importing a module script failed') ||
      error.message.includes('ChunkLoadError');

    return {
      hasError: true,
      error,
      isChunkError,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Capture current performance metrics
    const performanceMetrics = this.getPerformanceMetrics();

    // Log error with context
    const context: ErrorContext = {
      component: this.props.context?.component || 'ErrorBoundary',
      action: this.props.context?.action || 'render',
      userId: this.props.context?.userId,
      timestamp: Date.now(),
      additionalData: {
        ...this.props.context?.additionalData,
        componentStack: errorInfo.componentStack,
        isChunkError: this.state.isChunkError,
      },
      performance: performanceMetrics,
    };

    logError(error, context);

    // Store error info in state
    this.setState({ errorInfo });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  getPerformanceMetrics() {
    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      const fcp = paint.find(entry => entry.name === 'first-contentful-paint');
      
      return {
        metrics: {
          TTFB: navigation ? navigation.responseStart - navigation.requestStart : undefined,
          FCP: fcp ? fcp.startTime : undefined,
        },
        url: window.location.href,
        userAgent: navigator.userAgent,
      };
    } catch (error) {
      return {
        url: window.location.href,
        userAgent: navigator.userAgent,
      };
    }
  }

  handleRetry = () => {
    // For chunk loading errors, reload the page to get fresh chunks
    if (this.state.isChunkError) {
      window.location.reload();
    } else {
      // For other errors, just reset the error boundary
      this.setState({ 
        hasError: false, 
        error: null, 
        errorInfo: null,
        isChunkError: false,
      });
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, isChunkError } = this.state;

      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
            <div className="text-red-500 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {isChunkError ? 'Update Required' : 'Something went wrong'}
            </h2>
            <p className="text-gray-600 mb-6">
              {isChunkError
                ? 'A new version of the application is available. Please reload the page to get the latest updates.'
                : 'We encountered an error loading this page. This might be due to a network issue or a problem with the application.'}
            </p>
            {error && import.meta.env.DEV && (
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2 font-mono bg-gray-50 p-3 rounded text-left overflow-auto max-h-32">
                  {error.message}
                </p>
                {this.state.errorInfo?.componentStack && (
                  <details className="text-left">
                    <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                      Component Stack
                    </summary>
                    <pre className="text-xs text-gray-500 mt-2 bg-gray-50 p-3 rounded overflow-auto max-h-48">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                {isChunkError ? 'Reload Page' : 'Try Again'}
              </button>
              {!isChunkError && (
                <button
                  onClick={this.handleReload}
                  className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Reload Page
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
