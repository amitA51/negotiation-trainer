"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard, Sidebar, MobileNav } from "@/components/layout";
import { ToastProvider } from "@/components/ui";

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
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
              <Sidebar />
            </div>

            {/* Mobile Navigation */}
            <MobileNav />

            {/* Main Content */}
            <main id="main-content" className="lg:mr-64 min-h-screen pt-16 lg:pt-0">
              <div className="p-4 lg:p-8">
                {children}
              </div>
            </main>
          </div>
        </ToastProvider>
      </AuthGuard>
    </AuthProvider>
  );
}
