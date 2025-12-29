import React from 'react';
import { Search } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { SearchInputProps } from './SearchInput.types';

export function SearchInput({
  error,
  className,
  disabled,
  ...props
}: SearchInputProps) {
  return (
    <div className="w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-[15px] flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-[#5B6670]" />
        </div>
        <input
          type="text"
          placeholder="Buscar"
          disabled={disabled}
          className={cn(
            'w-full h-[50px] pl-[45px] pr-[15px] rounded-[6px] border text-[15px]',
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
