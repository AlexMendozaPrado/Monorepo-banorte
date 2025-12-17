'use client';

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Calculator, ArrowRight, CheckCircle } from 'lucide-react';

export function PaymentSimulator() {
  const [extraAmount, setExtraAmount] = useState(500);
  const [frequency, setFrequency] = useState<'once' | 'monthly'>('monthly');

  return (
    <Card className="mb-6 bg-gradient-to-br from-blue-50 to-white border-blue-100">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="text-blue-600" size={20} />
        <div>
          <h3 className="font-bold text-banorte-dark">Simulador de Pagos Extras</h3>
          <p className="text-xs text-banorte-gray">Descubre cuánto puedes ahorrar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-banorte-dark mb-2">
              Monto extra a pagar: <span className="font-bold text-blue-600">${extraAmount}</span>
            </label>
            <input
              type="range"
              min="0"
              max="5000"
              step="100"
              value={extraAmount}
              onChange={(e) => setExtraAmount(parseInt(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>$0</span>
              <span>$2,500</span>
              <span>$5,000</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-banorte-dark mb-2">Frecuencia</label>
            <div className="flex gap-2">
              <button
                onClick={() => setFrequency('once')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm border transition-all ${frequency === 'once' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
              >
                Una vez
              </button>
              <button
                onClick={() => setFrequency('monthly')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm border transition-all ${frequency === 'monthly' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
              >
                Mensual
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-banorte-dark mb-2">Aplicar a deuda</label>
            <select className="w-full p-2 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option>Banorte Oro (Recomendado)</option>
              <option>BBVA Personal</option>
              <option>Liverpool</option>
              <option>Santander Auto</option>
            </select>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <h4 className="font-bold text-banorte-dark mb-4 text-sm uppercase tracking-wider">Resultados</h4>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-500">Tiempo de pago</span>
              <div className="text-right">
                <p className="font-bold text-banorte-dark line-through text-xs text-gray-400">14 meses</p>
                <p className="font-bold text-green-600 flex items-center gap-1">
                  10 meses <span className="text-[10px] bg-green-100 px-1.5 py-0.5 rounded">-4 meses</span>
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-500">Intereses totales</span>
              <div className="text-right">
                <p className="font-bold text-banorte-dark line-through text-xs text-gray-400">$4,350</p>
                <p className="font-bold text-green-600 flex items-center gap-1">
                  $1,750 <span className="text-[10px] bg-green-100 px-1.5 py-0.5 rounded">Ahorras $2,600</span>
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-500">Fecha libre</span>
              <div className="text-right">
                <p className="font-bold text-banorte-dark line-through text-xs text-gray-400">Ene 2026</p>
                <p className="font-bold text-green-600">Sep 2025</p>
              </div>
            </div>

            <Button fullWidth className="bg-green-600 hover:bg-green-700 text-white">
              Programar este pago
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

