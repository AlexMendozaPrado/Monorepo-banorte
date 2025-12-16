import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { AlertCircle, Calendar } from 'lucide-react';

interface CreditCardDetailProps {
  used: number;
  limit: number;
  paymentDue: string;
  minPayment: number;
  noInterestPayment: number;
  cutDate: string;
  onPay: () => void;
}

export function CreditCardDetail({ used, limit, paymentDue, minPayment, noInterestPayment, cutDate, onPay }: CreditCardDetailProps) {
  const percentage = Math.round((used / limit) * 100);
  const available = limit - used;

  const getStatusColor = (pct: number) => {
    if (pct < 30) return 'text-status-success stroke-status-success';
    if (pct < 70) return 'text-status-warning stroke-status-warning';
    if (pct < 85) return 'text-orange-500 stroke-orange-500';
    return 'text-status-alert stroke-status-alert';
  };

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <Card className="flex flex-col items-center justify-center p-6">
        <h3 className="text-banorte-gray font-medium text-sm mb-4 uppercase tracking-wider">Uso de Crédito</h3>
        <div className="relative w-48 h-48 flex items-center justify-center mb-4">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="96" cy="96" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100" />
            <circle cx="96" cy="96" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent"
              strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
              className={`${getStatusColor(percentage).split(' ')[1]} transition-all duration-1000 ease-out`}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className={`text-4xl font-display font-bold ${getStatusColor(percentage).split(' ')[0]}`}>{percentage}%</span>
            <span className="text-xs text-gray-400 font-medium">utilizado</span>
          </div>
        </div>
        <div className="w-full space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Límite de crédito</span>
            <span className="font-bold text-banorte-dark">${limit.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Disponible</span>
            <span className="font-bold text-status-success">${available.toLocaleString()}</span>
          </div>
        </div>
        {percentage > 80 && (
          <div className="mt-4 flex items-center gap-2 text-xs text-status-alert bg-red-50 px-3 py-2 rounded-lg w-full">
            <AlertCircle size={16} />
            <span>Estás cerca de tu límite de crédito</span>
          </div>
        )}
      </Card>

      <Card className="flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-banorte-dark">Información de Pago</h3>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded text-banorte-gray">Corte: {cutDate}</span>
          </div>
          <div className="space-y-4 mb-6">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Pago para no generar intereses</p>
              <p className="text-2xl font-bold text-banorte-dark">${noInterestPayment.toLocaleString()}</p>
            </div>
            <div className="flex gap-4">
              <div className="flex-1 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Pago Mínimo</p>
                <p className="text-lg font-bold text-banorte-gray">${minPayment.toLocaleString()}</p>
              </div>
              <div className="flex-1 p-3 bg-red-50 rounded-lg border border-red-100">
                <p className="text-xs text-red-600 mb-1">Fecha Límite</p>
                <div className="flex items-center gap-1 text-banorte-red font-bold">
                  <Calendar size={16} />
                  <span>{paymentDue}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Button onClick={onPay} fullWidth className="mt-auto">Programar Pago</Button>
      </Card>
    </div>
  );
}

