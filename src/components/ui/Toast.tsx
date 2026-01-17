"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info", duration = 4000) => {
    const id = Math.random().toString(36).substring(7);
    const toast: Toast = { id, message, type, duration };
    
    setToasts((prev) => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={hideToast} />
    </ToastContext.Provider>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div 
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 flex flex-col gap-2"
      role="region"
      aria-label="התראות"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const icons = {
    success: <CheckCircle size={20} className="text-green-500" aria-hidden="true" />,
    error: <AlertCircle size={20} className="text-red-500" aria-hidden="true" />,
    warning: <AlertTriangle size={20} className="text-amber-500" aria-hidden="true" />,
    info: <Info size={20} className="text-blue-500" aria-hidden="true" />,
  };

  const bgColors = {
    success: "border-green-500/30 bg-green-500/10",
    error: "border-red-500/30 bg-red-500/10",
    warning: "border-amber-500/30 bg-amber-500/10",
    info: "border-blue-500/30 bg-blue-500/10",
  };

  const roleMap = {
    success: "status",
    error: "alert",
    warning: "alert",
    info: "status",
  } as const;

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-4 rounded-[var(--radius-lg)] border backdrop-blur-sm",
        "animate-slide-up shadow-lg",
        bgColors[toast.type]
      )}
      role={roleMap[toast.type]}
      aria-live={toast.type === "error" || toast.type === "warning" ? "assertive" : "polite"}
    >
      {icons[toast.type]}
      <p className="flex-1 text-sm text-[var(--text-primary)]">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 rounded hover:bg-white/10 transition-colors"
        aria-label="סגור התראה"
      >
        <X size={16} className="text-[var(--text-muted)]" aria-hidden="true" />
      </button>
    </div>
  );
}
