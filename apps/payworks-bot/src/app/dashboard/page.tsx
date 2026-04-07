import { Header } from '@/presentation/components/Header';
import { StatCard } from '@/presentation/components/StatCard';
import { CertificationsTable } from '@/presentation/components/CertificationsTable';

export default function DashboardPage() {
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
            <StatCard title="Total Certificaciones" value="48" subtitle="Ultimos 30 dias" accentColor="#323E48" />
            <StatCard title="Aprobadas" value="36" subtitle="75% tasa de aprobacion" accentColor="#6CC04A" />
            <StatCard title="Rechazadas" value="8" subtitle="16.7% requieren correccion" accentColor="#EB0029" />
            <StatCard title="Pendientes" value="4" subtitle="En proceso de validacion" accentColor="#FFA400" />
          </div>
        </section>

        <section className="px-[60px] pb-10">
          <CertificationsTable />
        </section>
      </main>
    </div>
  );
}
