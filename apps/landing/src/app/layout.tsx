import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Banorte - Portal de Aplicaciones',
  description: 'Selecciona la aplicación que deseas explorar',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
