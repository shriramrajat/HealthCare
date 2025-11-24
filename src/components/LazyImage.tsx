import React from 'react';
import { useLazyImage } from '../hooks/useLazyImage';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  threshold?: number;
  rootMargin?: string;
}

/**
 * LazyImage component with native lazy loading and Intersection Observer fallback
 * Provides placeholder support and smooth loading transitions
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23f3f4f6"/%3E%3C/svg%3E',
  threshold,
  rootMargin,
  className = '',
  ...props
}) => {
  const { imgRef, isLoaded, currentSrc, handleLoad } = useLazyImage(src, {
    threshold,
    rootMargin,
  });

  return (
    <img
      ref={imgRef}
      src={currentSrc || placeholder}
      alt={alt}
      loading="lazy"
      onLoad={handleLoad}
      className={`transition-opacity duration-300 ${
        isLoaded ? 'opacity-100' : 'opacity-50'
      } ${className}`}
      {...props}
    />
  );
};
