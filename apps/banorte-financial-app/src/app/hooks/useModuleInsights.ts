'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

/**
 * Dominios de insights disponibles
 */
export type InsightDomain = 'BUDGET' | 'SAVINGS' | 'DEBT' | 'GENERAL';

/**
 * Prioridades de insights
 */
export type InsightPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

/**
 * Acción ejecutable desde un insight
 */
export interface InsightAction {
  label: string;
  type: 'navigate' | 'api-call' | 'modal' | 'external' | 'dismiss';
  payload: Record<string, unknown>;
}

/**
 * Impacto potencial del insight
 */
export interface InsightImpact {
  amount: number;
  currency: string;
  timeframe: 'monthly' | 'annual' | 'one-time' | 'total';
  description?: string;
}

/**
 * DTO de un insight individual
 */
export interface InsightDTO {
  id: string;
  domain: InsightDomain;
  type: string;
  priority: InsightPriority;
  title: string;
  message: string;
  impact?: InsightImpact;
  actions: InsightAction[];
  relatedEntityId?: string;
  relatedEntityType?: string;
  expiresAt?: string;
  createdAt: string;
  isUrgent: boolean;
}

/**
 * Respuesta de la API de insights
 */
export interface InsightsResponse {
  budget: InsightDTO[];
  savings: InsightDTO[];
  debt: InsightDTO[];
  generatedAt: string;
  meta: {
    totalInsights: number;
    urgentCount: number;
    processingTimeMs: number;
  };
}

/**
 * Opciones para el hook useModuleInsights
 */
export interface UseModuleInsightsOptions {
  userId: string;
  domain: InsightDomain;
  monthlyIncome?: number;
  monthlyExpenses?: number;
  autoRefresh?: boolean;
  refreshInterval?: number; // en milisegundos
  maxInsights?: number;
  enabled?: boolean;
}

/**
 * Retorno del hook useModuleInsights
 */
export interface UseModuleInsightsReturn {
  insights: InsightDTO[];
  allInsights: InsightsResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  dismissInsight: (insightId: string) => void;
  dismissedIds: Set<string>;
  urgentCount: number;
}

/**
 * Hook para obtener insights proactivos de un módulo específico
 *
 * @example
 * ```tsx
 * const { insights, loading, error, dismissInsight } = useModuleInsights({
 *   userId: 'user-123',
 *   domain: 'BUDGET',
 *   autoRefresh: true,
 *   refreshInterval: 300000 // 5 minutos
 * });
 * ```
 */
export function useModuleInsights(
  options: UseModuleInsightsOptions
): UseModuleInsightsReturn {
  const {
    userId,
    domain,
    monthlyIncome,
    monthlyExpenses,
    autoRefresh = false,
    refreshInterval = 300000, // 5 minutos por defecto
    maxInsights = 5,
    enabled = true,
  } = options;

  const [allInsights, setAllInsights] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const fetchInsights = useCallback(async () => {
    if (!userId || !enabled) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        userId,
        domains: domain,
        maxInsights: maxInsights.toString(),
      });

      if (monthlyIncome) {
        params.append('monthlyIncome', monthlyIncome.toString());
      }
      if (monthlyExpenses) {
        params.append('monthlyExpenses', monthlyExpenses.toString());
      }

      const response = await axios.get<{
        success: boolean;
        data: InsightsResponse;
        error?: string;
      }>(`/api/advisor/proactive-insights?${params}`);

      if (response.data.success) {
        setAllInsights(response.data.data);
      } else {
        setError(response.data.error || 'Error fetching insights');
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error fetching insights';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userId, domain, monthlyIncome, monthlyExpenses, maxInsights, enabled]);

  // Fetch inicial
  useEffect(() => {
    if (enabled) {
      fetchInsights();
    }
  }, [fetchInsights, enabled]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !enabled) return;

    const interval = setInterval(fetchInsights, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchInsights, enabled]);

  // Dismiss insight (local state)
  const dismissInsight = useCallback((insightId: string) => {
    setDismissedIds((prev) => new Set([...prev, insightId]));

    // Persistir en localStorage para mantener entre sesiones
    try {
      const key = `dismissed-insights-${domain}`;
      const existing = localStorage.getItem(key);
      const ids = existing ? JSON.parse(existing) : [];
      ids.push(insightId);
      localStorage.setItem(key, JSON.stringify(ids.slice(-50))); // Mantener últimos 50
    } catch {
      // Ignorar errores de localStorage
    }
  }, [domain]);

  // Cargar dismissed IDs de localStorage al montar
  useEffect(() => {
    try {
      const key = `dismissed-insights-${domain}`;
      const existing = localStorage.getItem(key);
      if (existing) {
        setDismissedIds(new Set(JSON.parse(existing)));
      }
    } catch {
      // Ignorar errores de localStorage
    }
  }, [domain]);

  // Filtrar insights por dominio y dismissed
  const insights = useMemo(() => {
    if (!allInsights) return [];

    const domainKey = domain.toLowerCase() as keyof Pick<
      InsightsResponse,
      'budget' | 'savings' | 'debt'
    >;
    const domainInsights = allInsights[domainKey] || [];

    return domainInsights.filter((insight) => !dismissedIds.has(insight.id));
  }, [allInsights, domain, dismissedIds]);

  // Contar urgentes
  const urgentCount = useMemo(() => {
    return insights.filter((i) => i.isUrgent).length;
  }, [insights]);

  return {
    insights,
    allInsights,
    loading,
    error,
    refetch: fetchInsights,
    dismissInsight,
    dismissedIds,
    urgentCount,
  };
}

/**
 * Hook para obtener todos los insights de todos los dominios
 */
export function useAllProactiveInsights(
  userId: string,
  options?: {
    monthlyIncome?: number;
    monthlyExpenses?: number;
    enabled?: boolean;
  }
): {
  data: InsightsResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enabled = options?.enabled ?? true;

  const fetchAll = useCallback(async () => {
    if (!userId || !enabled) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({ userId });

      if (options?.monthlyIncome) {
        params.append('monthlyIncome', options.monthlyIncome.toString());
      }
      if (options?.monthlyExpenses) {
        params.append('monthlyExpenses', options.monthlyExpenses.toString());
      }

      const response = await axios.get<{
        success: boolean;
        data: InsightsResponse;
        error?: string;
      }>(`/api/advisor/proactive-insights?${params}`);

      if (response.data.success) {
        setData(response.data.data);
      } else {
        setError(response.data.error || 'Error fetching insights');
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error fetching insights';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userId, options?.monthlyIncome, options?.monthlyExpenses, enabled]);

  useEffect(() => {
    if (enabled) {
      fetchAll();
    }
  }, [fetchAll, enabled]);

  return { data, loading, error, refetch: fetchAll };
}
