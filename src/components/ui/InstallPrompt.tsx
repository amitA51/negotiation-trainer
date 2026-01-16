"use client";

import { useState, useEffect } from "react";
import { Download, X, Smartphone } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Check if previously dismissed
    const wasDismissed = localStorage.getItem("pwa-install-dismissed");
    if (wasDismissed) {
      const dismissedTime = parseInt(wasDismissed);
      // Show again after 7 days
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        setDismissed(true);
      }
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after a short delay
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
  };

  if (isInstalled || dismissed || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-fade-in-up">
      <div className="p-4 rounded-[var(--radius-lg)] bg-[var(--bg-elevated)] border border-[var(--border-default)] shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] flex items-center justify-center shrink-0">
            <Smartphone size={24} className="text-black" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[var(--text-primary)] mb-1">
              התקן את NEGO
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              הוסף לדף הבית לגישה מהירה וחוויה טובה יותר
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="primary"
                onClick={handleInstall}
                icon={<Download size={16} />}
              >
                התקן עכשיו
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
              >
                אחר כך
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
            aria-label="סגור"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

// iOS specific install instructions
export function IOSInstallInstructions({ onClose }: { onClose: () => void }) {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsIOS(ios);
    setIsStandalone(standalone);
  }, []);

  if (!isIOS || isStandalone) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
      <div className="w-full max-w-md bg-[var(--bg-elevated)] rounded-t-[var(--radius-xl)] md:rounded-[var(--radius-xl)] p-6 animate-fade-in-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-[var(--text-primary)]">
            התקן את NEGO
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-[var(--radius-md)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-[var(--accent-subtle)] flex items-center justify-center shrink-0">
              <span className="text-[var(--accent)] font-bold">1</span>
            </div>
            <div>
              <p className="text-[var(--text-primary)]">
                לחץ על כפתור השיתוף
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                בתחתית הדפדפן (Safari)
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-[var(--accent-subtle)] flex items-center justify-center shrink-0">
              <span className="text-[var(--accent)] font-bold">2</span>
            </div>
            <div>
              <p className="text-[var(--text-primary)]">
                בחר &quot;הוסף למסך הבית&quot;
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                גלול למטה אם צריך
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-[var(--accent-subtle)] flex items-center justify-center shrink-0">
              <span className="text-[var(--accent)] font-bold">3</span>
            </div>
            <div>
              <p className="text-[var(--text-primary)]">
                לחץ &quot;הוסף&quot;
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                האפליקציה תופיע במסך הבית
              </p>
            </div>
          </div>
        </div>

        <Button
          className="w-full mt-6"
          variant="primary"
          onClick={onClose}
        >
          הבנתי
        </Button>
      </div>
    </div>
  );
}
