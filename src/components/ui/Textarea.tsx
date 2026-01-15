"use client";

import { forwardRef, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            // Base styles
            "w-full px-4 py-3",
            "bg-[var(--bg-secondary)]",
            "border border-[var(--border-subtle)]",
            "rounded-[var(--radius-md)]",
            "text-[var(--text-primary)]",
            "placeholder:text-[var(--text-muted)]",
            "transition-all duration-[var(--transition-fast)]",
            "resize-none",
            "min-h-[120px]",
            // Focus
            "focus:outline-none focus:border-[var(--accent)]",
            "focus:shadow-[0_0_0_3px_var(--accent-subtle)]",
            // Hover
            "hover:border-[var(--border-default)]",
            // Disabled
            "disabled:opacity-50 disabled:cursor-not-allowed",
            // Error
            error && "border-[var(--error)] focus:border-[var(--error)] focus:shadow-[0_0_0_3px_var(--error-subtle)]",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-[var(--error)]">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-sm text-[var(--text-muted)]">{hint}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
