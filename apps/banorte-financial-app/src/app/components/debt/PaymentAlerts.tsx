'use client';

import React from 'react';
import { Card } from '@banorte/ui';
import { Calendar, Bell, AlertCircle } from 'lucide-react';

export function PaymentAlerts() {
  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-banorte-dark flex items-center gap-2">
          <Bell size={18} className="text-banorte-red" />
          Próximos Vencimientos
        </h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
          <div className="bg-white p-2 rounded text-center min-w-[50px]">
            <span className="block text-xs text-red-600 font-bold uppercase">Nov</span>
            <span className="block text-lg font-bold text-banorte-dark">10</span>
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm text-banorte-dark">BBVA Personal</p>
            <p className="text-xs text-red-600 font-medium">Vence en 2 días</p>
          </div>
          <p className="font-bold text-banorte-dark">$850</p>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <div className="bg-white p-2 rounded text-center min-w-[50px]">
            <span className="block text-xs text-gray-500 font-bold uppercase">Nov</span>
            <span className="block text-lg font-bold text-banorte-dark">15</span>
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm text-banorte-dark">Banorte Oro</p>
            <p className="text-xs text-gray-500">Vence en 7 días</p>
          </div>
          <p className="font-bold text-banorte-dark">$450</p>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <div className="bg-white p-2 rounded text-center min-w-[50px]">
            <span className="block text-xs text-gray-500 font-bold uppercase">Nov</span>
            <span className="block text-lg font-bold text-banorte-dark">20</span>
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm text-banorte-dark">Santander Auto</p>
            <p className="text-xs text-gray-500">Vence en 12 días</p>
          </div>
          <p className="font-bold text-banorte-dark">$1,800</p>
        </div>
      </div>
    </Card>
  );
}

