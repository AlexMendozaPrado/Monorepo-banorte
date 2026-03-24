// Forzar renderizado dinámico para todas las páginas en este layout
export const dynamic = 'force-dynamic';

export default function TestUploadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

