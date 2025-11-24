import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheConfig {
  ttl?: number; // Time to live in milliseconds (default: 5 minutes)
  key: string;
}

// Global cache store
const cacheStore = new Map<string, CacheEntry<any>>();

// Generate cache key from query parameters
export const generateCacheKey = (collection: string, params: Record<string, any>): string => {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${JSON.stringify(params[key])}`)
    .join('|');
  return `${collection}|${sortedParams}`;
};

// Check if cache entry is valid
const isCacheValid = <T,>(entry: CacheEntry<T> | undefined): entry is CacheEntry<T> => {
  if (!entry) return false;
  const now = Date.now();
  return now - entry.timestamp < entry.ttl;
};

// Get data from cache
export const getCachedData = <T,>(key: string): T | null => {
  const entry = cacheStore.get(key);
  if (isCacheValid(entry)) {
    return entry.data;
  }
  // Remove expired entry
  if (entry) {
    cacheStore.delete(key);
  }
  return null;
};

// Set data in cache
export const setCachedData = <T,>(key: string, data: T, ttl: number = 5 * 60 * 1000): void => {
  cacheStore.set(key, {
    data,
    timestamp: Date.now(),
    ttl
  });
};

// Invalidate cache entries by pattern
export const invalidateCache = (pattern?: string): void => {
  if (!pattern) {
    // Clear all cache
    cacheStore.clear();
    return;
  }
  
  // Clear cache entries matching pattern
  const keysToDelete: string[] = [];
  cacheStore.forEach((_, key) => {
    if (key.includes(pattern)) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach(key => cacheStore.delete(key));
};

// Hook for using Firestore cache
export const useFirestoreCache = <T,>(
  queryFn: () => Promise<T>,
  config: CacheConfig
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isMountedRef = useRef(true);
  
  const { key, ttl = 5 * 60 * 1000 } = config;

  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first unless force refresh
      if (!forceRefresh) {
        const cachedData = getCachedData<T>(key);
        if (cachedData !== null) {
          if (isMountedRef.current) {
            setData(cachedData);
            setLoading(false);
          }
          return cachedData;
        }
      }

      // Fetch fresh data
      const freshData = await queryFn();
      
      // Cache the result
      setCachedData(key, freshData, ttl);
      
      if (isMountedRef.current) {
        setData(freshData);
        setLoading(false);
      }
      
      return freshData;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      if (isMountedRef.current) {
        setError(error);
        setLoading(false);
      }
      throw error;
    }
  }, [key, queryFn, ttl]);

  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  const invalidate = useCallback(() => {
    invalidateCache(key);
  }, [key]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchData();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh,
    invalidate
  };
};

// Hook for mutations with automatic cache invalidation
export const useFirestoreMutation = <T, TArgs extends any[]>(
  mutationFn: (...args: TArgs) => Promise<T>,
  invalidationPatterns: string[]
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (...args: TArgs): Promise<T> => {
    try {
      setLoading(true);
      setError(null);

      const result = await mutationFn(...args);

      // Invalidate related cache entries
      invalidationPatterns.forEach(pattern => {
        invalidateCache(pattern);
      });

      setLoading(false);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      setLoading(false);
      throw error;
    }
  }, [mutationFn, invalidationPatterns]);

  return {
    mutate,
    loading,
    error
  };
};
