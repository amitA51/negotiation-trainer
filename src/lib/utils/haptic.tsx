"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";

// Haptic feedback patterns
export type HapticPattern = "light" | "medium" | "heavy" | "success" | "warning" | "error" | "selection";

interface HapticContextValue {
  isSupported: boolean;
  trigger: (pattern?: HapticPattern) => void;
}

const HapticContext = createContext<HapticContextValue>({
  isSupported: false,
  trigger: () => {},
});

export function useHaptic() {
  return useContext(HapticContext);
}

export function HapticProvider({ children }: { children: ReactNode }) {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if vibration API is supported
    setIsSupported("vibrate" in navigator);
  }, []);

  const trigger = (pattern: HapticPattern = "light") => {
    if (!isSupported) return;

    const patterns: Record<HapticPattern, number | number[]> = {
      light: 10,
      medium: 25,
      heavy: 50,
      success: [10, 50, 10],
      warning: [25, 25, 25],
      error: [50, 100, 50],
      selection: 5,
    };

    try {
      navigator.vibrate(patterns[pattern]);
    } catch {
      // Silently fail if vibration is not available
    }
  };

  return (
    <HapticContext.Provider value={{ isSupported, trigger }}>
      {children}
    </HapticContext.Provider>
  );
}

// Hook for components that need haptic feedback
export function useHapticFeedback() {
  const { isSupported, trigger } = useHaptic();

  return {
    isSupported,
    light: () => trigger("light"),
    medium: () => trigger("medium"),
    heavy: () => trigger("heavy"),
    success: () => trigger("success"),
    warning: () => trigger("warning"),
    error: () => trigger("error"),
    selection: () => trigger("selection"),
  };
}

// Button wrapper with haptic feedback
interface HapticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  hapticPattern?: HapticPattern;
  children: ReactNode;
}

export function HapticButton({ hapticPattern = "light", children, onClick, ...props }: HapticButtonProps) {
  const { trigger } = useHaptic();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    trigger(hapticPattern);
    onClick?.(e);
  };

  return (
    <button onClick={handleClick} {...props}>
      {children}
    </button>
  );
}
