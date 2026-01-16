"use client";

import { useState, useEffect } from "react";
import { 
  User, 
  Link2, 
  LogOut, 
  Copy, 
  Check, 
  RefreshCw, 
  ExternalLink,
  Settings,
  Shield,
  Smartphone,
  Save,
  Trash2,
  AlertTriangle
} from "lucide-react";
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
    <div className="max-w-3xl mx-auto relative min-h-screen pb-20">
      {/* Decorative Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--accent)]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] flex items-center gap-3">
          <Settings className="text-[var(--accent)]" />
          הגדרות חשבון
        </h1>
        <p className="text-[var(--text-secondary)] mt-2">
          נהל את הפרופיל שלך, העדפות אימון וחיבורים
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        <section className="relative overflow-hidden rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 md:p-8 animate-fade-in-up stagger-1 group hover:border-[var(--accent-dark)] transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/5 rounded-full blur-2xl -mr-10 -mt-10" />
          
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-right">
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--accent)] rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity" />
              <Avatar src={user?.photoURL} name={user?.displayName} size="xl" className="relative w-24 h-24 border-2 border-[var(--bg-primary)] shadow-xl" />
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-1">
                {user?.displayName || "משתמש"}
              </h2>
              <div className="flex items-center justify-center md:justify-start gap-2 text-[var(--text-muted)] mb-4">
                <User size={14} />
                <span>{user?.email}</span>
              </div>
              <Badge variant="default">התוכנית החינמית</Badge>
            </div>

            <Button
              variant="secondary"
              className="w-full md:w-auto"
              onClick={handleSignOut}
              icon={<LogOut size={16} />}
            >
              התנתק
            </Button>
          </div>
        </section>

        {/* Preferences */}
        <section className="rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 md:p-8 animate-fade-in-up stagger-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)]">
                <Shield size={20} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-[var(--text-primary)]">רמת קושי מועדפת</h3>
                <p className="text-sm text-[var(--text-secondary)]">רמת הקושי ההתחלתית לכל אימון חדש</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveDifficulty}
              loading={saving}
              className="text-[var(--accent)] hover:text-[var(--accent-light)] hover:bg-[var(--accent-subtle)]"
              icon={<Save size={16} />}
            >
              שמור שינויים
            </Button>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-8 gap-3 mb-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((level) => (
              <button
                key={level}
                onClick={() => setPreferredDifficulty(level)}
                className={cn(
                  "aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 relative overflow-hidden group",
                  preferredDifficulty === level
                    ? "bg-[var(--accent)] text-black shadow-[0_0_20px_var(--accent-glow)] scale-105"
                    : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)]"
                )}
              >
                {preferredDifficulty === level && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent" />
                )}
                <span className="text-xl font-bold relative z-10">{level}</span>
              </button>
            ))}
          </div>

          <div className={cn(
            "rounded-xl p-4 border transition-colors duration-300",
            preferredDifficulty <= 3 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
            preferredDifficulty <= 5 ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
            "bg-red-500/10 border-red-500/20 text-red-500"
          )}>
            <div className="font-bold mb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-current" />
              {difficultyInfo.name}
            </div>
            <p className="text-sm opacity-90">
              {difficultyInfo.description}
            </p>
          </div>
        </section>

        {/* Telegram Integration */}
        <section className="rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 md:p-8 animate-fade-in-up stagger-3">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
              <Smartphone size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[var(--text-primary)]">חיבור לטלגרם</h3>
              <p className="text-sm text-[var(--text-secondary)]">התאמן ישירות דרך הטלגרם</p>
            </div>
          </div>

          {user?.telegramChatId ? (
            <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                  <Check size={20} />
                </div>
                <div>
                  <p className="font-medium text-[var(--text-primary)]">מחובר בהצלחה</p>
                  <p className="text-sm text-[var(--text-muted)] font-mono">
                    @{user.telegramUsername || user.telegramChatId}
                  </p>
                </div>
              </div>
              <Button variant="ghost" className="text-red-500 hover:text-red-400 hover:bg-red-500/10" icon={<Trash2 size={16} />}>
                נתק
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {!linkingCode ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto mb-4">
                    <Link2 size={32} />
                  </div>
                  <p className="text-[var(--text-secondary)] mb-6 max-w-sm mx-auto">
                    חבר את חשבון הטלגרם שלך כדי לקבל תזכורות ולהתאמן בשיחות צ'אט מהירות
                  </p>
                  <Button
                    variant="primary"
                    onClick={handleGenerateCode}
                    loading={generatingCode}
                    className="w-full md:w-auto min-w-[200px]"
                  >
                    צור קוד חיבור
                  </Button>
                </div>
              ) : (
                <div className="animate-fade-in">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-[var(--bg-elevated)] p-4 rounded-xl border border-[var(--border-subtle)]">
                        <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2 block">
                          קוד החיבור שלך
                        </label>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 font-mono text-3xl text-[var(--accent)] font-bold tracking-widest text-center py-2">
                            {linkingCode}
                          </code>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleCopyCode}
                            className="h-10 w-10 p-0"
                          >
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                          </Button>
                        </div>
                        {codeExpiresIn && codeExpiresIn > 0 && (
                          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-[var(--text-muted)]">
                            <RefreshCw size={12} className={cn("animate-spin")} style={{ animationDuration: '3s' }} />
                            פג תוקף בעוד <span className="font-mono text-[var(--accent)]">{formatTime(codeExpiresIn)}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          className="flex-1"
                          onClick={handleOpenTelegram}
                          icon={<ExternalLink size={16} />}
                        >
                          פתח בוט
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={handleGenerateCode}
                          loading={generatingCode}
                          icon={<RefreshCw size={16} />}
                        >
                          חדש
                        </Button>
                      </div>
                    </div>

                    <div className="bg-[var(--bg-elevated)]/50 p-5 rounded-xl border border-[var(--border-subtle)] flex flex-col justify-center">
                      <h4 className="font-medium text-[var(--text-primary)] mb-3 flex items-center gap-2">
                        <Smartphone size={16} className="text-[var(--text-muted)]" />
                        איך מתחברים?
                      </h4>
                      <ol className="space-y-3 text-sm text-[var(--text-secondary)] list-decimal list-inside">
                        <li>לחץ על <strong>פתח בוט</strong> או חפש <code className="text-[var(--accent)] bg-[var(--accent-subtle)] px-1 rounded">@{TELEGRAM_BOT_USERNAME}</code></li>
                        <li>לחץ על <strong>Start</strong> בטלגרם</li>
                        <li>שלח את הקוד שמופיע כאן</li>
                        <li>זהו! החשבון מחובר</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Danger Zone */}
        <section className="rounded-3xl border border-red-900/20 bg-red-900/5 p-6 animate-fade-in-up stagger-4">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-red-500/10 text-red-500 shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-[var(--text-primary)] mb-1">אזור מסוכן</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                מחיקת החשבון היא פעולה בלתי הפיכה. כל הנתונים, האימונים וההיסטוריה יימחקו לצמיתות.
              </p>
              <Button variant="ghost" className="text-red-500 hover:bg-red-500/10 hover:text-red-600 border border-red-900/30">
                מחק חשבון
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
