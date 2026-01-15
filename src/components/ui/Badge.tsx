"use client";

import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "gold" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md";
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const variants = {
      default: "bg-[var(--bg-hover)] text-[var(--text-secondary)] border-[var(--border-default)]",
      gold: "bg-[var(--accent-subtle)] text-[var(--accent-light)] border-[var(--accent-dark)]",
      success: "bg-[var(--success-subtle)] text-[var(--success)] border-green-800",
      warning: "bg-[var(--warning-subtle)] text-[var(--warning)] border-yellow-800",
      error: "bg-[var(--error-subtle)] text-[var(--error)] border-red-800",
      info: "bg-[var(--info-subtle)] text-[var(--info)] border-blue-800",
    };

    const sizes = {
      sm: "px-2 py-0.5 text-xs",
      md: "px-2.5 py-1 text-sm",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5",
          "font-medium",
          "rounded-full",
          "border",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
