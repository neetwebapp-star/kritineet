'use client';

import React from 'react';
import { StitchIcon } from './StitchIcon';

interface StitchCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'surface' | 'container' | 'indigo' | 'mint' | 'danger';
}

export function StitchCard({
  children,
  className = '',
  onClick,
  variant = 'surface',
}: StitchCardProps) {
  const variantStyles = {
    surface: 'bg-white border-[#e9edff] shadow-sm',
    container: 'bg-[#f1f3ff] border-[#e1e8fd]/70 shadow-sm',
    indigo: 'bg-[#4f46e5] text-white border-transparent shadow-md',
    mint: 'bg-[#6cf8bb]/20 border-[#6cf8bb]/50 text-[#002113]',
    danger: 'bg-[#ffdad6]/40 border-[#ffdad6] text-[#93000a]',
  }[variant];

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border p-4 sm:p-5 transition-all ${variantStyles} ${
        onClick ? 'cursor-pointer active:scale-[0.99]' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

interface StitchBadgeProps {
  children: React.ReactNode;
  variant?: 'done' | 'progress' | 'next' | 'primary' | 'warning' | 'error';
  className?: string;
  icon?: string;
}

export function StitchBadge({
  children,
  variant = 'primary',
  className = '',
  icon,
}: StitchBadgeProps) {
  const styles = {
    done: 'bg-[#6cf8bb]/40 text-[#00714d] border-[#6cf8bb]/60',
    progress: 'bg-[#e1e8fd] text-[#3525cd] border-[#c3c0ff]',
    next: 'bg-[#f1f3ff] text-[#464555] border-[#dce2f7]',
    primary: 'bg-[#e2dfff] text-[#3525cd] border-[#c3c0ff]',
    warning: 'bg-[#fff0c2] text-[#8f6200] border-[#ffe28a]',
    error: 'bg-[#ffdad6] text-[#ba1a1a] border-[#ffb4ab]',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-headline font-semibold border ${styles} ${className}`}
    >
      {icon && <StitchIcon name={icon} size={14} />}
      {children}
    </span>
  );
}

interface StitchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  icon?: string;
  children: React.ReactNode;
}

export function StitchButton({
  variant = 'primary',
  icon,
  children,
  className = '',
  ...props
}: StitchButtonProps) {
  const styles = {
    primary: 'bg-[#4f46e5] hover:bg-[#4338ca] text-white shadow-md active:scale-[0.98]',
    secondary: 'bg-[#6cf8bb] hover:bg-[#4edea3] text-[#002113] font-semibold active:scale-[0.98]',
    outline: 'bg-white hover:bg-[#f1f3ff] text-[#141b2b] border border-[#e9edff] shadow-xs active:scale-[0.98]',
    ghost: 'hover:bg-[#f1f3ff] text-[#464555] hover:text-[#141b2b]',
  }[variant];

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-headline font-semibold text-sm transition-all cursor-pointer ${styles} ${className}`}
      {...props}
    >
      {icon && <StitchIcon name={icon} size={18} />}
      {children}
    </button>
  );
}

export default StitchCard;
