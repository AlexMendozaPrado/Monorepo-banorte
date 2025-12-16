'use client';

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Calculator, TrendingDown, Clock, DollarSign } from 'lucide-react';

export function PaymentSimulator() {
  const [extraPayment, setExtraPayment] = useState(500);

  const baseMonths = 48;
  const baseInterest = 28500;
  const savedMonths = Math.floor(extraPayment / 100) * 2;
  const savedInterest = Math.floor(extraPayment * 15);

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-purple-100 text-purple-600 rounded-xl">
          <Calculator size={24} />
        </div>
        <div>
          <h3 className="font-bold text-banorte-dark">Simulador de Pagos Extra</h3>
          <p className="text-sm text-gray-500">Descubre cuánto puedes ahorrar</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-banorte-dark">Pago extra mensual</label>
          <span className="text-2xl font-bold text-purple-600">${extraPayment.toLocaleString()}</span>
        </div>
        <input
          type="range"
          min={0}
          max={2000}
          step={100}
          value={extraPayment}
          onChange={(e) => setExtraPayment(Number(e.target.value))}
          className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>$0</span>
          <span>$2,000</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white p-3 rounded-lg border border-purple-100 text-center">
          <Clock size={20} className="mx-auto mb-2 text-purple-500" />
          <p className="text-xs text-gray-500 mb-1">Meses ahorrados</p>
          <p className="text-xl font-bold text-purple-600">{savedMonths}</p>
        </div>
        <div className="bg-white p-3 rounded-lg border border-purple-100 text-center">
          <DollarSign size={20} className="mx-auto mb-2 text-green-500" />
          <p className="text-xs text-gray-500 mb-1">Interés ahorrado</p>
          <p className="text-xl font-bold text-green-600">${savedInterest.toLocaleString()}</p>
        </div>
        <div className="bg-white p-3 rounded-lg border border-purple-100 text-center">
          <TrendingDown size={20} className="mx-auto mb-2 text-blue-500" />
          <p className="text-xs text-gray-500 mb-1">Nuevo plazo</p>
          <p className="text-xl font-bold text-blue-600">{baseMonths - savedMonths} meses</p>
        </div>
      </div>

      <div className="bg-purple-100 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-purple-700">Sin pago extra</span>
          <span className="text-sm font-medium text-purple-800">{baseMonths} meses / ${baseInterest.toLocaleString()} interés</span>
        </div>
        <div className="w-full bg-purple-200 rounded-full h-2 mb-3">
          <div className="bg-purple-400 h-2 rounded-full w-full" />
        </div>

        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-purple-700 font-bold">Con +${extraPayment}/mes</span>
          <span className="text-sm font-bold text-green-600">
            {baseMonths - savedMonths} meses / ${(baseInterest - savedInterest).toLocaleString()} interés
          </span>
        </div>
        <div className="w-full bg-purple-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((baseMonths - savedMonths) / baseMonths) * 100}%` }}
          />
        </div>
      </div>
    </Card>
  );
}

