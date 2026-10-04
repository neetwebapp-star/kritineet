'use client';

import React from 'react';
import { AppShell } from '@/components/stitch/AppShell';

interface StitchShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  streakDays?: number;
  showBack?: boolean;
  backHref?: string;
  hideNav?: boolean;
  fluid?: boolean;
  rightAction?: React.ReactNode;
}

export function StitchShell({
  children,
  title = 'Kriti NEET',
  subtitle = 'Preparation OS',
  streakDays = 7,
  showBack = false,
  backHref,
  hideNav = false,
  fluid = false,
  rightAction,
}: StitchShellProps) {
  return (
    <AppShell
      title={title}
      subtitle={subtitle}
      streakDays={streakDays}
      showBack={showBack}
      backHref={backHref}
      hideNav={hideNav}
      fluid={fluid}
      rightAction={rightAction}
    >
      {children}
    </AppShell>
  );
}

export default StitchShell;
