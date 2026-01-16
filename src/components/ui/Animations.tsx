"use client";

import { useEffect, useState, useRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

// Animated Counter
interface AnimatedCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 1500,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const animationFrame = useRef<number | null>(null);

  useEffect(() => {
    const startValue = displayValue;
    const endValue = value;

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      const current = startValue + (endValue - startValue) * easeOutQuart;
      setDisplayValue(current);

      if (progress < 1) {
        animationFrame.current = requestAnimationFrame(animate);
      }
    };

    startTime.current = null;
    animationFrame.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [value, duration]);

  return (
    <span className={className}>
      {prefix}
      {displayValue.toFixed(decimals)}
      {suffix}
    </span>
  );
}

// Staggered List Animation
interface StaggeredListProps {
  children: ReactNode[];
  staggerDelay?: number;
  className?: string;
}

export function StaggeredList({ children, staggerDelay = 50, className }: StaggeredListProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          className="animate-fade-in-up opacity-0"
          style={{
            animationDelay: `${index * staggerDelay}ms`,
            animationFillMode: "forwards",
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

// Typewriter Effect
interface TypewriterProps {
  text: string;
  speed?: number;
  delay?: number;
  cursor?: boolean;
  className?: string;
  onComplete?: () => void;
}

export function Typewriter({
  text,
  speed = 50,
  delay = 0,
  cursor = true,
  className,
  onComplete,
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayText("");
    setIsComplete(false);

    const timeout = setTimeout(() => {
      let currentIndex = 0;

      const interval = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayText(text.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(interval);
          setIsComplete(true);
          onComplete?.();
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, speed, delay, onComplete]);

  return (
    <span className={className}>
      {displayText}
      {cursor && !isComplete && (
        <span className="inline-block w-0.5 h-[1em] bg-[var(--accent)] mr-0.5 animate-pulse" />
      )}
    </span>
  );
}

// Fade Transition
interface FadeTransitionProps {
  show: boolean;
  children: ReactNode;
  duration?: number;
  className?: string;
}

export function FadeTransition({ show, children, duration = 300, className }: FadeTransitionProps) {
  const [shouldRender, setShouldRender] = useState(show);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  if (!shouldRender) return null;

  return (
    <div
      className={cn(
        "transition-opacity",
        show ? "opacity-100" : "opacity-0",
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}

// Slide Transition
interface SlideTransitionProps {
  show: boolean;
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right";
  duration?: number;
  className?: string;
}

export function SlideTransition({
  show,
  children,
  direction = "up",
  duration = 300,
  className,
}: SlideTransitionProps) {
  const [shouldRender, setShouldRender] = useState(show);

  const transforms = {
    up: "translateY(20px)",
    down: "translateY(-20px)",
    left: "translateX(20px)",
    right: "translateX(-20px)",
  };

  useEffect(() => {
    if (show) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  if (!shouldRender) return null;

  return (
    <div
      className={cn("transition-all", className)}
      style={{
        transitionDuration: `${duration}ms`,
        opacity: show ? 1 : 0,
        transform: show ? "translate(0)" : transforms[direction],
      }}
    >
      {children}
    </div>
  );
}

// Progress Circle
interface ProgressCircleProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
  children?: ReactNode;
}

export function ProgressCircle({
  progress,
  size = 120,
  strokeWidth = 8,
  className,
  children,
}: ProgressCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--bg-secondary)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--accent-dark)" />
            <stop offset="50%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--accent-light)" />
          </linearGradient>
        </defs>
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}

// Parallax Container
interface ParallaxProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

export function Parallax({ children, speed = 0.5, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      const scrolled = window.scrollY;
      const offset = (rect.top + scrolled) * speed;
      element.style.transform = `translateY(${offset - scrolled * speed}px)`;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

// Magnetic Button Effect
interface MagneticProps {
  children: ReactNode;
  strength?: number;
  className?: string;
}

export function Magnetic({ children, strength = 0.3, className }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      element.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    };

    const handleMouseLeave = () => {
      element.style.transform = "translate(0, 0)";
    };

    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [strength]);

  return (
    <div ref={ref} className={cn("transition-transform duration-150", className)}>
      {children}
    </div>
  );
}

// Shake Animation
export function useShake() {
  const [isShaking, setIsShaking] = useState(false);

  const shake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const shakeClass = isShaking ? "animate-shake" : "";

  return { shake, shakeClass, isShaking };
}

// Add shake animation to CSS
// @keyframes shake {
//   0%, 100% { transform: translateX(0); }
//   10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
//   20%, 40%, 60%, 80% { transform: translateX(4px); }
// }
// .animate-shake { animation: shake 0.5s ease-in-out; }
