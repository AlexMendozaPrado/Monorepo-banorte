import React from 'react';
import { cn } from '../../utils/cn';
import type { TextAreaProps } from './TextArea.types';

export function TextArea({
  label,
  error,
  className,
  disabled,
  id,
  ...props
}: TextAreaProps) {
  const inputId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-[12px] text-[#5B6670] mb-1 font-medium"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <textarea
          id={inputId}
          disabled={disabled}
          className={cn(
            'w-full min-h-[165px] p-[15px] rounded-[6px] border text-[15px] resize-y',
            'bg-white text-[#323E48] placeholder-[#A2A9AD]',
            'transition-colors duration-200 ease-in-out',
            'focus:outline-none',
            error
              ? 'border-[#EB0029] focus:border-[#EB0029]'
              : 'border-[#CFD2D3] focus:border-[#5B6670]',
            disabled && 'bg-[#F4F7F8] cursor-not-allowed',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-[#EB0029]">{error}</p>}
    </div>
  );
}
