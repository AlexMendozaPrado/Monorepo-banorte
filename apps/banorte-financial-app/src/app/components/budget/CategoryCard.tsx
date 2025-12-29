import React from 'react';
import { Card, ProgressBar } from '@banorte/ui';
import { Edit2, TrendingUp, AlertCircle } from 'lucide-react';

interface CategoryCardProps {
  id: string;
  name: string;
  icon: React.ReactNode;
  spent: number;
  budget: number;
  trend: 'up' | 'down' | 'stable';
  onEdit: (id: string) => void;
}

export function CategoryCard({
  id,
  name,
  icon,
  spent,
  budget,
  trend,
  onEdit,
}: CategoryCardProps) {
  const percentage = Math.round((spent / budget) * 100);
  const isOverBudget = percentage > 100;

  const getStatusColor = (pct: number): 'primary' | 'success' | 'warning' | 'alert' | 'secondary' => {
    if (pct < 70) return 'success';
    if (pct < 90) return 'warning';
    return 'alert';
  };

  return (
    <Card hoverEffect className="relative group">
      <button
        onClick={() => onEdit(id)}
        className="absolute top-3 right-3 p-2 text-gray-300 hover:text-banorte-red hover:bg-gray-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
      >
        <Edit2 size={16} />
      </button>

      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-banorte-gray">
          {icon}
        </div>
        <div>
          <h3 className="font-bold text-banorte-dark">{name}</h3>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            {trend === 'up' && (
              <TrendingUp size={12} className="text-status-alert" />
            )}
            <span>+12% vs mes anterior</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-end">
          <span className="text-lg font-bold text-banorte-dark">
            ${spent.toLocaleString()}
          </span>
          <span className="text-xs text-gray-500">
            de ${budget.toLocaleString()}
          </span>
        </div>

        <ProgressBar
          value={spent}
          max={budget}
          color={getStatusColor(percentage)}
          height="md"
        />

        {isOverBudget && (
          <div className="flex items-center gap-1 text-xs text-status-alert font-medium bg-orange-50 p-1.5 rounded">
            <AlertCircle size={12} />
            <span>Excedido por ${(spent - budget).toLocaleString()}</span>
          </div>
        )}
      </div>
    </Card>
  );
}

