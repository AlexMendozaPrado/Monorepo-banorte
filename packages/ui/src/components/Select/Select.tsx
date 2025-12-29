'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { SelectProps } from './Select.types';

export function Select({
  label,
  error,
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  disabled,
  className,
  id,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((opt) => opt.value === value);
  const isDisabled = Boolean(disabled);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    if (!isDisabled) {
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label
          htmlFor={id}
          className="block text-[12px] text-[#5B6670] mb-1 font-medium"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          id={id}
          disabled={isDisabled}
          onClick={() => !isDisabled && setIsOpen(!isOpen)}
          className={cn(
            'w-full h-[50px] px-[15px] rounded-[6px] border text-[15px] text-left',
            'flex items-center justify-between',
            'bg-white transition-colors duration-200 ease-in-out',
            'focus:outline-none',
            error
              ? 'border-[#EB0029] focus:border-[#EB0029]'
              : cn(
                  'border-[#CFD2D3]',
                  isOpen && 'border-[#5B6670]',
                  'focus:border-[#5B6670]'
                ),
            isDisabled ? 'bg-[#F4F7F8] cursor-not-allowed' : 'cursor-pointer',
            className
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className={selectedOption ? 'text-[#323E48]' : 'text-[#A2A9AD]'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            className={cn(
              'h-5 w-5 text-[#5B6670] transition-transform duration-200',
              isOpen && 'transform rotate-180'
            )}
          />
        </button>

        {isOpen && !isDisabled && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-[#CFD2D3] rounded-[6px] shadow-lg max-h-60 overflow-auto py-1">
            <ul role="listbox">
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      'px-[15px] py-2.5 text-[15px] cursor-pointer transition-colors',
                      'hover:bg-[#F4F7F8]',
                      isSelected ? 'text-[#EB0029]' : 'text-[#323E48]'
                    )}
                  >
                    {option.label}
                  </li>
                );
              })}
              {options.length === 0 && (
                <li className="px-[15px] py-2.5 text-[15px] text-[#A2A9AD] italic">
                  No options available
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-[#EB0029]">{error}</p>}
    </div>
  );
}
