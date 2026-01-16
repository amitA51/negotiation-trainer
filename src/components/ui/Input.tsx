"use client";

import { forwardRef, InputHTMLAttributes, useId } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconPosition?: "start" | "end";
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, icon, iconPosition = "start", type, id: providedId, ...props }, ref) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;
    
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={id}
            className="block text-sm font-medium text-[var(--text-secondary)] mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && iconPosition === "start" && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" aria-hidden="true">
              {icon}
            </div>
          )}
          <input
            type={type}
            id={id}
            ref={ref}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            autoComplete={props.autoComplete || "off"}
            spellCheck={type === "email" || type === "url" ? false : props.spellCheck}
            className={cn(
              // Base styles
              "w-full px-4 py-3",
              "bg-[var(--bg-secondary)]",
              "border border-[var(--border-subtle)]",
              "rounded-[var(--radius-md)]",
              "text-[var(--text-primary)]",
              "placeholder:text-[var(--text-muted)]",
              // Use specific transitions instead of transition-all
              "transition-[border-color,box-shadow] duration-[var(--transition-fast)]",
              // Focus
              "focus:outline-none focus:border-[var(--accent)]",
              "focus:shadow-[0_0_0_3px_var(--accent-subtle)]",
              // Hover
              "hover:border-[var(--border-default)]",
              // Disabled
              "disabled:opacity-50 disabled:cursor-not-allowed",
              // Error
              error && "border-[var(--error)] focus:border-[var(--error)] focus:shadow-[0_0_0_3px_var(--error-subtle)]",
              // Icon padding
              icon && iconPosition === "start" && "pr-12",
              icon && iconPosition === "end" && "pl-12",
              className
            )}
            {...props}
          />
          {icon && iconPosition === "end" && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" aria-hidden="true">
              {icon}
            </div>
          )}
        </div>
        {error && (
          <p id={errorId} className="mt-1.5 text-sm text-[var(--error)]" role="alert" aria-live="polite">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="mt-1.5 text-sm text-[var(--text-muted)]">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
