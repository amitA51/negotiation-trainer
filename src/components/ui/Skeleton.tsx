"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "rounded";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
}

export function Skeleton({
  className,
  variant = "rectangular",
  width,
  height,
  animation = "wave",
}: SkeletonProps) {
  const variants = {
    text: "rounded-md",
    circular: "rounded-full",
    rectangular: "rounded-none",
    rounded: "rounded-[var(--radius-md)]",
  };

  const animations = {
    pulse: "animate-pulse",
    wave: "animate-shimmer",
    none: "",
  };

  const style: React.CSSProperties = {
    width: width,
    height: height,
  };

  return (
    <div
      className={cn(
        "bg-[var(--bg-elevated)]",
        variants[variant],
        animations[animation],
        className
      )}
      style={style}
    />
  );
}

// Pre-built skeleton components for common use cases
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={cn(
            "h-4",
            i === lines - 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("p-6 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)]", className)}>
      <div className="flex items-start gap-4">
        <Skeleton variant="circular" className="w-12 h-12 shrink-0" />
        <div className="flex-1 space-y-3">
          <Skeleton variant="text" className="h-5 w-1/3" />
          <Skeleton variant="text" className="h-4 w-full" />
          <Skeleton variant="text" className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonAvatar({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };

  return <Skeleton variant="circular" className={sizes[size]} />;
}

export function SkeletonButton({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "h-8 w-20",
    md: "h-10 w-28",
    lg: "h-12 w-36",
  };

  return <Skeleton variant="rounded" className={sizes[size]} />;
}

export function SkeletonChat({ messages = 3 }: { messages?: number }) {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: messages }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "flex gap-3",
            i % 2 === 0 ? "justify-start" : "justify-end"
          )}
        >
          {i % 2 === 0 && <Skeleton variant="circular" className="w-8 h-8 shrink-0" />}
          <Skeleton
            variant="rounded"
            className={cn(
              "h-16",
              i % 2 === 0 ? "w-3/4" : "w-2/3"
            )}
          />
          {i % 2 !== 0 && <Skeleton variant="circular" className="w-8 h-8 shrink-0" />}
        </div>
      ))}
    </div>
  );
}

export function SkeletonStats({ cards = 3 }: { cards?: number }) {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {Array.from({ length: cards }).map((_, i) => (
        <div
          key={i}
          className="p-6 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)]"
        >
          <div className="flex items-center gap-4">
            <Skeleton variant="rounded" className="w-12 h-12 shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" className="h-3 w-16" />
              <Skeleton variant="text" className="h-6 w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] overflow-hidden">
      {/* Header */}
      <div className="bg-[var(--bg-secondary)] p-4 grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} variant="text" className="h-4" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="p-4 border-t border-[var(--border-subtle)] grid gap-4"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {Array.from({ length: cols }).map((_, colIdx) => (
            <Skeleton key={colIdx} variant="text" className="h-4" />
          ))}
        </div>
      ))}
    </div>
  );
}
