import React from 'react';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';

interface BudgetSummaryProps {
  income: number;
  spent: number;
  available: number;
}

export function BudgetSummary({
  income,
  spent,
  available,
}: BudgetSummaryProps) {
  const percentage = Math.round((spent / income) * 100);

  const getStatusColor = (pct: number): 'primary' | 'success' | 'warning' | 'alert' | 'secondary' => {
    if (pct < 70) return 'success';
    if (pct < 90) return 'warning';
    return 'alert';
  };

  return (
    <Card className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-sm text-banorte-gray mb-1">Ingreso Esperado</p>
          <p className="text-2xl font-bold text-banorte-dark">
            ${income.toLocaleString()}
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-sm text-banorte-gray mb-1">Gastado</p>
          <p className="text-2xl font-bold text-banorte-dark">
            ${spent.toLocaleString()}
          </p>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-600 mb-1">Disponible</p>
          <p className="text-2xl font-bold text-blue-700">
            ${available.toLocaleString()}
          </p>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm font-medium text-banorte-dark">
            Progreso General
          </span>
          <span
            className={`text-sm font-bold ${percentage > 90 ? 'text-status-alert' : 'text-banorte-gray'}`}
          >
            {percentage}% utilizado
          </span>
        </div>
        <ProgressBar
          value={spent}
          max={income}
          color={getStatusColor(percentage)}
          height="lg"
        />
      </div>
    </Card>
  );
}

