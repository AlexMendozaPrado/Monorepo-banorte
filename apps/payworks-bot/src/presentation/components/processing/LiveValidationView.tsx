'use client';

import React, { useEffect, useRef } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { Button, cn } from '@banorte/ui';
import {
  EventKind,
  EventLayer,
  LiveEvent,
  PIPELINE,
  useLiveValidationStream,
} from './liveValidationStream';

interface LiveValidationViewProps {
  merchantName: string;
  integrationLabel: string;
  certificationLabel: string;
  isReadyToFinish: boolean;
  runKey: string | number | null;
  onCancel?: () => void;
  /** Fired when the analyst clicks "Continuar" once the validation is fully done. */
  onContinue?: () => void;
  /** Optional CTA copy override — defaults to "Continuar". */
  continueLabel?: string;
}

const KIND_TONE: Record<EventKind, { fg: string; bg: string }> = {
  INFO: { fg: 'text-banorte-secondary', bg: 'bg-banorte-secondary/10' },
  PARSE: { fg: 'text-sky-700', bg: 'bg-sky-100' },
  LAYER: { fg: 'text-indigo-700', bg: 'bg-indigo-100' },
  CAT: { fg: 'text-violet-700', bg: 'bg-violet-100' },
  CHECK: { fg: 'text-banorte-dark', bg: 'bg-banorte-surface' },
  CROSS: { fg: 'text-orange-700', bg: 'bg-orange-100' },
  EXTRA: { fg: 'text-purple-700', bg: 'bg-purple-100' },
  DONE: { fg: 'text-banorte-success', bg: 'bg-[#E9F6E2]' },
};

const LAYER_TONE: Record<EventLayer, { fg: string; bg: string; label: string }> = {
  SERVLET: { fg: 'text-banorte-dark', bg: 'bg-[#E6EAED]', label: 'Servlet' },
  THREEDS: { fg: 'text-indigo-700', bg: 'bg-indigo-50', label: '3DS' },
  CYBERSOURCE: { fg: 'text-teal-700', bg: 'bg-teal-50', label: 'Cybersource' },
  XLAYER: { fg: 'text-orange-700', bg: 'bg-orange-50', label: 'X-LAYER' },
};

export function LiveValidationView({
  merchantName,
  integrationLabel,
  certificationLabel,
  isReadyToFinish,
  runKey,
  onCancel,
  onContinue,
  continueLabel = 'Continuar',
}: LiveValidationViewProps) {
  const stream = useLiveValidationStream({ isReadyToFinish, runKey });
  const logRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [stream.events.length]);

  const passed = stream.events.filter((e) => e.result === 'pass').length;
  const failed = stream.events.filter((e) => e.result === 'fail').length;
  const checked = passed + failed;
  const isDone = stream.pct === 100;

  return (
    <div className="w-full max-w-[1100px] mx-auto flex flex-col gap-4">
      <Hero
        merchantName={merchantName}
        integrationLabel={integrationLabel}
        certificationLabel={certificationLabel}
        pct={stream.pct}
      />

      <MetricsRow checked={checked} passed={passed} failed={failed} />

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4 min-h-[440px]">
        <Pipeline currentStepIdx={stream.stepIdx} reachedDictamen={stream.reachedDictamen} />
        <LogFeed
          events={stream.events}
          passed={passed}
          failed={failed}
          isReadyToFinish={isReadyToFinish}
          logRef={logRef}
        />
      </div>

      <footer className="flex items-center justify-between gap-4 text-[12px] text-banorte-secondary pt-1">
        <span className="italic">
          {isDone
            ? 'Validación completada. Avanza cuando estés listo para revisar el dictamen.'
            : 'Esto normalmente toma unos segundos. Puedes dejar la pestaña abierta.'}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-btn border border-[#D1D5DB] text-banorte-dark text-sm font-medium hover:bg-banorte-surface transition-colors"
            >
              Cancelar
            </button>
          )}
          {isDone && onContinue && (
            <Button variant="primary" size="md" className="gap-2" onClick={onContinue}>
              {continueLabel}
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}

interface HeroProps {
  merchantName: string;
  integrationLabel: string;
  certificationLabel: string;
  pct: number;
}

function Hero({ merchantName, integrationLabel, certificationLabel, pct }: HeroProps) {
  return (
    <div>
      <div className="flex items-end justify-between gap-6">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-banorte-secondary mb-1">Certificando</div>
          <h1 className="text-[28px] font-bold text-banorte-dark leading-tight">{merchantName}</h1>
          <div className="text-[13px] text-banorte-secondary mt-0.5">{integrationLabel}</div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-bold text-[40px] text-banorte-red leading-none tabular-nums">
            {pct}
            <span className="text-[20px] opacity-60">%</span>
          </div>
          <div className="text-[10px] uppercase tracking-wider text-banorte-secondary mt-0.5">Completado</div>
        </div>
      </div>
      <div className="mt-3">
        <div className="h-1.5 bg-white rounded-full border border-[#E2E6E8] overflow-hidden">
          <div
            className="h-full bg-banorte-red transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <div className="mt-2 flex items-center gap-3 text-[11px] font-mono text-banorte-secondary">
        <span className="inline-flex items-center gap-1.5 text-banorte-red">
          <span className="w-1.5 h-1.5 rounded-full bg-banorte-red animate-pulse" />
          EJECUCIÓN EN VIVO
        </span>
        <span>{certificationLabel}</span>
      </div>
    </div>
  );
}

interface MetricsRowProps {
  checked: number;
  passed: number;
  failed: number;
}

function MetricsRow({ checked, passed, failed }: MetricsRowProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Metric label="Reglas evaluadas" value={checked} sub="acumuladas en la sesión" />
      <Metric
        label="Pasaron"
        value={passed}
        tone="success"
        sub={checked ? `${Math.round((passed / checked) * 100)}% de aciertos` : '—'}
      />
      <Metric
        label="Con observación"
        value={failed}
        tone="warn"
        sub={failed ? 'requieren revisión' : 'todo en orden'}
      />
      <Metric label="Capas activas" value="3" sub="Servlet · 3DS · Cybersource" />
    </div>
  );
}

interface MetricProps {
  label: string;
  value: number | string;
  sub?: string;
  tone?: 'neutral' | 'success' | 'warn';
}

function Metric({ label, value, sub, tone = 'neutral' }: MetricProps) {
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
      <div className={cn('mt-1 font-bold leading-none tabular-nums text-[26px]', toneCls)}>{value}</div>
      {sub && <div className="text-[10px] text-banorte-secondary mt-1.5 leading-tight">{sub}</div>}
    </div>
  );
}

interface PipelineProps {
  currentStepIdx: number;
  reachedDictamen: boolean;
}

function Pipeline({ currentStepIdx, reachedDictamen }: PipelineProps) {
  return (
    <div className="bg-white rounded-card border border-[#E2E6E8] flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-[#EEF0F2]">
        <div className="text-[13px] font-semibold text-banorte-dark">Pipeline de validación</div>
        <div className="text-[11px] text-banorte-secondary">
          {PIPELINE.length} fases · {Math.min(currentStepIdx + 1, PIPELINE.length)} / {PIPELINE.length} en curso
        </div>
      </div>
      <div className="flex-1 overflow-auto p-3 space-y-1">
        {PIPELINE.map((s, i) => {
          const done = i < currentStepIdx;
          const active = i === currentStepIdx && (i !== PIPELINE.length - 1 || reachedDictamen);
          const dim = !done && !active;
          return (
            <div
              key={s.id}
              className={cn(
                'flex items-start gap-2.5 py-1.5 px-2 rounded transition-all',
                dim && 'opacity-50',
                active && 'bg-banorte-red/5',
              )}
            >
              <div
                className={cn(
                  'w-[20px] h-[20px] rounded-full grid place-items-center shrink-0 mt-[1px]',
                  done
                    ? 'bg-banorte-success text-white'
                    : active
                    ? 'bg-banorte-red text-white'
                    : 'bg-gray-100 text-banorte-secondary',
                )}
              >
                {done ? (
                  <Check className="w-3 h-3" strokeWidth={3} />
                ) : active ? (
                  <span className="w-[6px] h-[6px] rounded-full bg-white animate-pulse" />
                ) : (
                  <span className="w-[5px] h-[5px] rounded-full bg-gray-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className={cn(
                    'text-[12px] leading-tight',
                    done || active ? 'text-banorte-dark' : 'text-banorte-secondary',
                    active && 'font-semibold',
                  )}
                >
                  {s.label}
                </div>
                <div className="text-[10px] text-banorte-secondary leading-tight mt-[2px]">
                  {s.detail}
                </div>
              </div>
              {active && (
                <div className="flex gap-1 mt-1.5">
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      className="w-1 h-1 rounded-full bg-banorte-red animate-bounce"
                      style={{ animationDelay: `${d * 0.15}s` }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface LogFeedProps {
  events: LiveEvent[];
  passed: number;
  failed: number;
  isReadyToFinish: boolean;
  logRef: React.RefObject<HTMLDivElement>;
}

function LogFeed({ events, passed, failed, isReadyToFinish, logRef }: LogFeedProps) {
  return (
    <div className="bg-white rounded-card border border-[#E2E6E8] flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-[#EEF0F2] flex items-center justify-between">
        <div>
          <div className="text-[13px] font-semibold text-banorte-dark">Validación en vivo</div>
          <div className="text-[11px] text-banorte-secondary">
            Cada regla evaluada queda trazada con su resultado
          </div>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="inline-flex items-center gap-1 text-banorte-success">
            <span className="w-1.5 h-1.5 rounded-full bg-banorte-success" /> {passed}
          </span>
          <span className="inline-flex items-center gap-1 text-banorte-error">
            <span className="w-1.5 h-1.5 rounded-full bg-banorte-error" /> {failed}
          </span>
          <span className="inline-flex items-center gap-1 text-banorte-secondary">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" /> {events.length}
          </span>
        </div>
      </div>
      <div ref={logRef} className="flex-1 overflow-y-auto p-3 space-y-1 max-h-[440px]">
        {events.map((e, i) => (
          <LogLine key={i} index={i} event={e} />
        ))}
        <Cursor index={events.length} isReadyToFinish={isReadyToFinish} />
      </div>
      <div className="border-t border-[#EEF0F2] px-4 py-2 flex items-center justify-between text-[11px]">
        <span className="font-mono text-banorte-secondary">{events.length} eventos · auto-scroll</span>
      </div>
    </div>
  );
}

function LogLine({ index, event }: { index: number; event: LiveEvent }) {
  const tone = KIND_TONE[event.kind];
  const layer = event.layer ? LAYER_TONE[event.layer] : null;
  return (
    <div className="flex items-start gap-2 py-[3px] text-[11px] font-mono">
      <span className="text-banorte-secondary shrink-0 w-[24px] text-right tabular-nums">
        {String(index + 1).padStart(2, '0')}
      </span>
      <span className={cn('shrink-0 px-1.5 rounded font-bold tabular-nums', tone.fg, tone.bg)}>
        {event.kind}
      </span>
      {event.rule && <span className="shrink-0 text-banorte-secondary font-bold">{event.rule}</span>}
      {layer && (
        <span className={cn('shrink-0 px-1.5 rounded text-[10px] font-medium', layer.fg, layer.bg)}>
          {layer.label}
        </span>
      )}
      <span className="text-banorte-dark min-w-0 flex-1">
        {event.text}
        {event.detail && <span className="text-banorte-secondary"> · {event.detail}</span>}
      </span>
      {event.result === 'pass' && (
        <span className="shrink-0 inline-flex items-center justify-center w-[14px] h-[14px] rounded-full bg-[#E9F6E2] text-banorte-success text-[10px] font-bold">
          ✓
        </span>
      )}
      {event.result === 'fail' && (
        <span className="shrink-0 inline-flex items-center justify-center w-[14px] h-[14px] rounded-full bg-red-100 text-banorte-error text-[10px] font-bold">
          ×
        </span>
      )}
    </div>
  );
}

function Cursor({ index, isReadyToFinish }: { index: number; isReadyToFinish: boolean }) {
  return (
    <div className="flex items-center gap-2 py-[3px] text-[11px] font-mono text-banorte-secondary">
      <span className="w-[24px] text-right tabular-nums">{String(index + 1).padStart(2, '0')}</span>
      <span className="opacity-60">›</span>
      {isReadyToFinish ? (
        <span className="text-banorte-success">cerrando dictamen…</span>
      ) : (
        <span className="w-1.5 h-3 bg-banorte-dark animate-pulse" />
      )}
    </div>
  );
}
