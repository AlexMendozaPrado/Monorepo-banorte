'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Target,
  CreditCard,
  Sparkles,
  X,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  PiggyBank,
  AlertCircle,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import type { InsightDTO, InsightPriority, InsightAction } from '../../hooks/useModuleInsights';

/**
 * Estilos por prioridad
 */
const priorityStyles: Record<
  InsightPriority,
  { bg: string; border: string; icon: string; badge: string; badgeText: string }
> = {
  CRITICAL: {
    bg: 'bg-red-50',
    border: 'border-l-red-600',
    icon: 'text-red-600',
    badge: 'bg-red-600',
    badgeText: 'URGENTE',
  },
  HIGH: {
    bg: 'bg-orange-50',
    border: 'border-l-orange-500',
    icon: 'text-orange-500',
    badge: 'bg-orange-500',
    badgeText: 'IMPORTANTE',
  },
  MEDIUM: {
    bg: 'bg-blue-50',
    border: 'border-l-blue-500',
    icon: 'text-blue-500',
    badge: 'bg-blue-500',
    badgeText: 'SUGERIDO',
  },
  LOW: {
    bg: 'bg-green-50',
    border: 'border-l-green-500',
    icon: 'text-green-500',
    badge: 'bg-green-500',
    badgeText: 'TIP',
  },
};

/**
 * Iconos por tipo de insight
 */
const typeIcons: Record<string, React.ReactNode> = {
  ANT_EXPENSE_PATTERN: <TrendingDown size={18} />,
  BUDGET_OVERSPEND_WARNING: <AlertTriangle size={18} />,
  CATEGORY_OPTIMIZATION: <TrendingUp size={18} />,
  SPENDING_TREND: <TrendingUp size={18} />,
  GOAL_AT_RISK: <Target size={18} />,
  GOAL_CELEBRATION: <Sparkles size={18} />,
  RULE_OPTIMIZATION: <PiggyBank size={18} />,
  SAVINGS_OPPORTUNITY: <DollarSign size={18} />,
  EMERGENCY_FUND_LOW: <AlertCircle size={18} />,
  PAYMENT_DUE: <CreditCard size={18} />,
  CONSOLIDATION_OPPORTUNITY: <CheckCircle size={18} />,
  INTEREST_SAVINGS: <TrendingUp size={18} />,
  DEBT_FREE_MILESTONE: <Sparkles size={18} />,
  HIGH_INTEREST_WARNING: <AlertTriangle size={18} />,
};

interface ProactiveInsightCardProps {
  insight: InsightDTO;
  variant?: 'default' | 'compact' | 'minimal';
  onAction?: (action: InsightAction) => void;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Tarjeta de insight proactivo
 *
 * Muestra un insight con estilos basados en la prioridad,
 * acciones ejecutables y opción de descartar.
 */
export function ProactiveInsightCard({
  insight,
  variant = 'default',
  onAction,
  onDismiss,
  className = '',
}: ProactiveInsightCardProps) {
  const [expanded, setExpanded] = useState(variant !== 'compact');
  const styles = priorityStyles[insight.priority];
  const Icon = typeIcons[insight.type] || <Sparkles size={18} />;

  // Formato del timeframe para el impacto
  const formatTimeframe = (timeframe: string): string => {
    switch (timeframe) {
      case 'monthly':
        return '/mes';
      case 'annual':
        return '/año';
      case 'one-time':
        return '';
      case 'total':
        return ' total';
      default:
        return '';
    }
  };

  // Variante minimal - solo una línea
  if (variant === 'minimal') {
    return (
      <div
        className={`flex items-center gap-3 p-3 rounded-lg ${styles.bg} border-l-4 ${styles.border} ${className}`}
      >
        <div className={styles.icon}>{Icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">
            {insight.title}
          </p>
        </div>
        {insight.impact && (
          <span className="text-sm font-bold text-green-600 whitespace-nowrap">
            ${insight.impact.amount.toLocaleString('es-MX')}
            {formatTimeframe(insight.impact.timeframe)}
          </span>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
            aria-label="Descartar"
          >
            <X size={14} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl ${styles.bg} border-l-4 ${styles.border} overflow-hidden shadow-sm ${className}`}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            {/* Icon */}
            <div
              className={`p-2 bg-white rounded-lg shadow-sm ${styles.icon} flex-shrink-0`}
            >
              {Icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Title row */}
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h4 className="font-bold text-gray-800">{insight.title}</h4>
                {insight.priority === 'CRITICAL' && (
                  <span
                    className={`px-2 py-0.5 text-xs font-bold ${styles.badge} text-white rounded-full`}
                  >
                    {styles.badgeText}
                  </span>
                )}
              </div>

              {/* Message - solo si está expandido o es default */}
              {(expanded || variant === 'default') && (
                <p className="text-sm text-gray-600 leading-relaxed">
                  {insight.message}
                </p>
              )}
            </div>
          </div>

          {/* Actions header */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {variant === 'compact' && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                aria-label={expanded ? 'Contraer' : 'Expandir'}
              >
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                aria-label="Descartar"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Impact - solo si existe y está expandido */}
        {insight.impact && (expanded || variant === 'default') && (
          <div className="mt-3 p-3 bg-white rounded-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-green-600" />
                <span className="text-xs text-gray-500">
                  {insight.impact.description || 'Impacto potencial'}
                </span>
              </div>
              <span className="text-sm font-bold text-green-600">
                ${insight.impact.amount.toLocaleString('es-MX')}
                {formatTimeframe(insight.impact.timeframe)}
              </span>
            </div>
          </div>
        )}

        {/* Expiration warning */}
        {insight.expiresAt && (expanded || variant === 'default') && (
          <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
            <Clock size={12} />
            <span>
              Expira:{' '}
              {new Date(insight.expiresAt).toLocaleDateString('es-MX', {
                day: 'numeric',
                month: 'short',
              })}
            </span>
          </div>
        )}

        {/* Actions */}
        {insight.actions &&
          insight.actions.length > 0 &&
          (expanded || variant === 'default') && (
            <div className="mt-3 flex flex-wrap gap-2">
              {insight.actions.slice(0, 2).map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => onAction?.(action)}
                  className={`
                    inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg
                    transition-colors
                    ${
                      idx === 0
                        ? 'bg-banorte-red text-white hover:bg-banorte-red/90'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                    }
                  `}
                >
                  {action.label}
                  {idx === 0 && <ArrowRight size={14} />}
                </button>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}

export default ProactiveInsightCard;
