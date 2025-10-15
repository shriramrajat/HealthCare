// Performance optimization utilities for animations and UI

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  private constructor() {}

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Start measuring performance for a specific operation
   */
  public startMeasure(name: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (!this.metrics.has(name)) {
        this.metrics.set(name, []);
      }
      
      const measurements = this.metrics.get(name)!;
      measurements.push(duration);
      
      // Keep only last 100 measurements
      if (measurements.length > 100) {
        measurements.shift();
      }
      
      // Log slow operations (> 16ms for 60fps)
      if (duration > 16) {
        console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
      }
    };
  }

  /**
   * Get performance statistics for an operation
   */
  public getStats(name: string): { avg: number; min: number; max: number; count: number } | null {
    const measurements = this.metrics.get(name);
    if (!measurements || measurements.length === 0) return null;

    const avg = measurements.reduce((sum, val) => sum + val, 0) / measurements.length;
    const min = Math.min(...measurements);
    const max = Math.max(...measurements);

    return { avg, min, max, count: measurements.length };
  }

  /**
   * Clear all metrics
   */
  public clear(): void {
    this.metrics.clear();
  }
}

/**
 * Animation performance utilities
 */
export const animationPerformance = {
  /**
   * Check if device supports hardware acceleration
   */
  supportsHardwareAcceleration: (): boolean => {
    if (typeof window === 'undefined') return false;
    
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  },

  /**
   * Get optimal animation settings based on device capabilities
   */
  getOptimalSettings: () => {
    // Safe checks for browser environment
    const isLowEndDevice = typeof navigator !== 'undefined' && navigator.hardwareConcurrency <= 2;
    const isSlowConnection = typeof navigator !== 'undefined' && 
      'connection' in navigator && 
      ((navigator as any).connection?.effectiveType === 'slow-2g' || 
       (navigator as any).connection?.effectiveType === '2g');

    // Safe check for matchMedia
    const preferReducedMotion = typeof window !== 'undefined' && 
      window.matchMedia && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    return {
      enableComplexAnimations: !isLowEndDevice && !isSlowConnection,
      maxConcurrentAnimations: isLowEndDevice ? 3 : 10,
      preferReducedMotion: preferReducedMotion,
      useGPUAcceleration: animationPerformance.supportsHardwareAcceleration()
    };
  },

  /**
   * Create optimized animation variants based on device capabilities
   */
  createOptimizedVariants: (baseVariants: any) => {
    const settings = animationPerformance.getOptimalSettings();
    
    if (!settings.enableComplexAnimations || settings.preferReducedMotion) {
      // Return simplified variants for low-end devices or reduced motion preference
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.1 } },
        exit: { opacity: 0, transition: { duration: 0.1 } }
      };
    }

    return baseVariants;
  },

  /**
   * Optimize transition settings for performance
   */
  optimizeTransition: (transition: any) => {
    const settings = animationPerformance.getOptimalSettings();
    
    if (settings.preferReducedMotion) {
      return { duration: 0.01 };
    }

    if (!settings.enableComplexAnimations) {
      return {
        ...transition,
        duration: Math.min(transition.duration || 0.3, 0.2),
        ease: 'linear'
      };
    }

    return transition;
  }
};

/**
 * Memory management utilities
 */
export const memoryUtils = {
  /**
   * Weak reference cache for expensive computations
   */
  createWeakCache: <K extends object, V>() => {
    const cache = new WeakMap<K, V>();
    
    return {
      get: (key: K): V | undefined => cache.get(key),
      set: (key: K, value: V): void => { cache.set(key, value); },
      has: (key: K): boolean => cache.has(key),
      delete: (key: K): boolean => cache.delete(key)
    };
  },

  /**
   * LRU cache with size limit
   */
  createLRUCache: <K, V>(maxSize: number = 100) => {
    const cache = new Map<K, V>();
    
    return {
      get: (key: K): V | undefined => {
        if (cache.has(key)) {
          const value = cache.get(key)!;
          cache.delete(key);
          cache.set(key, value);
          return value;
        }
        return undefined;
      },
      
      set: (key: K, value: V): void => {
        if (cache.has(key)) {
          cache.delete(key);
        } else if (cache.size >= maxSize) {
          const firstKey = cache.keys().next().value;
          if (firstKey !== undefined) {
            cache.delete(firstKey);
          }
        }
        cache.set(key, value);
      },
      
      has: (key: K): boolean => cache.has(key),
      clear: (): void => { cache.clear(); },
      size: (): number => cache.size
    };
  }
};

/**
 * React performance hooks
 */

/**
 * Hook for debouncing values to prevent excessive re-renders
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook for throttling function calls
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const throttledCallback = useRef<T>();
  const lastRan = useRef<number>();

  useEffect(() => {
    throttledCallback.current = callback;
  });

  return useCallback(
    ((...args: Parameters<T>) => {
      if (lastRan.current === undefined) {
        throttledCallback.current!(...args);
        lastRan.current = Date.now();
      } else {
        clearTimeout(lastRan.current as unknown as number);
        lastRan.current = setTimeout(() => {
          if (Date.now() - lastRan.current! >= delay) {
            throttledCallback.current!(...args);
            lastRan.current = Date.now();
          }
        }, delay - (Date.now() - lastRan.current)) as unknown as number;
      }
    }) as T,
    [delay]
  );
};

/**
 * Hook for measuring component render performance
 */
export const useRenderPerformance = (componentName: string) => {
  const renderCount = useRef(0);
  const startTime = useRef<number>();

  useEffect(() => {
    renderCount.current += 1;
    startTime.current = performance.now();
  });

  useEffect(() => {
    if (startTime.current) {
      const renderTime = performance.now() - startTime.current;
      if (renderTime > 16) {
        console.warn(
          `Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms (render #${renderCount.current})`
        );
      }
    }
  });

  return { renderCount: renderCount.current };
};

/**
 * Hook for intersection observer with performance optimizations
 */
export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        setEntry(entry);
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
      observer.disconnect();
    };
  }, [options]);

  return { elementRef, isIntersecting, entry };
};

/**
 * Hook for lazy loading with performance optimizations
 */
export const useLazyLoad = <T>(
  loadFunction: () => Promise<T>,
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { elementRef, isIntersecting } = useIntersectionObserver();

  useEffect(() => {
    if (isIntersecting && !data && !loading) {
      setLoading(true);
      setError(null);
      
      loadFunction()
        .then(setData)
        .catch(setError)
        .finally(() => setLoading(false));
    }
  }, [isIntersecting, data, loading, loadFunction, ...dependencies]);

  return { elementRef, data, loading, error };
};

/**
 * Hook for virtual scrolling performance
 */
export const useVirtualScroll = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );
  
  const visibleItems = items.slice(startIndex, endIndex);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    startIndex,
    endIndex
  };
};

/**
 * Animation frame utilities
 */
export const animationFrame = {
  /**
   * Request animation frame with fallback
   */
  request: (callback: FrameRequestCallback): number => {
    if (typeof window !== 'undefined' && window.requestAnimationFrame) {
      return window.requestAnimationFrame(callback);
    }
    return setTimeout(callback, 16) as unknown as number;
  },

  /**
   * Cancel animation frame with fallback
   */
  cancel: (id: number): void => {
    if (typeof window !== 'undefined' && window.cancelAnimationFrame) {
      window.cancelAnimationFrame(id);
    } else {
      clearTimeout(id);
    }
  },

  /**
   * Batch DOM updates for better performance
   */
  batchUpdates: (updates: (() => void)[]): void => {
    animationFrame.request(() => {
      updates.forEach(update => update());
    });
  }
};

export default {
  PerformanceMonitor,
  animationPerformance,
  memoryUtils,
  useDebounce,
  useThrottle,
  useRenderPerformance,
  useIntersectionObserver,
  useLazyLoad,
  useVirtualScroll,
  animationFrame
};