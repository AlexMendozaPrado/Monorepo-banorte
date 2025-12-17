'use client';

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Snowflake, TrendingDown, Check, Info, Loader2 } from 'lucide-react';
import { useDebtStrategy } from '../../hooks/useDebtStrategy';

interface PaymentStrategyProps {
  userId?: string;
  availableMonthly?: number;
}

export function PaymentStrategy({ userId = 'user-demo', availableMonthly = 3000 }: PaymentStrategyProps) {
  const [strategy, setStrategy] = useState<'snowball' | 'avalanche'>('avalanche');
  const { comparison, loading, error } = useDebtStrategy(userId, availableMonthly);

  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-center p-8">
          <Loader2 size={32} className="animate-spin text-banorte-red" />
          <span className="ml-3 text-banorte-gray">Calculando estrategias de pago...</span>
        </div>
      </div>
    );
  }

  if (error || !comparison) {
    return (
      <div className="mb-8">
        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
          <p className="text-sm text-red-600">
            {error || 'No se pudo calcular la estrategia de pago. Asegúrate de tener deudas registradas.'}
          </p>
        </div>
      </div>
    );
  }

  const { snowball, avalanche, savingsDifference, monthsDifference, recommendedStrategy } = comparison;

  if (!snowball || !avalanche) {
    return null;
  }

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
            {snowball.reasoning}
          </p>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Ahorro en intereses</span>
              <span className="font-medium text-banorte-dark">
                ${snowball.totalInterestSaved.toLocaleString('es-MX')}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tiempo total</span>
              <span className="font-medium text-banorte-dark">
                {snowball.totalMonthsToPayoff} meses
              </span>
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
            {avalanche.reasoning}
          </p>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Ahorro en intereses</span>
              <span className="font-bold text-green-600">
                ${avalanche.totalInterestSaved.toLocaleString('es-MX')}
                {savingsDifference > 0 && (
                  <span className="ml-1">
                    (+${savingsDifference.toLocaleString('es-MX')})
                  </span>
                )}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tiempo total</span>
              <span className="font-bold text-green-600">
                {avalanche.totalMonthsToPayoff} meses
                {monthsDifference > 0 && (
                  <span className="ml-1">
                    (-{monthsDifference} meses)
                  </span>
                )}
              </span>
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

      {recommendedStrategy && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3">
          <Info className="text-blue-600 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-bold text-blue-800">Recomendación de Norma</p>
            <p className="text-sm text-blue-600">
              El método <strong>{recommendedStrategy === 'AVALANCHE' ? 'Avalancha' : 'Bola de Nieve'}</strong> es el más recomendado para tu situación.
              {recommendedStrategy === 'AVALANCHE' && savingsDifference > 0 && (
                <> Te ahorrará ${savingsDifference.toLocaleString('es-MX')} y te liberará {monthsDifference} meses antes.</>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

