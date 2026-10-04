'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { StitchIcon } from './StitchIcon';

interface StitchHeaderProps {
  title?: string;
  subtitle?: string;
  streakDays?: number;
  showBack?: boolean;
  backHref?: string;
  rightAction?: React.ReactNode;
}

export function StitchHeader({
  title = 'Kriti NEET',
  subtitle = 'Home',
  streakDays = 7,
  showBack = false,
  backHref,
  rightAction,
}: StitchHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 lg:left-64 xl:left-72 z-40 bg-[#f9f9ff]/85 backdrop-blur-xl border-b border-[#e9edff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] pt-safe transition-all">
      <div className="w-full max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {showBack ? (
            <button
              onClick={handleBack}
              aria-label="Back"
              className="min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center bg-white border border-[#e9edff] text-[#141b2b] hover:bg-[#f1f3ff] transition-colors active:scale-95"
            >
              <StitchIcon name="arrow_back" size={20} />
            </button>
          ) : (
            <Link href="/dashboard" className="lg:hidden relative h-8 w-8 flex-shrink-0">
              <Image
                src="/stitch/logo.png"
                alt="Kriti NEET Logo"
                fill
                sizes="32px"
                className="object-contain"
                priority
              />
            </Link>
          )}

          <div className="flex flex-col min-w-0">
            <h1 className="font-headline font-bold text-base sm:text-lg text-[#141b2b] tracking-tight leading-tight truncate">
              {title}
            </h1>
            <span className="text-xs text-[#464555] font-medium truncate">
              {subtitle}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
          {rightAction ? (
            rightAction
          ) : (
            <>
              <div className="inline-flex items-center gap-1.5 bg-[#e1e8fd] px-3 py-1 rounded-full border border-[#dce2f7]">
                <StitchIcon name="local_fire_department" size={16} className="text-[#3525cd]" />
                <span className="font-headline text-xs font-bold text-[#3525cd]">
                  {streakDays} Days
                </span>
              </div>
              <Link
                href="/settings"
                className="min-w-[40px] min-h-[40px] rounded-full overflow-hidden ring-2 ring-[#4f46e5]/20 flex items-center justify-center bg-white shadow-xs hover:ring-[#4f46e5]/40 transition-all flex-shrink-0"
                aria-label="Profile and Settings"
              >
                <Image
                  src="/stitch/avatar.png"
                  alt="Profile Avatar"
                  width={38}
                  height={38}
                  className="object-cover"
                />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default StitchHeader;
