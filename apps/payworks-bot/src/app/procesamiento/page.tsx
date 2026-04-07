import Link from 'next/link';
import { Header } from '@/presentation/components/Header';
import { ProcessingChecklist } from '@/presentation/components/ProcessingChecklist';

const mockTransactions = [
  { name: 'VENTA VISA', referencia: '320146914713', status: 'completed' as const, verdict: 'Aprobado' as const, time: '2.3s' },
  { name: 'VENTA MC', referencia: '320146914714', status: 'completed' as const, verdict: 'Aprobado' as const, time: '1.8s' },
  { name: 'CANCELACION VISA', referencia: '320146914800', status: 'completed' as const, verdict: 'Rechazado' as const, time: '3.1s' },
  { name: 'CANCELACION MC', referencia: '320146914801', status: 'completed' as const, verdict: 'Aprobado' as const, time: '2.0s' },
  { name: 'DEVOLUCION VISA', referencia: '320146914850', status: 'completed' as const, verdict: 'Aprobado' as const, time: '2.5s' },
  { name: 'DEVOLUCION MC', referencia: '320146914851', status: 'processing' as const, currentStep: 'Consultando BD Oracle...' },
  { name: 'PREAUTH VISA', status: 'pending' as const },
  { name: 'PREAUTH MC', status: 'pending' as const },
  { name: 'POSTAUTH VISA', status: 'pending' as const },
  { name: 'POSTAUTH MC', status: 'pending' as const },
];

export default function ProcesamientoPage() {
  return (
    <div className="flex flex-col min-h-screen bg-banorte-bg">
      <Header />
      <main className="flex-1 p-8 w-full flex flex-col items-center">
        <ProcessingChecklist
          merchantName="Liverpool SA de CV"
          integrationType="E-Commerce Tradicional"
          progress={6}
          total={10}
          transactions={mockTransactions}
          currentStepDetail="Descargando LOGs desde OwnCloud..."
        />

        <div className="w-full max-w-[720px] flex justify-start mt-6">
          <Link href="/dashboard" className="px-6 py-3 rounded-btn border border-[#D1D5DB] text-banorte-dark font-medium hover:bg-gray-50 transition-colors">
            Cancelar
          </Link>
        </div>
      </main>
    </div>
  );
}
