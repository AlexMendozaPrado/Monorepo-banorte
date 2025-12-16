import React from 'react';
import { Card } from '../ui/Card';
import { TrendingDown, Calendar, DollarSign, ArrowDown } from 'lucide-react';

export function DebtDashboard() {
  return (
    <Card className="bg-gradient-to-br from-gray-50 to-white border-gray-100 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-4 flex-1">
          <div className="flex items-center gap-2 text-banorte-gray">
            <DollarSign size={20} />
            <h2 className="text-lg font-bold font-display">Total Adeudado</h2>
          </div>

          <div>
            <p className="text-4xl font-bold text-banorte-dark mb-1">$85,000</p>
            <div className="flex items-center gap-2 text-sm">
              <span className="flex items-center text-status-success font-bold bg-green-50 px-2 py-0.5 rounded">
                <ArrowDown size={14} className="mr-1" />
                -$15,000
              </span>
              <span className="text-gray-500">desde que iniciaste</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">Fecha libre de deudas</p>
              <div className="flex items-center gap-2 font-bold text-banorte-dark">
                <Calendar size={16} className="text-banorte-red" />
                Marzo 2027
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">Ahorro proyectado</p>
              <div className="flex items-center gap-2 font-bold text-status-success">
                <TrendingDown size={16} />
                $12,450
              </div>
            </div>
          </div>
        </div>

        <div className="w-full md:w-64 space-y-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-500">Progreso general</span>
            <span className="font-bold text-banorte-dark">15% pagado</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-green-500 h-3 rounded-full w-[15%]" />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-gray-50 rounded border border-gray-100">
              <p className="text-gray-500">Deudas activas</p>
              <p className="font-bold text-banorte-dark text-lg">4</p>
            </div>
            <div className="p-2 bg-gray-50 rounded border border-gray-100">
              <p className="text-gray-500">Tasa promedio</p>
              <p className="font-bold text-orange-600 text-lg">29.2%</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

