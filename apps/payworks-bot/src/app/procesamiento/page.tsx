'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@banorte/ui';
import { Header } from '@/presentation/components/Header';
import {
  LiveValidationView,
  ProcessingCompleteView,
  ProcessingTransitionView,
} from '@/presentation/components/processing';
import { useCertificationRun } from '@/presentation/contexts/CertificationRunContext';
import { CertificationResponse } from '@/shared/types/api';

type LocalPhase = 'running' | 'complete' | 'transition';

const COMPLETE_PAUSE_MS = 1400;

function deriveVerdict(result: CertificationResponse): 'APROBADO' | 'PARCIAL' | 'RECHAZADO' {
  const verdict = result.verdict?.toUpperCase();
  if (verdict === 'APROBADO') return 'APROBADO';
  if (verdict === 'RECHAZADO') return 'RECHAZADO';
  return 'PARCIAL';
}

function formatDuration(ms: number | null): string {
  if (!ms || ms < 0) return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function aggregateRuleCounts(result: CertificationResponse) {
  let total = 0;
  let passed = 0;
  for (const tx of result.results) {
    for (const f of tx.fieldResults) {
      total += 1;
      if (f.verdict === 'PASS') passed += 1;
    }
  }
  return { total, passed, failed: total - passed };
}

export default function ProcesamientoPage() {
  const router = useRouter();
  const run = useCertificationRun();
  const [phase, setPhase] = useState<LocalPhase>('running');

  // Guard: no run in flight → bounce back to nueva-certificacion.
  useEffect(() => {
    if (run.status === 'idle') {
      router.replace('/nueva-certificacion');
    }
  }, [run.status, router]);

  // running → complete is now the analyst's manual decision via the
  // "Continuar" CTA on the live-validation footer (see onContinue prop below).
  // The stream itself enforces a minimum animation runtime before the CTA is
  // even visible, so a fast backend never blows past the live-validation story.

  // complete → transition (after the 100% celebration pause)
  useEffect(() => {
    if (phase !== 'complete') return;
    const timer = setTimeout(() => setPhase('transition'), COMPLETE_PAUSE_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  // transition is the user's manual gate — no auto-redirect to /resultados.
  // The CTA on the transition card is the only path forward, so the analyst
  // can take their time to read the verdict before opening the dictamen.

  if (run.status === 'idle') {
    return (
      <div className="flex flex-col min-h-screen bg-banorte-bg">
        <Header />
        <main className="flex-1 p-8 flex items-center justify-center" />
      </div>
    );
  }

  if (run.status === 'error') {
    return (
      <div className="flex flex-col min-h-screen bg-banorte-bg">
        <Header />
        <main className="flex-1 p-8 max-w-3xl mx-auto w-full">
          <Link
            href="/nueva-certificacion"
            className="inline-flex items-center text-banorte-red hover:underline font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Volver a Nueva Certificación
          </Link>
          <div className="bg-white rounded-card shadow-card p-8">
            <h1 className="text-2xl font-bold text-banorte-dark mb-2">
              No se pudo completar la certificación
            </h1>
            <p className="text-banorte-error mb-6">{run.error || 'Error desconocido'}</p>
            <div className="flex gap-3">
              <Link href="/nueva-certificacion">
                <Button variant="primary" size="md">
                  Reintentar
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="md">
                  Volver al Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const merchantName = run.merchantName || run.result?.merchantName || 'Comercio en certificación';
  const integrationLabel = run.integrationLabel || run.result?.integrationType || 'Certificación Payworks';
  const certificationLabel = run.result?.id ? `cert ${run.result.id}` : 'cert en curso…';

  return (
    <div className="flex flex-col min-h-screen bg-banorte-bg">
      <Header />
      <main className="flex-1 p-6 md:p-10 w-full">
        {phase === 'running' && (
          <LiveValidationView
            merchantName={merchantName}
            integrationLabel={integrationLabel}
            certificationLabel={certificationLabel}
            isReadyToFinish={run.status === 'success'}
            runKey={run.startedAt}
            continueLabel="Ver dictamen"
            onContinue={() => setPhase('complete')}
            onCancel={() => {
              run.reset();
              router.push('/nueva-certificacion');
            }}
          />
        )}

        {phase === 'complete' && run.result && (
          <CompletePhase
            result={run.result}
            merchantName={merchantName}
            integrationLabel={integrationLabel}
            certificationLabel={certificationLabel}
            durationMs={run.durationMs}
          />
        )}

        {phase === 'transition' && run.result && (
          <ProcessingTransitionView
            verdict={deriveVerdict(run.result)}
            approvedTx={run.result.approvedCount}
            totalTx={run.result.totalTransactions}
            failedRules={aggregateRuleCounts(run.result).failed}
            resultsHref={`/resultados/${run.result.id}`}
            onContinue={() => router.push(`/resultados/${run.result!.id}`)}
          />
        )}
      </main>
    </div>
  );
}

function CompletePhase({
  result,
  merchantName,
  integrationLabel,
  certificationLabel,
  durationMs,
}: {
  result: CertificationResponse;
  merchantName: string;
  integrationLabel: string;
  certificationLabel: string;
  durationMs: number | null;
}) {
  const counts = aggregateRuleCounts(result);
  return (
    <ProcessingCompleteView
      merchantName={merchantName}
      integrationLabel={integrationLabel}
      certificationLabel={certificationLabel}
      durationLabel={formatDuration(durationMs)}
      totalRules={counts.total}
      passedRules={counts.passed}
      observations={counts.failed}
      approvedTx={result.approvedCount}
      totalTx={result.totalTransactions}
    />
  );
}
