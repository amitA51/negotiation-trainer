'use client';

import { ErrorBoundaryUI } from '@/components/ui';

export default function TrainingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorBoundaryUI error={error} reset={reset} feature="האימון" />;
}
