"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Target,
  MessageSquare,
  BookOpen,
  History,
  BarChart3,
  Settings,
  LogOut,
  Trophy,
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
  { href: "/achievements", label: "הישגים", icon: Trophy },
  { href: "/history", label: "היסטוריה", icon: History },
  { href: "/stats", label: "סטטיסטיקות", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <aside className="fixed top-0 right-0 h-full w-64 bg-[var(--bg-secondary)] border-l border-[var(--border-subtle)] flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-[var(--border-subtle)]">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] flex items-center justify-center shadow-[0_0_20px_var(--accent-glow)]">
            <span className="text-lg font-bold text-black">N</span>
          </div>
          <span className="text-xl font-bold text-gold">NEGO</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] transition-all duration-[var(--transition-fast)]",
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

      {/* User Section */}
      <div className="p-4 border-t border-[var(--border-subtle)]">
        {/* Settings */}
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] transition-all duration-[var(--transition-fast)]",
            pathname === "/settings"
              ? "bg-[var(--accent-subtle)] text-[var(--accent-light)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
          )}
        >
          <Settings size={20} />
          <span className="font-medium">הגדרות</span>
        </Link>

        {/* User info */}
        <div className="mt-4 p-4 rounded-[var(--radius-lg)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <Avatar
              src={user?.photoURL}
              name={user?.displayName}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[var(--text-primary)] truncate">
                {user?.displayName || "משתמש"}
              </p>
              <p className="text-xs text-[var(--text-muted)] truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-[var(--radius-md)] text-sm text-[var(--text-muted)] hover:text-[var(--error)] hover:bg-[var(--error-subtle)] transition-colors"
          >
            <LogOut size={16} />
            <span>התנתק</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
