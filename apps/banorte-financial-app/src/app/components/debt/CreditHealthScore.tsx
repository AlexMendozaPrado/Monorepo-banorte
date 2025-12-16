import React from 'react';
import { Card } from '../ui/Card';
import { TrendingUp, Info } from 'lucide-react';

export function CreditHealthScore() {
  const score = 720;
  const maxScore = 850;
  const percentage = (score / maxScore) * 100;

  return (
    <Card className="text-center">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-banorte-dark">Score Crediticio</h3>
        <button className="text-gray-400 hover:text-gray-600">
          <Info size={16} />
        </button>
      </div>

      <div className="relative w-32 h-32 mx-auto mb-4">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="64" cy="64" r="56" stroke="#e5e7eb" strokeWidth="12" fill="none" />
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="url(#scoreGradient)"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${percentage * 3.52} 352`}
          />
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-banorte-dark">{score}</span>
          <span className="text-xs text-gray-500">de {maxScore}</span>
        </div>
      </div>

      <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm font-medium mb-3">
        <TrendingUp size={14} />
        <span>Bueno</span>
      </div>

      <p className="text-xs text-gray-500">
        Tu score ha mejorado <strong className="text-green-600">+15 pts</strong> en los últimos 3 meses
      </p>
    </Card>
  );
}

