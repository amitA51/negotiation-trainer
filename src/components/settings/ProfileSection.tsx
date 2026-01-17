/**
 * ProfileSection Component
 * User profile display with sign out option
 */

'use client';

import { User as UserIcon, LogOut } from 'lucide-react';
import { Button, Badge, Avatar } from '@/components/ui';
import type { User } from '@/types';

interface ProfileSectionProps {
  user: User | null;
  onSignOut: () => void;
}

export function ProfileSection({ user, onSignOut }: ProfileSectionProps) {
  return (
    <section className="rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 slide-up">
      <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-right">
        <Avatar
          src={user?.photoURL}
          name={user?.displayName}
          size="xl"
          className="w-20 h-20"
        />

        <div className="flex-1">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">
            {user?.displayName || 'משתמש'}
          </h2>
          <div className="flex items-center justify-center md:justify-start gap-2 text-[var(--text-muted)] mb-3">
            <UserIcon size={14} />
            <span className="text-sm">{user?.email}</span>
          </div>
          <Badge variant="default">התוכנית החינמית</Badge>
        </div>

        <Button
          variant="secondary"
          className="w-full md:w-auto"
          onClick={onSignOut}
          icon={<LogOut size={16} />}
        >
          התנתק
        </Button>
      </div>
    </section>
  );
}
