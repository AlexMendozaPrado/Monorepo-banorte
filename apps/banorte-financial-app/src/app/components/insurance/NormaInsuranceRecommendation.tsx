'use client';

import React from 'react';
import { Card } from '@banorte/ui';
import { Sparkles, ArrowRight, ShieldAlert } from 'lucide-react';

export function NormaInsuranceRecommendation() {
  return (
    <Card className="mb-6 border-l-4 border-l-banorte-red bg-red-50/30">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-red-100 text-banorte-red rounded-full">
          <Sparkles size={24} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-banorte-dark mb-1">
            Análisis de Norma
          </h3>
          <p className="text-sm text-banorte-gray mb-4">
            He notado que tienes un crédito automotriz activo pero tu seguro de
            auto vence en 15 días. Es crítico renovarlo para proteger tu
            patrimonio.
          </p>

          <div className="bg-white p-3 rounded-lg border border-gray-200 mb-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm font-medium text-banorte-dark">
                <ShieldAlert size={16} className="text-orange-500" />
                <span>Gap detectado: Seguro de Auto</span>
              </div>
              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">
                Alta Prioridad
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Te sugiero cotizar una cobertura amplia que incluya daños
              materiales y robo total.
            </p>
          </div>

          <button className="text-sm font-bold text-banorte-red flex items-center gap-1 hover:underline">
            Ver opciones recomendadas <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </Card>
  );
}

