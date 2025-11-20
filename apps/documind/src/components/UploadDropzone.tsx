"use client";

import { useState, DragEvent } from "react";

import { UploadingOverlay } from "./LoadingStates";

interface UploadDropzoneProps {
  onFileUpload: (file: File) => void;
  isUploading?: boolean;
}

export default function UploadDropzone({ onFileUpload, isUploading = false }: UploadDropzoneProps) {
  const [isOver, setIsOver] = useState(false);

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsOver(true);
    } else if (e.type === "dragleave") {
      setIsOver(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={`relative flex flex-col items-center gap-6 rounded-xl border-2 border-dashed px-6 py-14 transition-colors ${
        isOver ? "border-textSecondary" : "border-borderDashed"
      } ${isUploading ? "pointer-events-none" : ""}`}
      role="region"
      aria-label="Carga de PDF"
    >
      {/* Upload overlay when processing */}
      {isUploading && <UploadingOverlay />}

      <div className="flex max-w-[480px] flex-col items-center gap-2">
        <p className="text-lg font-bold leading-tight tracking-[-0.015em] text-textPrimary text-center">
          Arrastra y suelta un PDF aquí
        </p>
        <p className="text-sm font-normal leading-normal text-textPrimary text-center">O</p>
      </div>
      <label className={`flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-surface1 text-textPrimary text-sm font-bold leading-normal tracking-[0.015em] hover:opacity-95 focus-within:outline-none focus-within:ring-2 focus-within:ring-textPrimary/30 ${
        isUploading ? "opacity-50 cursor-not-allowed" : ""
      }`}>
        <span className="truncate">
          {isUploading ? "Procesando..." : "Seleccionar un archivo"}
        </span>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleChange}
          className="hidden"
          disabled={isUploading}
        />
      </label>
    </div>
  );
}
