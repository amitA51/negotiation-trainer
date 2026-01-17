"use client";

import { useState, useCallback, useRef, ReactNode, useId, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Accordion Component
interface AccordionItemProps {
  id: string;
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  icon?: ReactNode;
}

interface AccordionProps {
  items: AccordionItemProps[];
  allowMultiple?: boolean;
  className?: string;
}

export function Accordion({ items, allowMultiple = false, className }: AccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>(
    items.filter((item) => item.defaultOpen).map((item) => item.id)
  );

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setOpenItems((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      );
    } else {
      setOpenItems((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          {...item}
          isOpen={openItems.includes(item.id)}
          onToggle={() => toggleItem(item.id)}
        />
      ))}
    </div>
  );
}

function AccordionItem({
  title,
  children,
  icon,
  isOpen,
  onToggle,
}: AccordionItemProps & { isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-right hover:bg-[var(--bg-hover)] transition-colors"
        aria-expanded={isOpen}
      >
        {icon && <span className="text-[var(--text-muted)]">{icon}</span>}
        <span className="flex-1 font-medium text-[var(--text-primary)]">{title}</span>
        <ChevronDown
          size={20}
          className={cn(
            "text-[var(--text-muted)] transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="p-4 pt-0 text-[var(--text-secondary)]">{children}</div>
      </div>
    </div>
  );
}

// Tabs Component
interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
  variant?: "default" | "pills" | "underline";
}

export function Tabs({
  tabs,
  defaultTab,
  onChange,
  className,
  variant = "default",
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const tabListId = useId();

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  // Keyboard navigation for tabs
  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    const enabledTabs = tabs.filter(t => !t.disabled);
    const currentEnabledIndex = enabledTabs.findIndex(t => t.id === tabs[currentIndex].id);
    
    let nextIndex = -1;
    
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      // RTL: ArrowRight goes to previous, ArrowLeft goes to next
      if (e.key === "ArrowRight") {
        nextIndex = currentEnabledIndex > 0 ? currentEnabledIndex - 1 : enabledTabs.length - 1;
      } else {
        nextIndex = currentEnabledIndex < enabledTabs.length - 1 ? currentEnabledIndex + 1 : 0;
      }
    } else if (e.key === "Home") {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      nextIndex = enabledTabs.length - 1;
    }
    
    if (nextIndex >= 0) {
      const nextTab = enabledTabs[nextIndex];
      handleTabChange(nextTab.id);
      tabRefs.current.get(nextTab.id)?.focus();
    }
  };

  const variantStyles = {
    default: {
      container: "bg-[var(--bg-secondary)] p-1 rounded-[var(--radius-lg)]",
      tab: "px-4 py-2 rounded-[var(--radius-md)]",
      activeTab: "bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm",
      inactiveTab: "text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
    },
    pills: {
      container: "gap-2",
      tab: "px-4 py-2 rounded-[var(--radius-full)]",
      activeTab: "bg-[var(--accent-subtle)] text-[var(--accent-light)] border border-[var(--accent-dark)]",
      inactiveTab: "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]",
    },
    underline: {
      container: "border-b border-[var(--border-subtle)]",
      tab: "px-4 py-3 relative",
      activeTab: "text-[var(--accent)] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[var(--accent)]",
      inactiveTab: "text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
    },
  };

  const styles = variantStyles[variant];
  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className={className}>
      {/* Tab Headers */}
      <div
        className={cn("flex", styles.container)}
        role="tablist"
        aria-orientation="horizontal"
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            id={`${tabListId}-tab-${tab.id}`}
            ref={(el) => { if (el) tabRefs.current.set(tab.id, el); }}
            onClick={() => !tab.disabled && handleTabChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              "flex items-center gap-2 transition-all duration-[var(--transition-fast)] font-medium",
              styles.tab,
              activeTab === tab.id ? styles.activeTab : styles.inactiveTab,
              tab.disabled && "opacity-50 cursor-not-allowed"
            )}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-disabled={tab.disabled}
            aria-controls={`${tabListId}-panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div 
        id={`${tabListId}-panel-${activeTab}`}
        className="mt-4" 
        role="tabpanel"
        aria-labelledby={`${tabListId}-tab-${activeTab}`}
        tabIndex={0}
      >
        {activeTabData?.content}
      </div>
    </div>
  );
}

// Dropdown Component
interface DropdownItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: "start" | "end";
  className?: string;
}

export function Dropdown({ trigger, items, align = "start", className }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLButtonElement | HTMLAnchorElement>>(new Map());
  const dropdownId = useId();

  const actionableItems = items.filter(item => !item.divider);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setIsOpen(false);
      setFocusedIndex(-1);
    }
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    
    if (e.key === "Escape") {
      setIsOpen(false);
      setFocusedIndex(-1);
      return;
    }
    
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex(prev => {
        const next = prev + 1;
        return next >= actionableItems.length ? 0 : next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex(prev => {
        const next = prev - 1;
        return next < 0 ? actionableItems.length - 1 : next;
      });
    } else if (e.key === "Home") {
      e.preventDefault();
      setFocusedIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setFocusedIndex(actionableItems.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (focusedIndex >= 0) {
        const item = actionableItems[focusedIndex];
        if (!item.disabled) {
          item.onClick?.();
          setIsOpen(false);
          setFocusedIndex(-1);
        }
      }
    }
  }, [isOpen, focusedIndex, actionableItems]);

  // Focus the item when focusedIndex changes
  useEffect(() => {
    if (focusedIndex >= 0) {
      itemRefs.current.get(focusedIndex)?.focus();
    }
  }, [focusedIndex]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
      // Focus first item when opening with keyboard
      setFocusedIndex(0);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleClickOutside, handleKeyDown]);

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      {/* Trigger */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleTriggerKeyDown}
        role="button"
        tabIndex={0}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={dropdownId}
      >
        {trigger}
      </div>

      {/* Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          id={dropdownId}
          role="menu"
          aria-orientation="vertical"
          className={cn(
            "absolute top-full mt-2 min-w-[200px] py-2",
            "bg-[var(--bg-elevated)] border border-[var(--border-default)]",
            "rounded-[var(--radius-lg)] shadow-lg",
            "animate-scale-in z-50",
            align === "end" ? "left-0" : "right-0"
          )}
        >
          {(() => {
            let actionableIndex = 0;
            return items.map((item) => {
              if (item.divider) {
                return (
                  <div
                    key={item.id}
                    role="separator"
                    className="my-2 border-t border-[var(--border-subtle)]"
                  />
                );
              }

              const currentIndex = actionableIndex++;
              const itemContent = (
                <>
                  {item.icon && (
                    <span className="shrink-0 w-5" aria-hidden="true">{item.icon}</span>
                  )}
                  <span>{item.label}</span>
                </>
              );

              const itemClass = cn(
                "w-full flex items-center gap-3 px-4 py-2 text-right transition-colors outline-none",
                item.disabled
                  ? "opacity-50 cursor-not-allowed"
                  : item.danger
                  ? "text-[var(--error)] hover:bg-[var(--error-subtle)] focus:bg-[var(--error-subtle)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] focus:bg-[var(--bg-hover)] focus:text-[var(--text-primary)]"
              );

              if (item.href && !item.disabled) {
                return (
                  <a
                    key={item.id}
                    ref={(el) => { if (el) itemRefs.current.set(currentIndex, el); }}
                    href={item.href}
                    className={itemClass}
                    role="menuitem"
                    tabIndex={-1}
                    onClick={() => setIsOpen(false)}
                  >
                    {itemContent}
                  </a>
                );
              }

              return (
                <button
                  key={item.id}
                  ref={(el) => { if (el) itemRefs.current.set(currentIndex, el); }}
                  onClick={() => {
                    if (!item.disabled) {
                      item.onClick?.();
                      setIsOpen(false);
                    }
                  }}
                  className={itemClass}
                  role="menuitem"
                  tabIndex={-1}
                  disabled={item.disabled}
                  aria-disabled={item.disabled}
                >
                  {itemContent}
                </button>
              );
            });
          })()}
        </div>
      )}
    </div>
  );
}

// Toggle Switch Component
interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled,
  size = "md",
  className,
}: ToggleProps) {
  const sizes = {
    sm: { track: "w-8 h-5", thumb: "w-3 h-3", translate: "translate-x-3" },
    md: { track: "w-11 h-6", thumb: "w-4 h-4", translate: "translate-x-5" },
    lg: { track: "w-14 h-8", thumb: "w-6 h-6", translate: "translate-x-6" },
  };

  const s = sizes[size];

  return (
    <label
      className={cn(
        "flex items-center gap-3 cursor-pointer",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          "relative inline-flex shrink-0 rounded-full transition-colors duration-200",
          s.track,
          checked ? "bg-[var(--accent)]" : "bg-[var(--bg-active)]"
        )}
      >
        <span
          className={cn(
            "inline-block rounded-full bg-white shadow-sm transition-transform duration-200",
            s.thumb,
            "absolute top-1/2 -translate-y-1/2 right-1",
            checked && s.translate
          )}
        />
      </button>

      {(label || description) && (
        <div className="flex-1">
          {label && (
            <span className="font-medium text-[var(--text-primary)]">{label}</span>
          )}
          {description && (
            <p className="text-sm text-[var(--text-muted)]">{description}</p>
          )}
        </div>
      )}
    </label>
  );
}

// Tooltip Component
interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
  className?: string;
}

export function Tooltip({
  content,
  children,
  position = "top",
  delay = 300,
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  const positions = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 ml-2",
    right: "left-full top-1/2 -translate-y-1/2 mr-2",
  };

  return (
    <div
      className={cn("relative inline-block", className)}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}

      {isVisible && (
        <div
          className={cn(
            "absolute z-50 px-3 py-1.5",
            "bg-[var(--bg-active)] text-[var(--text-primary)]",
            "text-sm rounded-[var(--radius-md)] shadow-lg",
            "whitespace-nowrap animate-fade-in",
            positions[position]
          )}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </div>
  );
}
