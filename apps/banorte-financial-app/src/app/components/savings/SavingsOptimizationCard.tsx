'use client';

import React from 'react';
import { Card } from '@banorte/ui';
import { Sparkles, TrendingUp, Calendar, Loader2, Info, Target } from 'lucide-react';
import { useSavingsOptimization } from '../../hooks/useSavingsOptimization';

interface SavingsOptimizationCardProps {
  userId?: string;
  monthlyIncome?: number;
  monthlyExpenses?: number;
}

export function SavingsOptimizationCard({
  userId = 'user-demo',
  monthlyIncome = 30000,
  monthlyExpenses = 18000,
}: SavingsOptimizationCardProps) {
  const { optimization, loading, error } = useSavingsOptimization(userId, monthlyIncome, monthlyExpenses);

  if (loading) {
    return (
      <Card className="border-l-4 border-l-banorte-red">
        <div className="flex items-center justify-center p-6">
          <Loader2 size={24} className="animate-spin text-banorte-red" />
          <span className="ml-3 text-banorte-gray">Norma está optimizando tu estrategia...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-50 border border-red-100">
        <div className="flex items-start gap-3 p-4">
          <Info size={20} className="text-red-600 mt-0.5" />
          <div>
            <p className="text-sm text-red-800 font-medium">Error al cargar optimización</p>
            <p className="text-xs text-red-600 mt-1">{error}</p>
          </div>
        </div>
      </Card>
    );
  }

  if (!optimization || optimization.strategies.length === 0) {
    return (
      <Card className="bg-blue-50 border border-blue-100">
        <div className="flex items-start gap-3 p-4">
          <Info size={20} className="text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800 font-medium">Crea tu primera meta</p>
            <p className="text-xs text-blue-600 mt-1">
              {optimization?.overallRecommendation || 'Aún no tienes metas de ahorro. Crea tu primera meta para recibir recomendaciones personalizadas de Norma.'}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const totalSavings = optimization.totalMonthlySavings.amount;
  const availableForSavings = monthlyIncome - monthlyExpenses;

  return (
    <Card className="border-l-4 border-l-banorte-red">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-red-50 text-banorte-red rounded-full flex-shrink-0">
          <Sparkles size={24} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-banorte-dark mb-1">Optimización de Norma</h3>
          <p className="text-sm text-banorte-gray mb-4">
            He analizado tus metas y diseñé la mejor estrategia para alcanzarlas.
          </p>

          {/* Overall Recommendation */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4">
            <p className="text-sm text-blue-800">
              <strong className="text-blue-900">Análisis:</strong> {optimization.overallRecommendation}
            </p>
          </div>

          {/* Total Monthly Savings */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-700 font-medium mb-1">Ahorro Mensual Recomendado</p>
                <p className="text-2xl font-bold text-green-900">
                  ${totalSavings.toLocaleString('es-MX')}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {((totalSavings / availableForSavings) * 100).toFixed(0)}% de tu ingreso disponible
                </p>
              </div>
              <TrendingUp size={32} className="text-green-600" />
            </div>
          </div>

          {/* Strategies by Goal */}
          <div className="space-y-3 mb-4">
            <p className="text-sm font-bold text-banorte-dark">Distribución por Meta:</p>
            {optimization.strategies.map((strategy, idx) => {
              const completionDate = new Date(strategy.estimatedCompletionDate);
              const monthsRemaining = Math.round(
                (completionDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30)
              );

              return (
                <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Target size={16} className="text-banorte-red flex-shrink-0" />
                      <div>
                        <p className="font-bold text-sm text-banorte-dark">{strategy.goalName}</p>
                        <p className="text-xs text-banorte-gray mt-0.5">{strategy.reasoning}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Contribución</p>
                        <p className="font-bold text-banorte-dark">
                          ${strategy.recommendedMonthlyContribution.amount.toLocaleString('es-MX')}/mes
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Tiempo estimado</p>
                        <p className="font-bold text-blue-600 flex items-center gap-1">
                          <Calendar size={14} />
                          {monthsRemaining} meses
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Alternative Strategies */}
                  {strategy.alternativeStrategies && strategy.alternativeStrategies.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Opciones alternativas:</p>
                      {strategy.alternativeStrategies.map((alt, altIdx) => (
                        <p key={altIdx} className="text-xs text-banorte-gray">
                          • {alt.name}: ${alt.monthlyContribution.amount.toLocaleString('es-MX')}/mes → {alt.completionMonths} meses
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-xs text-banorte-gray bg-gray-50 p-2 rounded border border-gray-100">
            💡 <strong>Tip:</strong> Automatiza tus ahorros con reglas inteligentes para mayor disciplina y éxito.
          </div>
        </div>
      </div>
    </Card>
  );
}
