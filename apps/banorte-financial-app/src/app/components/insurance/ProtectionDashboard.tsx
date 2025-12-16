'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { Shield, Heart, Car, Home, Briefcase, Activity } from 'lucide-react';

export function ProtectionDashboard() {
  const protectionLevel = 45;
  const categories = [
    {
      name: 'Salud',
      icon: <Activity size={16} />,
      status: 'covered',
      color: 'text-green-600 bg-green-50',
    },
    {
      name: 'Vida',
      icon: <Heart size={16} />,
      status: 'partial',
      color: 'text-yellow-600 bg-yellow-50',
    },
    {
      name: 'Auto',
      icon: <Car size={16} />,
      status: 'covered',
      color: 'text-green-600 bg-green-50',
    },
    {
      name: 'Hogar',
      icon: <Home size={16} />,
      status: 'none',
      color: 'text-gray-400 bg-gray-100',
    },
    {
      name: 'Desempleo',
      icon: <Briefcase size={16} />,
      status: 'none',
      color: 'text-gray-400 bg-gray-100',
    },
  ];

  const getScoreColor = (score: number) => {
    if (score < 30) return 'text-banorte-red stroke-banorte-red';
    if (score < 60) return 'text-orange-500 stroke-orange-500';
    if (score < 80) return 'text-yellow-500 stroke-yellow-500';
    return 'text-status-success stroke-status-success';
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100 mb-6">
      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Circular Progress */}
        <div className="relative w-40 h-40 flex items-center justify-center flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="#e5e7eb"
              strokeWidth="12"
              fill="transparent"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray="440"
              strokeDashoffset={440 - (protectionLevel / 100) * 440}
              strokeLinecap="round"
              className={`${getScoreColor(protectionLevel).split(' ')[1]} transition-all duration-1000 ease-out`}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span
              className={`text-3xl font-bold ${getScoreColor(protectionLevel).split(' ')[0]}`}
            >
              {protectionLevel}%
            </span>
            <span className="text-xs text-gray-500 font-medium">Protegido</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 w-full">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold text-banorte-dark">
              Nivel de Protección
            </h2>
          </div>
          <p className="text-banorte-gray text-sm mb-6">
            Tienes áreas importantes sin cubrir. Aumentar tu protección te dará
            tranquilidad financiera ante imprevistos.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className={`flex flex-col items-center p-3 rounded-lg border border-transparent ${cat.color}`}
              >
                <div className="mb-1">{cat.icon}</div>
                <span className="text-xs font-bold">{cat.name}</span>
                <span className="text-[10px] font-medium opacity-80">
                  {cat.status === 'covered'
                    ? 'Cubierto'
                    : cat.status === 'partial'
                      ? 'Parcial'
                      : 'Sin cubrir'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

