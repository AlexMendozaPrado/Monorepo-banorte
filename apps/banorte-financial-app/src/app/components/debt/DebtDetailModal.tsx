'use client';

import React, { useState } from 'react';
import { X, CreditCard, Calendar, TrendingDown, FileText, History, Info } from 'lucide-react';

interface DebtDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DebtDetailModal({ isOpen, onClose }: DebtDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'amortization' | 'history' | 'docs'>('info');

  if (!isOpen) return null;

  const tabs = [
    { id: 'info', label: 'Información', icon: <Info size={16} /> },
    { id: 'amortization', label: 'Amortización', icon: <TrendingDown size={16} /> },
    { id: 'history', label: 'Historial', icon: <History size={16} /> },
    { id: 'docs', label: 'Documentos', icon: <FileText size={16} /> },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-banorte-red to-red-700 text-white p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <CreditCard size={28} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Banorte Oro</h2>
                <p className="text-white/80 text-sm">Tarjeta de Crédito</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 p-3 rounded-lg">
              <p className="text-white/70 text-xs">Saldo Actual</p>
              <p className="text-xl font-bold">$12,450</p>
            </div>
            <div className="bg-white/10 p-3 rounded-lg">
              <p className="text-white/70 text-xs">Tasa Anual</p>
              <p className="text-xl font-bold">42%</p>
            </div>
            <div className="bg-white/10 p-3 rounded-lg">
              <p className="text-white/70 text-xs">Próximo Pago</p>
              <p className="text-xl font-bold">7 días</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-banorte-red border-b-2 border-banorte-red bg-red-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[400px]">
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Límite de Crédito</p>
                  <p className="font-bold text-banorte-dark">$20,000</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Disponible</p>
                  <p className="font-bold text-green-600">$7,550</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Pago Mínimo</p>
                  <p className="font-bold text-banorte-dark">$450</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Fecha de Corte</p>
                  <p className="font-bold text-banorte-dark">Día 15</p>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={16} className="text-yellow-600" />
                  <p className="font-bold text-yellow-800">Próximo Vencimiento</p>
                </div>
                <p className="text-sm text-yellow-700">
                  Tu pago vence el <strong>22 de Noviembre</strong>. Paga al menos $450 para evitar cargos.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'amortization' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Tabla de amortización proyectada con pago recomendado de $800/mes</p>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-2 text-left">Mes</th>
                    <th className="p-2 text-right">Pago</th>
                    <th className="p-2 text-right">Capital</th>
                    <th className="p-2 text-right">Interés</th>
                    <th className="p-2 text-right">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map((month) => (
                    <tr key={month} className="border-b border-gray-100">
                      <td className="p-2">{month}</td>
                      <td className="p-2 text-right">$800</td>
                      <td className="p-2 text-right text-green-600">$365</td>
                      <td className="p-2 text-right text-red-500">$435</td>
                      <td className="p-2 text-right font-medium">${(12450 - month * 365).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              {[
                { date: '15 Nov 2024', amount: 450, status: 'Pagado' },
                { date: '15 Oct 2024', amount: 450, status: 'Pagado' },
                { date: '15 Sep 2024', amount: 800, status: 'Pagado' },
              ].map((payment, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-banorte-dark">{payment.date}</p>
                    <p className="text-xs text-gray-500">{payment.status}</p>
                  </div>
                  <p className="font-bold text-green-600">${payment.amount}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'docs' && (
            <div className="text-center py-8 text-gray-500">
              <FileText size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No hay documentos disponibles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

