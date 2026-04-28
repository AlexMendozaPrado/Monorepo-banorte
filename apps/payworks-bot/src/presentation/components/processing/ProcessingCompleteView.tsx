'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { PIPELINE } from './liveValidationStream';

interface ProcessingCompleteViewProps {
  merchantName: string;
  integrationLabel: string;
  certificationLabel: string;
  durationLabel: string;
  totalRules: number;
  passedRules: number;
  observations: number;
  approvedTx: number;
  totalTx: number;
}

export function ProcessingCompleteView({
  merchantName,
  integrationLabel,
  certificationLabel,
  durationLabel,
  totalRules,
  passedRules,
  observations,
  approvedTx,
  totalTx,
}: ProcessingCompleteViewProps) {
  const accuracy = totalRules ? Math.round((passedRules / totalRules) * 100) : 0;

  return (
    <div className="w-full max-w-[1100px] mx-auto flex flex-col gap-4">
      <div>
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-banorte-secondary mb-1">
              Certificando
            </div>
            <h1 className="text-[28px] font-bold text-banorte-dark leading-tight">{merchantName}</h1>
            <div className="text-[13px] text-banorte-secondary mt-0.5">{integrationLabel}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="font-bold text-[40px] text-banorte-success leading-none tabular-nums">
              100<span className="text-[20px] opacity-60">%</span>
            </div>
            <div className="text-[10px] uppercase tracking-wider text-banorte-secondary mt-0.5">
              Completado en {durationLabel}
            </div>
          </div>
        </div>
        <div className="mt-3">
          <div className="h-1.5 bg-white rounded-full border border-[#E2E6E8] overflow-hidden">
            <div className="h-full bg-banorte-success" style={{ width: '100%' }} />
          </div>
        </div>
        <div className="mt-2 flex items-center gap-3 text-[11px] font-mono text-banorte-secondary">
          <span className="inline-flex items-center gap-1.5 text-banorte-success">
            <span className="w-1.5 h-1.5 rounded-full bg-banorte-success" />
            EJECUCIÓN COMPLETADA
          </span>
          <span>{certificationLabel}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Metric label="Reglas evaluadas" value={totalRules} sub="catálogo + cruzadas + custom" />
        <Metric label="Pasaron" value={passedRules} tone="success" sub={`${accuracy}% de aciertos`} />
        <Metric
          label="Con observación"
          value={observations}
          tone="warn"
          sub={observations ? 'requieren revisión' : 'sin observaciones'}
        />
        <Metric label="Tiempo total" value={durationLabel} sub="ejecución del bot" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4 min-h-[320px]">
        <div className="bg-white rounded-card border border-[#E2E6E8] flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-[#EEF0F2] flex items-center justify-between">
            <div>
              <div className="text-[13px] font-semibold text-banorte-dark">Pipeline de validación</div>
              <div className="text-[11px] text-banorte-success font-medium">
                {PIPELINE.length} de {PIPELINE.length} fases completadas
              </div>
            </div>
            <span className="inline-flex items-center justify-center w-[24px] h-[24px] rounded-full bg-banorte-success text-white">
              <Check className="w-3 h-3" strokeWidth={3} />
            </span>
          </div>
          <div className="flex-1 overflow-auto p-3 space-y-1">
            {PIPELINE.map((s) => (
              <div key={s.id} className="flex items-start gap-2.5 py-1.5 px-2 rounded">
                <div className="w-[20px] h-[20px] rounded-full grid place-items-center shrink-0 mt-[1px] bg-banorte-success text-white">
                  <Check className="w-3 h-3" strokeWidth={3} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] leading-tight text-banorte-dark">{s.label}</div>
                  <div className="text-[10px] text-banorte-secondary leading-tight mt-[2px]">
                    {s.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-card border border-[#E2E6E8] flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-[#EEF0F2]">
            <div className="text-[13px] font-semibold text-banorte-dark">Resumen de la ejecución</div>
            <div className="text-[11px] text-banorte-secondary">
              log disponible en Resultados
            </div>
          </div>
          <div className="flex-1 grid place-items-center p-8">
            <div className="text-center max-w-[420px]">
              <div className="relative w-[88px] h-[88px] mx-auto mb-4">
                <div className="absolute inset-0 rounded-full bg-banorte-success/15 animate-ping" />
                <div className="absolute inset-0 rounded-full bg-banorte-success grid place-items-center">
                  <Check className="w-10 h-10 text-white" strokeWidth={3} />
                </div>
              </div>
              <div className="text-[10px] uppercase tracking-widest text-banorte-secondary mb-1">
                Dictamen generado
              </div>
              <h2 className="text-[22px] font-bold text-banorte-dark mb-2">
                Validación completada
              </h2>
              <p className="text-[13px] text-banorte-secondary mb-1">
                <b className="text-banorte-dark">
                  {approvedTx} de {totalTx}
                </b>{' '}
                transacciones pasaron sin observaciones.
              </p>
              {observations > 0 && (
                <p className="text-[13px] text-banorte-secondary">
                  <b className="text-banorte-warning">{observations}</b> requieren atención ·{' '}
                  <b className="text-banorte-dark">{observations} reglas</b> con hallazgos.
                </p>
              )}
              <div className="mt-5 inline-flex items-center gap-1.5 text-[11px] text-banorte-secondary font-mono">
                <span className="w-1 h-1 rounded-full bg-banorte-secondary animate-pulse" />
                Abriendo dictamen…
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  sub,
  tone = 'neutral',
}: {
  label: string;
  value: number | string;
  sub?: string;
  tone?: 'neutral' | 'success' | 'warn';
}) {
  const toneCls =
    tone === 'success'
      ? 'text-banorte-success'
      : tone === 'warn'
      ? 'text-banorte-warning'
      : 'text-banorte-dark';
  return (
    <div className="bg-white rounded-card border border-[#E2E6E8] px-4 py-3">
      <div className="text-[10px] uppercase tracking-wider text-banorte-secondary font-medium leading-tight">
        {label}
      </div>
      <div className={`mt-1 font-bold leading-none tabular-nums text-[26px] ${toneCls}`}>{value}</div>
      {sub && <div className="text-[10px] text-banorte-secondary mt-1.5 leading-tight">{sub}</div>}
    </div>
  );
}
