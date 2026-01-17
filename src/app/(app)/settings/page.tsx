/**
 * Settings Page
 * User account settings and preferences
 * Refactored to use modular components
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { signOut } from '@/lib/firebase/auth';
import { updateUserSettings } from '@/lib/firebase/firestore';
import { DEFAULT_AI_MODEL } from '@/data/constants';
import type { AIModel } from '@/types';

// Settings components
import {
  ProfileSection,
  DifficultyPreference,
  AIModelSelector,
  TelegramSection,
  DangerZone,
} from '@/components/settings';

export default function SettingsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Preferences state
  const [preferredDifficulty, setPreferredDifficulty] = useState(3);
  const [preferredModel, setPreferredModel] = useState<AIModel>(DEFAULT_AI_MODEL);
  const [saving, setSaving] = useState(false);

  // Load user preferences
  useEffect(() => {
    if (user?.settings?.preferredDifficulty) {
      setPreferredDifficulty(user.settings.preferredDifficulty);
    }
    if (user?.settings?.preferredModel) {
      setPreferredModel(user.settings.preferredModel);
    }
  }, [user]);

  // Handlers
  const handleSavePreferences = useCallback(async () => {
    if (!user) return;
    setSaving(true);

    try {
      await updateUserSettings(user.uid, {
        preferredDifficulty,
        preferredModel,
      });
      showToast('ההגדרות נשמרו', 'success');
    } catch {
      showToast('שגיאה בשמירת ההגדרות', 'error');
    } finally {
      setSaving(false);
    }
  }, [user, preferredDifficulty, preferredModel, showToast]);

  const handleSignOut = useCallback(async () => {
    await signOut();
  }, []);

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
        {/* Profile */}
        <ProfileSection user={user} onSignOut={handleSignOut} />

        {/* Difficulty Preference */}
        <DifficultyPreference
          value={preferredDifficulty}
          onChange={setPreferredDifficulty}
          onSave={handleSavePreferences}
          saving={saving}
        />

        {/* AI Model */}
        <AIModelSelector value={preferredModel} onChange={setPreferredModel} />

        {/* Telegram */}
        <TelegramSection user={user} />

        {/* Danger Zone */}
        <DangerZone user={user} />
      </div>
    </div>
  );
}
