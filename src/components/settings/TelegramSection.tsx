/**
 * TelegramSection Component
 * Telegram bot integration settings
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Link2,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Smartphone,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { User } from '@/types';

const TELEGRAM_BOT_USERNAME = 'Negotiationthebot';

interface TelegramSectionProps {
  user: User | null;
}

export function TelegramSection({ user }: TelegramSectionProps) {
  const { showToast } = useToast();
  const [linkingCode, setLinkingCode] = useState<string | null>(null);
  const [deepLink, setDeepLink] = useState<string | null>(null);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [codeExpiresIn, setCodeExpiresIn] = useState<number | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (codeExpiresIn === null || codeExpiresIn <= 0) return;

    const timer = setInterval(() => {
      setCodeExpiresIn((prev) => (prev && prev > 0 ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [codeExpiresIn]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleGenerateCode = useCallback(async () => {
    if (!user) return;
    setGeneratingCode(true);

    try {
      const response = await fetch('/api/telegram/pairing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, action: 'generate' }),
      });

      const data = await response.json();

      if (data.success) {
        setLinkingCode(data.code);
        setDeepLink(data.deepLink);
        setCodeExpiresIn(data.expiresIn);
      } else {
        showToast('שגיאה ביצירת קוד חיבור', 'error');
      }
    } catch {
      showToast('שגיאה ביצירת קוד חיבור', 'error');
    } finally {
      setGeneratingCode(false);
    }
  }, [user, showToast]);

  const handleCopyCode = useCallback(async () => {
    if (!linkingCode) return;
    await navigator.clipboard.writeText(linkingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [linkingCode]);

  const handleOpenTelegram = useCallback(() => {
    if (deepLink) {
      window.open(deepLink, '_blank');
    }
  }, [deepLink]);

  const handleDisconnect = useCallback(async () => {
    if (!user) return;
    setDisconnecting(true);

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        telegramChatId: null,
        telegramUserId: null,
        telegramUsername: null,
        telegramLinkedAt: null,
      });
      showToast('הטלגרם נותק בהצלחה', 'success');
      window.location.reload();
    } catch {
      showToast('שגיאה בניתוק הטלגרם', 'error');
    } finally {
      setDisconnecting(false);
    }
  }, [user, showToast]);

  const isConnected = !!user?.telegramChatId;

  return (
    <section
      className="rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 slide-up"
      style={{ animationDelay: '100ms' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
          <Smartphone size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-[var(--text-primary)]">
            חיבור לטלגרם
          </h3>
          <p className="text-sm text-[var(--text-muted)]">
            התאמן ישירות דרך הטלגרם
          </p>
        </div>
      </div>

      {isConnected ? (
        <ConnectedState
          username={user?.telegramUsername || user?.telegramChatId}
          onDisconnect={handleDisconnect}
          disconnecting={disconnecting}
        />
      ) : linkingCode ? (
        <LinkingCodeDisplay
          code={linkingCode}
          expiresIn={codeExpiresIn}
          copied={copied}
          generatingCode={generatingCode}
          onCopy={handleCopyCode}
          onOpenTelegram={handleOpenTelegram}
          onRefresh={handleGenerateCode}
          formatTime={formatTime}
        />
      ) : (
        <NotConnectedState
          onGenerateCode={handleGenerateCode}
          generatingCode={generatingCode}
        />
      )}
    </section>
  );
}

// Sub-components
function ConnectedState({
  username,
  onDisconnect,
  disconnecting,
}: {
  username: string | null | undefined;
  onDisconnect: () => void;
  disconnecting: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-hover)] border border-[var(--border-subtle)]">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
          <Check size={18} />
        </div>
        <div>
          <p className="font-medium text-[var(--text-primary)]">מחובר בהצלחה</p>
          <p className="text-sm text-[var(--text-muted)] font-mono">
            @{username}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        className="text-red-500 hover:bg-red-500/10"
        icon={<Trash2 size={14} />}
        onClick={onDisconnect}
        loading={disconnecting}
      >
        נתק
      </Button>
    </div>
  );
}

function NotConnectedState({
  onGenerateCode,
  generatingCode,
}: {
  onGenerateCode: () => void;
  generatingCode: boolean;
}) {
  return (
    <div className="text-center py-6">
      <div className="w-14 h-14 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto mb-4">
        <Link2 size={28} />
      </div>
      <p className="text-[var(--text-secondary)] mb-5 text-sm max-w-sm mx-auto">
        חבר את חשבון הטלגרם שלך כדי לקבל תזכורות ולהתאמן בשיחות צ'אט
      </p>
      <Button variant="primary" onClick={onGenerateCode} loading={generatingCode}>
        צור קוד חיבור
      </Button>
    </div>
  );
}

function LinkingCodeDisplay({
  code,
  expiresIn,
  copied,
  generatingCode,
  onCopy,
  onOpenTelegram,
  onRefresh,
  formatTime,
}: {
  code: string;
  expiresIn: number | null;
  copied: boolean;
  generatingCode: boolean;
  onCopy: () => void;
  onOpenTelegram: () => void;
  onRefresh: () => void;
  formatTime: (seconds: number) => string;
}) {
  return (
    <div className="fade-in">
      <div className="grid md:grid-cols-2 gap-5">
        {/* Code Display */}
        <div className="space-y-4">
          <div className="bg-[var(--bg-hover)] p-4 rounded-xl border border-[var(--border-subtle)]">
            <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2 block">
              קוד החיבור שלך
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 font-mono text-2xl text-[var(--accent)] font-bold tracking-widest text-center py-2">
                {code}
              </code>
              <Button
                variant="secondary"
                size="sm"
                onClick={onCopy}
                className="h-9 w-9 p-0"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </Button>
            </div>
            {expiresIn && expiresIn > 0 && (
              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-[var(--text-muted)]">
                <RefreshCw
                  size={10}
                  className="animate-spin"
                  style={{ animationDuration: '3s' }}
                />
                פג תוקף בעוד{' '}
                <span className="font-mono text-[var(--accent)]">
                  {formatTime(expiresIn)}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="primary"
              className="flex-1"
              onClick={onOpenTelegram}
              icon={<ExternalLink size={14} />}
            >
              פתח בוט
            </Button>
            <Button
              variant="ghost"
              onClick={onRefresh}
              loading={generatingCode}
              icon={<RefreshCw size={14} />}
            >
              חדש
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-[var(--bg-hover)] p-4 rounded-xl border border-[var(--border-subtle)]">
          <h4 className="font-medium text-[var(--text-primary)] mb-3 flex items-center gap-2 text-sm">
            <Smartphone size={14} className="text-[var(--text-muted)]" />
            איך מתחברים?
          </h4>
          <ol className="space-y-2 text-sm text-[var(--text-secondary)] list-decimal list-inside">
            <li>
              לחץ על <strong>פתח בוט</strong> או חפש{' '}
              <code className="text-[var(--accent)] text-xs">
                @{TELEGRAM_BOT_USERNAME}
              </code>
            </li>
            <li>
              לחץ על <strong>Start</strong> בטלגרם
            </li>
            <li>שלח את הקוד שמופיע כאן</li>
            <li>זהו! החשבון מחובר</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
