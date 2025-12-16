'use client';

import React from 'react';
import { Edit2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ProgressBar } from '../ui/ProgressBar';

export interface CategoryCardProps {
  id: string;
  name: string;
  icon: React.ReactNode;
  spent: number;
  budget: number;
  trend?: 'up' | 'down' | 'stable';
  currency?: string;
  onEdit: (id: string) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  id,
  name,
  icon,
  spent,
  budget,
  trend = 'stable',
  currency = 'MXN',
  onEdit,
}) => {
  const percentageUsed = budget > 0 ? (spent / budget) * 100 : 0;
  const isOverBudget = spent > budget;
  const isNearLimit = percentageUsed >= 80 && percentageUsed < 100;
  const available = budget - spent;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getProgressColor = (): 'primary' | 'success' | 'warning' | 'alert' => {
    if (isOverBudget) return 'alert';
    if (isNearLimit) return 'warning';
    return 'success';
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={16} className="text-status-alert" />;
      case 'down':
        return <TrendingDown size={16} className="text-status-success" />;
      default:
        return <Minus size={16} className="text-banorte-gray" />;
    }
  };

  return (
    <div className="bg-white rounded-card shadow-card p-5 hover:shadow-hover transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{icon}</div>
          <div>
            <h3 className="text-lg font-semibold text-banorte-dark">{name}</h3>
            <div className="flex items-center gap-1 mt-1">
              {getTrendIcon()}
              <span className="text-xs text-banorte-gray">
                {trend === 'up' ? 'Aumentó' : trend === 'down' ? 'Disminuyó' : 'Sin cambios'}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => onEdit(id)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label={`Editar ${name}`}
        >
          <Edit2 size={18} className="text-banorte-gray" />
        </button>
      </div>

      <div className="space-y-3">
        <ProgressBar
          value={spent}
          max={budget}
          color={getProgressColor()}
          size="md"
          showPercentage={true}
        />

        <div className="flex justify-between items-center text-sm">
          <div>
            <p className="text-banorte-gray">Gastado</p>
            <p className="font-semibold text-banorte-dark">{formatCurrency(spent)}</p>
          </div>
          <div className="text-right">
            <p className="text-banorte-gray">Presupuesto</p>
            <p className="font-semibold text-banorte-dark">{formatCurrency(budget)}</p>
          </div>
        </div>

        {isOverBudget && (
          <div className="bg-status-alert bg-opacity-10 border border-status-alert rounded-lg p-2">
            <p className="text-xs text-status-alert font-medium">
              ⚠️ Excediste el presupuesto por {formatCurrency(Math.abs(available))}
            </p>
          </div>
        )}

        {isNearLimit && !isOverBudget && (
          <div className="bg-status-warning bg-opacity-10 border border-status-warning rounded-lg p-2">
            <p className="text-xs text-status-warning font-medium">
              ⚡ Te quedan {formatCurrency(available)} ({(100 - percentageUsed).toFixed(0)}%)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

