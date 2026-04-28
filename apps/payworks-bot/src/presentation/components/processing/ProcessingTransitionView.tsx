'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, AlertCircle, Check } from 'lucide-react';
import { Button, cn } from '@banorte/ui';

interface ProcessingTransitionViewProps {
  verdict: 'APROBADO' | 'PARCIAL' | 'RECHAZADO';
  approvedTx: number;
  totalTx: number;
  failedRules: number;
  resultsHref: string;
  onContinue?: () => void;
}

export function ProcessingTransitionView({
  verdict,
  approvedTx,
  totalTx,
  failedRules,
  resultsHref,
  onContinue,
}: ProcessingTransitionViewProps) {
  const isApproved = verdict === 'APROBADO';
  return (
    <div className="w-full h-full grid place-items-center px-4">
      <div
        className="w-full max-w-[520px] bg-white rounded-card shadow-card border border-[#E2E6E8] p-8 text-center"
        style={{ animation: 'fadeUp 600ms ease-out forwards' }}
      >
        <style>{`
          @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes ringPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
          @keyframes ringScale { from { transform: scale(0.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        `}</style>
        <div className="relative w-[72px] h-[72px] mx-auto mb-4">
          {isApproved ? (
            <>
              <div
                className="absolute inset-[-8px] rounded-full bg-banorte-success/20"
                style={{ animation: 'ringPulse 1.6s ease-in-out infinite' }}
              />
              <div className="absolute inset-0 rounded-full bg-banorte-success grid place-items-center">
                <Check className="w-9 h-9 text-white" strokeWidth={3} />
              </div>
            </>
          ) : (
            <div
              className="absolute inset-0 rounded-full bg-banorte-warning/15 grid place-items-center"
              style={{ animation: 'ringScale 400ms cubic-bezier(.2,.7,.3,1)' }}
            >
              <AlertCircle className="w-9 h-9 text-banorte-warning" strokeWidth={2} />
            </div>
          )}
        </div>

        <div
          className={cn(
            'inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-3 px-2 py-[3px] rounded',
            isApproved ? 'text-banorte-success bg-[#E9F6E2]' : 'text-banorte-warning bg-orange-100',
          )}
        >
          Dictamen · {verdict.charAt(0) + verdict.slice(1).toLowerCase()}
        </div>

        <h2 className="text-[22px] font-bold text-banorte-dark leading-tight mb-2">
          {isApproved
            ? 'Todas las transacciones aprobadas'
            : `${approvedTx} de ${totalTx} transacciones aprobadas`}
        </h2>

        <p className="text-[13px] text-banorte-secondary mb-5 leading-relaxed">
          {isApproved ? (
            <>
              El comercio cumple con todas las reglas evaluadas del manual. La certificación
              está lista para emitir la carta correspondiente.
            </>
          ) : (
            <>
              <b className="text-banorte-dark">{totalTx - approvedTx}</b> transacciones requieren revisión
              en <span className="font-mono">{failedRules} regla{failedRules === 1 ? '' : 's'}</span> del manual.
              Revisa los detalles para decidir si se aprueba la certificación o se solicita corrección al comercio.
            </>
          )}
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/dashboard">
            <Button variant="outline" size="md">
              Volver al Dashboard
            </Button>
          </Link>
          <Link href={resultsHref}>
            <Button variant="primary" size="md" className="gap-2" onClick={onContinue}>
              {isApproved ? 'Abrir dictamen' : 'Revisar resultados'}
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </Button>
          </Link>
        </div>
        <div className="mt-4 text-[11px] text-banorte-secondary">
          Continúa cuando estés listo · el dictamen ya quedó guardado.
        </div>
      </div>
    </div>
  );
}
