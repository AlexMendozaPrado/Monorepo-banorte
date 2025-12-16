import React from 'react';
import { Card } from '../ui/Card';
import { TrendingUp, Award, Calendar } from 'lucide-react';

export function SavingsHistory() {
  const badges = [
    {
      icon: '🎯',
      title: 'Primera Meta',
      date: 'Sep 2024',
      color: 'bg-yellow-100 text-yellow-700',
    },
    {
      icon: '🔥',
      title: 'Racha 3 Meses',
      date: 'Oct 2024',
      color: 'bg-orange-100 text-orange-700',
    },
    {
      icon: '💰',
      title: '$10k Ahorrados',
      date: 'Ago 2024',
      color: 'bg-green-100 text-green-700',
    },
    {
      icon: '📈',
      title: 'Consistente',
      date: 'Sep 2024',
      color: 'bg-blue-100 text-blue-700',
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-banorte-dark">Historial de Ahorros</h3>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-red-50 text-banorte-red text-sm font-medium rounded-full">
              Gráfica
            </button>
            <button className="px-3 py-1 text-gray-500 text-sm font-medium hover:bg-gray-50 rounded-full">
              Movimientos
            </button>
          </div>
        </div>

        <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-blue-50/50 to-transparent" />
          <span className="text-gray-400 text-sm relative z-10">
            Gráfica de área interactiva aquí
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-xs text-gray-500 mb-1">Total Ahorrado</p>
            <p className="font-bold text-banorte-dark">$45,000</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-xs text-gray-500 mb-1">Promedio Mensual</p>
            <p className="font-bold text-banorte-dark">$3,200</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-xs text-gray-500 mb-1">Mejor Mes</p>
            <p className="font-bold text-status-success">Ago ($4.5k)</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-xs text-gray-500 mb-1">Racha Actual</p>
            <p className="font-bold text-orange-500">8 meses 🔥</p>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-bold text-banorte-dark mb-4">
          Logros Desbloqueados
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {badges.map((badge, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center text-center p-3 border border-gray-100 rounded-xl hover:shadow-md transition-shadow"
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-2 ${badge.color}`}
              >
                {badge.icon}
              </div>
              <p className="text-sm font-bold text-banorte-dark">
                {badge.title}
              </p>
              <p className="text-xs text-gray-400">{badge.date}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
