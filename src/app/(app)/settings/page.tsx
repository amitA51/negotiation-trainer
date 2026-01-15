"use client";

import { useState, useEffect } from "react";
import { User, Link2, LogOut, Copy, Check, RefreshCw, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button, Card, Badge, Avatar } from "@/components/ui";
import { signOut } from "@/lib/firebase/auth";
import { updateUserSettings } from "@/lib/firebase/firestore";
import { cn, getDifficultyInfo } from "@/lib/utils";

const TELEGRAM_BOT_USERNAME = "Negotiationthebot";

export default function SettingsPage() {
  const { user } = useAuth();
  const [preferredDifficulty, setPreferredDifficulty] = useState(3);
  const [linkingCode, setLinkingCode] = useState<string | null>(null);
  const [deepLink, setDeepLink] = useState<string | null>(null);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [codeExpiresIn, setCodeExpiresIn] = useState<number | null>(null);

  useEffect(() => {
    if (user?.settings?.preferredDifficulty) {
      setPreferredDifficulty(user.settings.preferredDifficulty);
    }
  }, [user]);

  // Countdown timer for code expiry
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
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleGenerateCode = async () => {
    if (!user) return;
    setGeneratingCode(true);
    try {
      const response = await fetch("/api/telegram/pairing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, action: "generate" }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setLinkingCode(data.code);
        setDeepLink(data.deepLink);
        setCodeExpiresIn(data.expiresIn);
      } else {
        console.error("Error generating code:", data.error);
      }
    } catch (error) {
      console.error("Error generating code:", error);
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleCopyCode = async () => {
    if (!linkingCode) return;
    await navigator.clipboard.writeText(linkingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenTelegram = () => {
    if (deepLink) {
      window.open(deepLink, "_blank");
    }
  };

  const handleSaveDifficulty = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateUserSettings(user.uid, { preferredDifficulty });
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const difficultyInfo = getDifficultyInfo(preferredDifficulty);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">הגדרות</h1>
        <p className="text-[var(--text-secondary)] mt-2">
          ניהול החשבון וההעדפות שלך
        </p>
      </div>

      {/* Profile */}
      <Card className="mb-6 animate-fade-in-up stagger-1" hover={false}>
        <div className="flex items-center gap-2 mb-4">
          <User size={20} className="text-[var(--accent)]" />
          <h2 className="font-semibold text-[var(--text-primary)]">פרופיל</h2>
        </div>
        <div className="flex items-center gap-4">
          <Avatar src={user?.photoURL} name={user?.displayName} size="xl" />
          <div>
            <p className="text-lg font-medium text-[var(--text-primary)]">
              {user?.displayName || "משתמש"}
            </p>
            <p className="text-sm text-[var(--text-muted)]">{user?.email}</p>
          </div>
        </div>
      </Card>

      {/* Preferred Difficulty */}
      <Card className="mb-6 animate-fade-in-up stagger-2" hover={false}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[var(--text-primary)]">רמת קושי מועדפת</h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSaveDifficulty}
            loading={saving}
          >
            שמור
          </Button>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((level) => (
            <button
              key={level}
              onClick={() => setPreferredDifficulty(level)}
              className={cn(
                "aspect-square rounded-[var(--radius-md)] flex items-center justify-center transition-all",
                preferredDifficulty === level
                  ? "bg-[var(--accent)] text-black shadow-[0_0_20px_var(--accent-glow)]"
                  : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)]"
              )}
            >
              <span className="text-xl font-bold">{level}</span>
            </button>
          ))}
        </div>
        <p className={cn("text-sm", difficultyInfo.color)}>
          {difficultyInfo.name} - {difficultyInfo.description}
        </p>
      </Card>

      {/* Telegram Linking */}
      <Card className="mb-6 animate-fade-in-up stagger-3" hover={false}>
        <div className="flex items-center gap-2 mb-4">
          <Link2 size={20} className="text-[var(--accent)]" />
          <h2 className="font-semibold text-[var(--text-primary)]">חיבור טלגרם</h2>
        </div>

        {user?.telegramChatId ? (
          <div className="flex items-center gap-2">
            <Badge variant="success">מחובר</Badge>
            <span className="text-sm text-[var(--text-muted)]">
              @{user.telegramUsername || `ID: ${user.telegramChatId}`}
            </span>
          </div>
        ) : (
          <>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              חבר את חשבון הטלגרם שלך כדי להשתמש במאמן גם בטלגרם
            </p>

            {linkingCode ? (
              <div className="space-y-4">
                {/* Code display */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-4 py-3 bg-[var(--bg-secondary)] rounded-[var(--radius-md)] font-mono text-2xl text-center text-[var(--accent)] tracking-widest border border-[var(--accent)]/30">
                    {linkingCode}
                  </div>
                  <Button
                    variant="secondary"
                    onClick={handleCopyCode}
                    icon={copied ? <Check size={18} /> : <Copy size={18} />}
                  >
                    {copied ? "הועתק!" : "העתק"}
                  </Button>
                </div>

                {/* Timer */}
                {codeExpiresIn && codeExpiresIn > 0 && (
                  <p className="text-sm text-[var(--text-muted)] text-center">
                    הקוד יפוג בעוד <span className="font-mono text-[var(--accent)]">{formatTime(codeExpiresIn)}</span>
                  </p>
                )}

                {/* Open Telegram Button */}
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleOpenTelegram}
                  icon={<ExternalLink size={18} />}
                >
                  פתח בטלגרם
                </Button>

                {/* Manual instructions */}
                <div className="p-3 bg-[var(--bg-secondary)] rounded-[var(--radius-md)] border border-[var(--border-subtle)]">
                  <p className="text-xs text-[var(--text-muted)] mb-2">או באופן ידני:</p>
                  <ol className="text-xs text-[var(--text-secondary)] space-y-1 list-decimal list-inside">
                    <li>חפש את הבוט <code className="text-[var(--accent)]">@{TELEGRAM_BOT_USERNAME}</code></li>
                    <li>שלח את הקוד <code className="text-[var(--accent)]">{linkingCode}</code></li>
                  </ol>
                </div>

                {/* Refresh button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleGenerateCode}
                  loading={generatingCode}
                  icon={<RefreshCw size={16} />}
                  className="w-full"
                >
                  צור קוד חדש
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                onClick={handleGenerateCode}
                loading={generatingCode}
                className="w-full"
              >
                צור קוד חיבור
              </Button>
            )}
          </>
        )}
      </Card>

      {/* Sign Out */}
      <Card className="animate-fade-in-up stagger-4" hover={false}>
        <Button
          variant="danger"
          className="w-full"
          onClick={handleSignOut}
          icon={<LogOut size={18} />}
        >
          התנתק
        </Button>
      </Card>
    </div>
  );
}
