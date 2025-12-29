import React from 'react';
import { cn } from '../../utils/cn';
import type { InputProps } from './Input.types';

export function Input({
  label,
  error,
  icon,
  className,
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-banorte-gray mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        <input
          className={cn(
            'w-full h-[50px] rounded-input border border-gray-300 bg-white',
            'text-banorte-dark placeholder-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-banorte-red focus:border-transparent',
            'disabled:bg-gray-100 disabled:text-gray-500',
            'transition-colors duration-200',
            icon ? 'pl-10' : 'pl-4',
            error && 'border-status-alert ring-1 ring-status-alert',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-status-alert">{error}</p>}
    </div>
  );
}
