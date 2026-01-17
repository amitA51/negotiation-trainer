/**
 * SuspenseLoader Component
 * Wraps content with Suspense and provides loading fallback
 * Based on frontend-dev-guidelines skill
 */

'use client';

import { Suspense, ReactNode } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

interface SuspenseLoaderProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
  /** Fallback type for common patterns */
  fallbackType?: 'card' | 'list' | 'page' | 'inline';
}

// Pre-built fallback components
function CardFallback() {
  return (
    <div className="space-y-4 animate-pulse">
      <Skeleton className="h-48 w-full rounded-2xl" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

function ListFallback() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function PageFallback() {
  return (
    <div className="space-y-6 animate-pulse">
      <Skeleton className="h-12 w-64" />
      <Skeleton className="h-48 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    </div>
  );
}

function InlineFallback() {
  return <Skeleton className="h-6 w-32 inline-block" />;
}

const fallbacks = {
  card: <CardFallback />,
  list: <ListFallback />,
  page: <PageFallback />,
  inline: <InlineFallback />,
};

export function SuspenseLoader({
  children,
  fallback,
  className,
  fallbackType = 'card',
}: SuspenseLoaderProps) {
  const fallbackContent = fallback || fallbacks[fallbackType];

  return (
    <Suspense
      fallback={
        <div className={className}>
          {fallbackContent}
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

// Export fallback components for custom use
export { CardFallback, ListFallback, PageFallback, InlineFallback };
