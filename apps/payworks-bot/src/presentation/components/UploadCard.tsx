'use client';

import React, { useState, useRef } from 'react';
import { ArrowUp, ArrowRight } from 'lucide-react';

const INTEGRATION_OPTIONS = [
  'E-Commerce Tradicional',
  'E-Commerce con Tokenizacion',
  'Ventana de Comercios',
  'Cybersource Directo',
  'Agregador E-Commerce (Esquema 1)',
  'Agregador Cargos Automaticos (Esquema 4)',
];

const OPERATION_MODES = [
  { id: 'semi' as const, title: 'Semi-automatico', desc: 'Sube CSV de BD y LOGs manualmente. No requiere acceso a red interna.' },
  { id: 'auto' as const, title: 'Totalmente Automatizado', desc: 'Conexion directa a BD Oracle y OwnCloud. Requiere acceso a red interna.' },
];

export function UploadCard() {
  const [selectedIntegration, setSelectedIntegration] = useState(INTEGRATION_OPTIONS[0]);
  const [selectedMode, setSelectedMode] = useState<'semi' | 'auto'>('auto');
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  return (
    <div className="w-full bg-white rounded-card shadow-card p-[40px] flex flex-col gap-[32px]">
      {/* Paso 1: Dropzone */}
      <div className="flex flex-col gap-3">
        <h2 className="font-semibold text-base text-banorte-dark">Paso 1: Subir Matriz de Pruebas</h2>
        <div
          className={`w-full rounded-card border-2 border-dashed transition-colors cursor-pointer flex flex-col items-center justify-center py-12 gap-3
            ${isDragging ? 'border-banorte-red bg-[#FDF0F1]' : 'border-[#D1D5D9] bg-banorte-surface'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.xls" onChange={handleFileChange} />
          <div className="w-[46px] h-[46px] rounded-full bg-banorte-red flex items-center justify-center mb-2">
            <ArrowUp className="text-white w-6 h-6" strokeWidth={3} />
          </div>
          <p className="font-semibold text-base text-banorte-dark">
            {file ? file.name : 'Arrastra tu Matriz de Pruebas aqui'}
          </p>
          <p className="text-[13px] text-banorte-secondary">
            {file ? 'Haz clic para cambiar el archivo' : 'o haz clic para seleccionar archivo (.xlsx, .xls)'}
          </p>
        </div>
      </div>

      {/* Paso 2: Tipo de Integracion */}
      <div className="flex flex-col gap-3">
        <h2 className="font-semibold text-base text-banorte-dark">Paso 2: Tipo de Integracion del Comercio</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-5">
          {INTEGRATION_OPTIONS.map((option) => {
            const isSelected = selectedIntegration === option;
            return (
              <div
                key={option}
                onClick={() => setSelectedIntegration(option)}
                className={`flex items-center gap-2.5 px-4 py-3.5 rounded-input cursor-pointer transition-colors
                  ${isSelected ? 'border-2 border-banorte-red bg-[#FDF0F1]' : 'border border-[#D1D5D9] bg-white'}`}
              >
                <div className={`w-[18px] h-[18px] rounded-full border-2 shrink-0
                  ${isSelected ? 'border-banorte-red bg-banorte-red' : 'border-[#D1D5D9]'}`}
                />
                <span className={`text-[13px] text-banorte-dark ${isSelected ? 'font-semibold' : ''}`}>
                  {option}
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

      {/* CTA */}
      <div className="flex justify-end mt-4">
        <button className="flex items-center gap-2 bg-banorte-red hover:bg-[#D00024] transition-colors text-white px-8 py-3.5 rounded-btn">
          <span className="font-semibold text-[15px]">Iniciar Certificacion</span>
          <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
