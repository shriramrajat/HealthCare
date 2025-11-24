import { useEffect, useRef } from 'react';

/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  FCP?: number; // First Contentful Paint
  TTFB?: number; // Time to First Byte
}

/**
 * Hook to monitor Core Web Vitals and other performance metrics
 */
export function usePerformanceMonitoring() {
  const metricsRef = useRef<PerformanceMetrics>({});
  const clsValueRef = useRef(0);
  const clsEntriesRef = useRef<PerformanceEntry[]>([]);

  useEffect(() => {
    // Check if Performance Observer is supported
    if (typeof PerformanceObserver === 'undefined') {
      console.warn('PerformanceObserver is not supported in this browser');
      return;
    }

    const observers: PerformanceObserver[] = [];

    try {
      // Observe Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number; loadTime?: number };
        
        // LCP is the render time or load time of the largest contentful element
        const lcpValue = lastEntry.renderTime || lastEntry.loadTime || 0;
        metricsRef.current.LCP = lcpValue;

        if (import.meta.env.DEV) {
          console.log('LCP:', lcpValue.toFixed(2), 'ms');
        }
      });

      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      observers.push(lcpObserver);
    } catch (error) {
      console.warn('Failed to observe LCP:', error);
    }

    try {
      // Observe First Input Delay (FID)
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          // FID is the time between user interaction and browser response
          const fidValue = entry.processingStart - entry.startTime;
          metricsRef.current.FID = fidValue;

          if (import.meta.env.DEV) {
            console.log('FID:', fidValue.toFixed(2), 'ms');
          }
        });
      });

      fidObserver.observe({ type: 'first-input', buffered: true });
      observers.push(fidObserver);
    } catch (error) {
      console.warn('Failed to observe FID:', error);
    }

    try {
      // Observe Cumulative Layout Shift (CLS)
      const clsObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        
        entries.forEach((entry: any) => {
          // Only count layout shifts without recent user input
          if (!entry.hadRecentInput) {
            clsValueRef.current += entry.value;
            clsEntriesRef.current.push(entry);
          }
        });

        metricsRef.current.CLS = clsValueRef.current;

        if (import.meta.env.DEV) {
          console.log('CLS:', clsValueRef.current.toFixed(4));
        }
      });

      clsObserver.observe({ type: 'layout-shift', buffered: true });
      observers.push(clsObserver);
    } catch (error) {
      console.warn('Failed to observe CLS:', error);
    }

    try {
      // Observe First Contentful Paint (FCP)
      const fcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            metricsRef.current.FCP = entry.startTime;

            if (import.meta.env.DEV) {
              console.log('FCP:', entry.startTime.toFixed(2), 'ms');
            }
          }
        });
      });

      fcpObserver.observe({ type: 'paint', buffered: true });
      observers.push(fcpObserver);
    } catch (error) {
      console.warn('Failed to observe FCP:', error);
    }

    try {
      // Observe Navigation Timing for TTFB
      const navigationObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          // TTFB is the time to first byte from the server
          const ttfbValue = entry.responseStart - entry.requestStart;
          metricsRef.current.TTFB = ttfbValue;

          if (import.meta.env.DEV) {
            console.log('TTFB:', ttfbValue.toFixed(2), 'ms');
          }
        });
      });

      navigationObserver.observe({ type: 'navigation', buffered: true });
      observers.push(navigationObserver);
    } catch (error) {
      console.warn('Failed to observe Navigation Timing:', error);
    }

    // Log final metrics when page is about to unload
    const logFinalMetrics = () => {
      if (import.meta.env.DEV) {
        console.log('Final Performance Metrics:', {
          LCP: metricsRef.current.LCP?.toFixed(2) + ' ms',
          FID: metricsRef.current.FID?.toFixed(2) + ' ms',
          CLS: metricsRef.current.CLS?.toFixed(4),
          FCP: metricsRef.current.FCP?.toFixed(2) + ' ms',
          TTFB: metricsRef.current.TTFB?.toFixed(2) + ' ms',
        });
      }
    };

    // Log metrics before page unload
    window.addEventListener('beforeunload', logFinalMetrics);

    // Cleanup observers
    return () => {
      observers.forEach((observer) => observer.disconnect());
      window.removeEventListener('beforeunload', logFinalMetrics);
    };
  }, []);

  /**
   * Get current performance metrics
   */
  const getMetrics = (): PerformanceMetrics => {
    return { ...metricsRef.current };
  };

  /**
   * Get performance data for error context
   */
  const getPerformanceContext = () => {
    return {
      metrics: getMetrics(),
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };
  };

  return {
    metrics: metricsRef.current,
    getMetrics,
    getPerformanceContext,
  };
}
