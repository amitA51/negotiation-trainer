/**
 * Loading state for Stats page
 */

import { Skeleton } from '@/components/ui';

export default function StatsLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Skeleton className="w-7 h-7 rounded" />
          <Skeleton className="h-9 w-40" />
        </div>
        <Skeleton className="h-5 w-56" />
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>

      {/* Additional stats */}
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );
}
