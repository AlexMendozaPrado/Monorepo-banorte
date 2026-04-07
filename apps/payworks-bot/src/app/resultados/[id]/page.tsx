'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download } from 'lucide-react';
import { Button, Card } from '@banorte/ui';
import { Header } from '@/presentation/components/Header';
import { TransactionResultCard } from '@/presentation/components/TransactionResultCard';
import { CertificationResponse } from '@/shared/types/api';

export default function ResultadosPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<CertificationResponse | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(`certification_${id}`);
    if (stored) {
      setData(JSON.parse(stored));
    }
  }, [id]);

  if (!data) {
    return (
      <div className="flex flex-col min-h-screen bg-banorte-bg">
        <Header />
        <main className="flex-1 p-8 max-w-6xl mx-auto w-full">
          <p className="text-banorte-secondary">Cargando resultados...</p>
        </main>
      </div>
    );
  }

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

        {/* Summary Card */}
        <Card className="!p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div>
              <div className="text-xs text-banorte-secondary mb-1">Comercio</div>
              <div className="text-base font-semibold text-banorte-dark">{data.merchantName}</div>
            </div>
            <div>
              <div className="text-xs text-banorte-secondary mb-1">Integracion</div>
              <div className="text-base font-semibold text-banorte-dark">{data.integrationType}</div>
            </div>
            <div>
              <div className="text-xs text-banorte-secondary mb-1">Transacciones</div>
              <div className="text-base font-semibold text-banorte-dark">{data.totalTransactions} validadas</div>
            </div>
            <div>
              <div className="text-xs text-banorte-secondary mb-1">Aprobadas</div>
              <div className="text-base font-semibold text-banorte-success">{data.approvedCount} / {data.totalTransactions}</div>
            </div>
            <div>
              <div className="text-xs text-banorte-secondary mb-1">Rechazadas</div>
              <div className="text-base font-semibold text-banorte-error">{data.rejectedCount} / {data.totalTransactions}</div>
            </div>
            <div>
              <div className="text-xs text-banorte-secondary mb-1">Dictamen</div>
              <div className={`text-base font-bold ${data.verdict === 'APROBADO' ? 'text-banorte-success' : 'text-banorte-error'}`}>
                {data.verdict}
              </div>
            </div>
          </div>
        </Card>

        {/* Transaction Result Cards */}
        <div className="space-y-6">
          {data.results.map((txn) => {
            const failedFields = txn.fieldResults
              .filter(f => f.verdict === 'FAIL')
              .map(f => ({ field: f.field, message: 'No encontrado en el LOG Servlet' }));

            return (
              <TransactionResultCard
                key={txn.transactionRef}
                name={`${txn.transactionType} ${txn.cardBrand}`}
                referencia={txn.transactionRef}
                verdict={txn.verdict === 'APROBADO' ? 'APROBADO' : 'RECHAZADO'}
                passedCount={txn.passedCount}
                totalCount={txn.totalValidated}
                failedFields={failedFields}
                fieldResults={txn.fieldResults}
              />
            );
          })}
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
