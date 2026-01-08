import type { Metadata } from 'next'
import './globals.css'
import { AppLayout } from './components/layout/AppLayout'
import { FinancialProvider } from './context/FinancialContext'
import { PaymentAlertsProvider } from './context/PaymentAlertsContext'

export const metadata: Metadata = {
  title: 'Banorte Financial Advisor',
  description: 'Tu asesor financiero inteligente',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <FinancialProvider>
          <PaymentAlertsProvider>
            <AppLayout>{children}</AppLayout>
          </PaymentAlertsProvider>
        </FinancialProvider>
      </body>
    </html>
  )
}
