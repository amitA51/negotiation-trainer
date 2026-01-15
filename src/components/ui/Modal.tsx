"use client";

import { useEffect, useRef, ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  showClose?: boolean;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  showClose = true,
  className,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  const modalContent = (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className={cn(
        "fixed inset-0 z-50",
        "bg-black/70 backdrop-blur-sm",
        "flex items-center justify-center p-4",
        "animate-fade-in"
      )}
    >
      <div
        className={cn(
          "w-full",
          sizes[size],
          "bg-[var(--bg-elevated)]",
          "border border-[var(--border-subtle)]",
          "rounded-[var(--radius-xl)]",
          "shadow-[var(--shadow-xl)]",
          "animate-scale-in",
          className
        )}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-start justify-between p-5 border-b border-[var(--border-subtle)]">
            <div>
              {title && (
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  {description}
                </p>
              )}
            </div>
            {showClose && (
              <button
                onClick={onClose}
                className={cn(
                  "p-2 rounded-[var(--radius-md)]",
                  "text-[var(--text-muted)]",
                  "hover:text-[var(--text-primary)]",
                  "hover:bg-[var(--bg-hover)]",
                  "transition-colors"
                )}
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
