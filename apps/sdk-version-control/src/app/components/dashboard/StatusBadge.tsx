'use client';

import React from 'react';
import { Check, AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react';
import { VersionStatus, getStatusColor, getStatusLabel } from '@/core/domain/value-objects/VersionStatus';

interface StatusBadgeProps {
  status: VersionStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showIcon?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: {
    dot: 'w-2 h-2',
    text: 'text-xs',
    padding: 'px-2 py-0.5',
    icon: 12,
  },
  md: {
    dot: 'w-2.5 h-2.5',
    text: 'text-sm',
    padding: 'px-2.5 py-1',
    icon: 14,
  },
  lg: {
    dot: 'w-3 h-3',
    text: 'text-base',
    padding: 'px-3 py-1.5',
    icon: 16,
  },
};

const statusIcons = {
  current: Check,
  warning: AlertTriangle,
  outdated: AlertTriangle,
  critical: AlertCircle,
  unknown: HelpCircle,
};

export function StatusBadge({
  status,
  size = 'sm',
  showLabel = false,
  showIcon = false,
  className = '',
}: StatusBadgeProps) {
  const color = getStatusColor(status);
  const label = getStatusLabel(status);
  const config = sizeConfig[size];
  const Icon = statusIcons[status];

  if (!showLabel && !showIcon) {
    // Solo dot
    return (
      <span
        className={`rounded-full inline-block ${config.dot} ${className}`}
        style={{ backgroundColor: color }}
        title={label}
        aria-label={label}
      />
    );
  }

  // Badge completo
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.padding} ${config.text} ${className}`}
      style={{
        backgroundColor: `${color}15`,
        color: color,
      }}
    >
      {showIcon && <Icon size={config.icon} />}
      {showLabel && <span>{label}</span>}
      {!showLabel && !showIcon && (
        <span
          className={`rounded-full ${config.dot}`}
          style={{ backgroundColor: color }}
        />
      )}
    </span>
  );
}
