"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

// Types
export type NotificationType = "success" | "error" | "warning" | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
}

interface NotificationContextValue {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id">) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  // Convenience methods
  success: (title: string, message?: string) => string;
  error: (title: string, message?: string) => string;
  warning: (title: string, message?: string) => string;
  info: (title: string, message?: string) => string;
}

// Context
const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

// Hook
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}

// Provider
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, "id">) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = {
      id,
      duration: 5000,
      dismissible: true,
      ...notification,
    };

    setNotifications((prev) => [...prev, newNotification]);

    // Auto-remove after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods
  const success = useCallback(
    (title: string, message?: string) =>
      addNotification({ type: "success", title, message }),
    [addNotification]
  );

  const error = useCallback(
    (title: string, message?: string) =>
      addNotification({ type: "error", title, message, duration: 8000 }),
    [addNotification]
  );

  const warning = useCallback(
    (title: string, message?: string) =>
      addNotification({ type: "warning", title, message }),
    [addNotification]
  );

  const info = useCallback(
    (title: string, message?: string) =>
      addNotification({ type: "info", title, message }),
    [addNotification]
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearAll,
        success,
        error,
        warning,
        info,
      }}
    >
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

// Notification Container
function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[100] space-y-2 pointer-events-none">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}

// Single Notification Item
function NotificationItem({
  notification,
  onDismiss,
}: {
  notification: Notification;
  onDismiss: () => void;
}) {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const colors = {
    success: {
      bg: "bg-[var(--success-subtle)]",
      border: "border-[var(--success)]",
      icon: "text-[var(--success)]",
    },
    error: {
      bg: "bg-[var(--error-subtle)]",
      border: "border-[var(--error)]",
      icon: "text-[var(--error)]",
    },
    warning: {
      bg: "bg-[var(--warning-subtle)]",
      border: "border-[var(--warning)]",
      icon: "text-[var(--warning)]",
    },
    info: {
      bg: "bg-[var(--info-subtle)]",
      border: "border-[var(--info)]",
      icon: "text-[var(--info)]",
    },
  };

  const Icon = icons[notification.type];
  const color = colors[notification.type];

  return (
    <div
      className={cn(
        "pointer-events-auto",
        "flex items-start gap-3 p-4",
        "rounded-[var(--radius-lg)]",
        "border-r-4",
        "bg-[var(--bg-elevated)]",
        "shadow-lg",
        color.border,
        "animate-slide-in-left"
      )}
      role="alert"
    >
      <div className={cn("shrink-0 mt-0.5", color.icon)}>
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[var(--text-primary)]">{notification.title}</p>
        {notification.message && (
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{notification.message}</p>
        )}
      </div>
      {notification.dismissible && (
        <button
          onClick={onDismiss}
          className="shrink-0 p-1 rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          aria-label="סגור התראה"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
