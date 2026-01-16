/**
 * Performance utilities for React components
 */

import { useEffect, useRef, useCallback, useState } from "react";

/**
 * Debounce a function call
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle a function call
 */
export function throttle<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Lazy load hook - only render when visible
 */
export function useLazyLoad(rootMargin = "100px") {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, isVisible };
}

/**
 * Preload images for better UX
 */
export function preloadImages(urls: string[]): Promise<void[]> {
  return Promise.all(
    urls.map(
      (url) =>
        new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = url;
        })
    )
  );
}

/**
 * Memoize expensive computations
 */
export function memoize<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  keyFn?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = keyFn ? keyFn(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Request idle callback polyfill
 */
export function requestIdleCallback(
  callback: IdleRequestCallback,
  options?: IdleRequestOptions
): number {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    return (window as Window & { requestIdleCallback: (cb: IdleRequestCallback, opts?: IdleRequestOptions) => number }).requestIdleCallback(callback, options);
  }

  // Fallback for Safari
  if (typeof window === "undefined") return 0;
  
  const start = Date.now();
  return setTimeout(() => {
    callback({
      didTimeout: false,
      timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
    });
  }, 1) as unknown as number;
}

/**
 * Cancel idle callback polyfill
 */
export function cancelIdleCallback(handle: number): void {
  if (typeof window !== "undefined" && "cancelIdleCallback" in window) {
    (window as Window & { cancelIdleCallback: (handle: number) => void }).cancelIdleCallback(handle);
  } else if (typeof window !== "undefined") {
    clearTimeout(handle);
  }
}

/**
 * Defer non-critical work to idle time
 */
export function useDeferredValue<T>(value: T, delay = 100): T {
  const [deferredValue, setDeferredValue] = useState(value);

  useEffect(() => {
    const handle = requestIdleCallback(
      () => setDeferredValue(value),
      { timeout: delay }
    );

    return () => cancelIdleCallback(handle);
  }, [value, delay]);

  return deferredValue;
}

/**
 * Measure component render time
 */
export function useRenderTime(componentName: string) {
  const startTime = useRef(performance.now());

  useEffect(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;
    
    if (process.env.NODE_ENV === "development") {
      console.log(`[Render] ${componentName}: ${renderTime.toFixed(2)}ms`);
    }
  });
}

/**
 * Batch multiple state updates
 */
export function useBatchedUpdates() {
  const pendingUpdates = useRef<(() => void)[]>([]);
  const isProcessing = useRef(false);

  const addUpdate = useCallback((update: () => void) => {
    pendingUpdates.current.push(update);

    if (!isProcessing.current) {
      isProcessing.current = true;
      
      requestAnimationFrame(() => {
        const updates = [...pendingUpdates.current];
        pendingUpdates.current = [];
        isProcessing.current = false;
        
        updates.forEach((update) => update());
      });
    }
  }, []);

  return addUpdate;
}

/**
 * Virtual scroll hook for long lists
 */
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan = 3
) {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop((e.target as HTMLDivElement).scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    startIndex,
    endIndex,
  };
}

/**
 * Prefetch data on hover
 */
export function usePrefetch(prefetchFn: () => Promise<void>, delay = 100) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const onMouseEnter = useCallback(() => {
    timeoutRef.current = setTimeout(prefetchFn, delay);
  }, [prefetchFn, delay]);

  const onMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return { onMouseEnter, onMouseLeave };
}

/**
 * Measure network speed for adaptive content
 */
export function useNetworkSpeed() {
  const [speed, setSpeed] = useState<"slow" | "medium" | "fast">("fast");

  useEffect(() => {
    interface NetworkConnection extends EventTarget {
      effectiveType: string;
    }
    
    const nav = navigator as Navigator & { connection?: NetworkConnection };
    const connection = nav.connection;
    
    if (connection) {
      const updateSpeed = () => {
        const effectiveType = connection.effectiveType;
        if (effectiveType === "slow-2g" || effectiveType === "2g") {
          setSpeed("slow");
        } else if (effectiveType === "3g") {
          setSpeed("medium");
        } else {
          setSpeed("fast");
        }
      };

      updateSpeed();
      connection.addEventListener("change", updateSpeed);
      return () => connection.removeEventListener("change", updateSpeed);
    }
  }, []);

  return speed;
}
