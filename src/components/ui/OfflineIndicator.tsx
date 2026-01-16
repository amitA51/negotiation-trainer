"use client";

import { useState, useEffect } from "react";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check initial state
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(true);
      // Hide banner after 3 seconds
      setTimeout(() => setShowBanner(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!showBanner && isOnline) return null;

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-[200]",
        "flex items-center justify-center gap-2 px-4 py-2",
        "text-sm font-medium",
        "transition-all duration-300",
        isOnline
          ? "bg-[var(--success)] text-white"
          : "bg-[var(--warning)] text-black"
      )}
    >
      {isOnline ? (
        <>
          <Wifi size={16} />
          <span>חזרת לאינטרנט</span>
        </>
      ) : (
        <>
          <WifiOff size={16} />
          <span>אין חיבור לאינטרנט</span>
        </>
      )}
    </div>
  );
}

// Connection status hook
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

// Pull to Refresh Component
interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  disabled?: boolean;
}

export function PullToRefresh({ onRefresh, children, disabled }: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  const threshold = 80;

  useEffect(() => {
    if (disabled) return;

    let startY = 0;
    let currentY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        setIsPulling(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling || isRefreshing) return;

      currentY = e.touches[0].clientY;
      const distance = Math.max(0, currentY - startY);
      
      // Apply resistance
      const resistance = 0.5;
      setPullDistance(Math.min(distance * resistance, threshold * 1.5));
    };

    const handleTouchEnd = async () => {
      if (!isPulling) return;

      if (pullDistance >= threshold && !isRefreshing) {
        setIsRefreshing(true);
        setPullDistance(threshold / 2);
        
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
        }
      }

      setIsPulling(false);
      setPullDistance(0);
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [disabled, isPulling, isRefreshing, pullDistance, onRefresh, threshold]);

  return (
    <div className="relative">
      {/* Pull indicator */}
      <div
        className={cn(
          "absolute left-1/2 -translate-x-1/2 flex items-center justify-center",
          "w-10 h-10 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-default)]",
          "transition-all duration-200",
          (isPulling || isRefreshing) ? "opacity-100" : "opacity-0"
        )}
        style={{
          top: pullDistance - 50,
          transform: `translateX(-50%) rotate(${pullDistance * 3}deg)`,
        }}
      >
        <RefreshCw
          size={20}
          className={cn(
            "text-[var(--accent)]",
            isRefreshing && "animate-spin"
          )}
        />
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling ? "none" : "transform 0.3s ease-out",
        }}
      >
        {children}
      </div>
    </div>
  );
}
