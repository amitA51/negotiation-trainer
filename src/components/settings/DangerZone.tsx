/**
 * DangerZone Component
 * Account deletion section
 */

'use client';

import { useState, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button, Modal } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/config';
import { deleteUser } from 'firebase/auth';
import type { User } from '@/types';

interface DangerZoneProps {
  user: User | null;
}

export function DangerZone({ user }: DangerZoneProps) {
  const { showToast } = useToast();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = useCallback(async () => {
    if (!user || !auth.currentUser) return;
    setDeleting(true);

    try {
      // Delete user data from Firestore
      await deleteDoc(doc(db, 'users', user.uid));
      await deleteDoc(doc(db, 'userStats', user.uid));

      // Delete Firebase Auth user
      await deleteUser(auth.currentUser);

      showToast('החשבון נמחק בהצלחה', 'success');
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        error.message.includes('requires-recent-login')
      ) {
        showToast(
          'נדרשת התחברות מחדש לפני מחיקת החשבון. התנתק והתחבר שוב.',
          'error'
        );
      } else {
        showToast('שגיאה במחיקת החשבון', 'error');
      }
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  }, [user, showToast]);

  return (
    <>
      <section
        className="rounded-2xl border border-red-900/20 bg-red-900/5 p-6 slide-up"
        style={{ animationDelay: '150ms' }}
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-[var(--text-primary)] mb-1">
              אזור מסוכן
            </h3>
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="מחיקת חשבון"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-900/30">
            <AlertTriangle className="text-red-500 shrink-0" size={24} />
            <p className="text-sm text-[var(--text-secondary)]">
              פעולה זו תמחק לצמיתות את כל הנתונים שלך כולל היסטוריית אימונים,
              סטטיסטיקות וייעוצים. לא ניתן לשחזר את הנתונים לאחר המחיקה.
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
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
    </>
  );
}
