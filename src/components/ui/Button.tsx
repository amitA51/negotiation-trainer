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
        hover:-translate-y-0.5
        active:translate-y-0
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

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          // Base styles
          "inline-flex items-center justify-center",
          "rounded-[var(--radius-md)]",
          "font-medium",
          "transition-all duration-[var(--transition-fast)]",
          "outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none",
          // Variant
          variants[variant],
          // Size
          sizes[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          icon && iconPosition === "start" && <span className="shrink-0">{icon}</span>
        )}
        {children}
        {!loading && icon && iconPosition === "end" && (
          <span className="shrink-0">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
