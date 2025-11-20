import type { Metadata } from 'next';
import { ThemeProvider } from './components/ThemeProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import './globals.css';

export const metadata: Metadata = {
  title: 'Banorte - Análisis de Sentimientos',
  description: 'Plataforma de análisis de sentimientos para documentos PDF usando OpenAI GPT-4',
  keywords: 'banorte, análisis, sentimientos, pdf, openai, gpt-4',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-primary text-textPrimary font-sans">
        <ThemeProvider>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
