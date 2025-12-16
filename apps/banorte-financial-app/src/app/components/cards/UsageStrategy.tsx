import React from 'react';
import { Card } from '../ui/Card';

export function UsageStrategy() {
  const days = Array.from({ length: 7 }, (_, i) => i + 10);

  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-banorte-dark">Estrategia de Uso Óptimo</h3>
        <span className="text-xs text-banorte-gray">Noviembre 2024</span>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
          <div key={day} className="text-xs font-medium text-gray-400 uppercase mb-2">
            {day}
          </div>
        ))}

        {days.map((day) => {
          const isCutDate = day === 15;
          const isPaymentDate = day === 12;
          const isGoodDay = day > 15;

          return (
            <div
              key={day}
              className={`p-2 rounded-lg border text-sm relative h-20 flex flex-col items-center justify-between
                ${isCutDate ? 'bg-red-50 border-red-200' : ''}
                ${isPaymentDate ? 'bg-yellow-50 border-yellow-200' : ''}
                ${isGoodDay ? 'bg-green-50 border-green-200' : 'border-gray-100'}
              `}
            >
              <span className="font-bold text-banorte-dark">{day}</span>

              {isCutDate && (
                <div className="text-[10px] leading-tight text-banorte-red font-medium">Corte</div>
              )}

              {isPaymentDate && (
                <div className="text-[10px] leading-tight text-yellow-700 font-medium">Pagar</div>
              )}

              {isGoodDay && (
                <div className="text-[10px] leading-tight text-green-700 font-medium">Ideal</div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 bg-blue-50 p-3 rounded-lg flex items-start gap-2 text-sm text-blue-800">
        <span className="text-lg">💡</span>
        <p>
          <strong>Tip de Norma:</strong> Tu fecha de corte es el 15. Si realizas tus compras grandes a partir del día 16, tendrás hasta 50 días para pagarlas sin intereses.
        </p>
      </div>
    </Card>
  );
}

