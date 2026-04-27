'use client';

import React, { useState } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';
import { cn } from '@banorte/ui';
import { TransactionRuleTree } from './TransactionRuleTree';
import { FieldResultResponse } from '@/shared/types/api';

type FieldResult = FieldResultResponse;

interface TransactionAccordionProps {
  name: string;
  referencia: string;
  verdict: 'APROBADO' | 'RECHAZADO';
  requiredPassed: number;
  requiredTotal: number;
  failedFields: { field: string; message: string }[];
  fieldResults: FieldResult[];
  defaultOpen?: boolean;
}

export function TransactionAccordion({
  name,
  referencia,
  verdict,
  requiredPassed,
  requiredTotal,
  failedFields,
  fieldResults,
  defaultOpen = false,
}: TransactionAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen || verdict === 'RECHAZADO');
  const isApproved = verdict === 'APROBADO';

  return (
    <div className={cn(
      'rounded-card overflow-hidden border transition-all',
      isApproved ? 'border-gray-100' : 'border-banorte-error/30',
    )}>
      {/* Accent bar */}
      <div className={cn('h-1 w-full', isApproved ? 'bg-banorte-success' : 'bg-banorte-error')} />

      {/* Header (clickable) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {isApproved
            ? <Check className="w-5 h-5 text-banorte-success" />
            : <X className="w-5 h-5 text-banorte-error" />
          }
          <span className="font-semibold text-sm text-banorte-dark">{name}</span>
          <span className="text-xs text-banorte-secondary">REF: {referencia}</span>
          <span className={cn(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold',
            isApproved ? 'bg-[#E9F6E2] text-[#2E8B15]' : 'bg-[#FDE4E1] text-[#B81818]'
          )}>
            {verdict}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn('text-xs font-medium', isApproved ? 'text-banorte-success' : 'text-banorte-error')}>
            {isApproved ? `${requiredPassed}/${requiredTotal} campos R` : `${failedFields.length} faltante(s)`}
          </span>
          <ChevronDown className={cn(
            'w-4 h-4 text-banorte-secondary transition-transform duration-200',
            isOpen && 'rotate-180'
          )} />
        </div>
      </button>

      {/* Expandable content */}
      {isOpen && (
        <div className="bg-white border-t border-gray-100">
          {failedFields.length > 0 && (
            <div className="bg-[#FFF4F4] px-5 py-3 text-sm text-banorte-error flex items-start gap-2 border-b border-red-100">
              <X className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                {failedFields.map((f) => (
                  <p key={f.field}><strong>{f.field}</strong> (Requerido): {f.message}</p>
                ))}
              </div>
            </div>
          )}
          <TransactionRuleTree fieldResults={fieldResults} />
        </div>
      )}
    </div>
  );
}
