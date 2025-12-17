import type { Metadata } from 'next'
import { AppLayout } from './components/layout/AppLayout'
import './globals.css'

export const metadata: Metadata = {
  title: 'SDK Version Control - Banorte',
  description: 'Monitoreo de versiones de SDKs para homologación entre plataformas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-banorte-bg antialiased">
        <AppLayout>
          {children}
        </AppLayout>
      </body>
    </html>
  )
}
