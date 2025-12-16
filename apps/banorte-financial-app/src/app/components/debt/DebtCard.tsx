import React from 'react';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { CreditCard, Car, Briefcase, ShoppingBag, AlertCircle } from 'lucide-react';

interface DebtCardProps {
  type: 'credit' | 'auto' | 'personal' | 'store';
  creditor: string;
  amount: number;
  rate: number;
  minPayment: number;
  recPayment: number;
  dueDate: string;
  progress: number;
  priority: 'high' | 'medium' | 'low';
  onViewDetails: () => void;
}

export function DebtCard({
  type,
  creditor,
  amount,
  rate,
  minPayment,
  recPayment,
  dueDate,
  progress,
  priority,
  onViewDetails,
}: DebtCardProps) {
  const icons = {
    credit: <CreditCard size={20} />,
    auto: <Car size={20} />,
    personal: <Briefcase size={20} />,
    store: <ShoppingBag size={20} />,
  };

  const priorityColors = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low: 'bg-green-100 text-green-700 border-green-200',
  };

  const rateColor = rate > 30 ? 'text-banorte-red font-bold' : rate > 15 ? 'text-orange-600' : 'text-green-600';

  return (
    <Card hoverEffect className="relative group cursor-pointer" onClick={onViewDetails}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gray-50 rounded-lg text-banorte-gray border border-gray-100">
            {icons[type]}
          </div>
          <div>
            <h3 className="font-bold text-banorte-dark text-sm">{creditor}</h3>
            <p className="text-xs text-gray-500">
              {type === 'credit' ? 'Tarjeta de Crédito' : type === 'auto' ? 'Préstamo Automotriz' : type === 'personal' ? 'Crédito Personal' : 'Tarjeta Departamental'}
            </p>
          </div>
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded border ${priorityColors[priority]}`}>
          {priority === 'high' ? 'ALTA PRIORIDAD' : priority === 'medium' ? 'MEDIA PRIORIDAD' : 'BAJA PRIORIDAD'}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs text-gray-500">Monto actual</p>
            <p className="text-xl font-bold text-banorte-dark">${amount.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Tasa Anual</p>
            <p className={`text-sm ${rateColor}`}>{rate}% APR</p>
          </div>
        </div>

        <ProgressBar value={progress} max={100} height="sm" color={priority === 'high' ? 'alert' : 'primary'} />

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-50 p-2 rounded border border-gray-100">
            <p className="text-gray-500 mb-1">Pago Mínimo</p>
            <p className="font-medium text-banorte-dark">${minPayment.toLocaleString()}</p>
          </div>
          <div className="bg-green-50 p-2 rounded border border-green-100">
            <p className="text-green-600 mb-1">Recomendado</p>
            <p className="font-bold text-green-700">${recPayment.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <AlertCircle size={12} className={priority === 'high' ? 'text-banorte-red' : 'text-gray-400'} />
          <span>Vence: {dueDate}</span>
        </div>
        <button className="text-banorte-red font-medium hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
          Ver detalles
        </button>
      </div>
    </Card>
  );
}

