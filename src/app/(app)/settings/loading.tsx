/**
 * Loading state for Settings page
 */

import { Skeleton } from '@/components/ui';

export default function SettingsLoading() {
  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Skeleton className="w-7 h-7 rounded" />
          <Skeleton className="h-9 w-40" />
        </div>
        <Skeleton className="h-5 w-72" />
      </div>

      {/* Profile section */}
      <Skeleton className="h-32 rounded-2xl" />

      {/* Difficulty preference */}
      <Skeleton className="h-48 rounded-2xl" />

      {/* AI Model */}
      <Skeleton className="h-56 rounded-2xl" />

      {/* Telegram */}
      <Skeleton className="h-40 rounded-2xl" />

      {/* Danger zone */}
      <Skeleton className="h-32 rounded-2xl" />
    </div>
  );
}
