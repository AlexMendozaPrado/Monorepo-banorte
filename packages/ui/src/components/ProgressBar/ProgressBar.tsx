import React from 'react';
import { cn } from '../../utils/cn';
import type { ProgressBarProps } from './ProgressBar.types';

const colors = {
  primary: 'bg-banorte-red',
  success: 'bg-status-success',
  warning: 'bg-status-warning',
  alert: 'bg-status-alert',
  secondary: 'bg-banorte-gray',
};

const heights = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export function ProgressBar({
  value,
  max = 100,
  color = 'primary',
  height = 'md',
  showLabel = false,
  label,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2 text-sm">
          <span className="text-banorte-gray">{label}</span>
          <span className="font-bold text-banorte-dark">
            {percentage.toFixed(0)}%
          </span>
        </div>
      )}
      <div
        className={cn(
          'w-full bg-gray-200 rounded-full overflow-hidden',
          heights[height]
        )}
      >
        <div
          className={cn(
            colors[color],
            heights[height],
            'rounded-full transition-all duration-500 ease-out'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
