import React from 'react';
import { Card } from '../ui/Card';
import { TrendingUp, ShieldCheck } from 'lucide-react';

export function CardHealthScore() {
  const score = 85;

  return (
    <Card className="mb-6 bg-gradient-to-r from-green-50 to-white border-green-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r="28" stroke="#e5e7eb" strokeWidth="6" fill="transparent" />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#6CC04A"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray="175"
                strokeDashoffset={175 - (score / 100) * 175}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-sm font-bold text-green-700">{score}</span>
          </div>

          <div>
            <h3 className="font-bold text-banorte-dark flex items-center gap-2">
              Salud de Tarjetas
              <ShieldCheck size={16} className="text-green-600" />
            </h3>
            <p className="text-xs text-banorte-gray">Tu uso de crédito es saludable. ¡Sigue así!</p>
          </div>
        </div>

        <div className="text-right hidden md:block">
          <div className="flex items-center gap-1 text-green-600 text-sm font-bold justify-end">
            <TrendingUp size={16} />
            <span>+5 pts</span>
          </div>
          <p className="text-xs text-gray-500">vs mes anterior</p>
        </div>
      </div>
    </Card>
  );
}

