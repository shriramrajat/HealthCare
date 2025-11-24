import { useEffect, useRef, useState } from 'react';

interface UseLazyImageOptions {
  threshold?: number;
  rootMargin?: string;
}

/**
 * Custom hook for lazy loading images using Intersection Observer
 * @param src - The image source URL
 * @param options - Intersection Observer options
 * @returns Object containing the image ref, loaded state, and current src
 */
export function useLazyImage(
  src: string,
  options: UseLazyImageOptions = {}
) {
  const { threshold = 0.01, rootMargin = '50px' } = options;
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(undefined);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // If browser doesn't support IntersectionObserver, load immediately
    if (!('IntersectionObserver' in window)) {
      setCurrentSrc(src);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setCurrentSrc(src);
            if (imgRef.current) {
              observer.unobserve(imgRef.current);
            }
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src, threshold, rootMargin]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return {
    imgRef,
    isLoaded,
    currentSrc,
    handleLoad,
  };
}
