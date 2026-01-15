"use client";

import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full",
        "border-[var(--border-strong)]",
        "border-t-[var(--accent)]",
        sizes[size],
        className
      )}
    />
  );
}

// Full page loading spinner
export function LoadingScreen({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-[var(--bg-primary)] flex flex-col items-center justify-center z-50">
      {/* Animated logo */}
      <div className="relative mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] animate-pulse" />
        <div className="absolute inset-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] blur-xl opacity-50 animate-pulse" />
      </div>
      
      {/* Logo text */}
      <h1 className="text-2xl font-bold text-gold mb-4">NEGO</h1>
      
      {/* Spinner */}
      <Spinner size="md" />
      
      {/* Message */}
      {message && (
        <p className="mt-4 text-[var(--text-secondary)] text-sm animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}

// Skeleton loading component
interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className, variant = "rectangular", width, height }: SkeletonProps) {
  const variants = {
    text: "rounded-md h-4",
    circular: "rounded-full",
    rectangular: "rounded-[var(--radius-md)]",
  };

  return (
    <div
      className={cn(
        "animate-shimmer",
        variants[variant],
        className
      )}
      style={{
        width: width,
        height: height,
      }}
    />
  );
}
