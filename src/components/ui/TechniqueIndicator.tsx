"use client";

import { useState, useEffect } from "react";
import { Sparkles, ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DetectedTechnique } from "@/lib/techniques/detection";
import { getTechniqueTip } from "@/lib/techniques/detection";

interface TechniqueBadgeProps {
  detected: DetectedTechnique;
  animate?: boolean;
}

export function TechniqueBadge({ detected, animate = true }: TechniqueBadgeProps) {
  const [showTip, setShowTip] = useState(false);
  const [isNew, setIsNew] = useState(animate);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setIsNew(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [animate]);

  const confidenceColors = {
    high: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    low: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  };

  return (
    <div
      className={cn(
        "inline-flex flex-col gap-1",
        isNew && "animate-bounce-in"
      )}
    >
      <button
        onClick={() => setShowTip(!showTip)}
        className={cn(
          "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border transition-all",
          confidenceColors[detected.confidence],
          "hover:scale-105 active:scale-95"
        )}
      >
        <Sparkles size={12} className={isNew ? "animate-pulse" : ""} />
        <span>{detected.technique.name}</span>
        {showTip ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
      
      {showTip && (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg p-3 text-xs slide-up max-w-xs">
          <div className="flex items-start gap-2">
            <Lightbulb size={14} className="text-[var(--accent)] shrink-0 mt-0.5" />
            <div>
              <p className="text-[var(--text-secondary)] mb-1">
                {getTechniqueTip(detected.technique.code)}
              </p>
              <p className="text-[var(--text-muted)] text-[10px]">
                {detected.technique.nameEn}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface TechniqueIndicatorProps {
  techniques: DetectedTechnique[];
  className?: string;
}

export function TechniqueIndicator({ techniques, className }: TechniqueIndicatorProps) {
  if (techniques.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1.5 mt-2", className)}>
      {techniques.map((detected, index) => (
        <TechniqueBadge
          key={`${detected.technique.code}-${index}`}
          detected={detected}
          animate={true}
        />
      ))}
    </div>
  );
}

interface TechniqueToastProps {
  detected: DetectedTechnique;
  onClose: () => void;
}

export function TechniqueToast({ detected, onClose }: TechniqueToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="bg-[var(--accent)] text-black px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2">
        <Sparkles size={16} className="animate-pulse" />
        <span className="font-medium text-sm">
          טכניקת {detected.technique.name} זוהתה!
        </span>
      </div>
    </div>
  );
}

// Add keyframes to global CSS
const styles = `
@keyframes bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-bounce-in {
  animation: bounce-in 0.5s ease-out;
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
`;

// Inject styles on mount
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
