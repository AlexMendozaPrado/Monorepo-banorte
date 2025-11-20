import Header from '../../components/Header';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-primary">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-8">
        {children}
      </main>

      <footer className="bg-gray-100 py-3 mt-auto text-center">
        <div className="text-sm text-textSecondary space-y-2">
          <div>
            Términos Legales | Aviso de Privacidad | Consulta los costos y las comisiones de nuestros productos
          </div>
          <div>
            2025 Grupo Financiero Banorte. Derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
