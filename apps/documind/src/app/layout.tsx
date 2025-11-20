import type { Metadata } from "next";
import ThemeProvider from "./components/ThemeProvider";
import { ChatWidget } from "@/components/chat";
import "./globals.css";

export const metadata: Metadata = {
  title: "Banorte - Análisis de Documentos PDF con IA",
  description: "Aplicación de Banorte para analizar documentos PDF, extraer palabras clave y chat con IA usando RAG",
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
          {children}
          {/* Chat Widget flotante disponible en todas las páginas */}
          <ChatWidget />
        </ThemeProvider>
      </body>
    </html>
  );
}
