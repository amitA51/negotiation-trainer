"use client";

import { useState, useEffect } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.remove("light", "dark");
      root.classList.add(systemTheme);
    } else {
      root.classList.remove("light", "dark");
      root.classList.add(theme);
    }
    
    localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  if (!mounted) {
    return (
      <div className={cn("w-10 h-10 rounded-[var(--radius-md)] bg-[var(--bg-hover)]", className)} />
    );
  }

  const themes: { value: Theme; icon: typeof Sun; label: string }[] = [
    { value: "light", icon: Sun, label: "בהיר" },
    { value: "dark", icon: Moon, label: "כהה" },
    { value: "system", icon: Monitor, label: "מערכת" },
  ];

  return (
    <div className={cn("flex items-center gap-1 p-1 rounded-[var(--radius-lg)] bg-[var(--bg-secondary)] border border-[var(--border-subtle)]", className)}>
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={cn(
            "p-2 rounded-[var(--radius-md)] transition-all duration-[var(--transition-fast)]",
            theme === value
              ? "bg-[var(--accent-subtle)] text-[var(--accent-light)] shadow-sm"
              : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
          )}
          title={label}
          aria-label={`בחר ערכת נושא ${label}`}
        >
          <Icon size={18} />
        </button>
      ))}
    </div>
  );
}

// Simple toggle button version
export function ThemeToggleButton({ className }: { className?: string }) {
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const newTheme = isDark ? "light" : "dark";
    setIsDark(!isDark);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  if (!mounted) {
    return (
      <div className={cn("w-10 h-10 rounded-[var(--radius-md)] bg-[var(--bg-hover)]", className)} />
    );
  }

  return (
    <button
      onClick={toggle}
      className={cn(
        "p-2.5 rounded-[var(--radius-md)] transition-all duration-[var(--transition-fast)]",
        "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]",
        "focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]",
        className
      )}
      aria-label={isDark ? "עבור למצב בהיר" : "עבור למצב כהה"}
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
