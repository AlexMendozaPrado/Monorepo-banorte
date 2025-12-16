import React from 'react';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { Gift, Star, Tag } from 'lucide-react';

export function BenefitsSection() {
  return (
    <Card className="mb-6">
      <div className="flex items-center gap-2 mb-6">
        <Gift className="text-banorte-red" size={20} />
        <h3 className="font-bold text-banorte-dark">Beneficios y Recompensas</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Points */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Star className="text-yellow-500" size={16} />
              <span className="font-medium text-sm">Puntos Banorte</span>
            </div>
            <span className="font-bold text-banorte-dark">12,450 pts</span>
          </div>
          <ProgressBar value={12450} max={20000} height="sm" color="warning" />
          <p className="text-xs text-gray-500">Te faltan 7,550 pts para un boleto de avión nacional.</p>
        </div>

        {/* Cashback */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Tag className="text-green-500" size={16} />
              <span className="font-medium text-sm">Cashback Acumulado</span>
            </div>
            <span className="font-bold text-banorte-dark">$845.00</span>
          </div>
          <ProgressBar value={845} max={1000} height="sm" color="success" />
          <p className="text-xs text-gray-500">Disponible para usar en tu próxima compra.</p>
        </div>

        {/* Active Benefits */}
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
          <p className="text-xs font-bold text-banorte-gray uppercase mb-2">Beneficios Activos</p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span>5% Cashback en Gasolina</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span>3% en Supermercados</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span>Acceso a Salas VIP (2 pases)</span>
            </li>
          </ul>
        </div>
      </div>
    </Card>
  );
}

