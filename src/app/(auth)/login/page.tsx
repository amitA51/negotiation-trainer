"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button, Input, Card } from "@/components/ui";
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from "@/lib/firebase/auth";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "register" | "forgot";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Google Sign In Error:", err);
      // Show more detailed error for debugging
      const errorMessage = err.message || "שגיאה לא ידועה";
      const errorCode = err.code || "unknown";
      
      if (errorCode === "auth/popup-closed-by-user") {
        setError("החלון נסגר לפני סיום ההתחברות");
      } else if (errorCode === "auth/cancelled-popup-request") {
        // Ignore this error as it happens when multiple popups are triggered
      } else if (errorCode === "auth/popup-blocked") {
        setError("הדפדפן חסם את החלון הקופץ. אנא אופשר חלונות קופצים לאתר זה.");
      } else if (errorCode === "auth/unauthorized-domain") {
         setError(`הדומיין אינו מורשה ב-Firebase (${window.location.hostname})`);
      } else {
         setError(`שגיאה בהתחברות עם Google: ${errorMessage} (${errorCode})`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "register") {
        if (!name.trim()) {
          setError("נא להזין שם מלא");
          return;
        }
        await signUpWithEmail(email, password, name);
      } else {
        await signInWithEmail(email, password);
      }
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/user-not-found") {
        setError("משתמש לא נמצא. נסה להירשם.");
      } else if (err.code === "auth/wrong-password") {
        setError("סיסמה שגויה.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("האימייל כבר רשום. נסה להתחבר.");
      } else if (err.code === "auth/weak-password") {
        setError("הסיסמה חלשה מדי. נדרשות לפחות 6 תווים.");
      } else {
        setError("שגיאה בהתחברות. נסה שוב.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[var(--bg-primary)]" />
      
      {/* Gradient orbs */}
      <div 
        className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
        style={{
          background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
        }}
      />
      <div 
        className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-10 blur-[100px]"
        style={{
          background: "radial-gradient(circle, var(--accent-light) 0%, transparent 70%)",
        }}
      />
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(var(--border-subtle) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] mb-6 shadow-[0_0_40px_var(--accent-glow)]">
            <span className="text-2xl font-bold text-black">N</span>
          </div>
          <h1 className="text-3xl font-bold text-gold mb-2">NEGO</h1>
          <p className="text-[var(--text-secondary)]">
            מאמן משא ומתן מקצועי
          </p>
        </div>

        {/* Auth Card */}
        <Card variant="glass" className="p-8" hover={false}>
          {/* Mode Title */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
              {mode === "login" && "התחברות"}
              {mode === "register" && "יצירת חשבון"}
              {mode === "forgot" && "איפוס סיסמה"}
            </h2>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-[var(--radius-md)] bg-[var(--error-subtle)] border border-red-800 text-[var(--error)] text-sm text-center animate-fade-in">
              {error}
            </div>
          )}

          {/* Google Sign In */}
          {mode !== "forgot" && (
            <>
              <Button
                variant="secondary"
                className="w-full mb-4"
                onClick={handleGoogleSignIn}
                loading={loading}
                icon={
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                }
              >
                המשך עם Google
              </Button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--border-subtle)]" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 text-sm text-[var(--text-muted)] bg-[rgba(15,15,18,0.8)]">
                    או
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Email Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            {mode === "register" && (
              <Input
                label="שם מלא"
                type="text"
                placeholder="הכנס את שמך"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={<User size={18} />}
                disabled={loading}
              />
            )}

            <Input
              label="אימייל"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={18} />}
              disabled={loading}
              dir="ltr"
            />

            {mode !== "forgot" && (
              <div className="relative">
                <Input
                  label="סיסמה"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock size={18} />}
                  disabled={loading}
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-[38px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-6"
              loading={loading}
            >
              {mode === "login" && "התחבר"}
              {mode === "register" && "צור חשבון"}
              {mode === "forgot" && "שלח קישור איפוס"}
            </Button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center space-y-2">
            {mode === "login" && (
              <>
                <button
                  onClick={() => setMode("forgot")}
                  className="text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                >
                  שכחת סיסמה?
                </button>
                <div className="text-sm text-[var(--text-secondary)]">
                  אין לך חשבון?{" "}
                  <button
                    onClick={() => setMode("register")}
                    className="text-[var(--accent)] hover:text-[var(--accent-light)] font-medium transition-colors"
                  >
                    הירשם עכשיו
                  </button>
                </div>
              </>
            )}

            {mode === "register" && (
              <div className="text-sm text-[var(--text-secondary)]">
                יש לך כבר חשבון?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="text-[var(--accent)] hover:text-[var(--accent-light)] font-medium transition-colors"
                >
                  התחבר
                </button>
              </div>
            )}

            {mode === "forgot" && (
              <button
                onClick={() => setMode("login")}
                className="inline-flex items-center gap-2 text-sm text-[var(--accent)] hover:text-[var(--accent-light)] transition-colors"
              >
                <ArrowLeft size={16} />
                חזרה להתחברות
              </button>
            )}
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-[var(--text-muted)] mt-8">
          בהתחברות אתה מסכים לתנאי השימוש ומדיניות הפרטיות
        </p>
      </div>
    </div>
  );
}
