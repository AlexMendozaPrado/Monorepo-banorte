import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { StepperProps } from './Stepper.types';

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="flex items-center justify-between w-full mb-8">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        return (
          <div
            key={index}
            className="flex flex-col items-center flex-1 relative"
          >
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'absolute top-4 left-1/2 w-full h-0.5 -z-10',
                  index < currentStep ? 'bg-banorte-red' : 'bg-gray-200'
                )}
              />
            )}

            {/* Step Circle */}
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-2 transition-colors duration-300',
                isCompleted && 'bg-banorte-red text-white',
                isCurrent && 'bg-white border-2 border-banorte-red text-banorte-red',
                !isCompleted && !isCurrent && 'bg-gray-100 text-gray-400'
              )}
            >
              {isCompleted ? <Check size={16} /> : index + 1}
            </div>

            {/* Step Label */}
            <span
              className={cn(
                'text-xs font-medium text-center transition-colors duration-300',
                isCurrent ? 'text-banorte-red' : 'text-gray-500'
              )}
            >
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}
