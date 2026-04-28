'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

export type StepId = 'parse' | 'layers' | 'catalog' | 'base' | 'cross' | 'extra' | 'dictamen';

export interface PipelineStep {
  id: StepId;
  label: string;
  detail: string;
}

export const PIPELINE: readonly PipelineStep[] = [
  { id: 'parse', label: 'Parseando log de sesión', detail: 'Detectando transacciones y capas' },
  { id: 'layers', label: 'Identificando capas presentes', detail: 'Servlet · 3D Secure · Cybersource' },
  { id: 'catalog', label: 'Cargando catálogo del manual', detail: 'Reglas oficiales por integración' },
  { id: 'base', label: 'Validaciones base por capa', detail: 'Campos mandatorios y formato' },
  { id: 'cross', label: 'Validaciones cruzadas', detail: 'XID · CAVV · ECI · montos' },
  { id: 'extra', label: 'Reglas adicionales de la sesión', detail: 'Reglas personalizadas' },
  { id: 'dictamen', label: 'Generando dictamen', detail: 'Trazabilidad regla → transacción' },
];

export type EventKind = 'INFO' | 'PARSE' | 'LAYER' | 'CAT' | 'CHECK' | 'CROSS' | 'EXTRA' | 'DONE';
export type EventResult = 'pass' | 'fail';
export type EventLayer = 'SERVLET' | 'THREEDS' | 'CYBERSOURCE' | 'XLAYER';

export interface LiveEvent {
  step: StepId;
  kind: EventKind;
  text: string;
  rule?: string;
  layer?: EventLayer;
  detail?: string;
  result?: EventResult;
}

const EVENTS: readonly LiveEvent[] = [
  { step: 'parse', kind: 'INFO', text: 'Sesión recibida · log y matriz cargados' },
  { step: 'parse', kind: 'PARSE', text: 'Transacciones detectadas en el log' },
  { step: 'layers', kind: 'LAYER', text: 'Capas activas: SERVLET · THREEDS · CYBERSOURCE' },
  { step: 'catalog', kind: 'CAT', text: 'Catálogo del manual cargado' },
  { step: 'base', kind: 'CHECK', rule: 'A1', layer: 'SERVLET', text: 'MERCHANT_ID requerido', result: 'pass' },
  { step: 'base', kind: 'CHECK', rule: 'C2', layer: 'SERVLET', text: 'EXPIRATION formato MM/AA', result: 'pass' },
  { step: 'base', kind: 'CHECK', rule: 'C4', layer: 'SERVLET', text: 'MERCHANT_ID 7 dígitos', result: 'pass' },
  { step: 'base', kind: 'CHECK', rule: 'D3', layer: 'SERVLET', text: 'RESPONSE_LANGUAGE valor válido', result: 'pass' },
  { step: 'base', kind: 'CHECK', rule: 'B2', layer: 'SERVLET', text: 'USER_EMAIL formato', result: 'pass' },
  { step: 'base', kind: 'CHECK', rule: 'E1', layer: 'THREEDS', text: 'ECI valor válido', result: 'pass' },
  { step: 'base', kind: 'CHECK', rule: 'E2', layer: 'THREEDS', text: 'CAVV requerido', result: 'pass' },
  { step: 'base', kind: 'CHECK', rule: 'F1', layer: 'CYBERSOURCE', text: 'decisión en {ACCEPT, REJECT, REVIEW}', result: 'pass' },
  { step: 'cross', kind: 'CROSS', rule: 'H1', layer: 'XLAYER', text: 'XID Servlet ↔ 3DS coincide', result: 'pass' },
  { step: 'cross', kind: 'CROSS', rule: 'H2', layer: 'XLAYER', text: 'AMOUNT Servlet ↔ Cybersource coincide', result: 'pass' },
  { step: 'cross', kind: 'CROSS', rule: 'H3', layer: 'XLAYER', text: 'CAVV Servlet ↔ 3DS coincide', result: 'pass' },
  { step: 'extra', kind: 'EXTRA', text: 'Reglas adicionales evaluadas en la sesión' },
  { step: 'dictamen', kind: 'DONE', text: 'Dictamen generado · trazabilidad lista' },
];

export interface LiveStreamState {
  events: LiveEvent[];
  stepIdx: number;
  pct: number;
  /** True when the deterministic animation has played all non-dictamen steps. */
  reachedDictamen: boolean;
}

interface UseLiveValidationStreamArgs {
  /** Total time the animation should take to advance from parse → reaching the dictamen step. */
  preDictamenDurationMs?: number;
  /** Whether the underlying server work has finished — gates the final 100% step. */
  isReadyToFinish: boolean;
  /** Reset key — when it changes, the stream restarts from zero. */
  runKey: string | number | null;
}

/**
 * Drives the deterministic visualization of the pipeline + log feed. The first
 * six pipeline steps animate on a fixed schedule so the analyst always sees a
 * coherent narrative; the final "Generando dictamen" step waits until the real
 * server response arrives, so the screen never misleads the user.
 */
export function useLiveValidationStream({
  preDictamenDurationMs = 8400,
  isReadyToFinish,
  runKey,
}: UseLiveValidationStreamArgs): LiveStreamState {
  const [tick, setTick] = useState(0);
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (runKey == null) return;
    startedAtRef.current = Date.now();
    setTick(0);
    const interval = setInterval(() => setTick((t) => t + 1), 90);
    return () => clearInterval(interval);
  }, [runKey]);

  return useMemo(() => {
    if (runKey == null || startedAtRef.current == null) {
      return { events: [], stepIdx: 0, pct: 0, reachedDictamen: false };
    }

    const elapsed = Math.max(0, Date.now() - startedAtRef.current);
    const preDictamenSteps = PIPELINE.length - 1;
    const stepDuration = preDictamenDurationMs / preDictamenSteps;
    const animatedStepFloat = Math.min(elapsed / stepDuration, preDictamenSteps);
    const animatedStepIdx = Math.floor(animatedStepFloat);

    const reachedDictamen = animatedStepIdx >= preDictamenSteps;
    const finishingStep = reachedDictamen && isReadyToFinish ? PIPELINE.length : Math.min(animatedStepIdx, preDictamenSteps);

    // pct: linear before dictamen; while waiting on dictamen hold at ~94%; jump to 100% when ready.
    let pct: number;
    if (!reachedDictamen) {
      pct = Math.min(94, Math.round((elapsed / preDictamenDurationMs) * 94));
    } else if (!isReadyToFinish) {
      pct = 94;
    } else {
      pct = 100;
    }

    const visibleEvents = EVENTS.filter((e) => {
      const eventStepIdx = PIPELINE.findIndex((s) => s.id === e.step);
      if (eventStepIdx < 0) return false;
      if (e.step === 'dictamen') return isReadyToFinish && reachedDictamen;
      return eventStepIdx <= animatedStepIdx;
    });

    return {
      events: visibleEvents,
      stepIdx: finishingStep,
      pct,
      reachedDictamen,
    };
    // tick is the trigger — ignore stale closure warnings.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, isReadyToFinish, runKey, preDictamenDurationMs]);
}
