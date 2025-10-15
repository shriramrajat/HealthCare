import React, { Suspense, lazy, ComponentType } from 'react';
import { motion } from 'framer-motion';
import { useLazyLoad } from '../../utils/performance';
import LoadingAnimation from './LoadingAnimation';

interface LazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
}

/**
 * Wrapper component for lazy loading content when it enters the viewport
 */
export const LazyComponent: React.FC<LazyComponentProps> = ({
  children,
  fallback,
  className = '',
  threshold = 0.1,
  rootMargin = '50px'
}) => {
  const { elementRef, data, loading } = useLazyLoad(
    async () => {
      // Simulate loading delay for demonstration
      await new Promise(resolve => setTimeout(resolve, 100));
      return true;
    },
    []
  );

  return (
    <div ref={elementRef} className={className}>
      {loading && (
        fallback || <LoadingAnimation type="skeleton" size="md" />
      )}
      {data && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      )}
    </div>
  );
};

/**
 * Higher-order component for lazy loading React components
 */
export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode
) {
  const LazyWrappedComponent = lazy(() => Promise.resolve({ default: Component }));

  return React.forwardRef<any, P>((props, ref) => (
    <Suspense fallback={fallback || <LoadingAnimation type="spinner" size="md" />}>
      <LazyWrappedComponent {...props} ref={ref} />
    </Suspense>
  ));
}

/**
 * Component for creating lazy-loaded route components
 */
export function createLazyRoute(
  importFunction: () => Promise<{ default: ComponentType<any> }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunction);

  return (props: any) => (
    <Suspense fallback={fallback || <LoadingAnimation type="spinner" size="lg" />}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

/**
 * Component for lazy loading images with intersection observer
 */
interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  placeholder,
  onLoad,
  onError
}) => {
  const { elementRef, data: shouldLoad, loading } = useLazyLoad(
    async () => {
      const img = new Image();
      img.src = src;
      return new Promise<boolean>((resolve, reject) => {
        img.onload = () => {
          onLoad?.();
          resolve(true);
        };
        img.onerror = () => {
          onError?.();
          reject(new Error('Failed to load image'));
        };
      });
    },
    [src]
  );

  return (
    <div ref={elementRef} className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          {placeholder || (
            <svg
              className="w-8 h-8 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      )}
      {shouldLoad && (
        <motion.img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover ${className}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </div>
  );
};

/**
 * Component for virtual scrolling large lists
 */
interface VirtualScrollListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export function VirtualScrollList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className = ''
}: VirtualScrollListProps<T>) {
  const {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    startIndex
  } = useLazyLoad(items, itemHeight, containerHeight);

  return (
    <div
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{ height: itemHeight }}
              className="flex items-center"
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default {
  LazyComponent,
  withLazyLoading,
  createLazyRoute,
  LazyImage,
  VirtualScrollList
};