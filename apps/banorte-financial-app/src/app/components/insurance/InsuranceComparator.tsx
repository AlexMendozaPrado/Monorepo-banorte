'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Check, X, Star } from 'lucide-react';

export function InsuranceComparator() {
  const options = [
    {
      name: 'Banorte Esencial',
      price: 850,
      coverage: '500k',
      deductible: '10%',
      rating: 4.5,
      features: [true, true, false, false],
      recommended: false,
    },
    {
      name: 'Banorte Plus',
      price: 1200,
      coverage: '1M',
      deductible: '5%',
      rating: 4.8,
      features: [true, true, true, false],
      recommended: true,
    },
    {
      name: 'Banorte Premium',
      price: 1800,
      coverage: '5M',
      deductible: '3%',
      rating: 4.9,
      features: [true, true, true, true],
      recommended: false,
    },
  ];

  const featuresList = [
    'Cobertura Nacional',
    'Asistencia Vial',
    'Auto Sustituto',
    'Cobertura en EE.UU.',
  ];

  return (
    <Card className="mb-6 overflow-x-auto">
      <h3 className="font-bold text-banorte-dark mb-6">
        Comparativa de Seguros de Auto
      </h3>

      <div className="min-w-[600px]">
        <div className="grid grid-cols-4 gap-4">
          {/* Labels Column */}
          <div className="pt-32 space-y-4">
            <div className="font-medium text-sm text-gray-500">
              Prima Mensual
            </div>
            <div className="font-medium text-sm text-gray-500">
              Suma Asegurada
            </div>
            <div className="font-medium text-sm text-gray-500">Deducible</div>
            <div className="font-medium text-sm text-gray-500">
              Calificación
            </div>
            {featuresList.map((f, i) => (
              <div key={i} className="font-medium text-sm text-gray-500">
                {f}
              </div>
            ))}
          </div>

          {/* Options Columns */}
          {options.map((opt, idx) => (
            <div
              key={idx}
              className={`relative p-4 rounded-xl ${opt.recommended ? 'bg-red-50 border-2 border-banorte-red' : 'bg-gray-50 border border-gray-200'}`}
            >
              {opt.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-banorte-red text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                  Mejor Opción
                </div>
              )}

              <div className="text-center mb-6">
                <h4 className="font-bold text-banorte-dark mb-2">{opt.name}</h4>
                <Button
                  size="sm"
                  fullWidth
                  variant={opt.recommended ? 'primary' : 'outline'}
                >
                  Cotizar
                </Button>
              </div>

              <div className="space-y-4 text-center">
                <div className="font-bold text-banorte-dark">${opt.price}</div>
                <div className="text-sm">{opt.coverage}</div>
                <div className="text-sm">{opt.deductible}</div>
                <div className="flex justify-center items-center gap-1 text-sm">
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  {opt.rating}
                </div>
                {opt.features.map((feat, i) => (
                  <div key={i} className="flex justify-center">
                    {feat ? (
                      <Check size={16} className="text-green-600" />
                    ) : (
                      <X size={16} className="text-gray-300" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

