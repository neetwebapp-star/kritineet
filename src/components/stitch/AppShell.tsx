'use client';

import React from 'react';
import { DesktopSidebar } from './DesktopSidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { StitchHeader } from './StitchHeader';

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  streakDays?: number;
  showBack?: boolean;
  backHref?: string;
  rightAction?: React.ReactNode;
  hideNav?: boolean;
  fluid?: boolean;
}

export function AppShell({
  children,
  title = 'Kriti NEET',
  subtitle = 'Preparation OS',
  streakDays = 7,
  showBack = false,
  backHref,
  rightAction,
  hideNav = false,
  fluid = false,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#f9f9ff] text-[#141b2b] flex flex-col font-sans selection:bg-[#c3c0ff] selection:text-[#0f0069] overflow-x-hidden">
      {/* Desktop Sidebar (strictly hidden on mobile, visible lg:) */}
      {!hideNav && <DesktopSidebar />}

      {/* Responsive Top Header */}
      <StitchHeader
        title={title}
        subtitle={subtitle}
        streakDays={streakDays}
        showBack={showBack}
        backHref={backHref}
        rightAction={rightAction}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all ${
          !hideNav ? 'lg:pl-64 xl:pl-72' : ''
        }`}
      >
        <main
          className={`flex-1 w-full pt-20 pb-28 lg:pb-12 ${
            fluid
              ? 'px-4 sm:px-6 lg:px-8'
              : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
          }`}
        >
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation (strictly hidden on desktop lg:hidden) */}
      {!hideNav && <MobileBottomNav />}
    </div>
  );
}

export default AppShell;
