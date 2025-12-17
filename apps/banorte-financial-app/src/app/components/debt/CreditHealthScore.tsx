'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { Shield } from 'lucide-react';

export function CreditHealthScore() {
  const score = 650; // Score crediticio simulado

  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-banorte-dark flex items-center gap-2">
          <Shield size={18} className="text-blue-600" />
          Score Crediticio
        </h3>
        <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">
          Actualizado hoy
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="#FFA400"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray="251"
              strokeDashoffset={251 - (65 / 100) * 251}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-xl font-bold text-banorte-dark">{score}</span>
            <span className="text-[10px] text-status-warning font-bold">Regular</span>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Promedio Nacional</span>
            <span className="font-medium text-banorte-dark">680</span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div className="bg-gray-400 h-2 w-[68%]" />
          </div>
          <p className="text-xs text-banorte-gray">
            Tu score ha mejorado <strong className="text-green-600">+12 puntos</strong> este mes gracias a tus pagos puntuales.
          </p>
        </div>
      </div>
    </Card>
  );
}

