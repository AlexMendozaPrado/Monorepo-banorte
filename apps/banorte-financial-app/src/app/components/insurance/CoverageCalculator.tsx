'use client';

import React, { useState } from 'react';
import { Card } from '@banorte/ui';
import { Calculator, ArrowRight } from 'lucide-react';

export function CoverageCalculator() {
  const [income, setIncome] = useState(25000);
  const [years, setYears] = useState(5);
  const recommended = income * 12 * years;

  return (
    <Card className="mb-6 bg-gradient-to-r from-gray-50 to-white">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="text-banorte-red" size={20} />
        <h3 className="font-bold text-banorte-dark">
          Calculadora de Cobertura (Vida)
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-banorte-dark mb-2">
              Ingresos Mensuales
            </label>
            <input
              type="range"
              min="10000"
              max="100000"
              step="1000"
              value={income}
              onChange={(e) => setIncome(parseInt(e.target.value))}
              className="w-full accent-banorte-red"
            />
            <p className="text-right font-bold text-banorte-dark">
              ${income.toLocaleString()}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-banorte-dark mb-2">
              Años de Protección
            </label>
            <div className="flex gap-2">
              {[3, 5, 10, 15].map((y) => (
                <button
                  key={y}
                  onClick={() => setYears(y)}
                  className={`flex-1 py-2 rounded border text-sm transition-colors ${years === y ? 'bg-banorte-red text-white border-banorte-red' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                >
                  {y} años
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center">
          <p className="text-sm text-gray-500 mb-2">
            Suma Asegurada Recomendada
          </p>
          <p className="text-3xl font-bold text-banorte-dark mb-4">
            ${recommended.toLocaleString()}
          </p>
          <p className="text-xs text-banorte-gray mb-4">
            Esto cubriría los gastos de tu familia por {years} años en caso de
            que faltes.
          </p>
          <button className="text-banorte-red font-bold text-sm flex items-center justify-center gap-1 hover:underline">
            Cotizar esta suma <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </Card>
  );
}

