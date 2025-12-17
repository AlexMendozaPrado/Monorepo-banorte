import React from 'react';
import { Card } from '../ui/Card';
import { Search, Filter, AlertTriangle } from 'lucide-react';

export function TransactionList() {
  const transactions = [
    { id: 1, name: 'Uber Eats', date: 'Hoy, 2:30 PM', amount: 245.0, category: 'Comida', icon: '🍔' },
    { id: 2, name: 'Netflix', date: 'Ayer', amount: 199.0, category: 'Suscripciones', icon: '🎬' },
    { id: 3, name: 'Gasolinera Shell', date: '14 Nov', amount: 850.0, category: 'Transporte', icon: '⛽' },
    { id: 4, name: 'Walmart Supercenter', date: '12 Nov', amount: 2450.0, category: 'Supermercado', icon: '🛒' },
    { id: 5, name: 'Amazon MX', date: '10 Nov', amount: 1299.0, category: 'Compras', icon: '📦' },
  ];

  return (
    <Card>
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <h3 className="font-bold text-banorte-dark">Historial de Transacciones</h3>

        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Buscar cargos..."
              className="w-full h-9 pl-9 pr-4 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:ring-1 focus:ring-banorte-red focus:outline-none"
            />
          </div>
          <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="space-y-1">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                {tx.icon}
              </div>
              <div>
                <p className="font-medium text-sm text-banorte-dark">{tx.name}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{tx.date}</span>
                  <span>•</span>
                  <span>{tx.category}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-sm text-banorte-dark">-${tx.amount.toFixed(2)}</p>
              <button className="text-[10px] text-banorte-red opacity-0 group-hover:opacity-100 transition-opacity hover:underline flex items-center justify-end gap-1 mt-1">
                <AlertTriangle size={10} />
                Disputar cargo
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-center">
        <button className="text-sm text-banorte-red font-medium hover:underline">
          Ver todos los movimientos
        </button>
      </div>
    </Card>
  );
}

