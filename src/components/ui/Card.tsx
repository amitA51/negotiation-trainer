"use client";

import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "gold" | "glass";
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", hover = true, padding = "md", children, ...props }, ref) => {
    const variants = {
      default: `
        bg-[var(--bg-elevated)]
        border border-[var(--border-subtle)]
        ${hover ? "hover:bg-[var(--bg-hover)] hover:border-[var(--border-default)] hover:shadow-[var(--shadow-md)]" : ""}
      `,
      gold: `
        bg-[var(--bg-elevated)]
        border border-[var(--accent-dark)]
        shadow-[0_0_0_1px_var(--accent-subtle)]
        ${hover ? "hover:border-[var(--accent)] hover:shadow-[var(--shadow-glow)]" : ""}
      `,
      glass: `
        bg-[rgba(15,15,18,0.8)]
        backdrop-blur-xl
        border border-[var(--border-subtle)]
        ${hover ? "hover:bg-[rgba(22,22,25,0.9)]" : ""}
      `,
    };

    const paddings = {
      none: "",
      sm: "p-3",
      md: "p-5",
      lg: "p-7",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-[var(--radius-lg)]",
          "transition-[background-color,border-color,box-shadow] duration-[var(--transition-base)]",
          variants[variant],
          paddings[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

// Card Header
const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("mb-4", className)}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

// Card Title
const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-lg font-semibold text-[var(--text-primary)]", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

// Card Description
const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-[var(--text-secondary)] mt-1", className)}
      {...props}
    />
  )
);
CardDescription.displayName = "CardDescription";

// Card Content
const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

// Card Footer
const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("mt-4 flex items-center gap-3", className)}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
