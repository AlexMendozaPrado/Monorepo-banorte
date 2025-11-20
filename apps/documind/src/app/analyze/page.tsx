"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import UploadDropzone from "@/components/UploadDropzone";
import KeywordsPane from "./components/KeywordsPane";
import SimplePDFViewer from "@/components/SimplePDFViewer";
import { LoadingStage } from "@/components/LoadingStates";
import { Keyword } from "@/core/domain/documents/Keyword";

export default function AnalyzePage() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<LoadingStage>('uploading');
  const [progress, setProgress] = useState(0);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const handleFileUpload = async (file: File) => {
    try {
      // Reset state
      setKeywords([]);
      setIsLoading(true);
      setProgress(0);

      // Create preview URL immediately
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      setFileName(file.name);

      // Stage 1: Uploading
      setLoadingStage('uploading');
      setProgress(10);

      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Stage 2: Extracting text
      setLoadingStage('extracting');
      setProgress(30);

      // Prepare form data
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", "generic");

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

      // Use the full Keyword objects from the service response
      const keywordObjects = (data.keywords || []) as Keyword[];

      // Small delay to show completion
      await new Promise(resolve => setTimeout(resolve, 500));

      setKeywords(keywordObjects);
      setIsLoading(false);
    } catch (err) {
      console.error("Error analyzing document:", err);
      // Fallback to demo keywords on error
      setKeywords([
        { phrase: "Error", kind: "Estado" },
        { phrase: "Análisis", kind: "Proceso" },
        { phrase: "Fallido", kind: "Resultado" }
      ]);
      setIsLoading(false);

      // Clean up URL on error
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
        setFileUrl(null);
        setFileName("");
      }
    }
  };

  // Clean up URL when component unmounts or file changes
  React.useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  return (
    <div className="min-h-screen flex flex-col bg-primary text-textPrimary">
      <Header />
      <div className="gap-4 px-6 flex flex-1 py-5 flex-col lg:flex-row">
        {/* Left Column - Document Upload and Viewer */}
        <main className="flex flex-col flex-1 max-w-none lg:max-w-[60%]">
          <div className="flex flex-wrap justify-between gap-3 p-4">
            <p className="text-[32px] font-bold leading-tight tracking-tight">Analizar Documento</p>
          </div>

          {/* Upload or PDF Viewer */}
          <div className="flex flex-col p-4 flex-1">
            {!fileUrl ? (
              <>
                <UploadDropzone
                  onFileUpload={handleFileUpload}
                  isUploading={isLoading && loadingStage === 'uploading'}
                />
                <p className="text-textSecondary text-sm font-normal leading-normal pb-3 pt-3 text-center">
                  Formatos de archivo admitidos: PDF
                </p>
              </>
            ) : (
              <div className="flex-1 min-h-[600px]">
                <SimplePDFViewer fileUrl={fileUrl} fileName={fileName} />
              </div>
            )}
          </div>
        </main>

        {/* Right Column - Keywords Panel */}
        <div className="w-full lg:w-[360px]">
          {isLoading ? (
            <div className="p-4">
              <h2 className="text-textPrimary text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3">
                Palabras Clave
              </h2>
              <div className="flex flex-col py-6">
                <div className="text-textSecondary text-sm">
                  {loadingStage === 'uploading' && 'Subiendo archivo...'}
                  {loadingStage === 'extracting' && 'Extrayendo texto...'}
                  {loadingStage === 'analyzing' && 'Analizando con IA...'}
                  {loadingStage === 'complete' && 'Completado'}
                </div>
                {progress && (
                  <div className="w-full bg-surface1 rounded-full h-2 mt-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <KeywordsPane keywords={keywords} />
          )}
        </div>
      </div>
    </div>
  );
}
