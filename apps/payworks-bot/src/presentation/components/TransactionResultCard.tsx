'use client';

import React from 'react';
import Link from 'next/link';
import { FieldValidationTable } from './FieldValidationTable';

interface FieldResult {
  field: string;
  rule: string;
  found: boolean;
  value?: string;
  verdict: 'PASS' | 'FAIL';
}

interface TransactionResultCardProps {
  name: string;
  referencia: string;
  verdict: 'APROBADO' | 'RECHAZADO';
  passedCount: number;
  totalCount: number;
  failedFields: { field: string; message: string }[];
  fieldResults: FieldResult[];
  showTable?: boolean;
}

export function TransactionResultCard({
  name,
  referencia,
  verdict,
  passedCount,
  totalCount,
  failedFields,
  fieldResults,
  showTable = true,
}: TransactionResultCardProps) {
  const isApproved = verdict === 'APROBADO';

  return (
    <div className="bg-white rounded-card shadow-card overflow-hidden">
      <div className={`h-1 w-full ${isApproved ? 'bg-banorte-success' : 'bg-banorte-error'}`} />

      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/transaccion/${referencia}`}
              className="text-[15px] font-semibold text-banorte-dark hover:text-banorte-red transition-colors"
            >
              {name}
            </Link>
            <span className="text-xs text-banorte-secondary">REF: {referencia}</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
              ${isApproved ? 'bg-[#E9F6E2] text-[#2E8B15]' : 'bg-[#FDE4E1] text-[#B81818]'}`}>
              {verdict}
            </span>
          </div>
          <div className={`text-sm font-medium ${isApproved ? 'text-banorte-success' : 'text-banorte-error'}`}>
            {isApproved ? `${passedCount}/${totalCount} campos validados` : `${failedFields.length} campo(s) faltante(s)`}
          </div>
        </div>
      </div>

      {failedFields.length > 0 && (
        <div className="bg-[#FFF4F4] p-4 text-sm text-banorte-error border-b border-red-100 flex items-start gap-2">
          <span className="font-bold mt-0.5">!</span>
          <span>
            {failedFields.map((f) => (
              <span key={f.field}><strong>Campo {f.field} (Requerido):</strong> {f.message}. </span>
            ))}
          </span>
        </div>
      )}

      {showTable && <FieldValidationTable fields={fieldResults} />}
    </div>
  );
}
