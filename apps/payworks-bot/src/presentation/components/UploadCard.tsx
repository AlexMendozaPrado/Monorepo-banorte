'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUp, ArrowRight, Upload, FileText } from 'lucide-react';
import { Button } from '@banorte/ui';
import { LaboratoryType } from '@/core/domain/value-objects/LaboratoryType';

const LAB_OPTIONS: Array<{ value: LaboratoryType; title: string; desc: string }> = [
  { value: LaboratoryType.ECOMM, title: 'ECOMM', desc: 'TNP estándar — folios CE, CE3DS, CYB3D, etc.' },
  { value: LaboratoryType.CAV, title: 'CAV / VIP', desc: 'Comercios Alto Valor — folios VIP-…' },
  { value: LaboratoryType.AGREGADORES_AGREGADOR, title: 'Agregadores — Agregador', desc: 'Folios A-CE / A-CP / A-CTLSSINTSEG / A-INTERSEG' },
  { value: LaboratoryType.AGREGADORES_INTEGRADOR, title: 'Agregadores — Integrador', desc: 'Folios I-CE / I-CP / I-CTLSSINTSEG / I-INTERSEG' },
];

interface IntegrationOption {
  value: string;
  label: string;
  version: string;
  isTP?: boolean;
  supports3DS?: boolean;
  supportsCybersource?: boolean;
}

/**
 * 8 productos oficiales alineados con `IntegrationType.ts`. Los badges
 * determinan los drag-drops condicionales que se muestran debajo.
 */
const INTEGRATION_OPTIONS: IntegrationOption[] = [
  { value: 'ECOMMERCE_TRADICIONAL', label: 'Comercio Electrónico Tradicional', version: 'v2.5', supports3DS: true, supportsCybersource: true },
  { value: 'MOTO', label: 'MOTO (Mail/Telephone Order)', version: 'v1.5' },
  { value: 'CARGOS_PERIODICOS_POST', label: 'Cargos Periódicos Post', version: 'v2.1' },
  { value: 'VENTANA_COMERCIO_ELECTRONICO', label: 'Ventana de Comercio Electrónico (Cifrada)', version: 'v1.8', supports3DS: true, supportsCybersource: true },
  { value: 'AGREGADORES_COMERCIO_ELECTRONICO', label: 'Agregadores — Comercio Electrónico', version: 'v2.6.4', supports3DS: true },
  { value: 'AGREGADORES_CARGOS_PERIODICOS', label: 'Agregadores — Cargos Periódicos', version: 'v2.6.4' },
  { value: 'API_PW2_SEGURO', label: 'API PW2 Seguro', version: 'v2.4', isTP: true },
  { value: 'INTERREDES_REMOTO', label: 'Interredes Remoto', version: 'v1.7', isTP: true },
];

const OPERATION_MODES = [
  { id: 'semi' as const, title: 'Semi-automatico', desc: 'Sube CSV de BD y LOGs manualmente. No requiere acceso a red interna.' },
  { id: 'auto' as const, title: 'Totalmente Automatizado', desc: 'Conexion directa a BD Oracle y OwnCloud. Requiere acceso a red interna.' },
];

export function UploadCard() {
  const router = useRouter();
  const [selectedIntegration, setSelectedIntegration] = useState(INTEGRATION_OPTIONS[0].value);
  const [selectedMode, setSelectedMode] = useState<'semi' | 'auto'>('semi');
  const [laboratoryType, setLaboratoryType] = useState<LaboratoryType>(LaboratoryType.ECOMM);
  const [isDragging, setIsDragging] = useState(false);
  const [matrizFile, setMatrizFile] = useState<File | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [servletLogFile, setServletLogFile] = useState<File | null>(null);
  const [prosaLogFile, setProsaLogFile] = useState<File | null>(null);
  const [afiliacionesFile, setAfiliacionesFile] = useState<File | null>(null);
  const [threeDSLogFile, setThreeDSLogFile] = useState<File | null>(null);
  const [cybersourceLogFile, setCybersourceLogFile] = useState<File | null>(null);
  const [coordinador, setCoordinador] = useState('');
  const [lenguaje, setLenguaje] = useState('');
  const [versionAplicacion, setVersionAplicacion] = useState('');
  const [urlSubdominio, setUrlSubdominio] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const matrizInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const servletInputRef = useRef<HTMLInputElement>(null);
  const prosaInputRef = useRef<HTMLInputElement>(null);
  const afiliacionesInputRef = useRef<HTMLInputElement>(null);
  const threeDSInputRef = useRef<HTMLInputElement>(null);
  const cybersourceInputRef = useRef<HTMLInputElement>(null);

  const currentIntegration = INTEGRATION_OPTIONS.find(o => o.value === selectedIntegration);

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
      formData.append('laboratoryType', laboratoryType);
      if (coordinador.trim()) formData.append('coordinadorCertificacion', coordinador.trim());
      if (lenguaje.trim()) formData.append('lenguaje', lenguaje.trim());
      if (versionAplicacion.trim()) formData.append('versionAplicacion', versionAplicacion.trim());
      if (urlSubdominio.trim()) formData.append('urlSubdominio', urlSubdominio.trim());

      if (selectedMode === 'semi') {
        if (csvFile) formData.append('csvBD', csvFile);
        if (servletLogFile) formData.append('servletLog', servletLogFile);
        if (prosaLogFile) formData.append('prosaLog', prosaLogFile);
      }
      if (afiliacionesFile) formData.append('afiliaciones', afiliacionesFile);
      if (threeDSLogFile) formData.append('threeDSLog', threeDSLogFile);
      if (cybersourceLogFile) formData.append('cybersourceLog', cybersourceLogFile);

      const res = await fetch('/api/certificacion/validar', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Error en la certificacion');
      }

      // Navegar a resultados — la pagina lee del endpoint GET /api/certificacion/[id].
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
          <input data-testid="upload-matriz" type="file" ref={matrizInputRef} className="hidden" accept=".xlsx,.xls" onChange={(e) => e.target.files?.[0] && setMatrizFile(e.target.files[0])} />
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
        <h2 className="font-semibold text-base text-banorte-dark">Paso 2: Tipo de Integración del Comercio</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-5">
          {INTEGRATION_OPTIONS.map((option) => {
            const isSelected = selectedIntegration === option.value;
            return (
              <div
                key={option.value}
                data-testid={`integration-${option.value}`}
                onClick={() => setSelectedIntegration(option.value)}
                className={`flex items-center gap-2.5 px-4 py-3.5 rounded-input cursor-pointer transition-colors
                  ${isSelected ? 'border-2 border-banorte-red bg-[#FDF0F1]' : 'border border-[#D1D5D9] bg-white'}`}
              >
                <div className={`w-[18px] h-[18px] rounded-full border-2 shrink-0
                  ${isSelected ? 'border-banorte-red bg-banorte-red' : 'border-[#D1D5D9]'}`}
                />
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[13px] text-banorte-dark ${isSelected ? 'font-semibold' : ''}`}>
                      {option.label}
                    </span>
                    {option.isTP && (
                      <span className="text-[10px] font-bold text-white bg-banorte-dark rounded-full px-2 py-0.5">
                        TP
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-banorte-secondary">
                    {option.version}
                    {option.supports3DS && ' · 3DS'}
                    {option.supportsCybersource && ' · Cybersource'}
                  </span>
                </div>
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

      {/* Paso 3.5: Selector de laboratorio (NOMENCLATURAS FOLIOS LABS) */}
      <div className="flex flex-col gap-3">
        <h2 className="font-semibold text-base text-banorte-dark">Paso 3.5: Laboratorio</h2>
        <p className="text-xs text-banorte-secondary">
          Determina la nomenclatura del folio oficial. Cada laboratorio tiene su
          propia secuencia (ver NOMENCLATURAS FOLIOS LABS, abr-2026).
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {LAB_OPTIONS.map(opt => {
            const isSelected = laboratoryType === opt.value;
            return (
              <div
                key={opt.value}
                data-testid={`lab-${opt.value}`}
                onClick={() => setLaboratoryType(opt.value)}
                className={`rounded-card border cursor-pointer px-4 py-3 transition-colors
                  ${isSelected
                    ? 'border-banorte-red bg-[#FDF0F1]'
                    : 'border-[#D1D5D9] bg-white hover:border-banorte-red'}`}
              >
                <h3 className={`font-semibold text-sm ${isSelected ? 'text-banorte-red' : 'text-banorte-dark'}`}>
                  {opt.title}
                </h3>
                <p className="text-xs text-banorte-secondary">{opt.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Paso 3.5: Coordinador de Certificación */}
      <div className="flex flex-col gap-2">
        <h2 className="font-semibold text-base text-banorte-dark">Paso 4: Coordinador de certificación</h2>
        <p className="text-xs text-banorte-secondary">
          Nombre del responsable Banorte que firmará esta certificación. Aparecerá en la carta oficial.
        </p>
        <input
          type="text"
          value={coordinador}
          onChange={(e) => setCoordinador(e.target.value)}
          placeholder="Ej. Fabio Serrano"
          className="w-full md:w-1/2 h-[45px] px-4 rounded-input border border-[#D1D5D9] bg-white text-sm text-banorte-dark
                     focus:outline-none focus:border-banorte-red focus:ring-1 focus:ring-banorte-red"
          maxLength={80}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-banorte-secondary">Lenguaje de la aplicación</label>
            <input
              type="text"
              value={lenguaje}
              onChange={(e) => setLenguaje(e.target.value)}
              placeholder="Ej. RUST LANG / JAVA / NODEJS"
              className="h-[40px] px-3 rounded-input border border-[#D1D5D9] bg-white text-sm text-banorte-dark
                         focus:outline-none focus:border-banorte-red focus:ring-1 focus:ring-banorte-red"
              maxLength={60}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-banorte-secondary">Versión de la aplicación</label>
            <input
              type="text"
              value={versionAplicacion}
              onChange={(e) => setVersionAplicacion(e.target.value)}
              placeholder="Ej. 2.5 / NO PROPORCIONADA"
              className="h-[40px] px-3 rounded-input border border-[#D1D5D9] bg-white text-sm text-banorte-dark
                         focus:outline-none focus:border-banorte-red focus:ring-1 focus:ring-banorte-red"
              maxLength={40}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-banorte-secondary">URL del subdominio</label>
            <input
              type="text"
              value={urlSubdominio}
              onChange={(e) => setUrlSubdominio(e.target.value)}
              placeholder="Ej. https://api.mueveciudad.net"
              className="h-[40px] px-3 rounded-input border border-[#D1D5D9] bg-white text-sm text-banorte-dark
                         focus:outline-none focus:border-banorte-red focus:ring-1 focus:ring-banorte-red"
              maxLength={200}
            />
          </div>
        </div>
      </div>

      {/* Paso 5: Archivos adicionales (solo modo semi-auto) */}
      {selectedMode === 'semi' && (
        <div className="flex flex-col gap-3">
          <h2 className="font-semibold text-base text-banorte-dark">Paso 5: Subir datos de BD y LOGs</h2>

          {/* CSV de BD */}
          <div
            className={`w-full rounded-card border-2 border-dashed cursor-pointer flex items-center gap-4 px-6 py-4
              ${csvFile ? 'border-banorte-success bg-[#E9F6E2]' : 'border-[#D1D5D9] bg-banorte-surface'}`}
            onClick={() => csvInputRef.current?.click()}
          >
            <input data-testid="upload-csv" type="file" ref={csvInputRef} className="hidden" accept="*" onChange={(e) => e.target.files?.[0] && setCsvFile(e.target.files[0])} />
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
              <input data-testid="upload-servlet" type="file" ref={servletInputRef} className="hidden" accept="*" onChange={(e) => e.target.files?.[0] && setServletLogFile(e.target.files[0])} />
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
              <input data-testid="upload-prosa" type="file" ref={prosaInputRef} className="hidden" accept="*" onChange={(e) => e.target.files?.[0] && setProsaLogFile(e.target.files[0])} />
              <FileText className={`w-5 h-5 ${prosaLogFile ? 'text-banorte-success' : 'text-banorte-secondary'}`} />
              <div>
                <p className="font-medium text-sm text-banorte-dark">{prosaLogFile ? prosaLogFile.name : 'LOG PROSA'}</p>
                <p className="text-xs text-banorte-secondary">Http.log del servidor PAYW_AUTORIZADOR</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Paso 4b: Logs de capas transversales — condicional al producto */}
      {selectedMode === 'semi' && (currentIntegration?.supports3DS || currentIntegration?.supportsCybersource) && (
        <div className="flex flex-col gap-3">
          <h2 className="font-semibold text-base text-banorte-dark">Logs de capas transversales (opcional)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentIntegration?.supports3DS && (
              <div
                className={`rounded-card border-2 border-dashed cursor-pointer flex items-center gap-4 px-6 py-4
                  ${threeDSLogFile ? 'border-banorte-success bg-[#E9F6E2]' : 'border-[#D1D5D9] bg-banorte-surface'}`}
                onClick={() => threeDSInputRef.current?.click()}
              >
                <input
                  data-testid="upload-3ds"
                  type="file"
                  ref={threeDSInputRef}
                  className="hidden"
                  accept="*"
                  onChange={(e) => e.target.files?.[0] && setThreeDSLogFile(e.target.files[0])}
                />
                <FileText className={`w-5 h-5 ${threeDSLogFile ? 'text-banorte-success' : 'text-banorte-secondary'}`} />
                <div>
                  <p className="font-medium text-sm text-banorte-dark">
                    {threeDSLogFile ? threeDSLogFile.name : 'LOG 3D Secure'}
                  </p>
                  <p className="text-xs text-banorte-secondary">Log del servicio 3DS (indexado por FOLIO DE TRANSACCION)</p>
                </div>
              </div>
            )}
            {currentIntegration?.supportsCybersource && (
              <div
                className={`rounded-card border-2 border-dashed cursor-pointer flex items-center gap-4 px-6 py-4
                  ${cybersourceLogFile ? 'border-banorte-success bg-[#E9F6E2]' : 'border-[#D1D5D9] bg-banorte-surface'}`}
                onClick={() => cybersourceInputRef.current?.click()}
              >
                <input
                  data-testid="upload-cybersource"
                  type="file"
                  ref={cybersourceInputRef}
                  className="hidden"
                  accept="*"
                  onChange={(e) => e.target.files?.[0] && setCybersourceLogFile(e.target.files[0])}
                />
                <FileText className={`w-5 h-5 ${cybersourceLogFile ? 'text-banorte-success' : 'text-banorte-secondary'}`} />
                <div>
                  <p className="font-medium text-sm text-banorte-dark">
                    {cybersourceLogFile ? cybersourceLogFile.name : 'LOG Cybersource'}
                  </p>
                  <p className="text-xs text-banorte-secondary">Log Cybersource Direct (indexado por OrderId)</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Paso 5: Afiliaciones (CSV/TXT) — opcional */}
      <div className="flex flex-col gap-3">
        <h2 className="font-semibold text-base text-banorte-dark">
          Paso {selectedMode === 'semi' ? '5' : '4'}: Datos de Afiliaciones (opcional)
        </h2>
        <div
          className={`w-full rounded-card border-2 border-dashed cursor-pointer flex items-center gap-4 px-6 py-4
            ${afiliacionesFile ? 'border-banorte-success bg-[#E9F6E2]' : 'border-[#D1D5D9] bg-banorte-surface'}`}
          onClick={() => afiliacionesInputRef.current?.click()}
        >
          <input
            data-testid="upload-afiliaciones"
            type="file"
            ref={afiliacionesInputRef}
            className="hidden"
            accept=".csv,.txt"
            onChange={(e) => e.target.files?.[0] && setAfiliacionesFile(e.target.files[0])}
          />
          <Upload className={`w-5 h-5 ${afiliacionesFile ? 'text-banorte-success' : 'text-banorte-secondary'}`} />
          <div>
            <p className="font-medium text-sm text-banorte-dark">
              {afiliacionesFile ? afiliacionesFile.name : 'Export de NPAYW.AFILIACIONES (.csv o .txt)'}
            </p>
            <p className="text-xs text-banorte-secondary">
              Resultado del query SELECT * FROM NPAYW.AFILIACIONES. Se usa para rellenar la carta oficial.
            </p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-[#FFF4F4] border border-banorte-error/20 rounded-card px-4 py-3 text-sm text-banorte-error">
          {error}
        </div>
      )}

      {/* CTA */}
      <div className="flex justify-end mt-4">
        <Button data-testid="submit-certification" variant="primary" size="lg" className="gap-2" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Procesando...' : 'Iniciar Certificacion'}
          {!isLoading && <ArrowRight className="w-4 h-4" strokeWidth={2.5} />}
        </Button>
      </div>
    </div>
  );
}
