'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Check } from 'lucide-react';
import { Header } from '@/presentation/components/Header';
import { LogViewer } from '@/presentation/components/LogViewer';

const servletEnvio = `[11/03/2026 18:02:25] SE RECIBIO POST HTTP
DESDE LA IP: 99.80.99.245
************************************
CARD_NUMBER:     [510125******2396]
CMD_TRANS:       [AUTH]
CONTROL_NUMBER:  [14080278637...]
AMOUNT:          [98.39]
ID_AFILIACION:   [7049408]
MODO:            [PRD]
************************************`;

const servletRespuesta = `[11/03/2026 18:02:26] SE ENVIO RESPUESTA HTTP
HACIA LA IP: 99.80.99.245
************************************
RESULTADO_PAYW:  [A]
CODIGO_PAYW:     [000]
TEXTO:           [Approved]
REFERENCIA:      [320146914713]
CODIGO_AUT:      [830125]
************************************`;

const prosaEnvio = `[11/03/2026 18:02:25] SE ENVIO MENSAJE
HACIA EL AUTORIZADOR PROSA5
(/140.240.11.78:58701):
Campo 0:  [0200]
Campo 3:  [000000]
Campo 4:  [000000009839]
Campo 37: [320146914713]
Campo 38: [      ]
Campo 41: [70494081]`;

const prosaRespuesta = `[11/03/2026 18:02:26] SE RECIBIO MENSAJE
DESDE EL AUTORIZADOR PROSA5
(/140.240.11.78:58701):
Campo 0:  [0210]
Campo 4:  [000000009839]
Campo 37: [320146914713]
Campo 38: [830125]
Campo 39: [00]`;

const fieldValidation = [
  { field: 'ID_AFILIACION', rule: 'R', servlet: true, servletVal: '7049408', prosa: true, prosaVal: '70494081 (C41)' },
  { field: 'MONTO', rule: 'R', servlet: true, servletVal: '98.39', prosa: true, prosaVal: '000000009839 (C4)' },
  { field: 'CMD_TRANS', rule: 'R', servlet: true, servletVal: 'AUTH', prosa: true, prosaVal: '0200 (C0)' },
  { field: 'NUMERO_TARJETA', rule: 'R', servlet: true, servletVal: '510125******2396', prosa: true, prosaVal: '510125******2396' },
];

export default function TransactionDetailPage() {
  return (
    <div className="flex flex-col min-h-screen bg-banorte-bg">
      <Header />
      <main className="flex-1 p-8 max-w-[1400px] mx-auto w-full">
        <div className="mb-6">
          <Link href="/resultados/1" className="inline-flex items-center text-banorte-red hover:underline font-medium mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" /> Volver a Resultados
          </Link>
          <h1 className="text-2xl font-bold text-banorte-dark mb-1">Detalle de Transaccion: VENTA VISA</h1>
          <p className="text-[13px] text-banorte-secondary">REF: 320146914713 | CONTROL: 140802786372026031200022522</p>
        </div>

        <div className="bg-white rounded-card shadow-card p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
            <div><div className="text-xs text-banorte-secondary mb-1">Tipo Transaccion</div><div className="text-sm font-semibold text-banorte-dark">AUTH</div></div>
            <div><div className="text-xs text-banorte-secondary mb-1">Marca</div><div className="text-sm font-semibold text-banorte-dark">VISA</div></div>
            <div><div className="text-xs text-banorte-secondary mb-1">Monto</div><div className="text-sm font-semibold text-banorte-dark">$98.39</div></div>
            <div><div className="text-xs text-banorte-secondary mb-1">Status BD</div><span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#E9F6E2] text-[#2E8B15]">Approved</span></div>
            <div><div className="text-xs text-banorte-secondary mb-1">Servidor Servlet</div><div className="text-sm font-semibold text-banorte-dark">lnxpwecom03p</div></div>
            <div><div className="text-xs text-banorte-secondary mb-1">Servidor PROSA</div><div className="text-sm font-semibold text-banorte-dark">lnxpwappse05p</div></div>
            <div><div className="text-xs text-banorte-secondary mb-1">Fecha</div><div className="text-sm font-semibold text-banorte-dark">2026-03-11 18:02:25</div></div>
            <div><div className="text-xs text-banorte-secondary mb-1">Auth Code</div><div className="text-sm font-semibold text-banorte-dark">830125</div></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <LogViewer title="LOG Servlet" tabs={[{ label: 'Envio', content: servletEnvio }, { label: 'Respuesta', content: servletRespuesta }]} />
          <LogViewer title="LOG PROSA (ISO 8583)" tabs={[{ label: 'Envio 0200', content: prosaEnvio }, { label: 'Respuesta 0210', content: prosaRespuesta }]} />
        </div>

        <div className="bg-white rounded-card shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-banorte-dark">Validacion de Campos Mandatorios (E-Commerce Tradicional)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-banorte-surface">
                  {['Campo', 'Regla', 'En Servlet', 'Valor Servlet', 'En PROSA', 'Valor PROSA', 'Estado'].map((col) => (
                    <th key={col} className="py-3 px-5 text-[11px] font-semibold text-banorte-secondary uppercase tracking-wider">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-sm text-banorte-dark">
                {fieldValidation.map((f, i) => (
                  <tr key={f.field} className={i % 2 === 0 ? 'bg-white' : 'bg-banorte-surface'}>
                    <td className="py-3 px-5 font-mono text-xs">{f.field}</td>
                    <td className="py-3 px-5">{f.rule}</td>
                    <td className="py-3 px-5">{f.servlet ? 'Si' : 'No'}</td>
                    <td className="py-3 px-5 font-mono text-xs">{f.servletVal}</td>
                    <td className="py-3 px-5">{f.prosa ? 'Si' : 'No'}</td>
                    <td className="py-3 px-5 font-mono text-xs">{f.prosaVal}</td>
                    <td className="py-3 px-5"><Check className="w-4 h-4 text-banorte-success" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
