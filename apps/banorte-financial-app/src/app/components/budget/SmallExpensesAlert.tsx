'use client';

import React from 'react';
import { AlertTriangle, Coffee, ShoppingBag, Smartphone } from 'lucide-react';
import { useAntExpenses } from '../../hooks/useAntExpenses';

export interface SmallExpensesAlertProps {
  userId?: string;
}

export const SmallExpensesAlert: React.FC<SmallExpensesAlertProps> = ({ userId = 'user-demo' }) => {
  const { analysis, loading } = useAntExpenses(userId, 1);

  if (loading || !analysis || analysis.detections.length === 0) {
    return null;
  }

  const topDetection = analysis.detections[0];
  const totalSavings = analysis.potentialMonthlySavings.amount;

  const getCategoryIcon = (category: string) => {
    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes('café') || lowerCategory.includes('cafetería')) {
      return <Coffee size={20} className="text-status-warning" />;
    }
    if (lowerCategory.includes('app') || lowerCategory.includes('delivery')) {
      return <Smartphone size={20} className="text-status-warning" />;
    }
    return <ShoppingBag size={20} className="text-status-warning" />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-gradient-to-br from-status-warning/10 to-status-warning/5 border border-status-warning rounded-card p-5 shadow-card">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-status-warning/20 rounded-lg">
          <AlertTriangle size={24} className="text-status-warning" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-banorte-dark mb-1">
            Gastos Hormiga Detectados
          </h3>
          <p className="text-sm text-banorte-gray">
            Identificamos {analysis.detections.length} patrón{analysis.detections.length > 1 ? 'es' : ''} de gastos pequeños recurrentes
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Top Detection */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            {getCategoryIcon(topDetection.category)}
            <span className="font-semibold text-banorte-dark">{topDetection.category}</span>
          </div>
          <p className="text-sm text-banorte-gray mb-2">{topDetection.description}</p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-banorte-gray">Impacto mensual:</span>
            <span className="font-bold text-status-warning">
              {formatCurrency(topDetection.monthlyImpact.amount)}
            </span>
          </div>
        </div>

        {/* Savings Potential */}
        <div className="bg-status-success/10 border border-status-success rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-banorte-gray mb-1">Ahorro potencial mensual</p>
              <p className="text-2xl font-bold text-status-success">
                {formatCurrency(totalSavings)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-banorte-gray mb-1">Ahorro anual</p>
              <p className="text-lg font-semibold text-status-success">
                {formatCurrency(totalSavings * 12)}
              </p>
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs font-medium text-blue-900">
            💡 {topDetection.recommendation}
          </p>
        </div>

        {/* View Details Link */}
        <button className="w-full text-sm font-medium text-banorte-red hover:text-red-700 transition-colors text-center py-2">
          Ver análisis completo →
        </button>
      </div>
    </div>
  );
};

