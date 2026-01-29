import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BIAN POC - Banorte',
  description: 'Explorador de capacidades BIAN para Banorte',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
