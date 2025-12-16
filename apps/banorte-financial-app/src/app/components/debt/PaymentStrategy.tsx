'use client';

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Snowflake, TrendingDown, Check, Info } from 'lucide-react';

export function PaymentStrategy() {
  const [strategy, setStrategy] = useState<'snowball' | 'avalanche'>('avalanche');

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-banorte-dark">Estrategia de Pago</h2>
          <p className="text-sm text-banorte-gray">Compara y selecciona el método ideal para ti</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Snowball Card */}
        <Card
          className={`cursor-pointer transition-all border-2 ${strategy === 'snowball' ? 'border-blue-500 ring-4 ring-blue-50' : 'border-transparent hover:border-gray-200'}`}
          onClick={() => setStrategy('snowball')}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <Snowflake size={24} />
              </div>
              <div>
                <h3 className="font-bold text-banorte-dark">Bola de Nieve</h3>
                <p className="text-xs text-gray-500">Motivación psicológica</p>
              </div>
            </div>
            {strategy === 'snowball' && (
              <div className="bg-blue-500 text-white p-1 rounded-full">
                <Check size={16} />
              </div>
            )}
          </div>

          <p className="text-sm text-banorte-gray mb-4">
            Paga primero las deudas más pequeñas para ganar impulso y motivación con victorias rápidas.
          </p>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Ahorro en intereses</span>
              <span className="font-medium text-banorte-dark">$10,200</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tiempo total</span>
              <span className="font-medium text-banorte-dark">41 meses</span>
            </div>
          </div>

          <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-gray-100">
            <div className="w-1/4 bg-blue-300" />
            <div className="w-1/4 bg-blue-400" />
            <div className="w-1/4 bg-blue-500" />
            <div className="w-1/4 bg-blue-600" />
          </div>
        </Card>

        {/* Avalanche Card */}
        <Card
          className={`cursor-pointer transition-all border-2 ${strategy === 'avalanche' ? 'border-green-500 ring-4 ring-green-50' : 'border-transparent hover:border-gray-200'}`}
          onClick={() => setStrategy('avalanche')}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                <TrendingDown size={24} />
              </div>
              <div>
                <h3 className="font-bold text-banorte-dark">Avalancha</h3>
                <p className="text-xs text-gray-500">Máximo ahorro financiero</p>
              </div>
            </div>
            {strategy === 'avalanche' && (
              <div className="bg-green-500 text-white p-1 rounded-full">
                <Check size={16} />
              </div>
            )}
          </div>

          <p className="text-sm text-banorte-gray mb-4">
            Paga primero las deudas con mayor interés para minimizar el costo total y salir antes.
          </p>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Ahorro en intereses</span>
              <span className="font-bold text-green-600">$12,450 (+$2,250)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tiempo total</span>
              <span className="font-bold text-green-600">38 meses (-3 meses)</span>
            </div>
          </div>

          <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-gray-100">
            <div className="w-1/3 bg-green-600" />
            <div className="w-1/4 bg-green-500" />
            <div className="w-1/4 bg-green-400" />
            <div className="w-[16%] bg-green-300" />
          </div>
        </Card>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3">
        <Info className="text-blue-600 mt-0.5" size={20} />
        <div>
          <p className="text-sm font-bold text-blue-800">Recomendación de Norma</p>
          <p className="text-sm text-blue-600">
            Basado en tus altas tasas de interés (42% en Banorte Oro), el método <strong>Avalancha</strong> te ahorrará $2,250 y te liberará 3 meses antes.
          </p>
        </div>
      </div>
    </div>
  );
}

