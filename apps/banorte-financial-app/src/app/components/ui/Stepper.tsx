import React from 'react';
import { Check } from 'lucide-react';

export interface Step {
  id: string;
  label: string;
  description?: string;
}

export interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = onStepClick !== undefined;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <button
                  onClick={() => isClickable && onStepClick(index)}
                  disabled={!isClickable}
                  className={`
                    relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200
                    ${isCompleted ? 'bg-banorte-red border-banorte-red text-white' : ''}
                    ${isCurrent ? 'border-banorte-red text-banorte-red bg-white' : ''}
                    ${!isCompleted && !isCurrent ? 'border-gray-300 text-gray-400 bg-white' : ''}
                    ${isClickable ? 'cursor-pointer hover:shadow-md' : 'cursor-default'}
                  `}
                >
                  {isCompleted ? (
                    <Check size={20} />
                  ) : (
                    <span className="font-semibold">{index + 1}</span>
                  )}
                </button>
                <div className="mt-2 text-center">
                  <div
                    className={`text-sm font-medium ${
                      isCurrent ? 'text-banorte-red' : isCompleted ? 'text-banorte-dark' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </div>
                  {step.description && (
                    <div className="text-xs text-banorte-gray mt-1">{step.description}</div>
                  )}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 -mt-12">
                  <div
                    className={`h-full transition-all duration-200 ${
                      index < currentStep ? 'bg-banorte-red' : 'bg-gray-300'
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
