// Export all UI components
export { Button } from "./Button";
export type { ButtonProps } from "./Button";

export { Input } from "./Input";
export type { InputProps } from "./Input";

export { Textarea } from "./Textarea";
export type { TextareaProps } from "./Textarea";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./Card";
export type { CardProps } from "./Card";

export { Badge } from "./Badge";
export type { BadgeProps } from "./Badge";

export { Spinner, LoadingScreen, Skeleton } from "./Spinner";

export { Avatar } from "./Avatar";

export { Progress, ScoreCircle } from "./Progress";

export { Modal } from "./Modal";

export { ToastProvider, useToast } from "./Toast";

// Enhanced Skeleton Components
export {
  Skeleton as EnhancedSkeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonChat,
  SkeletonStats,
  SkeletonTable,
} from "./Skeleton";

// Theme Toggle
export { ThemeToggle, ThemeToggleButton } from "./ThemeToggle";

// Notifications
export { NotificationProvider, useNotifications } from "./Notifications";
export type { Notification, NotificationType } from "./Notifications";

// Offline & PWA
export { OfflineIndicator, useOnlineStatus, PullToRefresh } from "./OfflineIndicator";
export { InstallPrompt, IOSInstallInstructions } from "./InstallPrompt";

// Animations
export {
  AnimatedCounter,
  StaggeredList,
  Typewriter,
  FadeTransition,
  SlideTransition,
  ProgressCircle,
  Parallax,
  Magnetic,
  useShake,
} from "./Animations";

// Interactive Components
export { Accordion, Tabs, Dropdown, Toggle, Tooltip } from "./Interactive";

// Form Controls
export { SearchInput, Select, Chip, RangeSlider } from "./FormControls";

// Premium "Obsidian Air" Components
export { BackgroundEffects } from "./BackgroundEffects";
export { MagneticButton } from "./MagneticButton";
export { SpotlightCard } from "./SpotlightCard";
export { TextReveal } from "./TextReveal";
export { BentoGrid, BentoGridItem } from "./BentoGrid";

// Loading & Empty States
export {
  SuspenseLoader,
  CardFallback,
  ListFallback,
  PageFallback,
  InlineFallback,
} from "./SuspenseLoader";

export {
  EmptyState,
  SearchEmptyState,
  NoDataEmptyState,
  NoSessionsEmptyState,
  NoAchievementsEmptyState,
} from "./EmptyState";
export type { EmptyStateProps } from "./EmptyState";

// Error Handling
export { ErrorBoundaryUI, InlineError } from "./ErrorBoundary";
export type { ErrorBoundaryProps } from "./ErrorBoundary";
