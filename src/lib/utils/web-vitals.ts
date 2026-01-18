/**
 * ==========================================
 * 📈 WEB VITALS MONITORING
 * ==========================================
 * Client-side performance monitoring
 * Tracks Core Web Vitals (LCP, FID, CLS)
 */

import { trackEvent } from './sentry';

/** Web Vital metric type */
interface WebVitalMetric {
  id: string;
  name: 'CLS' | 'FCP' | 'FID' | 'INP' | 'LCP' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  entries: PerformanceEntry[];
  navigationType: string;
}

/** Thresholds for Core Web Vitals */
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
} as const;

/** Get rating based on value and thresholds */
function getRating(
  name: keyof typeof THRESHOLDS,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name];
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/** Report web vital to analytics */
export function reportWebVital(metric: WebVitalMetric): void {
  // Only track in production or if explicitly enabled
  if (process.env.NODE_ENV !== 'production' && !process.env.NEXT_PUBLIC_TRACK_VITALS) {
    return;
  }

  const { name, value, rating, id } = metric;

  // Send to Sentry
  trackEvent(`web_vital_${name.toLowerCase()}`, {
    value: Math.round(value),
    rating,
    id,
  });

  // Log for debugging
  if (process.env.NODE_ENV === 'development') {
    const color = rating === 'good' ? '🟢' : rating === 'needs-improvement' ? '🟡' : '🔴';
    console.log(`${color} ${name}: ${Math.round(value)}ms (${rating})`);
  }
}

/** Initialize web vitals monitoring */
export async function initWebVitals(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    // Dynamically import web-vitals to reduce bundle size
    const { onCLS, onFCP, onFID, onINP, onLCP, onTTFB } = await import('web-vitals');

    onCLS((metric) => {
      reportWebVital({
        ...metric,
        rating: getRating('CLS', metric.value),
      } as WebVitalMetric);
    });

    onFCP((metric) => {
      reportWebVital({
        ...metric,
        rating: getRating('FCP', metric.value),
      } as WebVitalMetric);
    });

    onFID((metric) => {
      reportWebVital({
        ...metric,
        rating: getRating('FID', metric.value),
      } as WebVitalMetric);
    });

    onINP((metric) => {
      reportWebVital({
        ...metric,
        rating: getRating('INP', metric.value),
      } as WebVitalMetric);
    });

    onLCP((metric) => {
      reportWebVital({
        ...metric,
        rating: getRating('LCP', metric.value),
      } as WebVitalMetric);
    });

    onTTFB((metric) => {
      reportWebVital({
        ...metric,
        rating: getRating('TTFB', metric.value),
      } as WebVitalMetric);
    });
  } catch {
    // web-vitals not available
    console.warn('[Web Vitals] Failed to initialize monitoring');
  }
}

/** Get current performance metrics */
export function getPerformanceMetrics(): {
  domContentLoaded: number;
  loadComplete: number;
  firstPaint: number;
  memoryUsage?: number;
} | null {
  if (typeof window === 'undefined' || !window.performance) return null;

  const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (!timing) return null;

  const paintEntries = performance.getEntriesByType('paint');
  const firstPaint = paintEntries.find(e => e.name === 'first-paint');

  const result: {
    domContentLoaded: number;
    loadComplete: number;
    firstPaint: number;
    memoryUsage?: number;
  } = {
    domContentLoaded: Math.round(timing.domContentLoadedEventEnd - timing.startTime),
    loadComplete: Math.round(timing.loadEventEnd - timing.startTime),
    firstPaint: firstPaint ? Math.round(firstPaint.startTime) : 0,
  };

  // Memory usage (Chrome only)
  const memory = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory;
  if (memory) {
    result.memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024);
  }

  return result;
}
