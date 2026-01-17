/**
 * Loading state for Training page
 */

import { Skeleton } from '@/components/ui';

export default function TrainingLoading() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
      {/* Progress steps */}
      <div className="flex items-center justify-center gap-3 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-9 h-9 rounded-full" />
            {i < 3 && <Skeleton className="w-10 h-0.5" />}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <Skeleton className="h-9 w-48 mx-auto mb-3" />
        <Skeleton className="h-5 w-72 mx-auto" />
      </div>

      {/* Category grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>

      {/* Custom scenario option */}
      <Skeleton className="h-24 rounded-2xl" />
    </div>
  );
}
