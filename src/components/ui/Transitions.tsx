/**
 * ==========================================
 * 🎨 PAGE TRANSITIONS - FRAMER MOTION
 * ==========================================
 * Smooth page transitions and animations
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

/**
 * Page transition wrapper
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{
          duration: 0.3,
          ease: [0.22, 1, 0.36, 1], // Custom easing
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Fade in transition
 */
export function FadeIn({
  children,
  delay = 0,
  duration = 0.5,
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Slide in from bottom
 */
export function SlideInBottom({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Scale in animation
 */
export function ScaleIn({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay,
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Stagger children animation
 */
export function StaggerChildren({
  children,
  staggerDelay = 0.1,
}: {
  children: ReactNode;
  staggerDelay?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Stagger child item
 */
export function StaggerItem({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Achievement unlock animation
 */
export function AchievementUnlock({
  children,
  onComplete,
}: {
  children: ReactNode;
  onComplete?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, rotate: -180 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      }}
      onAnimationComplete={onComplete}
    >
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/**
 * Score counter animation
 */
export function ScoreCounter({
  from,
  to,
  duration = 1,
}: {
  from: number;
  to: number;
  duration?: number;
}) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.span
        initial={{ scale: 1.5 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <motion.span
          key={to}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration }}
        >
          {to}
        </motion.span>
      </motion.span>
    </motion.span>
  );
}

/**
 * Message typing animation
 */
export function TypingAnimation() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex gap-1 items-center"
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-gray-400 rounded-full"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.15,
          }}
        />
      ))}
    </motion.div>
  );
}

/**
 * Card hover effect
 */
export function HoverCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      whileHover={{
        scale: 1.02,
        y: -4,
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Button press animation
 */
export function PressButton({
  children,
  onClick,
  className,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <motion.button
      className={className}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{ duration: 0.1 }}
    >
      {children}
    </motion.button>
  );
}

/**
 * Slide in notification
 */
export function SlideNotification({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose?: () => void;
}) {
  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onAnimationComplete={() => {
        if (onClose) {
          setTimeout(onClose, 3000);
        }
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Progress bar animation
 */
export function AnimatedProgress({
  value,
  max = 100,
  className,
}: {
  value: number;
  max?: number;
  className?: string;
}) {
  const percentage = (value / max) * 100;

  return (
    <div className={`relative h-2 bg-gray-200 rounded-full overflow-hidden ${className}`}>
      <motion.div
        className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#C9A227] to-[#D4B647]"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
    </div>
  );
}

/**
 * Confetti explosion (for achievements)
 */
export function ConfettiExplosion() {
  const confettiCount = 30;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from({ length: confettiCount }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: ['#C9A227', '#3B82F6', '#A855F7', '#F59E0B'][i % 4],
            left: '50%',
            top: '50%',
          }}
          initial={{ scale: 0, x: 0, y: 0 }}
          animate={{
            scale: [0, 1, 0],
            x: Math.cos((i / confettiCount) * Math.PI * 2) * (200 + Math.random() * 100),
            y: Math.sin((i / confettiCount) * Math.PI * 2) * (200 + Math.random() * 100),
          }}
          transition={{
            duration: 1.5,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

/**
 * Loading spinner
 */
export function SpinnerAnimation() {
  return (
    <motion.div
      className="w-8 h-8 border-4 border-gray-200 border-t-[#C9A227] rounded-full"
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
}

/**
 * Pulse animation (for live indicators)
 */
export function PulseIndicator({ className }: { className?: string }) {
  return (
    <motion.div
      className={`w-3 h-3 bg-green-500 rounded-full ${className}`}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [1, 0.7, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
      }}
    />
  );
}
