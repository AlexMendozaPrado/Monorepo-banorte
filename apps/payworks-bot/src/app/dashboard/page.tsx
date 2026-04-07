'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/presentation/components/Header';
import { StatCard } from '@/presentation/components/StatCard';
import { CertificationsTable } from '@/presentation/components/CertificationsTable';

interface DashboardStats {
  total: number;
  aprobadas: number;
  rechazadas: number;
  pendientes: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    aprobadas: 0,
    rechazadas: 0,
    pendientes: 0,
  });

  useEffect(() => {
    fetch('/api/certificacion/historial')
      .then(res => res.json())
      .then(result => {
        if (result.success && result.data) {
          const sessions = result.data;
          setStats({
            total: sessions.length,
            aprobadas: sessions.filter((s: any) => s.verdict === 'APROBADO').length,
            rechazadas: sessions.filter((s: any) => s.verdict === 'RECHAZADO').length,
            pendientes: sessions.filter((s: any) => s.verdict === 'PENDIENTE').length,
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen w-full bg-banorte-bg flex flex-col">
      <Header />
      <main className="flex-1 w-full max-w-[1440px] mx-auto flex flex-col">
        <section className="pt-8 px-[60px] pb-6 flex flex-col gap-1">
          <h1 className="text-banorte-dark font-bold text-[28px] leading-tight">
            Dashboard de Certificacion
          </h1>
          <p className="text-banorte-secondary text-sm">
            Gestion y seguimiento de certificaciones de comercios en Payworks
          </p>
        </section>

        <section className="px-[60px] pb-8">
          <div className="flex flex-wrap gap-5">
            <StatCard
              title="Total Certificaciones"
              value={stats.total || '--'}
              subtitle="Sesion actual"
              accentColor="#323E48"
            />
            <StatCard
              title="Aprobadas"
              value={stats.aprobadas || '--'}
              subtitle={stats.total > 0 ? `${Math.round((stats.aprobadas / stats.total) * 100)}% tasa de aprobacion` : 'Sin datos'}
              accentColor="#6CC04A"
            />
            <StatCard
              title="Rechazadas"
              value={stats.rechazadas || '--'}
              subtitle={stats.total > 0 ? `${Math.round((stats.rechazadas / stats.total) * 100)}% requieren correccion` : 'Sin datos'}
              accentColor="#EB0029"
            />
            <StatCard
              title="Pendientes"
              value={stats.pendientes || '--'}
              subtitle="En proceso de validacion"
              accentColor="#FFA400"
            />
          </div>
        </section>

        <section className="px-[60px] pb-10">
          <CertificationsTable />
        </section>
      </main>
    </div>
  );
}
