import React from 'react';
import { Calendar } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { DateInputProps } from './DateInput.types';

export function DateInput({
  label,
  error,
  className,
  disabled,
  id,
  ...props
}: DateInputProps) {
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
        <input
          type="text"
          id={inputId}
          placeholder="DD/MM/YY"
          disabled={disabled}
          className={cn(
            'w-full h-[50px] pl-[15px] pr-[45px] rounded-[6px] border text-[15px]',
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
        <div className="absolute inset-y-0 right-0 pr-[15px] flex items-center pointer-events-none">
          <Calendar className="h-5 w-5 text-[#5B6670]" />
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-[#EB0029]">{error}</p>}
    </div>
  );
}
