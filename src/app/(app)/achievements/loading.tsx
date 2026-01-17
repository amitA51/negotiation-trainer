/**
 * Loading state for Achievements page
 */

import { Skeleton } from '@/components/ui';

export default function AchievementsLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Skeleton className="w-7 h-7 rounded" />
          <Skeleton className="h-9 w-32" />
        </div>
        <Skeleton className="h-5 w-64" />
      </div>

      {/* Progress bar */}
      <Skeleton className="h-32 rounded-2xl" />

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-10 w-24 rounded-full shrink-0" />
        ))}
      </div>

      {/* Achievements grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
