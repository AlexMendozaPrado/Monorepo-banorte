import { Header } from '@/presentation/components/Header';
import { UploadCard } from '@/presentation/components/UploadCard';

export default function NuevaCertificacionPage() {
  return (
    <div className="min-h-screen w-full bg-banorte-bg flex flex-col">
      <Header />
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-5 md:px-[60px] pt-10 pb-[60px] flex flex-col gap-6">
        <h1 className="font-bold text-[28px] text-banorte-dark">Nueva Certificacion</h1>
        <UploadCard />
      </main>
    </div>
  );
}
