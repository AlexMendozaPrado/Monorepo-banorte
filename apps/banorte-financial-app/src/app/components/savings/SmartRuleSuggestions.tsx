'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Sparkles, Zap, Percent, DollarSign, Gift, Loader2, Info, Plus } from 'lucide-react';
import { useSavingsOptimization } from '../../hooks/useSavingsOptimization';

interface SmartRuleSuggestionsProps {
  userId?: string;
  monthlyIncome?: number;
  monthlyExpenses?: number;
  onCreateRule?: (ruleType: string, ruleName: string, description: string) => void;
}

const getRuleIcon = (type: string) => {
  switch (type.toUpperCase()) {
    case 'ROUNDUP':
      return <Zap size={20} />;
    case 'PERCENTAGE':
      return <Percent size={20} />;
    case 'FIXED':
      return <DollarSign size={20} />;
    case 'WINDFALL':
      return <Gift size={20} />;
    default:
      return <Sparkles size={20} />;
  }
};

const getRuleColor = (type: string) => {
  switch (type.toUpperCase()) {
    case 'ROUNDUP':
      return 'bg-blue-100 text-blue-600';
    case 'PERCENTAGE':
      return 'bg-purple-100 text-purple-600';
    case 'FIXED':
      return 'bg-green-100 text-green-600';
    case 'WINDFALL':
      return 'bg-orange-100 text-orange-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

const getRuleTypeLabel = (type: string): string => {
  switch (type.toUpperCase()) {
    case 'ROUNDUP':
      return 'Redondeo';
    case 'PERCENTAGE':
      return 'Porcentaje';
    case 'FIXED':
      return 'Fijo';
    case 'WINDFALL':
      return 'Ingresos Extra';
    default:
      return type;
  }
};

export function SmartRuleSuggestions({
  userId = 'user-demo',
  monthlyIncome = 30000,
  monthlyExpenses = 18000,
  onCreateRule,
}: SmartRuleSuggestionsProps) {
  const { optimization, loading, error } = useSavingsOptimization(userId, monthlyIncome, monthlyExpenses);

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100">
        <div className="flex items-center justify-center p-6">
          <Loader2 size={24} className="animate-spin text-purple-600" />
          <span className="ml-3 text-banorte-gray">Generando reglas inteligentes...</span>
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
            <p className="text-sm text-red-800 font-medium">Error al cargar sugerencias</p>
            <p className="text-xs text-red-600 mt-1">{error}</p>
          </div>
        </div>
      </Card>
    );
  }

  if (!optimization || !optimization.suggestedRules || optimization.suggestedRules.length === 0) {
    return (
      <Card className="bg-blue-50 border border-blue-100">
        <div className="flex items-start gap-3 p-4">
          <Info size={20} className="text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800 font-medium">Sin sugerencias disponibles</p>
            <p className="text-xs text-blue-600 mt-1">
              Crea metas de ahorro para recibir sugerencias de reglas automáticas personalizadas.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const totalEstimatedSavings = optimization.suggestedRules.reduce(
    (sum, rule) => sum + rule.estimatedMonthlySavings.amount,
    0
  );

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100">
      <div className="flex items-start gap-4 mb-4">
        <div className="p-3 bg-purple-100 text-purple-600 rounded-full flex-shrink-0">
          <Sparkles size={24} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-banorte-dark mb-1 flex items-center gap-2">
            Reglas Automáticas Sugeridas
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
              Por Norma
            </span>
          </h3>
          <p className="text-sm text-banorte-gray">
            Ahorra sin esfuerzo con estas reglas inteligentes diseñadas para ti
          </p>
        </div>
      </div>

      {/* Total Potential Savings */}
      <div className="bg-white p-3 rounded-lg border border-purple-200 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-purple-700 font-medium">Ahorro Potencial Mensual</p>
            <p className="text-xl font-bold text-purple-900">
              ${totalEstimatedSavings.toLocaleString('es-MX')}
            </p>
          </div>
          <Zap size={28} className="text-purple-600" />
        </div>
      </div>

      {/* Rule Suggestions */}
      <div className="space-y-3">
        {optimization.suggestedRules.map((rule, idx) => (
          <div
            key={idx}
            className="bg-white p-4 rounded-lg border border-gray-200 hover:border-purple-300 transition-all hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg ${getRuleColor(rule.type)} flex items-center justify-center flex-shrink-0`}>
                {getRuleIcon(rule.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-sm text-banorte-dark">{rule.name}</h4>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {getRuleTypeLabel(rule.type)}
                      </span>
                    </div>
                    <p className="text-xs text-banorte-gray leading-relaxed">
                      {rule.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1">
                    <p className="text-xs text-gray-500">Ahorro estimado:</p>
                    <p className="font-bold text-green-600">
                      ${rule.estimatedMonthlySavings.amount.toLocaleString('es-MX')}/mes
                    </p>
                    <span className="text-xs text-gray-400">
                      (${(rule.estimatedMonthlySavings.amount * 12).toLocaleString('es-MX')}/año)
                    </span>
                  </div>
                  {onCreateRule && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onCreateRule(rule.type, rule.name, rule.description)}
                      className="text-xs"
                    >
                      <Plus size={14} className="mr-1" />
                      Crear
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-purple-700 bg-purple-50 p-3 rounded border border-purple-100">
        💡 <strong>Tip de Norma:</strong> Automatizar tu ahorro elimina la tentación de gastar y aumenta tus probabilidades de éxito en un 80%.
      </div>
    </Card>
  );
}
