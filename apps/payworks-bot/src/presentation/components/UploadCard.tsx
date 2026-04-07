'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUp, ArrowRight, Upload, FileText } from 'lucide-react';
import { Button } from '@banorte/ui';

const INTEGRATION_OPTIONS = [
  { value: 'ECOMMERCE_TRADICIONAL', label: 'E-Commerce Tradicional' },
  { value: 'ECOMMERCE_TOKENIZACION', label: 'E-Commerce con Tokenizacion' },
  { value: 'VENTANA_COMERCIOS', label: 'Ventana de Comercios' },
  { value: 'CYBERSOURCE_DIRECTO', label: 'Cybersource Directo' },
  { value: 'AGREGADOR_ECOMM', label: 'Agregador E-Commerce (Esquema 1)' },
  { value: 'AGREGADOR_CARGOS_AUTO', label: 'Agregador Cargos Automaticos (Esquema 4)' },
];

const OPERATION_MODES = [
  { id: 'semi' as const, title: 'Semi-automatico', desc: 'Sube CSV de BD y LOGs manualmente. No requiere acceso a red interna.' },
  { id: 'auto' as const, title: 'Totalmente Automatizado', desc: 'Conexion directa a BD Oracle y OwnCloud. Requiere acceso a red interna.' },
];

export function UploadCard() {
  const router = useRouter();
  const [selectedIntegration, setSelectedIntegration] = useState(INTEGRATION_OPTIONS[0].value);
  const [selectedMode, setSelectedMode] = useState<'semi' | 'auto'>('semi');
  const [isDragging, setIsDragging] = useState(false);
  const [matrizFile, setMatrizFile] = useState<File | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [servletLogFile, setServletLogFile] = useState<File | null>(null);
  const [prosaLogFile, setProsaLogFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const matrizInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const servletInputRef = useRef<HTMLInputElement>(null);
  const prosaInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) setMatrizFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!matrizFile) { setError('Sube la Matriz de Pruebas'); return; }
    if (selectedMode === 'semi' && (!csvFile || !servletLogFile || !prosaLogFile)) {
      setError('En modo semi-automatico, sube el CSV de BD y ambos archivos de LOG');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('matriz', matrizFile);
      formData.append('integrationType', selectedIntegration);
      formData.append('operationMode', selectedMode);

      if (selectedMode === 'semi') {
        if (csvFile) formData.append('csvBD', csvFile);
        if (servletLogFile) formData.append('servletLog', servletLogFile);
        if (prosaLogFile) formData.append('prosaLog', prosaLogFile);
      }

      const res = await fetch('/api/certificacion/validar', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Error en la certificacion');
      }

      // Guardar resultado en sessionStorage y navegar a resultados
      sessionStorage.setItem(`certification_${data.data.id}`, JSON.stringify(data.data));
      router.push(`/resultados/${data.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-card shadow-card p-[40px] flex flex-col gap-[32px]">
      {/* Paso 1: Dropzone Matriz */}
      <div className="flex flex-col gap-3">
        <h2 className="font-semibold text-base text-banorte-dark">Paso 1: Subir Matriz de Pruebas</h2>
        <div
          className={`w-full rounded-card border-2 border-dashed transition-colors cursor-pointer flex flex-col items-center justify-center py-12 gap-3
            ${isDragging ? 'border-banorte-red bg-[#FDF0F1]' : 'border-[#D1D5D9] bg-banorte-surface'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => matrizInputRef.current?.click()}
        >
          <input type="file" ref={matrizInputRef} className="hidden" accept=".xlsx,.xls" onChange={(e) => e.target.files?.[0] && setMatrizFile(e.target.files[0])} />
          <div className="w-[46px] h-[46px] rounded-full bg-banorte-red flex items-center justify-center mb-2">
            <ArrowUp className="text-white w-6 h-6" strokeWidth={3} />
          </div>
          <p className="font-semibold text-base text-banorte-dark">
            {matrizFile ? matrizFile.name : 'Arrastra tu Matriz de Pruebas aqui'}
          </p>
          <p className="text-[13px] text-banorte-secondary">
            {matrizFile ? 'Haz clic para cambiar el archivo' : 'o haz clic para seleccionar archivo (.xlsx, .xls)'}
          </p>
        </div>
      </div>

      {/* Paso 2: Tipo de Integracion */}
      <div className="flex flex-col gap-3">
        <h2 className="font-semibold text-base text-banorte-dark">Paso 2: Tipo de Integracion del Comercio</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-5">
          {INTEGRATION_OPTIONS.map((option) => {
            const isSelected = selectedIntegration === option.value;
            return (
              <div
                key={option.value}
                onClick={() => setSelectedIntegration(option.value)}
                className={`flex items-center gap-2.5 px-4 py-3.5 rounded-input cursor-pointer transition-colors
                  ${isSelected ? 'border-2 border-banorte-red bg-[#FDF0F1]' : 'border border-[#D1D5D9] bg-white'}`}
              >
                <div className={`w-[18px] h-[18px] rounded-full border-2 shrink-0
                  ${isSelected ? 'border-banorte-red bg-banorte-red' : 'border-[#D1D5D9]'}`}
                />
                <span className={`text-[13px] text-banorte-dark ${isSelected ? 'font-semibold' : ''}`}>
                  {option.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Paso 3: Modo de Operacion */}
      <div className="flex flex-col gap-3">
        <h2 className="font-semibold text-base text-banorte-dark">Paso 3: Modo de Operacion</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {OPERATION_MODES.map((mode) => {
            const isSelected = selectedMode === mode.id;
            return (
              <div
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={`flex flex-col gap-2 p-5 rounded-card cursor-pointer transition-colors
                  ${isSelected ? 'border-2 border-banorte-red bg-[#FDF0F1]' : 'border border-[#D1D5D9] bg-white'}`}
              >
                <h3 className={`font-semibold text-sm ${isSelected ? 'text-banorte-red' : 'text-banorte-dark'}`}>
                  {mode.title}
                </h3>
                <p className="text-xs text-banorte-secondary">{mode.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Paso 4: Archivos adicionales (solo modo semi-auto) */}
      {selectedMode === 'semi' && (
        <div className="flex flex-col gap-3">
          <h2 className="font-semibold text-base text-banorte-dark">Paso 4: Subir datos de BD y LOGs</h2>

          {/* CSV de BD */}
          <div
            className={`w-full rounded-card border-2 border-dashed cursor-pointer flex items-center gap-4 px-6 py-4
              ${csvFile ? 'border-banorte-success bg-[#E9F6E2]' : 'border-[#D1D5D9] bg-banorte-surface'}`}
            onClick={() => csvInputRef.current?.click()}
          >
            <input type="file" ref={csvInputRef} className="hidden" accept="*" onChange={(e) => e.target.files?.[0] && setCsvFile(e.target.files[0])} />
            <Upload className={`w-5 h-5 ${csvFile ? 'text-banorte-success' : 'text-banorte-secondary'}`} />
            <div>
              <p className="font-medium text-sm text-banorte-dark">{csvFile ? csvFile.name : 'CSV exportado de Toad/SQLDeveloper'}</p>
              <p className="text-xs text-banorte-secondary">Resultado del query a VTRANSACCIONES (.csv)</p>
            </div>
          </div>

          {/* LOGs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className={`rounded-card border-2 border-dashed cursor-pointer flex items-center gap-4 px-6 py-4
                ${servletLogFile ? 'border-banorte-success bg-[#E9F6E2]' : 'border-[#D1D5D9] bg-banorte-surface'}`}
              onClick={() => servletInputRef.current?.click()}
            >
              <input type="file" ref={servletInputRef} className="hidden" accept="*" onChange={(e) => e.target.files?.[0] && setServletLogFile(e.target.files[0])} />
              <FileText className={`w-5 h-5 ${servletLogFile ? 'text-banorte-success' : 'text-banorte-secondary'}`} />
              <div>
                <p className="font-medium text-sm text-banorte-dark">{servletLogFile ? servletLogFile.name : 'LOG Servlet'}</p>
                <p className="text-xs text-banorte-secondary">Http.log del servidor PAYW_ENTRADA</p>
              </div>
            </div>

            <div
              className={`rounded-card border-2 border-dashed cursor-pointer flex items-center gap-4 px-6 py-4
                ${prosaLogFile ? 'border-banorte-success bg-[#E9F6E2]' : 'border-[#D1D5D9] bg-banorte-surface'}`}
              onClick={() => prosaInputRef.current?.click()}
            >
              <input type="file" ref={prosaInputRef} className="hidden" accept="*" onChange={(e) => e.target.files?.[0] && setProsaLogFile(e.target.files[0])} />
              <FileText className={`w-5 h-5 ${prosaLogFile ? 'text-banorte-success' : 'text-banorte-secondary'}`} />
              <div>
                <p className="font-medium text-sm text-banorte-dark">{prosaLogFile ? prosaLogFile.name : 'LOG PROSA'}</p>
                <p className="text-xs text-banorte-secondary">Http.log del servidor PAYW_AUTORIZADOR</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-[#FFF4F4] border border-banorte-error/20 rounded-card px-4 py-3 text-sm text-banorte-error">
          {error}
        </div>
      )}

      {/* CTA */}
      <div className="flex justify-end mt-4">
        <Button variant="primary" size="lg" className="gap-2" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Procesando...' : 'Iniciar Certificacion'}
          {!isLoading && <ArrowRight className="w-4 h-4" strokeWidth={2.5} />}
        </Button>
      </div>
    </div>
  );
}
