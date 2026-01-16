"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "start" | "end";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      icon,
      iconPosition = "start",
      children,
      "aria-label": ariaLabel,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary: `
        bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)]
        text-black font-semibold
        shadow-[0_0_0_1px_var(--accent-dark),var(--shadow-sm)]
        hover:from-[var(--accent-light)] hover:to-[var(--accent)]
        hover:shadow-[0_0_20px_var(--accent-glow),var(--shadow-md)]
        active:scale-[0.98]
      `,
      secondary: `
        bg-[var(--bg-elevated)]
        text-[var(--text-primary)]
        border border-[var(--border-default)]
        hover:bg-[var(--bg-hover)]
        hover:border-[var(--border-strong)]
      `,
      ghost: `
        bg-transparent
        text-[var(--text-secondary)]
        hover:bg-[var(--bg-hover)]
        hover:text-[var(--text-primary)]
      `,
      danger: `
        bg-[var(--error)]
        text-white font-semibold
        hover:bg-red-500
        hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]
      `,
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm gap-1.5",
      md: "px-5 py-2.5 text-base gap-2",
      lg: "px-7 py-3.5 text-lg gap-2.5",
    };

    // Icon-only buttons need aria-label
    const isIconOnly = icon && !children;
    const computedAriaLabel = isIconOnly && !ariaLabel ? "לחצן" : ariaLabel;

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-label={computedAriaLabel}
        aria-busy={loading}
        aria-disabled={disabled || loading}
        className={cn(
          // Base styles
          "inline-flex items-center justify-center",
          "rounded-[var(--radius-md)]",
          "font-medium",
          // Use specific transition properties instead of transition-all
          "transition-[background,border-color,box-shadow,transform,opacity]",
          "duration-[var(--transition-fast)]",
          // Focus - using focus-visible for better UX
          "outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]",
          // Disabled state
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none",
          // Touch optimization
          "touch-action-manipulation",
          // Variant
          variants[variant],
          // Size
          sizes[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
        ) : (
          icon && iconPosition === "start" && <span className="shrink-0" aria-hidden="true">{icon}</span>
        )}
        {children}
        {!loading && icon && iconPosition === "end" && (
          <span className="shrink-0" aria-hidden="true">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
