import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Payworks Bot - Certificacion Automatizada',
  description: 'Bot de validacion automatizada para certificacion de comercios en Payworks',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
