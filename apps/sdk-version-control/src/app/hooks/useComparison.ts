'use client';

import { useState, useCallback } from 'react';
import { ComparisonDTO } from '@/core/application/dtos/ComparisonDTO';
import { PlatformType } from '@/core/domain/value-objects/PlatformType';

interface UseComparisonReturn {
  comparison: ComparisonDTO | null;
  loading: boolean;
  error: string | null;
  compareServices: (serviceIds: string[], platforms?: PlatformType[]) => Promise<void>;
  clearComparison: () => void;
}

/**
 * Hook para comparar servicios lado a lado
 */
export function useComparison(): UseComparisonReturn {
  const [comparison, setComparison] = useState<ComparisonDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const compareServices = useCallback(async (
    serviceIds: string[],
    platforms?: PlatformType[]
  ) => {
    if (serviceIds.length < 2) {
      setError('Se requieren al menos 2 servicios para comparar');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('ids', serviceIds.join(','));
      if (platforms && platforms.length > 0) {
        params.set('platforms', platforms.join(','));
      }

      const response = await fetch(`/api/services/compare?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setComparison(data.data.comparison);
        setError(null);
      } else {
        setError(data.error?.message || 'Failed to compare services');
        setComparison(null);
      }
    } catch {
      setError('Network error. Please try again.');
      setComparison(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearComparison = useCallback(() => {
    setComparison(null);
    setError(null);
  }, []);

  return {
    comparison,
    loading,
    error,
    compareServices,
    clearComparison,
  };
}
