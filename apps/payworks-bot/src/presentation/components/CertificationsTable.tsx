'use client';

import React from 'react';
import Link from 'next/link';
import {
  Button,
  Card,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@banorte/ui';
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
        <Link href="/nueva-certificacion">
          <Button variant="primary" size="sm">
            + Nueva Certificacion
          </Button>
        </Link>
      </div>

      <Card noPadding className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[1000px]">
            <TableHeader>
              <TableRow hoverable={false}>
                <TableHead className="text-banorte-secondary text-xs">Comercio</TableHead>
                <TableHead className="text-banorte-secondary text-xs w-[200px]">Tipo Integracion</TableHead>
                <TableHead className="text-banorte-secondary text-xs w-[120px]">Transacciones</TableHead>
                <TableHead className="text-banorte-secondary text-xs w-[120px]">Fecha</TableHead>
                <TableHead className="text-banorte-secondary text-xs w-[140px]">Analista</TableHead>
                <TableHead className="text-banorte-secondary text-xs w-[130px]">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="text-banorte-dark text-[13px]">{row.comercio}</TableCell>
                  <TableCell className="text-banorte-dark text-[13px]">{row.tipoIntegracion}</TableCell>
                  <TableCell className="text-banorte-dark text-[13px]">{row.transacciones}</TableCell>
                  <TableCell className="text-banorte-dark text-[13px]">{row.fecha}</TableCell>
                  <TableCell className="text-banorte-dark text-[13px]">{row.analista}</TableCell>
                  <TableCell><StatusBadge status={row.estado} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
