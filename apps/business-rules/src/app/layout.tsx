import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Business Rules Generator - Banorte',
  description: 'Generación automática de reglas de negocio basadas en regulaciones bancarias con IA',
  keywords: ['Banorte', 'Business Rules', 'Gemini AI', 'ISO 20022', 'Reglas de Negocio'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
