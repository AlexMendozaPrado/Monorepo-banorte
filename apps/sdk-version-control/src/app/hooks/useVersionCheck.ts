'use client';

import { useState, useCallback } from 'react';
import { PlatformType } from '@/core/domain/value-objects/PlatformType';
import { VersionCheckSummary } from '@/core/domain/entities/VersionCheckResult';

interface VersionCheckResultDTO {
  serviceId: string;
  serviceName: string;
  platform: PlatformType;
  previousVersion: string;
  latestVersion: string;
  status: string;
  checkedAt: string;
  changelog?: string;
  error?: string;
}

interface UseVersionCheckReturn {
  checking: boolean;
  results: VersionCheckResultDTO[];
  summary: VersionCheckSummary | null;
  error: string | null;
  checkUpdates: (serviceIds?: string[], options?: CheckOptions) => Promise<void>;
  clearResults: () => void;
}

interface CheckOptions {
  platforms?: PlatformType[];
  forceRefresh?: boolean;
}

/**
 * Hook para verificar actualizaciones de versiones
 */
export function useVersionCheck(): UseVersionCheckReturn {
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState<VersionCheckResultDTO[]>([]);
  const [summary, setSummary] = useState<VersionCheckSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkUpdates = useCallback(async (
    serviceIds?: string[],
    options?: CheckOptions
  ) => {
    setChecking(true);
    setError(null);

    try {
      const response = await fetch('/api/services/check-updates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceIds,
          platforms: options?.platforms,
          forceRefresh: options?.forceRefresh,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.data.results);
        setSummary(data.data.summary);
        setError(null);
      } else {
        setError(data.error?.message || 'Failed to check updates');
        setResults([]);
        setSummary(null);
      }
    } catch {
      setError('Network error. Please try again.');
      setResults([]);
      setSummary(null);
    } finally {
      setChecking(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setSummary(null);
    setError(null);
  }, []);

  return {
    checking,
    results,
    summary,
    error,
    checkUpdates,
    clearResults,
  };
}
