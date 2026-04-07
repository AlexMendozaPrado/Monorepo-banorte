'use client';

import React from 'react';
import { Check, X } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@banorte/ui';

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
      <Table>
        <TableHeader>
          <TableRow hoverable={false}>
            <TableHead className="text-banorte-secondary text-[11px] uppercase tracking-wider">Campo</TableHead>
            <TableHead className="text-banorte-secondary text-[11px] uppercase tracking-wider">Regla</TableHead>
            <TableHead className="text-banorte-secondary text-[11px] uppercase tracking-wider">Encontrado</TableHead>
            <TableHead className="text-banorte-secondary text-[11px] uppercase tracking-wider">Valor</TableHead>
            <TableHead className="text-banorte-secondary text-[11px] uppercase tracking-wider">Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.map((f) => (
            <TableRow key={f.field}>
              <TableCell className="font-mono text-xs">{f.field}</TableCell>
              <TableCell>{f.rule}</TableCell>
              <TableCell className={!f.found && f.rule === 'R' ? 'text-banorte-error font-medium' : ''}>
                {f.rule === 'N/A' ? '--' : f.found ? 'Si' : 'No'}
              </TableCell>
              <TableCell className="font-mono text-xs">{f.rule === 'N/A' ? '--' : f.value || '--'}</TableCell>
              <TableCell>
                {f.verdict === 'PASS'
                  ? <Check className="w-4 h-4 text-banorte-success" />
                  : <X className="w-4 h-4 text-banorte-error" />
                }
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
