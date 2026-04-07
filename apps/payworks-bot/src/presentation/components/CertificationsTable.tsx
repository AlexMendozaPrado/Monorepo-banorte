'use client';

import React from 'react';
import Link from 'next/link';
import { StatusBadge, Status } from './StatusBadge';

interface Certification {
  id: string;
  comercio: string;
  tipoIntegracion: string;
  transacciones: string;
  fecha: string;
  analista: string;
  estado: Status;
}

const mockData: Certification[] = [
  { id: '1', comercio: 'Liverpool SA de CV', tipoIntegracion: 'E-Commerce Tradicional', transacciones: '10/10', fecha: '2026-03-28', analista: 'J. Garcia', estado: 'Aprobado' },
  { id: '2', comercio: 'Coppel Ecommerce', tipoIntegracion: 'Cybersource Directo', transacciones: '8/10', fecha: '2026-03-27', analista: 'M. Lopez', estado: 'Rechazado' },
  { id: '3', comercio: 'Rappi Agregador', tipoIntegracion: 'Agregador E-Comm', transacciones: '5/12', fecha: '2026-03-27', analista: 'A. Mendoza', estado: 'En Proceso' },
  { id: '4', comercio: 'OXXO Pay', tipoIntegracion: 'Ventana Comercios', transacciones: '6/6', fecha: '2026-03-26', analista: 'J. Garcia', estado: 'Aprobado' },
  { id: '5', comercio: 'MercadoLibre MX', tipoIntegracion: 'Agregador Cargos Auto', transacciones: '--', fecha: '2026-03-26', analista: 'M. Lopez', estado: 'Pendiente' },
];

export function CertificationsTable() {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between w-full">
        <h2 className="text-banorte-dark font-semibold text-lg">Certificaciones Recientes</h2>
        <Link
          href="/nueva-certificacion"
          className="bg-banorte-red hover:bg-[#D00024] transition-colors text-white font-semibold text-[13px] py-2.5 px-5 rounded-btn flex items-center justify-center"
        >
          + Nueva Certificacion
        </Link>
      </div>

      <div className="bg-white rounded-card shadow-card overflow-hidden w-full">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-banorte-surface">
                {['Comercio', 'Tipo Integracion', 'Transacciones', 'Fecha', 'Analista', 'Estado'].map((col) => (
                  <th key={col} className="py-3.5 px-5 text-banorte-secondary font-semibold text-xs">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockData.map((row) => (
                <tr key={row.id} className="border-b border-[#E5E7E8] last:border-b-0 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-5 text-banorte-dark text-[13px]">{row.comercio}</td>
                  <td className="py-4 px-5 text-banorte-dark text-[13px]">{row.tipoIntegracion}</td>
                  <td className="py-4 px-5 text-banorte-dark text-[13px]">{row.transacciones}</td>
                  <td className="py-4 px-5 text-banorte-dark text-[13px]">{row.fecha}</td>
                  <td className="py-4 px-5 text-banorte-dark text-[13px]">{row.analista}</td>
                  <td className="py-4 px-5"><StatusBadge status={row.estado} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
