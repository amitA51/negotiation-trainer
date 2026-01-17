"use client";

import { useEffect, useRef, RefObject } from "react";

// ==========================================
// FIREBASE HOOKS - SWR & REALTIME
// ==========================================

// Export SWR hooks (legacy, for backward compatibility)
export * from "./useSWR";

// Export Real-time hooks (NEW - for better performance)
export * from "./useFirebaseRealtime";

// ==========================================
// UTILITY HOOKS
// ==========================================

// Smooth scroll to element
export function useSmoothScroll() {
  const scrollToElement = (elementId: string, offset = 0) => {
    const element = document.getElementById(elementId);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  return { scrollToElement, scrollToTop, scrollToBottom };
}

// Intersection Observer hook for animations
export function useInView(
  threshold = 0.1,
  rootMargin = "0px"
): [RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isInView.current = entry.isIntersecting;
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return [ref, isInView.current];
}

// Keyboard shortcut hook
export function useKeyboardShortcut(
  keys: string[],
  callback: () => void,
  enabled = true
) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const pressedKeys: string[] = [];
      
      if (e.ctrlKey || e.metaKey) pressedKeys.push("ctrl");
      if (e.shiftKey) pressedKeys.push("shift");
      if (e.altKey) pressedKeys.push("alt");
      pressedKeys.push(e.key.toLowerCase());

      const match = keys.every((key) => 
        pressedKeys.includes(key.toLowerCase())
      );

      if (match) {
        e.preventDefault();
        callback();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [keys, callback, enabled]);
}

// Local storage with SSR support
export function useLocalStorage<T>(key: string, initialValue: T) {
  const getStoredValue = (): T => {
    if (typeof window === "undefined") return initialValue;
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  };

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(getStoredValue()) : value;
      localStorage.setItem(key, JSON.stringify(valueToStore));
      window.dispatchEvent(new Event("storage"));
    } catch {
      // Failed to save to localStorage - storage may be full or disabled
    }
  };

  return [getStoredValue(), setValue] as const;
}

// Debounce hook
export function useDebounce<T>(value: T, delay: number): T {
  const debouncedValue = useRef(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      debouncedValue.current = value;
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue.current;
}

// Media query hook
export function useMediaQuery(query: string): boolean {
  const matches = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    matches.current = mediaQuery.matches;

    const handler = (e: MediaQueryListEvent) => {
      matches.current = e.matches;
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [query]);

  return matches.current;
}

// Device detection
export function useDeviceDetection() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(min-width: 769px) and (max-width: 1024px)");
  const isDesktop = useMediaQuery("(min-width: 1025px)");
  
  const isTouchDevice = typeof window !== "undefined" && 
    ("ontouchstart" in window || navigator.maxTouchPoints > 0);

  return { isMobile, isTablet, isDesktop, isTouchDevice };
}

// Copy to clipboard
export function useCopyToClipboard() {
  const copy = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback for older browsers
      try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        return true;
      } catch {
        return false;
      }
    }
  };

  return { copy };
}

// Click outside hook
export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  handler: () => void,
  enabled = true
) {
  useEffect(() => {
    if (!enabled) return;

    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        handler();
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [ref, handler, enabled]);
}

// Previous value hook
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

// Window size hook
export function useWindowSize() {
  const size = useRef({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      size.current = {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return size.current;
}

// Scroll position hook
export function useScrollPosition() {
  const position = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const updatePosition = () => {
      position.current = {
        x: window.scrollX,
        y: window.scrollY,
      };
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, { passive: true });
    return () => window.removeEventListener("scroll", updatePosition);
  }, []);

  return position.current;
}

// Lock body scroll
export function useLockBodyScroll(lock: boolean) {
  useEffect(() => {
    if (!lock) return;

    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [lock]);
}
