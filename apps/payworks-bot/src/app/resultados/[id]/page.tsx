'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Download } from 'lucide-react';
import { Button, Card } from '@banorte/ui';
import { Header } from '@/presentation/components/Header';
import { TransactionResultCard } from '@/presentation/components/TransactionResultCard';

const mockResults = {
  merchantName: 'Liverpool SA de CV',
  integrationType: 'E-Commerce Tradicional',
  totalTransactions: 10,
  approved: 9,
  rejected: 1,
  verdict: 'RECHAZADO' as const,
  transactions: [
    {
      name: 'VENTA VISA',
      referencia: '320146914713',
      verdict: 'APROBADO' as const,
      passedCount: 11,
      totalCount: 11,
      failedFields: [],
      fieldResults: [
        { field: 'ID_AFILIACION', rule: 'R', found: true, value: '7049408', verdict: 'PASS' as const },
        { field: 'USUARIO', rule: 'R', found: true, value: '7049408', verdict: 'PASS' as const },
        { field: 'CMD_TRANS', rule: 'R', found: true, value: 'AUTH', verdict: 'PASS' as const },
        { field: 'MONTO', rule: 'R', found: true, value: '98.39', verdict: 'PASS' as const },
        { field: 'NUMERO_TARJETA', rule: 'R', found: true, value: '510125******2396', verdict: 'PASS' as const },
        { field: 'MODO_ENTRADA', rule: 'R', found: true, value: 'MANUAL', verdict: 'PASS' as const },
        { field: 'NUMERO_PAGOS', rule: 'N/A', found: false, value: undefined, verdict: 'PASS' as const },
      ],
    },
    {
      name: 'CANCELACION VISA',
      referencia: '320146914800',
      verdict: 'RECHAZADO' as const,
      passedCount: 8,
      totalCount: 9,
      failedFields: [{ field: 'REFERENCIA', message: 'No encontrado en el LOG Servlet. El comercio no envio este campo obligatorio' }],
      fieldResults: [
        { field: 'REFERENCIA', rule: 'R', found: false, value: undefined, verdict: 'FAIL' as const },
        { field: 'ID_AFILIACION', rule: 'R', found: true, value: '7049408', verdict: 'PASS' as const },
      ],
    },
  ],
};

export default function ResultadosPage() {
  const r = mockResults;

  return (
    <div className="flex flex-col min-h-screen bg-banorte-bg">
      <Header />
      <main className="flex-1 p-8 max-w-6xl mx-auto w-full">
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center text-banorte-red hover:underline font-medium mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" /> Volver
          </Link>
          <h1 className="text-[28px] font-bold text-banorte-dark">Resultados de Certificacion</h1>
        </div>

        <Card className="!p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div><div className="text-xs text-banorte-secondary mb-1">Comercio</div><div className="text-base font-semibold text-banorte-dark">{r.merchantName}</div></div>
            <div><div className="text-xs text-banorte-secondary mb-1">Integracion</div><div className="text-base font-semibold text-banorte-dark">{r.integrationType}</div></div>
            <div><div className="text-xs text-banorte-secondary mb-1">Transacciones</div><div className="text-base font-semibold text-banorte-dark">{r.totalTransactions} validadas</div></div>
            <div><div className="text-xs text-banorte-secondary mb-1">Aprobadas</div><div className="text-base font-semibold text-banorte-success">{r.approved} / {r.totalTransactions}</div></div>
            <div><div className="text-xs text-banorte-secondary mb-1">Rechazadas</div><div className="text-base font-semibold text-banorte-error">{r.rejected} / {r.totalTransactions}</div></div>
            <div><div className="text-xs text-banorte-secondary mb-1">Dictamen</div><div className="text-base font-bold text-banorte-error">{r.verdict}</div></div>
          </div>
        </Card>

        <div className="space-y-6">
          {r.transactions.map((txn) => (
            <TransactionResultCard key={txn.referencia} {...txn} />
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <Button variant="secondary" size="lg" className="gap-2">
            <Download className="w-4 h-4" /> Descargar Dictamen PDF
          </Button>
        </div>
      </main>
    </div>
  );
}
