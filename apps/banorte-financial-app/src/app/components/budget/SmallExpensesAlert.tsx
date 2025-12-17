import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { AlertTriangle, Coffee, ShoppingBag, Smartphone, Loader2 } from 'lucide-react';
import { useAntExpenses } from '../../hooks/useAntExpenses';

interface SmallExpensesAlertProps {
  userId: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  'Cafeterías': <Coffee size={16} className="text-gray-400" />,
  'Coffee Shops': <Coffee size={16} className="text-gray-400" />,
  'Café': <Coffee size={16} className="text-gray-400" />,
  'Tiendas de conveniencia': <ShoppingBag size={16} className="text-gray-400" />,
  'Convenience Stores': <ShoppingBag size={16} className="text-gray-400" />,
  'Apps de delivery': <Smartphone size={16} className="text-gray-400" />,
  'Food Delivery': <Smartphone size={16} className="text-gray-400" />,
  'Delivery': <Smartphone size={16} className="text-gray-400" />,
};

const getIconForCategory = (category: string): React.ReactNode => {
  return categoryIcons[category] || <AlertTriangle size={16} className="text-gray-400" />;
};

export function SmallExpensesAlert({ userId }: SmallExpensesAlertProps) {
  const { analysis, loading, error } = useAntExpenses(userId, 1);

  if (loading) {
    return (
      <Card className="bg-orange-50 border border-orange-100">
        <div className="flex items-center justify-center p-6">
          <Loader2 size={24} className="animate-spin text-status-warning" />
          <span className="ml-2 text-sm text-banorte-gray">Analizando gastos hormiga...</span>
        </div>
      </Card>
    );
  }

  if (error || !analysis || analysis.detections.length === 0) {
    return null;
  }

  const totalMonthly = analysis.totalMonthlyImpact.amount;
  const detections = analysis.detections.slice(0, 3); // Show top 3

  return (
    <Card className="bg-orange-50 border border-orange-100">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-white rounded-full text-status-warning shadow-sm">
          <AlertTriangle size={24} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-banorte-dark mb-1">
            Gastos Hormiga Detectados
          </h3>
          <p className="text-sm text-banorte-gray mb-4">
            Norma ha identificado {analysis.detections.length} gasto{analysis.detections.length !== 1 ? 's' : ''} recurrente{analysis.detections.length !== 1 ? 's' : ''} que suma{analysis.detections.length !== 1 ? 'n' : ''}{' '}
            <strong className="text-banorte-dark">
              ${totalMonthly.toLocaleString('es-MX')}/mes
            </strong>.
          </p>

          <div className="space-y-2 mb-4">
            {detections.map((detection, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-white p-2 rounded border border-orange-100"
              >
                <div className="flex items-center gap-2">
                  {getIconForCategory(detection.category)}
                  <span className="text-sm font-medium">{detection.category}</span>
                </div>
                <span className="text-sm font-bold text-banorte-red">
                  ${detection.monthlyImpact.amount.toLocaleString('es-MX')}
                </span>
              </div>
            ))}
          </div>

          {analysis.overallRecommendation && (
            <div className="bg-white p-3 rounded border border-orange-100 mb-4">
              <p className="text-xs text-banorte-gray">
                <strong className="text-banorte-dark">Recomendación de Norma:</strong>{' '}
                {analysis.overallRecommendation}
              </p>
            </div>
          )}

          <Button
            size="sm"
            fullWidth
            className="bg-status-warning hover:bg-orange-600 text-white border-none"
          >
            Crear regla de ahorro automático
          </Button>
        </div>
      </div>
    </Card>
  );
}

