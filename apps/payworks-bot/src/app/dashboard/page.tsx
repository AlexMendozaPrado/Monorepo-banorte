import { Header } from '@/presentation/components/Header';

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
      </main>
    </div>
  );
}
