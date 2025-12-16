'use client';

import React from 'react';
import { Receipt, TrendingUp } from 'lucide-react';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  merchant?: string;
}

export interface TopExpensesProps {
  transactions?: Transaction[];
  currency?: string;
}

export const TopExpenses: React.FC<TopExpensesProps> = ({
  transactions = [],
  currency = 'MXN',
}) => {
  // Mock data if no transactions provided
  const mockTransactions: Transaction[] = [
    {
      id: '1',
      description: 'Supermercado',
      amount: 1250,
      category: 'Alimentos',
      date: new Date().toISOString(),
      merchant: 'Walmart',
    },
    {
      id: '2',
      description: 'Gasolina',
      amount: 800,
      category: 'Transporte',
      date: new Date(Date.now() - 86400000).toISOString(),
      merchant: 'Pemex',
    },
    {
      id: '3',
      description: 'Restaurante',
      amount: 650,
      category: 'Alimentos',
      date: new Date(Date.now() - 172800000).toISOString(),
      merchant: 'Sanborns',
    },
    {
      id: '4',
      description: 'Streaming',
      amount: 199,
      category: 'Entretenimiento',
      date: new Date(Date.now() - 259200000).toISOString(),
      merchant: 'Netflix',
    },
    {
      id: '5',
      description: 'Farmacia',
      amount: 450,
      category: 'Salud',
      date: new Date(Date.now() - 345600000).toISOString(),
      merchant: 'Farmacias del Ahorro',
    },
  ];

  const displayTransactions = transactions.length > 0 ? transactions : mockTransactions;
  const topTransactions = displayTransactions.slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Alimentos': 'bg-green-100 text-green-800',
      'Transporte': 'bg-blue-100 text-blue-800',
      'Entretenimiento': 'bg-purple-100 text-purple-800',
      'Salud': 'bg-red-100 text-red-800',
      'Servicios': 'bg-yellow-100 text-yellow-800',
      'Hogar': 'bg-orange-100 text-orange-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-card shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Receipt size={20} className="text-banorte-red" />
          <h3 className="text-lg font-bold text-banorte-dark">Gastos Recientes</h3>
        </div>
        <TrendingUp size={18} className="text-banorte-gray" />
      </div>

      <div className="space-y-3">
        {topTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-banorte-dark truncate">
                  {transaction.merchant || transaction.description}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getCategoryColor(transaction.category)}`}>
                  {transaction.category}
                </span>
                <span className="text-xs text-banorte-gray">
                  {formatDate(transaction.date)}
                </span>
              </div>
            </div>
            <div className="text-right ml-3">
              <p className="font-bold text-banorte-dark">
                {formatCurrency(transaction.amount)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 text-sm font-medium text-banorte-red hover:text-red-700 transition-colors text-center py-2 border-t border-gray-100">
        Ver todos los gastos →
      </button>
    </div>
  );
};

