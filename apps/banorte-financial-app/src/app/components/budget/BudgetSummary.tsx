'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

export interface BudgetSummaryProps {
  income: number;
  spent: number;
  available: number;
  currency?: string;
}

export const BudgetSummary: React.FC<BudgetSummaryProps> = ({
  income,
  spent,
  available,
  currency = 'MXN',
}) => {
  const percentageSpent = income > 0 ? (spent / income) * 100 : 0;
  const isOverBudget = spent > income;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Income Card */}
      <div className="bg-white rounded-card shadow-card p-6 border-l-4 border-status-success">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-banorte-gray">Ingresos</span>
          <TrendingUp size={20} className="text-status-success" />
        </div>
        <p className="text-3xl font-bold text-banorte-dark">{formatCurrency(income)}</p>
        <p className="text-xs text-banorte-gray mt-1">Total del mes</p>
      </div>

      {/* Spent Card */}
      <div className={`bg-white rounded-card shadow-card p-6 border-l-4 ${isOverBudget ? 'border-status-alert' : 'border-status-warning'}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-banorte-gray">Gastado</span>
          <TrendingDown size={20} className={isOverBudget ? 'text-status-alert' : 'text-status-warning'} />
        </div>
        <p className={`text-3xl font-bold ${isOverBudget ? 'text-status-alert' : 'text-banorte-dark'}`}>
          {formatCurrency(spent)}
        </p>
        <p className="text-xs text-banorte-gray mt-1">
          {percentageSpent.toFixed(1)}% del presupuesto
        </p>
      </div>

      {/* Available Card */}
      <div className={`bg-white rounded-card shadow-card p-6 border-l-4 ${available < 0 ? 'border-status-alert' : 'border-banorte-red'}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-banorte-gray">Disponible</span>
          <Wallet size={20} className={available < 0 ? 'text-status-alert' : 'text-banorte-red'} />
        </div>
        <p className={`text-3xl font-bold ${available < 0 ? 'text-status-alert' : 'text-banorte-dark'}`}>
          {formatCurrency(available)}
        </p>
        <p className="text-xs text-banorte-gray mt-1">
          {available < 0 ? 'Sobre presupuesto' : 'Para gastar'}
        </p>
      </div>
    </div>
  );
};

