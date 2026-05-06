'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { Button, TextArea } from '@banorte/ui';
import { Header } from '@/presentation/components/Header';
import { TransactionAccordion } from '@/presentation/components/TransactionAccordion';
import { CertificationResponse } from '@/shared/types/api';
import { generateCertificationPDF } from '@/presentation/utils/generateCertificationPDF';
import { useCertificationDetail } from '@/presentation/hooks/useCertificationDetail';

const INTEGRATION_NAMES: Record<string, string> = {
  ECOMMERCE_TRADICIONAL: 'Comercio Electrónico Tradicional',
  MOTO: 'MOTO (Mail/Telephone Order)',
  CARGOS_PERIODICOS_POST: 'Cargos Periódicos Post',
  VENTANA_COMERCIO_ELECTRONICO: 'Ventana de Comercio Electrónico',
  AGREGADORES_COMERCIO_ELECTRONICO: 'Agregadores — Comercio Electrónico',
  AGREGADORES_CARGOS_PERIODICOS: 'Agregadores — Cargos Periódicos',
  API_PW2_SEGURO: 'API PW2 Seguro (TP)',
  INTERREDES_REMOTO: 'Interredes Remoto (TP)',
};

const TRANSACTION_NAMES: Record<string, string> = {
  AUTH: 'VENTA',
  VOID: 'CANCELACION',
  REFUND: 'DEVOLUCION',
  PREAUTH: 'PREAUTORIZACION',
  POSTAUTH: 'POSTAUTORIZACION',
  VERIFY: 'VERIFICACION',
  REVERSAL: 'REVERSA',
  CASHBACK: 'CASHBACK',
  REAUTH: 'REAUTORIZACION',
};

function groupByType(results: CertificationResponse['results']) {
  const groups: Record<string, { total: number; passed: number }> = {};
  for (const r of results) {
    const name = TRANSACTION_NAMES[r.transactionType] || r.transactionType;
    if (!groups[name]) groups[name] = { total: 0, passed: 0 };
    groups[name].total++;
    if (r.verdict === 'APROBADO') groups[name].passed++;
  }
  return groups;
}

export default function ResultadosPage() {
  const params = useParams();
  const id = params.id as string;
  const [filter, setFilter] = useState<'all' | 'failed'>('all');
  const [notasAdicionales, setNotasAdicionales] = useState('');
  const state = useCertificationDetail(id);

  const downloadCartaDocx = () => {
    const trimmed = notasAdicionales
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .join('\n');
    const query = trimmed ? `?notas=${encodeURIComponent(trimmed)}` : '';
    window.open(`/api/certificacion/carta/${id}${query}`, '_blank');
  };

  if (state.kind === 'loading') {
    return (
      <div className="flex flex-col min-h-screen bg-banorte-bg">
        <Header />
        <main className="flex-1 p-8 max-w-6xl mx-auto w-full">
          <p className="text-banorte-secondary">Cargando resultados...</p>
        </main>
      </div>
    );
  }

  if (state.kind === 'notFound') {
    return (
      <div className="flex flex-col min-h-screen bg-banorte-bg">
        <Header />
        <main className="flex-1 p-8 max-w-6xl mx-auto w-full">
          <Link href="/dashboard" className="inline-flex items-center text-banorte-red hover:underline font-medium mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" /> Volver al Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-banorte-dark mb-2">Certificacion no encontrada</h1>
          <p className="text-banorte-secondary">
            La certificacion con ID <span className="font-mono">{id}</span> no existe o fue eliminada.
          </p>
        </main>
      </div>
    );
  }

  if (state.kind === 'error') {
    return (
      <div className="flex flex-col min-h-screen bg-banorte-bg">
        <Header />
        <main className="flex-1 p-8 max-w-6xl mx-auto w-full">
          <Link href="/dashboard" className="inline-flex items-center text-banorte-red hover:underline font-medium mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" /> Volver al Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-banorte-dark mb-2">No se pudo cargar la certificacion</h1>
          <p className="text-banorte-error">{state.message}</p>
        </main>
      </div>
    );
  }

  const data: CertificationResponse = state.data;
  const approvalRate = data.totalTransactions > 0 ? Math.round((data.approvedCount / data.totalTransactions) * 100) : 0;
  const isApproved = data.verdict === 'APROBADO';
  const byType = groupByType(data.results);

  const filteredResults = filter === 'failed'
    ? data.results.filter(r => r.verdict !== 'APROBADO')
    : data.results;

  return (
    <div className="flex flex-col min-h-screen bg-banorte-bg">
      <Header />
      <main className="flex-1 p-8 max-w-6xl mx-auto w-full">
        {/* Back + Title */}
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center text-banorte-red hover:underline font-medium mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" /> Volver al Dashboard
          </Link>
          <h1 className="text-[28px] font-bold text-banorte-dark">Resultados de Certificacion</h1>
        </div>

        {/* ===== DASHBOARD VISUAL (Alternativa B) ===== */}
        <div className="bg-white rounded-card shadow-card p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Left: Donut visual + Dictamen */}
            <div className="flex items-center gap-6 lg:min-w-[320px]">
              {/* Donut chart visual */}
              <div className="relative w-[100px] h-[100px] shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#E5E7EB" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15.5" fill="none"
                    stroke={isApproved ? '#6CC04A' : '#EB0029'}
                    strokeWidth="3"
                    strokeDasharray={`${approvalRate} ${100 - approvalRate}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-lg font-bold ${isApproved ? 'text-banorte-success' : 'text-banorte-error'}`}>
                    {approvalRate}%
                  </span>
                </div>
              </div>

              <div>
                <div
                  data-testid="global-verdict"
                  className={`text-2xl font-bold mb-1 ${isApproved ? 'text-banorte-success' : 'text-banorte-error'}`}
                >
                  {data.verdict}
                </div>
                <div className="text-sm text-banorte-secondary">
                  <span data-testid="approved-count">{data.approvedCount}</span>
                  /
                  <span data-testid="total-count">{data.totalTransactions}</span>
                  {' '}transacciones aprobadas
                </div>
                {data.rejectedCount > 0 && (
                  <div className="text-sm text-banorte-error mt-1">
                    <span data-testid="rejected-count">{data.rejectedCount}</span>
                    {' '}transaccion(es) requieren correccion
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="hidden lg:block w-px bg-gray-200" />

            {/* Right: Info del comercio + barras por tipo */}
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <div className="text-xs text-banorte-secondary mb-0.5">Comercio</div>
                  <div className="text-sm font-semibold text-banorte-dark">{data.merchantName}</div>
                </div>
                <div>
                  <div className="text-xs text-banorte-secondary mb-0.5">Integracion</div>
                  <div className="text-sm font-semibold text-banorte-dark">{INTEGRATION_NAMES[data.integrationType] || data.integrationType}</div>
                </div>
              </div>

              <div className="text-xs text-banorte-secondary mb-2 font-medium">Por tipo de transaccion:</div>
              <div className="space-y-2">
                {Object.entries(byType).map(([type, { total, passed }]) => {
                  const pct = Math.round((passed / total) * 100);
                  const allPassed = passed === total;
                  return (
                    <div
                      key={type}
                      data-testid={`type-counter-${type}`}
                      data-passed={passed}
                      data-total={total}
                      className="flex items-center gap-3"
                    >
                      <span className="text-xs text-banorte-dark w-[120px] font-medium truncate">{type}</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${allPassed ? 'bg-banorte-success' : 'bg-banorte-error'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-banorte-secondary w-[50px] text-right">
                        {passed}/{total} {allPassed ? '✓' : '✗'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ===== TRANSACCIONES (Alternativa A: Acordeones) ===== */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-banorte-dark font-semibold text-lg">
            Detalle por transaccion
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                ${filter === 'all' ? 'bg-banorte-dark text-white' : 'bg-gray-100 text-banorte-secondary hover:bg-gray-200'}`}
            >
              Todas ({data.totalTransactions})
            </button>
            {data.rejectedCount > 0 && (
              <button
                onClick={() => setFilter('failed')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                  ${filter === 'failed' ? 'bg-banorte-error text-white' : 'bg-red-50 text-banorte-error hover:bg-red-100'}`}
              >
                Solo fallidas ({data.rejectedCount})
              </button>
            )}
          </div>
        </div>

        <div className="space-y-3 mb-8">
          {filteredResults.map((txn) => {
            const requiredFields = txn.fieldResults.filter(f => f.rule === 'R');
            const requiredPassed = requiredFields.filter(f => f.verdict === 'PASS').length;

            return (
              <TransactionAccordion
                key={txn.transactionRef}
                name={`${TRANSACTION_NAMES[txn.transactionType] || txn.transactionType} ${txn.cardBrand}`}
                referencia={txn.transactionRef}
                verdict={txn.verdict === 'APROBADO' ? 'APROBADO' : 'RECHAZADO'}
                requiredPassed={requiredPassed}
                requiredTotal={requiredFields.length}
                fieldResults={txn.fieldResults}
              />
            );
          })}
        </div>

        {/* ===== NOTAS ADICIONALES PARA LA CARTA ===== */}
        <div className="bg-white rounded-card shadow-card p-6 mb-6">
          <h3 className="text-banorte-dark font-semibold mb-1">
            Notas adicionales para la carta oficial
          </h3>
          <p className="text-sm text-banorte-gray mb-3">
            Una nota por línea. Se agregan como bullets al final de la sección
            &quot;Notas:&quot; del documento. Opcional.
          </p>
          <TextArea
            name="notasAdicionales"
            value={notasAdicionales}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setNotasAdicionales(e.target.value)
            }
            placeholder="Ej.: La afiliación validada corresponde al ambiente de pruebas&#10;Se omitieron las pruebas de tokenización por solicitud del comercio"
          />
        </div>

        {/* ===== ACCIONES ===== */}
        <div className="flex justify-between items-center">
          <Link href="/nueva-certificacion">
            <Button variant="outline" size="md">
              Nueva Certificacion
            </Button>
          </Link>
          <Button variant="secondary" size="lg" className="gap-2" onClick={() => generateCertificationPDF(data)}>
            <Download className="w-4 h-4" /> Descargar Dictamen PDF
          </Button>
          <Button
            variant="primary"
            size="lg"
            className="gap-2"
            onClick={downloadCartaDocx}
            disabled={!isApproved}
            title={
              isApproved
                ? undefined
                : 'La carta oficial solo se emite cuando la certificación esté APROBADA (todas las transacciones deben pasar). Revisa los fails para corregir antes de descargar.'
            }
          >
            <FileText className="w-4 h-4" /> Descargar Carta Oficial (.docx)
          </Button>
        </div>
      </main>
    </div>
  );
}
