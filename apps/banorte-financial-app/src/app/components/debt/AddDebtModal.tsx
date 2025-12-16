'use client';

import React, { useState } from 'react';
import { X, CreditCard, Car, Briefcase, ShoppingBag, Plus } from 'lucide-react';

interface AddDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddDebtModal({ isOpen, onClose }: AddDebtModalProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const debtTypes = [
    { id: 'credit', label: 'Tarjeta de Crédito', icon: <CreditCard size={24} /> },
    { id: 'auto', label: 'Préstamo Auto', icon: <Car size={24} /> },
    { id: 'personal', label: 'Crédito Personal', icon: <Briefcase size={24} /> },
    { id: 'store', label: 'Tarjeta Departamental', icon: <ShoppingBag size={24} /> },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-banorte-dark">Agregar Deuda</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-500 mb-4">Selecciona el tipo de deuda</p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {debtTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  selectedType === type.id
                    ? 'border-banorte-red bg-red-50 text-banorte-red'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                {type.icon}
                <span className="text-sm font-medium">{type.label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-banorte-dark mb-1">Nombre del acreedor</label>
              <input
                type="text"
                placeholder="Ej: Banorte, Liverpool, BBVA..."
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-banorte-red focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-banorte-dark mb-1">Saldo actual</label>
                <input
                  type="number"
                  placeholder="$0.00"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-banorte-red focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-banorte-dark mb-1">Tasa anual (%)</label>
                <input
                  type="number"
                  placeholder="0%"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-banorte-red focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button className="flex-1 py-3 px-4 bg-banorte-red text-white rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
            <Plus size={18} />
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}

