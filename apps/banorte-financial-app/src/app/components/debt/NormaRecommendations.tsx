'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { Sparkles, Scissors, ArrowRight } from 'lucide-react';

export function NormaRecommendations() {
  return (
    <Card className="mb-6 border-l-4 border-l-banorte-red">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-red-50 text-banorte-red rounded-full">
          <Sparkles size={24} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-banorte-dark mb-1">Recomendación de Norma</h3>
          <p className="text-sm text-banorte-gray mb-4">
            He analizado tus gastos y encontré una oportunidad para liberar{' '}
            <strong className="text-banorte-dark">$1,200 mensuales</strong> que podrías destinar a tu deuda de Banorte Oro.
          </p>

          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm">
                <Scissors size={16} className="text-gray-400" />
                <span>Recortar gastos hormiga</span>
              </div>
              <span className="font-bold text-green-600">+$450</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Scissors size={16} className="text-gray-400" />
                <span>Reducir salidas a restaurantes</span>
              </div>
              <span className="font-bold text-green-600">+$750</span>
            </div>
          </div>

          <button className="text-sm font-bold text-banorte-red flex items-center gap-1 hover:underline">
            Aplicar recomendaciones a presupuesto <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </Card>
  );
}

