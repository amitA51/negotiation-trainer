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
import { Button, Badge, Avatar, Modal } from "@/components/ui";
import { signOut } from "@/lib/firebase/auth";
import { updateUserSettings } from "@/lib/firebase/firestore";
import { useToast } from "@/components/ui/Toast";
import { cn, getDifficultyInfo } from "@/lib/utils";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { deleteUser } from "firebase/auth";
import { auth } from "@/lib/firebase/config";

const TELEGRAM_BOT_USERNAME = "Negotiationthebot";

export default function SettingsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [preferredDifficulty, setPreferredDifficulty] = useState(3);
  const [linkingCode, setLinkingCode] = useState<string | null>(null);
  const [deepLink, setDeepLink] = useState<string | null>(null);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [codeExpiresIn, setCodeExpiresIn] = useState<number | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
        showToast("שגיאה ביצירת קוד חיבור", "error");
      }
    } catch {
      showToast("שגיאה ביצירת קוד חיבור", "error");
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
      showToast("ההגדרות נשמרו", "success");
    } catch {
      showToast("שגיאה בשמירת ההגדרות", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  // Disconnect Telegram
  const handleDisconnectTelegram = async () => {
    if (!user) return;
    setDisconnecting(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        telegramChatId: null,
        telegramUserId: null,
        telegramUsername: null,
        telegramLinkedAt: null,
      });
      showToast("הטלגרם נותק בהצלחה", "success");
      // Force page reload to update user state
      window.location.reload();
    } catch {
      showToast("שגיאה בניתוק הטלגרם", "error");
    } finally {
      setDisconnecting(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (!user || !auth.currentUser) return;
    setDeleting(true);
    try {
      // Delete user data from Firestore
      await deleteDoc(doc(db, "users", user.uid));
      await deleteDoc(doc(db, "userStats", user.uid));
      
      // Delete Firebase Auth user
      await deleteUser(auth.currentUser);
      
      showToast("החשבון נמחק בהצלחה", "success");
    } catch (error: unknown) {
      // Handle re-authentication requirement
      if (error instanceof Error && error.message.includes("requires-recent-login")) {
        showToast("נדרשת התחברות מחדש לפני מחיקת החשבון. התנתק והתחבר שוב.", "error");
      } else {
        showToast("שגיאה במחיקת החשבון", "error");
      }
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const difficultyInfo = getDifficultyInfo(preferredDifficulty);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8 fade-in">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] flex items-center gap-3">
          <Settings className="text-[var(--accent)]" size={28} />
          הגדרות חשבון
        </h1>
        <p className="text-[var(--text-secondary)] mt-2">
          נהל את הפרופיל שלך, העדפות אימון וחיבורים
        </p>
      </div>

      <div className="space-y-5">
        {/* Profile Card */}
        <section className="rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 slide-up">
          <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-right">
            <Avatar src={user?.photoURL} name={user?.displayName} size="xl" className="w-20 h-20" />
            
            <div className="flex-1">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">
                {user?.displayName || "משתמש"}
              </h2>
              <div className="flex items-center justify-center md:justify-start gap-2 text-[var(--text-muted)] mb-3">
                <User size={14} />
                <span className="text-sm">{user?.email}</span>
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
        <section className="rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 slide-up" style={{ animationDelay: "50ms" }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent-subtle)] flex items-center justify-center text-[var(--accent)]">
                <Shield size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--text-primary)]">רמת קושי מועדפת</h3>
                <p className="text-sm text-[var(--text-muted)]">רמה התחלתית לכל אימון חדש</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveDifficulty}
              loading={saving}
              className="text-[var(--accent)]"
              icon={<Save size={14} />}
            >
              שמור
            </Button>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mb-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((level) => (
              <button
                key={level}
                onClick={() => setPreferredDifficulty(level)}
                className={cn(
                  "aspect-square rounded-xl flex items-center justify-center transition-colors",
                  preferredDifficulty === level
                    ? "bg-[var(--accent)] text-black"
                    : "bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]"
                )}
              >
                <span className="text-lg font-bold">{level}</span>
              </button>
            ))}
          </div>

          <div className={cn(
            "rounded-lg p-3 text-sm",
            preferredDifficulty <= 3 ? "bg-emerald-500/10 text-emerald-500" :
            preferredDifficulty <= 5 ? "bg-amber-500/10 text-amber-500" :
            "bg-red-500/10 text-red-500"
          )}>
            <span className="font-medium">{difficultyInfo.name}</span>
            <span className="mx-2">·</span>
            <span className="opacity-80">{difficultyInfo.description}</span>
          </div>
        </section>

        {/* Telegram Integration */}
        <section className="rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 slide-up" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Smartphone size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">חיבור לטלגרם</h3>
              <p className="text-sm text-[var(--text-muted)]">התאמן ישירות דרך הטלגרם</p>
            </div>
          </div>

          {user?.telegramChatId ? (
            <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-hover)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                  <Check size={18} />
                </div>
                <div>
                  <p className="font-medium text-[var(--text-primary)]">מחובר בהצלחה</p>
                  <p className="text-sm text-[var(--text-muted)] font-mono">
                    @{user.telegramUsername || user.telegramChatId}
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                className="text-red-500 hover:bg-red-500/10" 
                icon={<Trash2 size={14} />}
                onClick={handleDisconnectTelegram}
                loading={disconnecting}
              >
                נתק
              </Button>
            </div>
          ) : (
            <div>
              {!linkingCode ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto mb-4">
                    <Link2 size={28} />
                  </div>
                  <p className="text-[var(--text-secondary)] mb-5 text-sm max-w-sm mx-auto">
                    חבר את חשבון הטלגרם שלך כדי לקבל תזכורות ולהתאמן בשיחות צ'אט
                  </p>
                  <Button
                    variant="primary"
                    onClick={handleGenerateCode}
                    loading={generatingCode}
                  >
                    צור קוד חיבור
                  </Button>
                </div>
              ) : (
                <div className="fade-in">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-4">
                      <div className="bg-[var(--bg-hover)] p-4 rounded-xl border border-[var(--border-subtle)]">
                        <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2 block">
                          קוד החיבור שלך
                        </label>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 font-mono text-2xl text-[var(--accent)] font-bold tracking-widest text-center py-2">
                            {linkingCode}
                          </code>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleCopyCode}
                            className="h-9 w-9 p-0"
                          >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                          </Button>
                        </div>
                        {codeExpiresIn && codeExpiresIn > 0 && (
                          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-[var(--text-muted)]">
                            <RefreshCw size={10} className="animate-spin" style={{ animationDuration: '3s' }} />
                            פג תוקף בעוד <span className="font-mono text-[var(--accent)]">{formatTime(codeExpiresIn)}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          className="flex-1"
                          onClick={handleOpenTelegram}
                          icon={<ExternalLink size={14} />}
                        >
                          פתח בוט
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={handleGenerateCode}
                          loading={generatingCode}
                          icon={<RefreshCw size={14} />}
                        >
                          חדש
                        </Button>
                      </div>
                    </div>

                    <div className="bg-[var(--bg-hover)] p-4 rounded-xl border border-[var(--border-subtle)]">
                      <h4 className="font-medium text-[var(--text-primary)] mb-3 flex items-center gap-2 text-sm">
                        <Smartphone size={14} className="text-[var(--text-muted)]" />
                        איך מתחברים?
                      </h4>
                      <ol className="space-y-2 text-sm text-[var(--text-secondary)] list-decimal list-inside">
                        <li>לחץ על <strong>פתח בוט</strong> או חפש <code className="text-[var(--accent)] text-xs">@{TELEGRAM_BOT_USERNAME}</code></li>
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
        <section className="rounded-2xl border border-red-900/20 bg-red-900/5 p-6 slide-up" style={{ animationDelay: "150ms" }}>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[var(--text-primary)] mb-1">אזור מסוכן</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                מחיקת החשבון היא פעולה בלתי הפיכה. כל הנתונים יימחקו לצמיתות.
              </p>
              <Button 
                variant="ghost" 
                className="text-red-500 hover:bg-red-500/10 border border-red-900/30"
                onClick={() => setShowDeleteModal(true)}
              >
                מחק חשבון
              </Button>
            </div>
          </div>
        </section>

        {/* Delete Account Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="מחיקת חשבון"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-900/30">
              <AlertTriangle className="text-red-500 shrink-0" size={24} />
              <p className="text-sm text-[var(--text-secondary)]">
                פעולה זו תמחק לצמיתות את כל הנתונים שלך כולל היסטוריית אימונים, סטטיסטיקות וייעוצים. לא ניתן לשחזר את הנתונים לאחר המחיקה.
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                ביטול
              </Button>
              <Button 
                variant="danger" 
                onClick={handleDeleteAccount}
                loading={deleting}
              >
                מחק לצמיתות
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
