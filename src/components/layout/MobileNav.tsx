"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Home,
  Target,
  MessageSquare,
  BookOpen,
  History,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/firebase/auth";
import { Avatar } from "@/components/ui";

const navItems = [
  { href: "/dashboard", label: "בית", icon: Home },
  { href: "/training", label: "אימון", icon: Target },
  { href: "/consultation", label: "ייעוץ", icon: MessageSquare },
  { href: "/techniques", label: "טכניקות", icon: BookOpen },
  { href: "/history", label: "היסטוריה", icon: History },
  { href: "/stats", label: "סטטיסטיקות", icon: BarChart3 },
  { href: "/settings", label: "הגדרות", icon: Settings },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[var(--bg-secondary)]/80 backdrop-blur-lg border-b border-[var(--border-subtle)] flex items-center justify-between px-4 z-50 lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] flex items-center justify-center">
            <span className="text-sm font-bold text-black">N</span>
          </div>
          <span className="text-lg font-bold text-gold">NEGO</span>
        </Link>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-[var(--radius-md)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={cn(
          "fixed top-16 right-0 bottom-0 w-72 bg-[var(--bg-secondary)] border-l border-[var(--border-subtle)] z-50 lg:hidden transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* User Info */}
        <div className="p-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <Avatar
              src={user?.photoURL}
              name={user?.displayName}
              size="lg"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[var(--text-primary)] truncate">
                {user?.displayName || "משתמש"}
              </p>
              <p className="text-sm text-[var(--text-muted)] truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] transition-all",
                  isActive
                    ? "bg-[var(--accent-subtle)] text-[var(--accent-light)] border border-[var(--accent-dark)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                )}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[var(--border-subtle)]">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-[var(--radius-md)] text-[var(--text-muted)] hover:text-[var(--error)] hover:bg-[var(--error-subtle)] transition-colors"
          >
            <LogOut size={20} />
            <span>התנתק</span>
          </button>
        </div>
      </div>
    </>
  );
}
