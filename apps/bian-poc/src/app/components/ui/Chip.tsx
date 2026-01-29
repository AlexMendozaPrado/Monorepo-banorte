'use client';

import React from 'react';
import { cn } from '@banorte/ui';

interface ChipProps {
  label: React.ReactNode;
  size?: 'sm' | 'md';
  variant?: 'filled' | 'outlined';
  color?: string;
  textColor?: string;
  className?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}

export function Chip({
  label,
  size = 'sm',
  variant = 'filled',
  color,
  textColor,
  className,
  onClick,
  icon,
}: ChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-display font-medium whitespace-nowrap',
        size === 'sm' ? 'h-6 px-2.5 text-[11px]' : 'h-8 px-3 text-[13px]',
        variant === 'outlined'
          ? 'border border-gray-300 bg-transparent text-banorte-gray'
          : '',
        onClick && 'cursor-pointer transition-colors',
        className
      )}
      style={{
        ...(variant === 'filled' && color ? { backgroundColor: color } : {}),
        ...(textColor ? { color: textColor } : {}),
      }}
      onClick={onClick}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {label}
    </span>
  );
}
