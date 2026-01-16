"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/components/ui/Toast";
import { NotificationProvider } from "@/components/ui/Notifications";
import { HapticProvider } from "@/lib/utils/haptic";
import { OfflineIndicator, InstallPrompt } from "@/components/ui";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <HapticProvider>
        <ToastProvider>
          <NotificationProvider>
            {/* Offline indicator at the top */}
            <OfflineIndicator />
            
            {/* Main content */}
            {children}
            
            {/* PWA install prompt */}
            <InstallPrompt />
          </NotificationProvider>
        </ToastProvider>
      </HapticProvider>
    </AuthProvider>
  );
}
