'use client';

import React from 'react';
import { Sparkles, Loader2, AlertCircle, ChevronRight, RefreshCw } from 'lucide-react';
import { ProactiveInsightCard } from './ProactiveInsightCard';
import type { InsightDTO, InsightDomain, InsightAction } from '../../hooks/useModuleInsights';

/**
 * Configuración visual por dominio
 */
const domainConfig: Record<
  InsightDomain,
  { color: string; bgColor: string; borderColor: string; icon: string }
> = {
  BUDGET: {
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    icon: '',
  },
  SAVINGS: {
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: '',
  },
  DEBT: {
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: '',
  },
  GENERAL: {
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: '',
  },
};

/**
 * Títulos por defecto por dominio
 */
const defaultTitles: Record<InsightDomain, string> = {
  BUDGET: 'Lo que Norma detectó',
  SAVINGS: 'Optimizaciones de Norma',
  DEBT: 'Alertas y Oportunidades',
  GENERAL: 'Insights Generales',
};

/**
 * Subtítulos por defecto por dominio
 */
const defaultSubtitles: Record<InsightDomain, string> = {
  BUDGET: 'Oportunidades de mejora en tu presupuesto',
  SAVINGS: 'Sugerencias personalizadas para tus metas',
  DEBT: 'Estrategias para liberarte de deudas más rápido',
  GENERAL: 'Recomendaciones basadas en tu situación',
};

interface ModuleInsightsSectionProps {
  domain: InsightDomain;
  insights: InsightDTO[];
  loading: boolean;
  error?: string | null;
  title?: string;
  subtitle?: string;
  maxVisible?: number;
  onViewAll?: () => void;
  onInsightAction?: (insightId: string, action: InsightAction) => void;
  onDismiss?: (insightId: string) => void;
  onRefresh?: () => void;
  className?: string;
  variant?: 'default' | 'compact' | 'minimal';
  showHeader?: boolean;
  emptyMessage?: string;
}

/**
 * Sección de insights proactivos para un módulo
 *
 * Muestra una lista de insights con estados de loading, error y vacío.
 * Soporta variantes visuales y acciones personalizadas.
 *
 * @example
 * ```tsx
 * <ModuleInsightsSection
 *   domain="BUDGET"
 *   insights={budgetInsights}
 *   loading={loading}
 *   error={error}
 *   title="Lo que Norma detectó"
 *   onDismiss={dismissInsight}
 *   onInsightAction={(id, action) => handleAction(action)}
 * />
 * ```
 */
export function ModuleInsightsSection({
  domain,
  insights,
  loading,
  error,
  title,
  subtitle,
  maxVisible = 3,
  onViewAll,
  onInsightAction,
  onDismiss,
  onRefresh,
  className = '',
  variant = 'default',
  showHeader = true,
  emptyMessage,
}: ModuleInsightsSectionProps) {
  const config = domainConfig[domain];
  const displayTitle = title || defaultTitles[domain];
  const displaySubtitle = subtitle || defaultSubtitles[domain];
  const visibleInsights = insights.slice(0, maxVisible);
  const hasMore = insights.length > maxVisible;

  // Estado de loading
  if (loading) {
    return (
      <div
        className={`rounded-xl ${config.bgColor} border ${config.borderColor} p-6 ${className}`}
      >
        <div className="flex items-center justify-center gap-3">
          <Loader2 size={24} className={`animate-spin ${config.color}`} />
          <span className="text-gray-600">Norma está analizando...</span>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className={`rounded-xl bg-red-50 border border-red-100 p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-800 font-medium">
              Error al cargar insights
            </p>
            <p className="text-xs text-red-600 mt-1">{error}</p>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="text-red-600 hover:text-red-800 p-1"
              aria-label="Reintentar"
            >
              <RefreshCw size={16} />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Estado vacío - no mostrar nada si no hay insights
  if (!insights || insights.length === 0) {
    // Opcionalmente mostrar mensaje de vacío
    if (emptyMessage) {
      return (
        <div
          className={`rounded-xl ${config.bgColor} border ${config.borderColor} p-6 text-center ${className}`}
        >
          <Sparkles size={24} className={`mx-auto mb-2 ${config.color}`} />
          <p className="text-sm text-gray-600">{emptyMessage}</p>
        </div>
      );
    }
    return null;
  }

  return (
    <div className={className}>
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 ${config.bgColor} rounded-lg`}>
              <Sparkles size={20} className={config.color} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">{displayTitle}</h3>
              {displaySubtitle && (
                <p className="text-xs text-gray-500">{displaySubtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Refresh button */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Actualizar"
              >
                <RefreshCw size={16} />
              </button>
            )}

            {/* View all button */}
            {hasMore && onViewAll && (
              <button
                onClick={onViewAll}
                className={`text-sm font-medium ${config.color} flex items-center gap-1 hover:underline`}
              >
                Ver todos ({insights.length})
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Insights Grid */}
      <div className={variant === 'compact' ? 'space-y-2' : 'space-y-3'}>
        {visibleInsights.map((insight) => (
          <ProactiveInsightCard
            key={insight.id}
            insight={insight}
            variant={variant}
            onAction={(action) => onInsightAction?.(insight.id, action)}
            onDismiss={onDismiss ? () => onDismiss(insight.id) : undefined}
          />
        ))}
      </div>

      {/* View all footer (alternativa) */}
      {hasMore && onViewAll && !showHeader && (
        <button
          onClick={onViewAll}
          className={`mt-3 w-full py-2 text-sm font-medium ${config.color} text-center hover:underline`}
        >
          Ver {insights.length - maxVisible} más
        </button>
      )}
    </div>
  );
}

export default ModuleInsightsSection;
