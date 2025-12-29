import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { ButtonProps } from './Button.types';

const baseStyles =
  'inline-flex items-center justify-center font-display font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-btn';

const variants = {
  primary:
    'bg-banorte-red text-white hover:bg-red-700 focus:ring-banorte-red shadow-sm hover:shadow-md',
  secondary:
    'bg-banorte-gray text-white hover:bg-gray-600 focus:ring-banorte-gray shadow-sm',
  outline:
    'border-2 border-banorte-red text-banorte-red hover:bg-red-50 focus:ring-banorte-red',
  ghost: 'text-banorte-gray hover:bg-gray-100 hover:text-banorte-dark',
  danger:
    'bg-status-alert text-white hover:bg-orange-600 focus:ring-status-alert',
};

const sizes = {
  sm: 'h-[35px] px-4 text-sm',
  md: 'h-[45px] px-6 text-base',
  lg: 'h-[50px] px-8 text-lg',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
