/**
 * ==========================================
 * 🏆 ACHIEVEMENTS UI COMPONENTS
 * ==========================================
 * Complete achievement system UI
 * - AchievementBadge: Individual animated badge
 * - AchievementsGallery: Grid display of all badges
 * - AchievementProgress: Progress bars and level display
 * - AchievementNotification: Unlock toast notification
 */

'use client';

import { useState, useCallback, createContext, useContext, ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Lock, Star, Flame, Sparkles, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Achievement,
  AchievementRarity,
  AchievementCategory,
  ACHIEVEMENTS,
  getRarityColor,
  getRarityLabelHe,
  calculateLevel,
  pointsForNextLevel,
} from '@/data/achievements';
import { Progress } from '@/components/ui/Progress';

// ============================================
// TYPES
// ============================================

export interface AchievementWithProgress extends Achievement {
  progress: number;
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface UserAchievementStats {
  totalPoints: number;
  level: number;
  totalUnlocked: number;
  streak: number;
  longestStreak: number;
}

// ============================================
// RARITY STYLES
// ============================================

const rarityStyles: Record<AchievementRarity, {
  gradient: string;
  glow: string;
  border: string;
  bg: string;
}> = {
  common: {
    gradient: 'from-gray-400 to-gray-500',
    glow: 'shadow-gray-500/30',
    border: 'border-gray-500/40',
    bg: 'bg-gray-500/10',
  },
  rare: {
    gradient: 'from-blue-400 to-blue-600',
    glow: 'shadow-blue-500/40',
    border: 'border-blue-500/40',
    bg: 'bg-blue-500/10',
  },
  epic: {
    gradient: 'from-purple-400 to-purple-600',
    glow: 'shadow-purple-500/50',
    border: 'border-purple-500/40',
    bg: 'bg-purple-500/10',
  },
  legendary: {
    gradient: 'from-amber-400 via-yellow-500 to-orange-500',
    glow: 'shadow-amber-500/60',
    border: 'border-amber-500/50',
    bg: 'bg-amber-500/15',
  },
};

const categoryLabels: Record<AchievementCategory, { label: string; icon: string }> = {
  training: { label: 'אימונים', icon: '🎯' },
  techniques: { label: 'טכניקות', icon: '🧠' },
  consistency: { label: 'רציפות', icon: '🔥' },
  score: { label: 'ציונים', icon: '⭐' },
  difficulty: { label: 'קושי', icon: '💪' },
  special: { label: 'מיוחד', icon: '🎁' },
};

// ============================================
// ACHIEVEMENT BADGE COMPONENT
// ============================================

interface AchievementBadgeProps {
  achievement: AchievementWithProgress;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  onClick?: () => void;
  className?: string;
}

export function AchievementBadge({
  achievement,
  size = 'md',
  showProgress = true,
  onClick,
  className,
}: AchievementBadgeProps) {
  const { unlocked, progress, rarity } = achievement;
  const styles = rarityStyles[rarity];

  const sizes = {
    sm: { container: 'w-16 h-16', icon: 'text-2xl', badge: 'w-20' },
    md: { container: 'w-20 h-20', icon: 'text-3xl', badge: 'w-24' },
    lg: { container: 'w-28 h-28', icon: 'text-5xl', badge: 'w-32' },
  };

  return (
    <motion.div
      className={cn('flex flex-col items-center gap-2', className)}
      whileHover={unlocked ? { scale: 1.05 } : undefined}
      whileTap={unlocked ? { scale: 0.95 } : undefined}
    >
      <motion.button
        onClick={onClick}
        disabled={!onClick}
        className={cn(
          'relative rounded-2xl flex items-center justify-center transition-all duration-300',
          sizes[size].container,
          unlocked
            ? cn(
                'border-2',
                styles.border,
                styles.bg,
                'shadow-lg',
                styles.glow,
                'cursor-pointer'
              )
            : 'border border-[var(--border-default)] bg-[var(--bg-secondary)] opacity-50 cursor-default'
        )}
        aria-label={unlocked ? achievement.nameHe : `${achievement.nameHe} (נעול)`}
      >
        {/* Shine effect for unlocked legendary badges */}
        {unlocked && rarity === 'legendary' && (
          <motion.div
            className="absolute inset-0 rounded-2xl overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
              animate={{
                x: ['-200%', '200%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 2,
              }}
            />
          </motion.div>
        )}

        {/* Badge icon */}
        {unlocked ? (
          <span className={cn(sizes[size].icon, 'relative z-10')}>
            {achievement.icon}
          </span>
        ) : (
          <Lock className="w-6 h-6 text-[var(--text-muted)]" />
        )}

        {/* Rarity indicator dot */}
        <div
          className={cn(
            'absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[var(--bg-primary)]',
            unlocked ? `bg-gradient-to-r ${styles.gradient}` : 'bg-gray-600'
          )}
        />
      </motion.button>

      {/* Name */}
      <span
        className={cn(
          'text-xs text-center font-medium max-w-[80px] truncate',
          unlocked ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'
        )}
        title={achievement.nameHe}
      >
        {achievement.nameHe}
      </span>

      {/* Progress bar (only for locked badges) */}
      {showProgress && !unlocked && progress > 0 && (
        <div className={cn('w-full', sizes[size].badge)}>
          <Progress value={progress} size="sm" variant="default" />
        </div>
      )}
    </motion.div>
  );
}

// ============================================
// ACHIEVEMENTS GALLERY COMPONENT
// ============================================

interface AchievementsGalleryProps {
  achievements: AchievementWithProgress[];
  filter?: AchievementCategory | 'all' | 'unlocked' | 'locked';
  onBadgeClick?: (achievement: AchievementWithProgress) => void;
  className?: string;
}

export function AchievementsGallery({
  achievements,
  filter = 'all',
  onBadgeClick,
  className,
}: AchievementsGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all' | 'unlocked' | 'locked'>(filter);

  const filteredAchievements = achievements.filter((a) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'unlocked') return a.unlocked;
    if (selectedCategory === 'locked') return !a.unlocked;
    return a.category === selectedCategory;
  });

  // Group by category for display
  const groupedAchievements = filteredAchievements.reduce(
    (acc, achievement) => {
      const category = achievement.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(achievement);
      return acc;
    },
    {} as Record<AchievementCategory, AchievementWithProgress[]>
  );

  const categories: (AchievementCategory | 'all' | 'unlocked' | 'locked')[] = [
    'all',
    'unlocked',
    'locked',
    'training',
    'techniques',
    'consistency',
    'score',
    'difficulty',
    'special',
  ];

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all',
              selectedCategory === cat
                ? 'bg-[var(--accent)] text-[var(--bg-primary)]'
                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
            )}
          >
            {cat === 'all' && 'הכל'}
            {cat === 'unlocked' && '✓ נפתחו'}
            {cat === 'locked' && '🔒 נעולים'}
            {categoryLabels[cat as AchievementCategory]?.icon}{' '}
            {categoryLabels[cat as AchievementCategory]?.label}
          </button>
        ))}
      </div>

      {/* Stats summary */}
      <div className="flex gap-4 text-sm text-[var(--text-secondary)]">
        <span>
          סה״כ נפתחו: {achievements.filter((a) => a.unlocked).length}/{achievements.length}
        </span>
        <span>•</span>
        <span>מוצגים: {filteredAchievements.length}</span>
      </div>

      {/* Badges grid */}
      {selectedCategory === 'all' || selectedCategory === 'unlocked' || selectedCategory === 'locked' ? (
        // Show all with category headers
        <div className="flex flex-col gap-8">
          {Object.entries(groupedAchievements).map(([category, categoryAchievements]) => (
            <div key={category}>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)] mb-4">
                <span>{categoryLabels[category as AchievementCategory]?.icon}</span>
                <span>{categoryLabels[category as AchievementCategory]?.label}</span>
              </h3>
              <motion.div
                className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.05 },
                  },
                }}
              >
                {categoryAchievements.map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                  >
                    <AchievementBadge
                      achievement={achievement}
                      size="sm"
                      onClick={() => onBadgeClick?.(achievement)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          ))}
        </div>
      ) : (
        // Show filtered without headers
        <motion.div
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.05 },
            },
          }}
        >
          {filteredAchievements.map((achievement) => (
            <motion.div
              key={achievement.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <AchievementBadge
                achievement={achievement}
                size="sm"
                onClick={() => onBadgeClick?.(achievement)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {filteredAchievements.length === 0 && (
        <div className="text-center py-12 text-[var(--text-muted)]">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>אין הישגים להצגה בקטגוריה זו</p>
        </div>
      )}
    </div>
  );
}

// ============================================
// ACHIEVEMENT DETAIL MODAL
// ============================================

interface AchievementDetailProps {
  achievement: AchievementWithProgress | null;
  onClose: () => void;
}

export function AchievementDetail({ achievement, onClose }: AchievementDetailProps) {
  if (!achievement) return null;

  const styles = rarityStyles[achievement.rarity];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal */}
        <motion.div
          className={cn(
            'relative w-full max-w-sm rounded-2xl border p-6',
            'bg-[var(--bg-primary)]',
            styles.border
          )}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-1 rounded-full hover:bg-[var(--bg-secondary)] transition-colors"
            aria-label="סגור"
          >
            <X className="w-5 h-5 text-[var(--text-muted)]" />
          </button>

          {/* Badge */}
          <div className="flex flex-col items-center text-center">
            <div
              className={cn(
                'w-24 h-24 rounded-2xl flex items-center justify-center mb-4',
                achievement.unlocked
                  ? cn('border-2', styles.border, styles.bg, 'shadow-xl', styles.glow)
                  : 'border border-[var(--border-default)] bg-[var(--bg-secondary)] opacity-60'
              )}
            >
              {achievement.unlocked ? (
                <span className="text-5xl">{achievement.icon}</span>
              ) : (
                <Lock className="w-10 h-10 text-[var(--text-muted)]" />
              )}
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">
              {achievement.nameHe}
            </h3>

            {/* Rarity badge */}
            <span
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium mb-4',
                styles.bg,
                'border',
                styles.border
              )}
              style={{ color: getRarityColor(achievement.rarity) }}
            >
              {getRarityLabelHe(achievement.rarity)}
            </span>

            {/* Description */}
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              {achievement.descriptionHe}
            </p>

            {/* Progress or unlock date */}
            {achievement.unlocked ? (
              <div className="flex items-center gap-2 text-sm text-[var(--success)]">
                <Sparkles className="w-4 h-4" />
                <span>נפתח!</span>
                {achievement.unlockedAt && (
                  <span className="text-[var(--text-muted)]">
                    • {new Date(achievement.unlockedAt).toLocaleDateString('he-IL')}
                  </span>
                )}
              </div>
            ) : (
              <div className="w-full">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[var(--text-muted)]">התקדמות</span>
                  <span className="text-[var(--text-secondary)]">
                    {Math.round(achievement.progress)}%
                  </span>
                </div>
                <Progress value={achievement.progress} size="md" variant="gold" />
              </div>
            )}

            {/* Points */}
            <div className="flex items-center gap-2 mt-6 text-[var(--accent)]">
              <Star className="w-4 h-4" />
              <span className="font-medium">{achievement.points} נקודות</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================
// ACHIEVEMENT PROGRESS / LEVEL DISPLAY
// ============================================

interface AchievementProgressProps {
  stats: UserAchievementStats;
  className?: string;
}

export function AchievementProgressDisplay({ stats, className }: AchievementProgressProps) {
  const { totalPoints, level, totalUnlocked, streak } = stats;
  const nextLevelPoints = pointsForNextLevel(level);
  const currentLevelPoints = pointsForNextLevel(level - 1);
  const progressToNextLevel = ((totalPoints - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Level card */}
      <div className="bg-gradient-to-br from-[var(--accent-subtle)] to-[var(--bg-secondary)] border border-[var(--accent-dark)]/30 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-[var(--bg-primary)]">{level}</span>
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">רמה {level}</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                {totalPoints} / {nextLevelPoints} נקודות
              </p>
            </div>
          </div>
          <Trophy className="w-8 h-8 text-[var(--accent)]" />
        </div>

        {/* Progress to next level */}
        <Progress value={progressToNextLevel} size="md" variant="gold" />
        <p className="text-xs text-[var(--text-muted)] mt-2 text-center">
          עוד {nextLevelPoints - totalPoints} נקודות לרמה הבאה
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[var(--bg-secondary)] rounded-xl p-4 text-center">
          <Sparkles className="w-5 h-5 mx-auto mb-1 text-[var(--accent)]" />
          <p className="text-2xl font-bold text-[var(--text-primary)]">{totalUnlocked}</p>
          <p className="text-xs text-[var(--text-muted)]">נפתחו</p>
        </div>
        <div className="bg-[var(--bg-secondary)] rounded-xl p-4 text-center">
          <Star className="w-5 h-5 mx-auto mb-1 text-amber-500" />
          <p className="text-2xl font-bold text-[var(--text-primary)]">{totalPoints}</p>
          <p className="text-xs text-[var(--text-muted)]">נקודות</p>
        </div>
        <div className="bg-[var(--bg-secondary)] rounded-xl p-4 text-center">
          <Flame className="w-5 h-5 mx-auto mb-1 text-orange-500" />
          <p className="text-2xl font-bold text-[var(--text-primary)]">{streak}</p>
          <p className="text-xs text-[var(--text-muted)]">ימי רצף</p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// ACHIEVEMENT NOTIFICATION CONTEXT
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
// ACHIEVEMENT NOTIFICATION TOAST
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
        className={cn(
          'absolute inset-0 opacity-20 bg-gradient-to-r',
          styles.gradient
        )}
        animate={{
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
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
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 0.5,
            delay: 0.2,
          }}
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

// ============================================
// MINI ACHIEVEMENT SHOWCASE
// ============================================

interface AchievementShowcaseProps {
  achievements: AchievementWithProgress[];
  maxDisplay?: number;
  onViewAll?: () => void;
  className?: string;
}

export function AchievementShowcase({
  achievements,
  maxDisplay = 5,
  onViewAll,
  className,
}: AchievementShowcaseProps) {
  const recentUnlocked = achievements
    .filter((a) => a.unlocked)
    .sort((a, b) => {
      if (!a.unlockedAt || !b.unlockedAt) return 0;
      return new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime();
    })
    .slice(0, maxDisplay);

  return (
    <div className={cn('bg-[var(--bg-secondary)] rounded-2xl p-5', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[var(--accent)]" />
          הישגים אחרונים
        </h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm text-[var(--accent)] hover:text-[var(--accent-light)] flex items-center gap-1"
          >
            הכל
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
        )}
      </div>

      {recentUnlocked.length > 0 ? (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {recentUnlocked.map((achievement) => (
            <AchievementBadge
              key={achievement.id}
              achievement={achievement}
              size="sm"
              showProgress={false}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--text-muted)] text-center py-4">
          עדיין אין הישגים. התחל להתאמן!
        </p>
      )}
    </div>
  );
}

// ============================================
// EXPORTS
// ============================================

export {
  type AchievementBadgeProps,
  type AchievementsGalleryProps,
  type AchievementDetailProps,
  type AchievementProgressProps,
  type AchievementShowcaseProps,
};
