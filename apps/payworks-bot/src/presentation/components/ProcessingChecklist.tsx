'use client';

import React from 'react';
import { Check, Loader2, Circle } from 'lucide-react';
import { Card } from '@banorte/ui';

type ProcessingStatus = 'completed' | 'processing' | 'pending';

interface TransactionProgress {
  name: string;
  referencia?: string;
  status: ProcessingStatus;
  verdict?: 'Aprobado' | 'Rechazado';
  time?: string;
  currentStep?: string;
}

interface ProcessingChecklistProps {
  merchantName: string;
  integrationType: string;
  progress: number;
  total: number;
  transactions: TransactionProgress[];
  currentStepDetail?: string;
}

export function ProcessingChecklist({
  merchantName,
  integrationType,
  progress,
  total,
  transactions,
  currentStepDetail,
}: ProcessingChecklistProps) {
  const percentage = total > 0 ? (progress / total) * 100 : 0;

  return (
    <Card className="w-full max-w-[720px] !p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-banorte-dark mb-1">Certificando comercio...</h1>
        <p className="text-sm text-banorte-secondary">{merchantName} | {integrationType}</p>
      </div>

      <div className="mb-8">
        <div className="w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden mb-2">
          <div className="h-full bg-banorte-red transition-all duration-500" style={{ width: `${percentage}%` }} />
        </div>
        <div className="text-right text-[13px] text-banorte-secondary">
          {progress} de {total} transacciones procesadas
        </div>
      </div>

      <div className="space-y-4 mb-8">
        {transactions.map((txn, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {txn.status === 'completed' && <Check className="w-5 h-5 text-banorte-success" />}
              {txn.status === 'processing' && <Loader2 className="w-5 h-5 text-banorte-secondary animate-spin" />}
              {txn.status === 'pending' && <Circle className="w-5 h-5 text-[#D1D5DB]" />}
              <span className={`text-sm font-medium ${txn.status === 'pending' ? 'text-[#9CA3AF]' : txn.status === 'processing' ? 'text-banorte-secondary' : 'text-banorte-dark'}`}>
                {txn.name}{txn.referencia ? ` (REF: ${txn.referencia})` : ''}
              </span>
            </div>
            <div className="flex items-center gap-4">
              {txn.status === 'completed' && txn.verdict && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                  ${txn.verdict === 'Aprobado' ? 'bg-[#E9F6E2] text-[#2E8B15]' : 'bg-[#FDE4E1] text-[#B81818]'}`}>
                  {txn.verdict}
                </span>
              )}
              {txn.status === 'processing' && txn.currentStep && (
                <span className="text-xs text-banorte-secondary italic">{txn.currentStep}</span>
              )}
              {txn.time && <span className="text-xs text-banorte-secondary w-8 text-right">{txn.time}</span>}
            </div>
          </div>
        ))}
      </div>

      {currentStepDetail && (
        <div className="bg-banorte-surface rounded p-4">
          <p className="text-sm font-medium text-banorte-dark mb-1">Paso actual: {currentStepDetail}</p>
        </div>
      )}
    </Card>
  );
}
