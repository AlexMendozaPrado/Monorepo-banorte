'use client';

import React, { useState } from 'react';
import { Modal, Button } from '@banorte/ui';
import { CreditCard, Download, Calendar, DollarSign } from 'lucide-react';

interface DebtDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DebtDetailModal({ isOpen, onClose }: DebtDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'amortization' | 'history' | 'docs'>('info');

  const amortizationData = [
    { month: 'Nov 2024', payment: 1200, capital: 765, interest: 435, balance: 11685 },
    { month: 'Dic 2024', payment: 1200, capital: 792, interest: 408, balance: 10893 },
    { month: 'Ene 2025', payment: 1200, capital: 820, interest: 380, balance: 10073 },
    { month: 'Feb 2025', payment: 1200, capital: 849, interest: 351, balance: 9224 },
    { month: 'Mar 2025', payment: 1200, capital: 878, interest: 322, balance: 8346 },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalle de Deuda: Banorte Oro" maxWidth="lg">
      <div className="flex gap-4 border-b border-gray-100 mb-6 overflow-x-auto">
        {['info', 'amortization', 'history', 'docs'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`
              pb-3 px-2 text-sm font-medium transition-colors whitespace-nowrap
              ${activeTab === tab ? 'text-banorte-red border-b-2 border-banorte-red' : 'text-gray-500 hover:text-banorte-dark'}
            `}
          >
            {tab === 'info' ? 'Información' : tab === 'amortization' ? 'Amortización' : tab === 'history' ? 'Historial' : 'Documentos'}
          </button>
        ))}
      </div>

      {activeTab === 'info' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Monto Actual</p>
              <p className="text-2xl font-bold text-banorte-dark">$12,450</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-xs text-red-600 mb-1">Tasa de Interés</p>
              <p className="text-2xl font-bold text-banorte-red">42% APR</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-4 text-sm">
            <div>
              <p className="text-gray-500">Acreedor</p>
              <p className="font-medium text-banorte-dark">Banorte</p>
            </div>
            <div>
              <p className="text-gray-500">Tipo</p>
              <p className="font-medium text-banorte-dark">Tarjeta de Crédito</p>
            </div>
            <div>
              <p className="text-gray-500">Pago Mensual</p>
              <p className="font-medium text-banorte-dark">$1,200</p>
            </div>
            <div>
              <p className="text-gray-500">Próximo Pago</p>
              <p className="font-medium text-banorte-dark">15 Nov 2024</p>
            </div>
            <div>
              <p className="text-gray-500">Meses Restantes</p>
              <p className="font-medium text-banorte-dark">14 meses</p>
            </div>
            <div>
              <p className="text-gray-500">Fecha Inicio</p>
              <p className="font-medium text-banorte-dark">Enero 2023</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'amortization' && (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3">Mes</th>
                  <th className="px-4 py-3">Pago</th>
                  <th className="px-4 py-3">Capital</th>
                  <th className="px-4 py-3">Interés</th>
                  <th className="px-4 py-3">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {amortizationData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-banorte-dark">{row.month}</td>
                    <td className="px-4 py-3">${row.payment}</td>
                    <td className="px-4 py-3 text-green-600">${row.capital}</td>
                    <td className="px-4 py-3 text-orange-600">${row.interest}</td>
                    <td className="px-4 py-3 font-bold">${row.balance.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button variant="outline" fullWidth size="sm">
            <Download size={16} className="mr-2" />
            Descargar tabla completa
          </Button>
        </div>
      )}

      <div className="flex gap-3 pt-6 mt-6 border-t border-gray-100">
        <Button variant="secondary" fullWidth onClick={onClose}>
          Cerrar
        </Button>
        <Button fullWidth>Hacer Pago Extra</Button>
      </div>
    </Modal>
  );
}

