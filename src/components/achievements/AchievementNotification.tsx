/**
 * Achievement Notification System
 * Toast notifications for achievement unlocks
 */

'use client';

import { useState, useCallback, createContext, useContext, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Achievement } from '@/data/achievements';
import { rarityStyles } from './styles';

// ============================================
// CONTEXT
// ============================================

interface AchievementNotification {
  achievement: Achievement;
  id: string;
}

interface AchievementNotificationContextType {
  showAchievementUnlock: (achievement: Achievement) => void;
}

const AchievementNotificationContext = createContext<AchievementNotificationContextType | null>(null);

export function useAchievementNotification() {
  const context = useContext(AchievementNotificationContext);
  if (!context) {
    throw new Error('useAchievementNotification must be used within AchievementNotificationProvider');
  }
  return context;
}

// ============================================
// PROVIDER
// ============================================

interface AchievementNotificationProviderProps {
  children: ReactNode;
}

export function AchievementNotificationProvider({ children }: AchievementNotificationProviderProps) {
  const [notifications, setNotifications] = useState<AchievementNotification[]>([]);

  const showAchievementUnlock = useCallback((achievement: Achievement) => {
    const id = Math.random().toString(36).substring(7);
    setNotifications((prev) => [...prev, { achievement, id }]);

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <AchievementNotificationContext.Provider value={{ showAchievementUnlock }}>
      {children}
      <AchievementNotificationContainer notifications={notifications} onDismiss={dismiss} />
    </AchievementNotificationContext.Provider>
  );
}

// ============================================
// CONTAINER
// ============================================

interface AchievementNotificationContainerProps {
  notifications: AchievementNotification[];
  onDismiss: (id: string) => void;
}

function AchievementNotificationContainer({
  notifications,
  onDismiss,
}: AchievementNotificationContainerProps) {
  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[60] flex flex-col gap-3">
      <AnimatePresence>
        {notifications.map((notification) => (
          <AchievementNotificationToast
            key={notification.id}
            achievement={notification.achievement}
            onDismiss={() => onDismiss(notification.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// TOAST
// ============================================

interface AchievementNotificationToastProps {
  achievement: Achievement;
  onDismiss: () => void;
}

function AchievementNotificationToast({ achievement, onDismiss }: AchievementNotificationToastProps) {
  const styles = rarityStyles[achievement.rarity];

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-2xl border p-4',
        'bg-[var(--bg-primary)]',
        styles.border,
        'shadow-2xl',
        styles.glow
      )}
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: 'spring', duration: 0.5 }}
      role="alert"
      aria-live="polite"
    >
      {/* Animated background glow */}
      <motion.div
        className={cn('absolute inset-0 opacity-20 bg-gradient-to-r', styles.gradient)}
        animate={{ opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Confetti effect for legendary */}
      {achievement.rarity === 'legendary' && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 2 }}
        >
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: '50%',
                backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#A855F7'][i % 4],
              }}
              initial={{ y: 0, opacity: 1 }}
              animate={{
                y: [0, -100 - Math.random() * 50],
                x: (Math.random() - 0.5) * 100,
                opacity: 0,
                scale: [1, 0.5],
              }}
              transition={{
                duration: 1 + Math.random() * 0.5,
                delay: Math.random() * 0.3,
              }}
            />
          ))}
        </motion.div>
      )}

      <div className="relative flex items-center gap-4">
        {/* Badge */}
        <motion.div
          className={cn(
            'w-14 h-14 rounded-xl flex items-center justify-center border-2 shrink-0',
            styles.border,
            styles.bg
          )}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <span className="text-3xl">{achievement.icon}</span>
        </motion.div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-[var(--accent)]" />
            <span className="text-xs font-medium text-[var(--accent)]">הישג נפתח!</span>
          </div>
          <h4 className="font-bold text-[var(--text-primary)] truncate">
            {achievement.nameHe}
          </h4>
          <p className="text-xs text-[var(--text-secondary)] truncate">
            +{achievement.points} נקודות
          </p>
        </div>

        {/* Dismiss button */}
        <button
          onClick={onDismiss}
          className="p-1.5 rounded-full hover:bg-[var(--bg-secondary)] transition-colors shrink-0"
          aria-label="סגור"
        >
          <X className="w-4 h-4 text-[var(--text-muted)]" />
        </button>
      </div>

      {/* Progress bar auto-dismiss indicator */}
      <motion.div
        className={cn('absolute bottom-0 left-0 h-0.5 bg-gradient-to-r', styles.gradient)}
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: 5, ease: 'linear' }}
      />
    </motion.div>
  );
}
