'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ApiResponse, CertificationResponse } from '@/shared/types/api';

export type RunStatus = 'idle' | 'running' | 'success' | 'error';

export interface RunStartArgs {
  formData: FormData;
  merchantName?: string;
  integrationLabel?: string;
}

export interface RunSnapshot {
  status: RunStatus;
  startedAt: number | null;
  finishedAt: number | null;
  result: CertificationResponse | null;
  error: string | null;
  merchantName: string | undefined;
  integrationLabel: string | undefined;
  /** Total elapsed time on completion. Null while running. */
  durationMs: number | null;
}

export interface CertificationRunValue extends RunSnapshot {
  start(args: RunStartArgs): void;
  reset(): void;
}

const CertificationRunContext = createContext<CertificationRunValue | null>(null);

const initialSnapshot: RunSnapshot = {
  status: 'idle',
  startedAt: null,
  finishedAt: null,
  result: null,
  error: null,
  merchantName: undefined,
  integrationLabel: undefined,
  durationMs: null,
};

/**
 * Holds the in-flight certification request so that /procesamiento can render
 * the live validation animation against the same request kicked off from
 * /nueva-certificacion. Lives in the root layout so navigation between routes
 * does not lose the run.
 */
export function CertificationRunProvider({ children }: { children: React.ReactNode }) {
  const [snapshot, setSnapshot] = useState<RunSnapshot>(initialSnapshot);
  const inflightRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    inflightRef.current?.abort();
    inflightRef.current = null;
    setSnapshot(initialSnapshot);
  }, []);

  const start = useCallback(({ formData, merchantName, integrationLabel }: RunStartArgs) => {
    inflightRef.current?.abort();
    const controller = new AbortController();
    inflightRef.current = controller;

    const startedAt = Date.now();
    setSnapshot({
      ...initialSnapshot,
      status: 'running',
      startedAt,
      merchantName,
      integrationLabel,
    });

    fetch('/api/certificacion/validar', {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    })
      .then(async (res) => {
        const body = (await res.json()) as ApiResponse<CertificationResponse>;
        if (controller.signal.aborted) return;
        if (!body.success || !body.data) {
          throw new Error(body.error || `HTTP ${res.status}`);
        }
        const finishedAt = Date.now();
        setSnapshot((prev) => ({
          ...prev,
          status: 'success',
          finishedAt,
          durationMs: finishedAt - (prev.startedAt ?? finishedAt),
          result: body.data!,
        }));
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        const finishedAt = Date.now();
        setSnapshot((prev) => ({
          ...prev,
          status: 'error',
          finishedAt,
          durationMs: finishedAt - (prev.startedAt ?? finishedAt),
          error: err instanceof Error ? err.message : 'Error desconocido',
        }));
      });
  }, []);

  useEffect(() => () => inflightRef.current?.abort(), []);

  const value = useMemo<CertificationRunValue>(
    () => ({ ...snapshot, start, reset }),
    [snapshot, start, reset],
  );

  return (
    <CertificationRunContext.Provider value={value}>
      {children}
    </CertificationRunContext.Provider>
  );
}

export function useCertificationRun(): CertificationRunValue {
  const ctx = useContext(CertificationRunContext);
  if (!ctx) {
    throw new Error('useCertificationRun must be used inside <CertificationRunProvider>');
  }
  return ctx;
}
