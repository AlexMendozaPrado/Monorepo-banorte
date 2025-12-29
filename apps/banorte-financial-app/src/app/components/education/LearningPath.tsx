'use client';

import React from 'react';
import { Card } from '@banorte/ui';
import { Check, Lock, Star } from 'lucide-react';

export function LearningPath() {
  const steps = [
    {
      id: 1,
      title: 'Conceptos Básicos',
      status: 'completed' as const,
    },
    {
      id: 2,
      title: 'Presupuesto Personal',
      status: 'completed' as const,
    },
    {
      id: 3,
      title: 'Fondo de Emergencia',
      status: 'current' as const,
    },
    {
      id: 4,
      title: 'Control de Deudas',
      status: 'locked' as const,
    },
    {
      id: 5,
      title: 'Inversión Inicial',
      status: 'locked' as const,
    },
  ];

  return (
    <Card className="h-full">
      <h3 className="font-bold text-banorte-dark mb-6">
        Tu Ruta de Aprendizaje
      </h3>

      <div className="relative pl-4 space-y-8">
        {/* Vertical Line */}
        <div className="absolute left-[27px] top-2 bottom-2 w-0.5 bg-gray-100 -z-10" />

        {steps.map((step) => (
          <div key={step.id} className="flex items-center gap-4 relative">
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10
                ${step.status === 'completed' ? 'bg-green-500 text-white' : ''}
                ${step.status === 'current' ? 'bg-banorte-red text-white ring-4 ring-red-50' : ''}
                ${step.status === 'locked' ? 'bg-gray-200 text-gray-400' : ''}
              `}
            >
              {step.status === 'completed' && <Check size={14} />}
              {step.status === 'current' && (
                <Star size={14} fill="currentColor" />
              )}
              {step.status === 'locked' && <Lock size={14} />}
            </div>

            <div
              className={`flex-1 p-3 rounded-lg border ${step.status === 'current' ? 'bg-red-50 border-red-100' : 'bg-white border-gray-100'}`}
            >
              <p
                className={`text-sm font-bold ${step.status === 'locked' ? 'text-gray-400' : 'text-banorte-dark'}`}
              >
                {step.title}
              </p>
              {step.status === 'current' && (
                <p className="text-xs text-banorte-red mt-1 font-medium">
                  En progreso
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
