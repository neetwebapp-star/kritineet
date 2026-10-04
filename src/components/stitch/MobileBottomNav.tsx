'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { StitchIcon } from './StitchIcon';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const MOBILE_NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Home', icon: 'home' },
  { href: '/ncert', label: 'NCERT', icon: 'menu_book' },
  { href: '/cbt', label: 'CBT', icon: 'quiz' },
  { href: '/ai-tutor', label: 'AI Tutor', icon: 'smart_toy' },
  { href: '/analytics', label: 'Analytics', icon: 'insights' },
];

export interface MobileBottomNavProps {
  activeTab?: string;
}

export function MobileBottomNav({ activeTab }: MobileBottomNavProps = {}) {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-[#e9edff] shadow-[0_-2px_12px_rgba(0,0,0,0.05)] pb-safe">
      <div className="w-full max-w-lg mx-auto h-16 px-2 flex items-center justify-around">
        {MOBILE_NAV_ITEMS.map((item) => {
          const isActive =
            activeTab
              ? item.label.toLowerCase() === activeTab.toLowerCase() ||
                item.href.replace('/', '') === activeTab.toLowerCase()
              : pathname === item.href ||
                (item.href !== '/' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`min-h-[44px] min-w-[56px] flex flex-col items-center justify-center gap-1 px-2 py-1 rounded-xl transition-all ${
                isActive
                  ? 'text-[#3525cd] font-semibold'
                  : 'text-[#464555] hover:text-[#3525cd]'
              }`}
            >
              <div
                className={`p-1 rounded-full transition-colors ${
                  isActive ? 'bg-[#e2dfff] text-[#3525cd]' : 'text-[#777587]'
                }`}
              >
                <StitchIcon name={item.icon} size={20} />
              </div>
              <span className="text-[10px] tracking-tight leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileBottomNav;
