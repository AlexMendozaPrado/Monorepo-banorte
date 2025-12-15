import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Banorte Financial Advisor',
  description: 'Tu asesor financiero inteligente',
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
