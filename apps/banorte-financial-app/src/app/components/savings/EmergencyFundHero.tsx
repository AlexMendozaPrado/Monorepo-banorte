import React from 'react';
import { Card, Button } from '@banorte/ui';
import { TrendingUp, Info, ShieldCheck } from 'lucide-react';

interface EmergencyFundHeroProps {
  saved: number;
  target: number;
  monthlyContribution: number;
}

export function EmergencyFundHero({
  saved,
  target,
  monthlyContribution,
}: EmergencyFundHeroProps) {
  const percentage = Math.round((saved / target) * 100);
  const remaining = target - saved;
  const monthsToGoal = (remaining / monthlyContribution).toFixed(1);

  // Circle calculations
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100 relative overflow-hidden">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-4">
        {/* Left Content */}
        <div className="flex-1 text-center md:text-left space-y-4">
          <div className="flex items-center justify-center md:justify-start gap-2 text-blue-600 mb-2">
            <ShieldCheck size={24} />
            <h2 className="text-lg font-bold font-display">
              Fondo de Emergencia
            </h2>
          </div>

          <div>
            <p className="text-4xl font-bold text-banorte-dark mb-1">
              ${saved.toLocaleString()}
            </p>
            <p className="text-banorte-gray">
              de{' '}
              <span className="font-medium text-banorte-dark">
                ${target.toLocaleString()}
              </span>{' '}
              meta recomendada
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
            <Button>Aportar Ahora</Button>
            <Button variant="outline">Ajustar Meta</Button>
          </div>

          <div className="bg-white/60 backdrop-blur-sm p-3 rounded-lg border border-blue-100 inline-flex items-start gap-2 text-sm text-banorte-gray max-w-md">
            <span className="text-lg">💡</span>
            <p>
              Con tu ritmo actual de{' '}
              <strong className="text-banorte-dark">
                ${monthlyContribution}/mes
              </strong>
              , completarás tu fondo en{' '}
              <strong className="text-blue-600">{monthsToGoal} meses</strong>.
            </p>
          </div>
        </div>

        {/* Right Content - Circular Progress */}
        <div className="relative w-64 h-64 flex items-center justify-center flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx="128"
              cy="128"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-blue-100"
            />
            {/* Progress Circle */}
            <circle
              cx="128"
              cy="128"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="text-blue-500 transition-all duration-1500 ease-out"
            />
          </svg>

          <div className="absolute flex flex-col items-center">
            <span className="text-5xl font-display font-bold text-blue-600">
              {percentage}%
            </span>
            <span className="text-sm text-gray-500 font-medium mt-1">
              completado
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
