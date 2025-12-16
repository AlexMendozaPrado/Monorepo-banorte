import React from 'react';
import { Card } from '../ui/Card';
import { Bell, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

export function PaymentAlerts() {
  const alerts = [
    {
      type: 'urgent',
      title: 'BBVA Personal',
      message: 'Vence en 2 días',
      amount: '$850',
      icon: <AlertTriangle size={16} />,
      color: 'bg-red-50 border-red-200 text-red-700',
    },
    {
      type: 'warning',
      title: 'Banorte Oro',
      message: 'Vence en 7 días',
      amount: '$450',
      icon: <Clock size={16} />,
      color: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    },
    {
      type: 'ok',
      title: 'Santander Auto',
      message: 'Vence en 12 días',
      amount: '$1,800',
      icon: <CheckCircle size={16} />,
      color: 'bg-green-50 border-green-200 text-green-700',
    },
  ];

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <Bell size={20} className="text-banorte-red" />
        <h3 className="font-bold text-banorte-dark">Próximos Pagos</h3>
      </div>

      <div className="space-y-2">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-3 rounded-lg border ${alert.color}`}
          >
            <div className="flex items-center gap-3">
              {alert.icon}
              <div>
                <p className="font-medium text-sm">{alert.title}</p>
                <p className="text-xs opacity-80">{alert.message}</p>
              </div>
            </div>
            <span className="font-bold text-sm">{alert.amount}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

