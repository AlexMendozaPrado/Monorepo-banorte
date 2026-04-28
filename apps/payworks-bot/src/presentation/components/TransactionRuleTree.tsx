'use client';

import React, { useMemo, useState } from 'react';
import { ChevronDown, Check, X, Circle, Shield, BookOpen } from 'lucide-react';
import { cn } from '@banorte/ui';
import { FieldResultResponse } from '@/shared/types/api';

const LAYER_INFO: Record<string, { label: string; bg: string; tone: string }> = {
  SERVLET:     { label: 'Servlet (TNP)',     bg: '#E6EAED', tone: '#323E48' },
  THREEDS:     { label: '3D Secure',         bg: '#EEF0FE', tone: '#4F46E5' },
  CYBERSOURCE: { label: 'Cybersource',       bg: '#E3F4F1', tone: '#0D9488' },
  AGREGADOR:   { label: 'Agregador',         bg: '#FFEDD5', tone: '#C2410C' },
  EMV:         { label: 'EMV',               bg: '#FBF1E0', tone: '#B45309' },
  AN5822:      { label: 'AN5822 CIT/MIT',    bg: '#F3E8FF', tone: '#7C3AED' },
  OTROS:       { label: 'Otras validaciones',bg: '#F1F5F9', tone: '#475569' },
};

const LAYER_ORDER = ['SERVLET', 'THREEDS', 'CYBERSOURCE', 'AGREGADOR', 'EMV', 'AN5822', 'OTROS'];

type Status = 'pass' | 'fail' | 'skip';

function getStatus(f: FieldResultResponse): Status {
  if (f.rule === 'N/A') return 'skip';
  return f.verdict === 'PASS' ? 'pass' : 'fail';
}

function StatusIcon({ status }: { status: Status }) {
  if (status === 'skip') {
    return (
      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-100 text-banorte-secondary shrink-0">
        <Circle className="w-2 h-2" strokeWidth={3} />
      </span>
    );
  }
  if (status === 'pass') {
    return (
      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-100 text-banorte-success shrink-0">
        <Check className="w-2.5 h-2.5" strokeWidth={3.5} />
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-100 text-banorte-error shrink-0">
      <X className="w-2.5 h-2.5" strokeWidth={3.5} />
    </span>
  );
}

interface TransactionRuleTreeProps {
  fieldResults: FieldResultResponse[];
}

/**
 * Detalle por transaccion como arbol Capa -> Fuente del manual -> Regla.
 * Componente puro: agrupa el DTO `FieldResultResponse[]` que ya emite el
 * dominio sin requerir cambios en core/application/infrastructure.
 *
 * Reemplaza la tabla plana `FieldValidationTable` dentro de
 * `TransactionAccordion`. La taxonomia de "grupos" se deriva del campo
 * `source` (seccion del manual) que el dominio ya provee.
 */
export function TransactionRuleTree({ fieldResults }: TransactionRuleTreeProps) {
  const tree = useMemo(() => {
    const t: Record<string, Record<string, FieldResultResponse[]>> = {};
    for (const f of fieldResults) {
      const layer = f.layer && LAYER_INFO[f.layer] ? f.layer : 'OTROS';
      const src = f.source || 'Sin referencia';
      if (!t[layer]) t[layer] = {};
      if (!t[layer][src]) t[layer][src] = [];
      t[layer][src].push(f);
    }
    return t;
  }, [fieldResults]);

  const layers = useMemo(
    () => LAYER_ORDER.filter((l) => tree[l]),
    [tree],
  );

  const total = fieldResults.length;
  const passCount = fieldResults.filter((f) => getStatus(f) === 'pass').length;
  const failCount = fieldResults.filter((f) => getStatus(f) === 'fail').length;
  const skipCount = fieldResults.filter((f) => getStatus(f) === 'skip').length;
  const applicable = total - skipCount;

  // Auto-abrir capas con falla
  const defaultOpen = useMemo(() => {
    const o: Record<string, boolean> = {};
    layers.forEach((l) => {
      o[l] = Object.values(tree[l]).flat().some((f) => getStatus(f) === 'fail');
    });
    return o;
  }, [layers, tree]);
  const [openLayers, setOpenLayers] = useState<Record<string, boolean>>(defaultOpen);

  return (
    <div className="space-y-3 p-4 bg-banorte-bg/40">
      {/* Resumen */}
      <div className="bg-white rounded border border-gray-100 p-3 flex items-center gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-full bg-banorte-red/10 text-banorte-red grid place-items-center">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[12px] font-semibold text-banorte-dark leading-tight">
              {applicable} de {total} validaciones aplicadas
            </div>
            <div className="text-[10px] text-banorte-secondary leading-tight font-mono">
              {passCount} cumplen
              {failCount > 0 && (
                <>
                  {' · '}
                  <span className="text-banorte-error font-bold">{failCount} con observación</span>
                </>
              )}
              {skipCount > 0 && <> · {skipCount} fuera de alcance</>}
            </div>
          </div>
        </div>
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden flex">
          {applicable > 0 && (
            <>
              <div
                className="h-full bg-banorte-success"
                style={{ width: `${(passCount / applicable) * 100}%` }}
              />
              <div
                className="h-full bg-banorte-error"
                style={{ width: `${(failCount / applicable) * 100}%` }}
              />
            </>
          )}
        </div>
      </div>

      {/* Arbol por capa */}
      <div className="bg-white rounded-card border border-gray-100 overflow-hidden">
        {layers.map((layer, idx) => {
          const info = LAYER_INFO[layer];
          const groups = tree[layer];
          const layerFields = Object.values(groups).flat();
          const lPass = layerFields.filter((f) => getStatus(f) === 'pass').length;
          const lFail = layerFields.filter((f) => getStatus(f) === 'fail').length;
          const lSkip = layerFields.filter((f) => getStatus(f) === 'skip').length;
          const lApplicable = layerFields.length - lSkip;
          const lOpen = !!openLayers[layer];

          return (
            <div key={layer} className={cn(idx < layers.length - 1 && 'border-b border-gray-100')}>
              <button
                type="button"
                onClick={() => setOpenLayers((o) => ({ ...o, [layer]: !lOpen }))}
                className="w-full px-3 py-2.5 flex items-center gap-2.5 hover:bg-banorte-light/40 text-left transition-colors"
              >
                <ChevronDown
                  className={cn(
                    'w-3.5 h-3.5 text-banorte-secondary transition-transform shrink-0',
                    !lOpen && '-rotate-90',
                  )}
                />
                <span
                  className="px-2 py-[2px] rounded text-[11px] font-medium font-mono"
                  style={{ background: info.bg, color: info.tone }}
                >
                  {info.label}
                </span>
                <span className="flex-1 text-[11px] text-banorte-secondary">
                  {Object.keys(groups).length} grupo(s) · {lApplicable} aplican
                </span>
                <span className="font-mono text-[11px] tabular-nums flex items-center gap-3">
                  <span className="text-banorte-success">✓ {lPass}</span>
                  {lFail > 0 && <span className="text-banorte-error font-bold">✗ {lFail}</span>}
                  {lSkip > 0 && <span className="text-banorte-secondary">○ {lSkip}</span>}
                </span>
              </button>

              {lOpen && (
                <div className="bg-banorte-light/20 border-t border-gray-100">
                  {Object.entries(groups).map(([source, fields], gIdx, gArr) => (
                    <LayerGroup
                      key={source}
                      source={source}
                      fields={fields}
                      isLast={gIdx === gArr.length - 1}
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

interface LayerGroupProps {
  source: string;
  fields: FieldResultResponse[];
  isLast: boolean;
}

function LayerGroup({ source, fields, isLast }: LayerGroupProps) {
  const gPass = fields.filter((f) => getStatus(f) === 'pass').length;
  const gFail = fields.filter((f) => getStatus(f) === 'fail').length;
  const gSkip = fields.filter((f) => getStatus(f) === 'skip').length;
  const [open, setOpen] = useState<boolean>(gFail > 0);

  return (
    <div className={cn(!isLast && 'border-b border-gray-100')}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full pl-8 pr-3 py-2 flex items-center gap-2.5 hover:bg-white/60 text-left transition-colors"
      >
        <ChevronDown
          className={cn(
            'w-3.5 h-3.5 text-banorte-secondary transition-transform shrink-0',
            !open && '-rotate-90',
          )}
        />
        <BookOpen className="w-3.5 h-3.5 text-banorte-secondary shrink-0" />
        <span className="text-[12px] text-banorte-dark font-medium truncate">{source}</span>
        <span className="flex-1" />
        <span className="font-mono text-[11px] tabular-nums">
          <span className="text-banorte-success">{gPass}</span>
          <span className="text-banorte-secondary">/{gPass + gFail}</span>
          {gFail > 0 && <span className="text-banorte-error font-bold ml-1">({gFail}✗)</span>}
          {gSkip > 0 && <span className="text-banorte-secondary ml-1">· ○{gSkip}</span>}
        </span>
      </button>

      {open && (
        <div className="pl-14 pr-3 pb-2 space-y-[2px]">
          {fields.map((f, idx) => (
            <RuleLine key={`${f.field}-${idx}`} field={f} />
          ))}
        </div>
      )}
    </div>
  );
}

function RuleLine({ field }: { field: FieldResultResponse }) {
  const status = getStatus(field);
  const label = field.displayName || field.manualName || field.field;
  const detail = describeStatus(field, status);

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-[11px] rounded px-2 py-[5px]',
        status === 'fail' && 'bg-red-50 border-l-2 border-banorte-error',
        status === 'pass' && 'hover:bg-white/70',
        status === 'skip' && 'opacity-60',
      )}
    >
      <StatusIcon status={status} />
      <span
        className="font-mono text-[10px] text-banorte-secondary w-12 shrink-0 truncate"
        title={field.field}
      >
        {field.field}
      </span>
      <span className="text-[10px] text-banorte-secondary shrink-0">·</span>
      <span className="font-mono text-[10px] text-banorte-secondary w-7 shrink-0">{field.rule}</span>
      <span className="text-banorte-dark truncate flex-1" title={label}>{label}</span>
      <span
        title={detail}
        className={cn(
          'text-[11px] truncate max-w-[260px] cursor-help',
          status === 'pass' && 'text-banorte-secondary',
          status === 'fail' && 'text-banorte-error font-medium',
          status === 'skip' && 'text-banorte-secondary italic',
        )}
      >
        {detail}
      </span>
    </div>
  );
}

function shorten(value: string, max = 28): string {
  if (value.length <= max) return value;
  return value.slice(0, max - 1) + '…';
}

/**
 * Genera el texto de la columna 'detail' del árbol con la mejor info
 * disponible: prefiere `failDetail` del dominio cuando existe, cae a
 * mensajes derivados de `found` y `value` cuando no.
 */
function describeStatus(field: FieldResultResponse, status: Status): string {
  if (status === 'skip') return 'Fuera de alcance';
  if (status === 'pass') {
    return field.value ? `Valor: ${shorten(field.value)}` : 'Cumple';
  }
  // fail
  if (field.failDetail) return field.failDetail;
  if (field.found) {
    return field.value
      ? `Valor inválido: "${shorten(field.value)}"`
      : 'Valor inválido';
  }
  return 'No encontrado en el log';
}
