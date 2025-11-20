"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import UploadDropzone from "@/components/UploadDropzone";
import { LoadingStage } from "@/components/LoadingStates";
import { DashboardA } from "@/components/dashboard/DashboardA";
import { SentimentAnalysisResult } from "@/core/domain/documents/SentimentAnalysis";
import { ArrowLeft, FileText, Download, Share2 } from "lucide-react";

export default function SentimentAnalysisPage() {
  const [analysisData, setAnalysisData] = useState<SentimentAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<LoadingStage>('uploading');
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    try {
      // Reset state
      setAnalysisData(null);
      setError(null);
      setIsLoading(true);
      setProgress(0);
      setFileName(file.name);

      // Stage 1: Uploading
      setLoadingStage('uploading');
      setProgress(10);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Stage 2: Extracting text
      setLoadingStage('extracting');
      setProgress(30);

      // Prepare form data
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", "finance");

      // Stage 3: Analyzing with AI
      setLoadingStage('analyzing');
      setProgress(60);

      // Call API
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      setProgress(90);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error analyzing document");
      }

      // Complete
      setProgress(100);
      setLoadingStage('complete');

      // Small delay to show completion
      await new Promise(resolve => setTimeout(resolve, 500));

      // Set the sentiment analysis data
      if (data.sentimentAnalysis) {
        setAnalysisData(data.sentimentAnalysis);
      } else {
        throw new Error("No sentiment analysis data received");
      }

      setIsLoading(false);
    } catch (err) {
      console.error("Error analyzing document:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysisData(null);
    setFileName("");
    setError(null);
    setProgress(0);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Custom Header for Sentiment Analysis */}
      <header className="bg-white border-b-4 border-red-600 h-16 flex items-center justify-between px-8">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-gray-800">
            Análisis de Sentimientos Banorte
          </h1>
        </div>
        <div className="flex items-center space-x-6">
          <button className="flex items-center space-x-1 text-sm font-normal text-gray-600 hover:border-b-2 hover:border-red-600 pb-1">
            <FileText size={16} />
            <span>Documentos</span>
          </button>
          {analysisData && (
            <>
              <button className="flex items-center space-x-1 text-sm font-normal text-gray-600 hover:border-b-2 hover:border-red-600 pb-1">
                <Download size={16} />
                <span>Descargar PDF</span>
              </button>
              <button className="flex items-center space-x-1 text-sm font-normal text-gray-600 hover:border-b-2 hover:border-red-600 pb-1">
                <Share2 size={16} />
                <span>Compartir</span>
              </button>
            </>
          )}
        </div>
      </header>

      <div className="container mx-auto px-8 py-8">
        {!analysisData ? (
          <>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Análisis de Sentimientos
            </h2>
            <p className="text-gray-600 mb-12 font-normal">
              Analice documentos PDF para obtener insights sobre el sentimiento y
              menciones de sus clientes
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 pb-16 border-b-2 border-gray-200">
              <div className="p-8 flex flex-col items-center">
                <FileText className="text-red-600 mb-6" size={32} />
                <h3 className="text-lg font-bold mb-3 text-gray-800">
                  Carga Documentos
                </h3>
                <p className="text-sm text-center text-gray-600 font-normal">
                  Suba archivos PDF para análisis automático
                </p>
              </div>
              <div className="p-8 flex flex-col items-center">
                <FileText className="text-red-600 mb-6" size={32} />
                <h3 className="text-lg font-bold mb-3 text-gray-800">
                  Métricas Detalladas
                </h3>
                <p className="text-sm text-center text-gray-600 font-normal">
                  Sentimientos, distribución y análisis de texto
                </p>
              </div>
              <div className="p-8 flex flex-col items-center">
                <FileText className="text-red-600 mb-6" size={32} />
                <h3 className="text-lg font-bold mb-3 text-gray-800">
                  Insights Accionables
                </h3>
                <p className="text-sm text-center text-gray-600 font-normal">
                  Alertas y recomendaciones de negocio
                </p>
              </div>
            </div>

            {/* Upload Section */}
            <div className="pt-8">
              <h3 className="text-lg font-bold mb-8 text-gray-800 flex items-center">
                <FileText className="mr-2" size={20} />
                Nuevo Análisis de Sentimientos
              </h3>

              {isLoading ? (
                <div className="border-2 border-gray-200 p-16 flex flex-col items-center justify-center h-64">
                  <div className="text-gray-800 font-bold mb-4">
                    {loadingStage === 'uploading' && 'Subiendo archivo...'}
                    {loadingStage === 'extracting' && 'Extrayendo texto...'}
                    {loadingStage === 'analyzing' && 'Analizando sentimientos con IA...'}
                    {loadingStage === 'complete' && 'Completado'}
                  </div>
                  <div className="w-full max-w-md bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-4">{progress}%</p>
                </div>
              ) : (
                <UploadDropzone onFileUpload={handleFileUpload} isUploading={false} />
              )}

              {error && (
                <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-600 text-red-800">
                  <p className="font-bold">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Back Button */}
            <button
              onClick={handleReset}
              className="flex items-center text-gray-600 hover:border-b-2 hover:border-red-600 mb-8 font-normal pb-1"
            >
              <ArrowLeft size={20} className="mr-2" />
              Volver a cargar documento
            </button>

            {/* Dashboard Title */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Dashboard Ejecutivo
              </h2>
              <p className="text-gray-600">
                Documento: <span className="font-bold">{fileName}</span>
              </p>
            </div>

            {/* Dashboard A Component */}
            <DashboardA analysisData={analysisData} />
          </>
        )}
      </div>
    </div>
  );
}
