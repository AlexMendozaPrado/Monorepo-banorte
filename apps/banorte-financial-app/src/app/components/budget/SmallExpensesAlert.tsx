import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { AlertTriangle, Coffee, ShoppingBag, Smartphone } from 'lucide-react';

export function SmallExpensesAlert() {
  return (
    <Card className="bg-orange-50 border border-orange-100">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-white rounded-full text-status-warning shadow-sm">
          <AlertTriangle size={24} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-banorte-dark mb-1">
            Gastos Hormiga Detectados
          </h3>
          <p className="text-sm text-banorte-gray mb-4">
            Norma ha identificado 3 gastos recurrentes que suman{' '}
            <strong className="text-banorte-dark">$1,250/mes</strong>.
          </p>

          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between bg-white p-2 rounded border border-orange-100">
              <div className="flex items-center gap-2">
                <Coffee size={16} className="text-gray-400" />
                <span className="text-sm font-medium">Cafeterías</span>
              </div>
              <span className="text-sm font-bold text-banorte-red">$450</span>
            </div>
            <div className="flex items-center justify-between bg-white p-2 rounded border border-orange-100">
              <div className="flex items-center gap-2">
                <ShoppingBag size={16} className="text-gray-400" />
                <span className="text-sm font-medium">
                  Tiendas de conveniencia
                </span>
              </div>
              <span className="text-sm font-bold text-banorte-red">$320</span>
            </div>
            <div className="flex items-center justify-between bg-white p-2 rounded border border-orange-100">
              <div className="flex items-center gap-2">
                <Smartphone size={16} className="text-gray-400" />
                <span className="text-sm font-medium">Apps de delivery</span>
              </div>
              <span className="text-sm font-bold text-banorte-red">$480</span>
            </div>
          </div>

          <Button
            size="sm"
            fullWidth
            className="bg-status-warning hover:bg-orange-600 text-white border-none"
          >
            Crear regla de ahorro automático
          </Button>
        </div>
      </div>
    </Card>
  );
}

