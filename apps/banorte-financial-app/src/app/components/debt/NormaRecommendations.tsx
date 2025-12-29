'use client';

import React from 'react';
import { Card } from '@banorte/ui';
import { Sparkles, Scissors, ArrowRight, Loader2 } from 'lucide-react';
import { useAntExpenses } from '../../hooks/useAntExpenses';
import { useDebts } from '../../hooks/useDebts';

interface NormaRecommendationsProps {
  userId?: string;
}

export function NormaRecommendations({ userId = 'user-demo' }: NormaRecommendationsProps) {
  const { analysis, loading: antLoading } = useAntExpenses(userId, 1);
  const { debts, isLoading: debtsLoading } = useDebts(userId);

  if (antLoading || debtsLoading) {
    return (
      <Card className="mb-6 border-l-4 border-l-banorte-red">
        <div className="flex items-center justify-center p-6">
          <Loader2 size={20} className="animate-spin text-banorte-red" />
          <span className="ml-2 text-sm text-banorte-gray">Analizando oportunidades...</span>
        </div>
      </Card>
    );
  }

  if (!analysis || analysis.detections.length === 0) {
    return null;
  }

  // Find highest interest debt
  const highestInterestDebt = debts.reduce((max, debt) =>
    debt.interestRate > (max?.interestRate || 0) ? debt : max
  , debts[0]);

  const totalPotentialSavings = analysis.totalMonthlyImpact.amount;
  const topDetections = analysis.detections.slice(0, 2); // Show top 2 opportunities

  return (
    <Card className="mb-6 border-l-4 border-l-banorte-red">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-red-50 text-banorte-red rounded-full">
          <Sparkles size={24} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-banorte-dark mb-1">Recomendación de Norma</h3>
          <p className="text-sm text-banorte-gray mb-4">
            He analizado tus gastos y encontré una oportunidad para liberar{' '}
            <strong className="text-banorte-dark">
              ${totalPotentialSavings.toLocaleString('es-MX')} mensuales
            </strong>
            {highestInterestDebt && (
              <> que podrías destinar a tu deuda de {highestInterestDebt.name} ({highestInterestDebt.interestRate}% tasa).</>
            )}
          </p>

          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4">
            {topDetections.map((detection, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between ${idx > 0 ? 'mt-2' : ''}`}
              >
                <div className="flex items-center gap-2 text-sm">
                  <Scissors size={16} className="text-gray-400" />
                  <span>{detection.category}</span>
                </div>
                <span className="font-bold text-green-600">
                  +${detection.monthlyImpact.amount.toLocaleString('es-MX')}
                </span>
              </div>
            ))}
          </div>

          {analysis.overallRecommendation && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4">
              <p className="text-xs text-blue-600">
                💡 <strong>Tip:</strong> {analysis.overallRecommendation}
              </p>
            </div>
          )}

          <button className="text-sm font-bold text-banorte-red flex items-center gap-1 hover:underline">
            Ver análisis completo <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </Card>
  );
}

