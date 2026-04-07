'use client';

import React from 'react';
import { Check, X } from 'lucide-react';

interface FieldResult {
  field: string;
  rule: string;
  found: boolean;
  value?: string;
  verdict: 'PASS' | 'FAIL';
}

interface FieldValidationTableProps {
  fields: FieldResult[];
}

export function FieldValidationTable({ fields }: FieldValidationTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-banorte-surface">
            {['Campo', 'Regla', 'Encontrado', 'Valor', 'Estado'].map((col) => (
              <th key={col} className="py-3 px-5 text-[11px] font-semibold text-banorte-secondary uppercase tracking-wider">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-sm text-banorte-dark divide-y divide-gray-100">
          {fields.map((f) => (
            <tr key={f.field} className="hover:bg-gray-50">
              <td className="py-3 px-5 font-mono text-xs">{f.field}</td>
              <td className="py-3 px-5">{f.rule}</td>
              <td className={`py-3 px-5 ${!f.found && f.rule === 'R' ? 'text-banorte-error font-medium' : ''}`}>
                {f.rule === 'N/A' ? '--' : f.found ? 'Si' : 'No'}
              </td>
              <td className="py-3 px-5 font-mono text-xs">{f.rule === 'N/A' ? '--' : f.value || '--'}</td>
              <td className="py-3 px-5">
                {f.verdict === 'PASS'
                  ? <Check className="w-4 h-4 text-banorte-success" />
                  : <X className="w-4 h-4 text-banorte-error" />
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
