/**
 * Accessibility utilities
 */

import React, { useEffect, useRef, useState, useCallback } from "react";

/**
 * Announce message to screen readers
 */
export function announce(message: string, priority: "polite" | "assertive" = "polite") {
  const el = document.createElement("div");
  el.setAttribute("aria-live", priority);
  el.setAttribute("aria-atomic", "true");
  el.setAttribute("class", "sr-only");
  el.textContent = message;
  
  document.body.appendChild(el);
  
  setTimeout(() => {
    document.body.removeChild(el);
  }, 1000);
}

/**
 * Focus trap for modals and dialogs
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive) return;

    previousFocus.current = document.activeElement as HTMLElement;
    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    firstElement?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus.current?.focus();
    };
  }, [isActive]);

  return containerRef;
}

/**
 * Skip link functionality
 */
export function SkipLink({ targetId = "main-content" }: { targetId?: string }) {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView();
    }
  }, [targetId]);

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className="skip-link"
    >
      דלג לתוכן הראשי
    </a>
  );
}

/**
 * Reduce motion preference
 */
export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return prefersReducedMotion;
}

/**
 * Color contrast preference
 */
export function usePrefersHighContrast() {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-contrast: high)");
    setPrefersHighContrast(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersHighContrast(e.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return prefersHighContrast;
}

/**
 * Keyboard navigation for lists
 */
export function useListNavigation(
  itemsLength: number,
  onSelect: (index: number) => void
) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((prev) => (prev + 1) % itemsLength);
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((prev) => (prev - 1 + itemsLength) % itemsLength);
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          onSelect(activeIndex);
          break;
        case "Home":
          e.preventDefault();
          setActiveIndex(0);
          break;
        case "End":
          e.preventDefault();
          setActiveIndex(itemsLength - 1);
          break;
      }
    },
    [itemsLength, onSelect, activeIndex]
  );

  return { activeIndex, setActiveIndex, handleKeyDown };
}

/**
 * Live region for dynamic content
 */
export function useLiveRegion() {
  const regionRef = useRef<HTMLDivElement>(null);

  const announce = useCallback((message: string) => {
    if (regionRef.current) {
      regionRef.current.textContent = "";
      // Force reflow
      void regionRef.current.offsetHeight;
      regionRef.current.textContent = message;
    }
  }, []);

  const LiveRegion = useCallback(
    ({ priority = "polite" }: { priority?: "polite" | "assertive" }) => (
      <div
        ref={regionRef}
        aria-live={priority}
        aria-atomic="true"
        className="sr-only"
      />
    ),
    []
  );

  return { announce, LiveRegion };
}

/**
 * Check if element is visible
 */
export function isElementVisible(element: HTMLElement | null): boolean {
  if (!element) return false;

  const style = window.getComputedStyle(element);
  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    style.opacity !== "0" &&
    element.offsetParent !== null
  );
}

/**
 * Get all focusable elements
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(", ");

  return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
    isElementVisible
  );
}

/**
 * Screen reader only styles (add to CSS)
 */
export const srOnlyStyles = {
  position: "absolute" as const,
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap" as const,
  border: 0,
};
