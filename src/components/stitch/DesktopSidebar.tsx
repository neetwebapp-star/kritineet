'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { StitchIcon } from './StitchIcon';

interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: string;
}

const PRIMARY_NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Home Dashboard', icon: 'home' },
  { href: '/ncert', label: 'NCERT Reader', icon: 'menu_book', badge: 'High Yield' },
  { href: '/planner', label: 'Study Planner', icon: 'event_note' },
  { href: '/cbt', label: 'CBT Simulation', icon: 'quiz', badge: 'NEET NTA' },
  { href: '/dpp', label: 'DPP Challenger', icon: 'local_fire_department' },
  { href: '/pyq-vault', label: 'PYQ Vault', icon: 'history_edu' },
  { href: '/error-book', label: 'Error Notebook', icon: 'psychology' },
  { href: '/ai-tutor', label: 'AI Study Tutor', icon: 'smart_toy' },
  { href: '/analytics', label: 'Learning Intelligence', icon: 'insights' },
  { href: '/nta-notifications', label: 'NTA Notifications', icon: 'notifications' },
  { href: '/admin/hub', label: 'Admin Hub', icon: 'admin_panel_settings' },
];

export function DesktopSidebar() {
  const pathname = usePathname();
  const [unreadNtaCount, setUnreadNtaCount] = React.useState<number>(0);

  React.useEffect(() => {
    async function loadUnreadCount() {
      try {
        const res = await fetch('/api/student/nta-notifications/unread');
        if (res.ok) {
          const json = await res.json();
          setUnreadNtaCount(json.unreadCount || 0);
        }
      } catch (e) {}
    }
    loadUnreadCount();
  }, [pathname]);

  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-white border-r border-[#e9edff] min-h-screen fixed top-0 left-0 bottom-0 z-40 select-none shadow-[1px_0_10px_rgba(0,0,0,0.02)]">
      {/* Brand Header */}
      <div className="h-20 px-6 flex items-center justify-between border-b border-[#f1f3ff]">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative h-9 w-9 flex-shrink-0 transition-transform group-hover:scale-105">
            <Image
              src="/stitch/logo.png"
              alt="Kriti NEET Logo"
              fill
              sizes="36px"
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-headline font-bold text-base text-[#141b2b] tracking-tight leading-tight flex items-center gap-1.5">
              Kriti NEET
              <span className="inline-block px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider bg-[#e2dfff] text-[#3525cd] rounded">
                2027
              </span>
            </span>
            <span className="text-[11px] text-[#464555] font-medium truncate">
              Adaptive Learning OS
            </span>
          </div>
        </Link>
      </div>

      {/* Target Countdown Pill */}
      <div className="px-5 py-3 border-b border-[#f1f3ff] bg-[#f9f9ff]">
        <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-[#e9edff] shadow-xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#e1e8fd] flex items-center justify-center text-[#3525cd]">
              <StitchIcon name="timer" size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-[#464555] tracking-wider">
                Target NEET
              </span>
              <span className="font-headline font-bold text-xs text-[#141b2b]">
                May 2, 2027
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-headline font-bold text-xs text-[#3525cd]">
              248 Days
            </span>
            <span className="text-[9px] text-[#006c49] font-semibold">On Track</span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 custom-scrollbar">
        <div className="px-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-[#777587]">
          Navigation
        </div>
        {PRIMARY_NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#e2dfff] text-[#3525cd] font-semibold shadow-xs'
                  : 'text-[#464555] hover:bg-[#f1f3ff] hover:text-[#141b2b]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <StitchIcon
                  name={item.icon}
                  size={19}
                  className={isActive ? 'text-[#3525cd]' : 'text-[#777587]' } />
                <span className="truncate">{item.label}</span>
              </div>
              {item.href === '/nta-notifications' && unreadNtaCount > 0 ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap bg-[#ba1a1a] text-white animate-pulse">
                  {unreadNtaCount}
                </span>
              ) : item.badge ? (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                    isActive
                      ? 'bg-[#3525cd] text-white'
                      : 'bg-[#f1f3ff] text-[#464555]'
                  }`}
                >
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>

      {/* User Footer Card & Logout */}
      <div className="p-4 border-t border-[#f1f3ff] bg-[#f9f9ff] space-y-2">
        <Link
          href="/settings"
          className="flex items-center gap-3 p-2 rounded-xl bg-white border border-[#e9edff] hover:border-[#3525cd]/30 transition-all shadow-xs group"
        >
          <div className="relative w-9 h-9 rounded-full overflow-hidden ring-2 ring-[#4f46e5]/20 flex-shrink-0">
            <Image
              src="/stitch/avatar.png"
              alt="Profile"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="font-headline font-bold text-xs text-[#141b2b] truncate group-hover:text-[#3525cd]">
                Kriti Sharma
              </span>
              <span className="text-[10px] font-bold text-[#006c49]">AIR 500</span>
            </div>
            <span className="text-[10px] text-[#464555] truncate">
              student@neet2027.com
            </span>
          </div>
        </Link>
        <button
          type="button"
          onClick={async () => {
            try {
              await fetch('/api/auth', { method: 'DELETE' });
              window.location.href = '/';
            } catch (e) {
              window.location.href = '/';
            }
          }}
          className="w-full py-1.5 px-3 rounded-lg text-[11px] font-headline font-semibold text-[#777587] hover:text-[#ba1a1a] hover:bg-[#fff1f0] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <StitchIcon name="logout" size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

export default DesktopSidebar;
