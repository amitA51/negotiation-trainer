"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/layout";
import { ToastProvider, Skeleton } from "@/components/ui";

// Dynamic imports for layout components
const Sidebar = dynamic(() => import("@/components/layout").then(mod => ({ default: mod.Sidebar })), {
  ssr: false,
  loading: () => <div className="w-64 h-screen bg-[var(--bg-secondary)]" />,
});

const MobileNav = dynamic(() => import("@/components/layout").then(mod => ({ default: mod.MobileNav })), {
  ssr: false,
  loading: () => <div className="h-16 bg-[var(--bg-secondary)]" />,
});

// Loading fallback for page content
function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <Skeleton className="h-12 w-64" />
      <Skeleton className="h-48 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    </div>
  );
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AuthGuard>
        <ToastProvider>
          <div className="min-h-screen bg-[var(--bg-primary)]">
            {/* Skip to main content link for accessibility */}
            <a 
              href="#main-content" 
              className="skip-link"
            >
              דלג לתוכן הראשי
            </a>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
              <Suspense fallback={<div className="w-64 h-screen bg-[var(--bg-secondary)]" />}>
                <Sidebar />
              </Suspense>
            </div>

            {/* Mobile Navigation */}
            <Suspense fallback={<div className="h-16 bg-[var(--bg-secondary)]" />}>
              <MobileNav />
            </Suspense>

            {/* Main Content with Suspense */}
            <main id="main-content" className="lg:mr-64 min-h-screen pt-16 lg:pt-0">
              <div className="p-4 lg:p-8">
                <Suspense fallback={<PageSkeleton />}>
                  {children}
                </Suspense>
              </div>
            </main>
          </div>
        </ToastProvider>
      </AuthGuard>
    </AuthProvider>
  );
}
