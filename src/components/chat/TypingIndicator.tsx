"use client";

import { cn } from "@/lib/utils";

export function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-in">
      {/* AI Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] flex items-center justify-center shrink-0">
        <span className="text-xs font-bold text-black">N</span>
      </div>

      {/* Typing Dots */}
      <div className="px-4 py-3 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl rounded-bl-sm">
        <div className="flex items-center gap-1">
          <span
            className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}
