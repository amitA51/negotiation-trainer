"use client";

import { useState, useRef, useEffect, forwardRef, ReactNode } from "react";
import { Search, X, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Search Input with suggestions
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  suggestions?: string[];
  onSuggestionSelect?: (suggestion: string) => void;
  loading?: boolean;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  onSearch,
  placeholder = "חיפוש…",
  suggestions = [],
  onSuggestionSelect,
  loading,
  className,
}: SearchInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const showSuggestions = isFocused && suggestions.length > 0 && value.length > 0;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          onSuggestionSelect?.(suggestions[selectedIndex]);
          onChange(suggestions[selectedIndex]);
        } else {
          onSearch?.(value);
        }
        setIsFocused(false);
        break;
      case "Escape":
        setIsFocused(false);
        break;
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search
          size={18}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
        />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "w-full pr-10 pl-10 py-3",
            "bg-[var(--bg-secondary)] border border-[var(--border-subtle)]",
            "rounded-[var(--radius-lg)] text-[var(--text-primary)]",
            "placeholder:text-[var(--text-muted)]",
            "focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-subtle)]",
            "transition-all duration-[var(--transition-fast)]"
          )}
        />
        {value && (
          <button
            onClick={() => {
              onChange("");
              inputRef.current?.focus();
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            aria-label="נקה חיפוש"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 py-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-lg)] shadow-lg z-50">
          {loading ? (
            <div className="px-4 py-2 text-[var(--text-muted)]">טוען...</div>
          ) : (
            suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  onChange(suggestion);
                  onSuggestionSelect?.(suggestion);
                  setIsFocused(false);
                }}
                className={cn(
                  "w-full px-4 py-2 text-right transition-colors",
                  index === selectedIndex
                    ? "bg-[var(--accent-subtle)] text-[var(--accent-light)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                )}
              >
                {suggestion}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Select Component
interface SelectOption {
  value: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  ({ value, onChange, options, placeholder, disabled, error, className }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
      <div ref={containerRef} className={cn("relative", className)}>
        <button
          ref={ref}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            "w-full flex items-center justify-between gap-2 px-4 py-3",
            "bg-[var(--bg-secondary)] border rounded-[var(--radius-lg)]",
            "text-right transition-all duration-[var(--transition-fast)]",
            error
              ? "border-[var(--error)] focus:ring-[var(--error-subtle)]"
              : "border-[var(--border-subtle)] focus:border-[var(--accent)] focus:ring-[var(--accent-subtle)]",
            "focus:outline-none focus:ring-2",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <span className={cn(
            "flex items-center gap-2",
            selectedOption ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"
          )}>
            {selectedOption?.icon}
            {selectedOption?.label || placeholder || "בחר אפשרות"}
          </span>
          <ChevronDown
            size={18}
            className={cn(
              "text-[var(--text-muted)] transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 py-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-lg)] shadow-lg z-50 max-h-60 overflow-auto">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  if (!option.disabled) {
                    onChange(option.value);
                    setIsOpen(false);
                  }
                }}
                disabled={option.disabled}
                className={cn(
                  "w-full flex items-center justify-between gap-2 px-4 py-2 text-right transition-colors",
                  option.disabled
                    ? "opacity-50 cursor-not-allowed text-[var(--text-muted)]"
                    : option.value === value
                    ? "bg-[var(--accent-subtle)] text-[var(--accent-light)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                )}
              >
                <span className="flex items-center gap-2">
                  {option.icon}
                  {option.label}
                </span>
                {option.value === value && <Check size={16} />}
              </button>
            ))}
          </div>
        )}

        {error && (
          <p className="mt-1 text-sm text-[var(--error)]">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

// Chip/Tag Component
interface ChipProps {
  children: ReactNode;
  onRemove?: () => void;
  variant?: "default" | "gold" | "success" | "warning" | "error";
  size?: "sm" | "md";
  className?: string;
}

export function Chip({
  children,
  onRemove,
  variant = "default",
  size = "md",
  className,
}: ChipProps) {
  const variants = {
    default: "bg-[var(--bg-hover)] text-[var(--text-secondary)] border-[var(--border-default)]",
    gold: "bg-[var(--accent-subtle)] text-[var(--accent-light)] border-[var(--accent-dark)]",
    success: "bg-[var(--success-subtle)] text-[var(--success)]",
    warning: "bg-[var(--warning-subtle)] text-[var(--warning)]",
    error: "bg-[var(--error-subtle)] text-[var(--error)]",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-3 py-1 text-sm gap-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className="p-0.5 rounded-full hover:bg-black/10 transition-colors"
          aria-label="הסר"
        >
          <X size={size === "sm" ? 12 : 14} />
        </button>
      )}
    </span>
  );
}

// Range Slider
interface RangeSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  formatValue?: (value: number) => string;
  className?: string;
}

export function RangeSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showValue = true,
  formatValue = (v) => String(v),
  className,
}: RangeSliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("space-y-2", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <label className="text-sm font-medium text-[var(--text-secondary)]">
              {label}
            </label>
          )}
          {showValue && (
            <span className="text-sm text-[var(--accent)]">
              {formatValue(value)}
            </span>
          )}
        </div>
      )}
      <div className="relative">
        <input
          type="range"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          className="w-full h-2 rounded-full bg-[var(--bg-secondary)] appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-[var(--accent)]
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-[var(--accent)]
            [&::-moz-range-thumb]:border-0
            [&::-moz-range-thumb]:cursor-pointer"
          style={{
            background: `linear-gradient(to left, var(--accent) ${percentage}%, var(--bg-secondary) ${percentage}%)`,
          }}
        />
      </div>
    </div>
  );
}
