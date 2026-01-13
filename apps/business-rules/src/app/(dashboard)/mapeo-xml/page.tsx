'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  Paper
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';

import ValidationModal from '@/components/ValidationModal';
import xmlParserService from '@/services/xmlParser.service';
import mapeoAltamiraService, { type XMLNominaData, type XMLProveedoresData } from '@/services/mapeoAltamira.service';
import txtGeneratorService from '@/services/txtGenerator.service';
import { TIPOS_OPERACION_SISTEMA } from '@/types/xmlValidation.types';

const steps = ['Cargar XML', 'Validar Datos', 'Generar TXT'];

type TipoOperacion = 'proveedores' | 'nomina';

interface TxtResult {
  success: boolean;
  content?: string;
  totalLineas?: number;
  totalEmpleados?: number;
  errors?: string[];
}

interface NominaMapeadaData {
  empleados: any[];
  totalImporte: number;
  totalRegistros: number;
  fechaProceso: string;
}

export default function MapeoXMLPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Datos del proceso
  const [archivoXML, setArchivoXML] = useState<File | null>(null);
  const [tipoOperacion, setTipoOperacion] = useState<TipoOperacion | null>(null);
  const [registrosMapeados, setRegistrosMapeados] = useState<any[]>([]);
  const [nominaData, setNominaData] = useState<NominaMapeadaData | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [txtGenerado, setTxtGenerado] = useState<TxtResult | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xml')) {
      setError('Por favor selecciona un archivo XML válido');
      return;
    }

    setArchivoXML(file);
    setError(null);
    setSuccess(null);
  };

  const handleProcessXML = async () => {
    if (!archivoXML) {
      setError('Por favor selecciona un archivo XML');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Parsear XML
      const parseResult = await xmlParserService.parseXMLFile(archivoXML);

      if (!parseResult.success) {
        throw new Error(parseResult.error);
      }

      setTipoOperacion(parseResult.tipoOperacion as TipoOperacion);

      // 2. Mapear a formato Altamira
      let registros;
      if (parseResult.tipoOperacion === TIPOS_OPERACION_SISTEMA.NOMINA) {
        // Cast to XMLNominaData - structure is compatible
        const xmlNominaData = parseResult.data as unknown as XMLNominaData;
        const datosNomina = mapeoAltamiraService.mapearNomina(xmlNominaData);
        registros = datosNomina.empleados;
        // Store full nomina data for TXT generation
        setNominaData(datosNomina);
      } else {
        // Cast to XMLProveedoresData - structure is compatible
        const provData = parseResult.data as unknown as XMLProveedoresData;
        registros = mapeoAltamiraService.mapearProveedores(provData);
        setNominaData(null);
      }

      if (!registros || registros.length === 0) {
        throw new Error('No se encontraron registros para mapear');
      }

      setRegistrosMapeados(registros);
      setActiveStep(1);
      setShowValidationModal(true);
      setSuccess(`Se mapearon ${registros.length} registros correctamente`);

    } catch (err: any) {
      setError(err.message || 'Error al procesar el archivo XML');
    } finally {
      setLoading(false);
    }
  };

  const handleValidationConfirm = async (registrosValidados: any[]) => {
    console.log('📥 handleValidationConfirm llamado con', registrosValidados.length, 'registros');
    console.log('📋 Tipo de operación:', tipoOperacion);

    setShowValidationModal(false);
    setLoading(true);
    setError(null);

    try {
      // 3. Generar TXT
      console.log('🔧 Llamando a generarTXT...');

      let result;
      if (tipoOperacion === 'nomina') {
        // For nómina, we need to pass NominaMapeada object with updated employees
        const nominaMapeada = {
          empleados: registrosValidados,
          totalImporte: registrosValidados.reduce((sum: number, emp: any) => sum + (emp.salario || 0), 0),
          totalRegistros: registrosValidados.length,
          fechaProceso: nominaData?.fechaProceso || new Date().toISOString()
        };
        console.log('📋 Datos de nómina para TXT:', nominaMapeada);
        result = txtGeneratorService.generarTXT(nominaMapeada, tipoOperacion);
      } else {
        // For proveedores, pass the array directly
        result = txtGeneratorService.generarTXT(registrosValidados, tipoOperacion);
      }

      console.log('📄 Resultado de generarTXT:', result);

      if (!result.success) {
        console.error('❌ Generación falló con errores:', result.errors);
        throw new Error(result.errors?.join('\n') || 'Error al generar TXT');
      }

      console.log('✅ TXT generado exitosamente, actualizando estado...');
      setTxtGenerado(result);
      setActiveStep(2);
      setSuccess('TXT generado exitosamente. Listo para descargar.');
      console.log('✅ Estado actualizado, activeStep = 2');

    } catch (err: any) {
      console.error('❌ Error en handleValidationConfirm:', err);
      setError(err.message || 'Error al generar el archivo TXT');
      setShowValidationModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTXT = () => {
    if (txtGenerado && txtGenerado.content) {
      txtGeneratorService.descargarTXT(txtGenerado.content, tipoOperacion);
      setSuccess('Archivo TXT descargado exitosamente');
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setArchivoXML(null);
    setTipoOperacion(null);
    setRegistrosMapeados([]);
    setNominaData(null);
    setTxtGenerado(null);
    setError(null);
    setSuccess(null);
  };

  return (
    <Box sx={{
      p: { xs: 2, md: 4 },
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      maxWidth: '1400px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <Typography variant="h3" sx={{ mb: 2, fontWeight: 700, color: '#333', textAlign: 'center' }}>
        Mapeo XML Bancario
      </Typography>
      <Typography variant="h6" sx={{ mb: 5, color: '#666', textAlign: 'center', fontWeight: 400 }}>
        Convierte archivos XML ISO 20022 a formato TXT Altamira
      </Typography>

      {/* Stepper */}
      <Paper sx={{ p: 4, mb: 4, boxShadow: 3 }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel
                sx={{
                  '& .MuiStepLabel-label': {
                    fontSize: '1.1rem',
                    fontWeight: 500
                  }
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Mensajes */}
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 4,
            fontSize: '1.1rem',
            py: 2,
            boxShadow: 2
          }}
          onClose={() => setError(null)}
        >
          <Typography variant="h6" sx={{ mb: 0.5 }}>Error</Typography>
          <Typography variant="body1">{error}</Typography>
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{
            mb: 4,
            fontSize: '1.1rem',
            py: 2,
            boxShadow: 2
          }}
          onClose={() => setSuccess(null)}
        >
          <Typography variant="h6" sx={{ mb: 0.5 }}>Éxito</Typography>
          <Typography variant="body1">{success}</Typography>
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ mb: 4 }}>
          <LinearProgress sx={{ height: 8, borderRadius: 1 }} />
          <Typography variant="body1" sx={{ mt: 2, textAlign: 'center', color: '#666' }}>
            Procesando archivo...
          </Typography>
        </Box>
      )}

      {/* Contenido por paso */}
      <Card sx={{ boxShadow: 3 }}>
        <CardContent sx={{ p: { xs: 3, md: 6 }, minHeight: '500px' }}>
          {activeStep === 0 && (
            <Box sx={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
              <CloudUploadIcon sx={{ fontSize: 140, color: '#EB0029', mb: 3 }} />
              <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
                Paso 1: Cargar Archivo XML
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 5, fontWeight: 400 }}>
                Selecciona un archivo XML en formato ISO 20022 (pain.001)
              </Typography>

              <input
                accept=".xml"
                id="xml-file-input"
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
              <label htmlFor="xml-file-input">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  size="large"
                  sx={{
                    backgroundColor: '#EB0029',
                    color: 'white',
                    fontSize: '1.1rem',
                    py: 2,
                    px: 5,
                    '&:hover': { backgroundColor: '#c70023' }
                  }}
                >
                  SELECCIONAR ARCHIVO
                </Button>
              </label>

              {archivoXML && (
                <Box sx={{ mt: 5 }}>
                  <Alert
                    severity="info"
                    sx={{
                      mb: 4,
                      fontSize: '1rem',
                      py: 2,
                      '& .MuiAlert-message': {
                        width: '100%'
                      }
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      <strong>Archivo seleccionado:</strong> {archivoXML.name}
                    </Typography>
                    <Typography variant="body1">
                      Tamaño: {(archivoXML.size / 1024).toFixed(2)} KB
                    </Typography>
                  </Alert>

                  <Button
                    variant="contained"
                    onClick={handleProcessXML}
                    disabled={loading}
                    size="large"
                    sx={{
                      backgroundColor: '#EB0029',
                      fontSize: '1.1rem',
                      py: 2,
                      px: 6,
                      '&:hover': { backgroundColor: '#c70023' }
                    }}
                  >
                    Procesar XML
                  </Button>
                </Box>
              )}
            </Box>
          )}

          {activeStep === 1 && (
            <Box sx={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
              <CheckCircleIcon sx={{ fontSize: 140, color: '#10b981', mb: 3 }} />
              <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
                Paso 2: Validación de Datos
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 5, fontWeight: 400 }}>
                Los datos han sido mapeados. Revisa y edita en el modal de validación.
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  onClick={() => setShowValidationModal(true)}
                  size="large"
                  sx={{
                    backgroundColor: '#EB0029',
                    fontSize: '1.1rem',
                    py: 2,
                    px: 5,
                    '&:hover': { backgroundColor: '#c70023' }
                  }}
                >
                  Abrir Validación
                </Button>

                <Button
                  variant="outlined"
                  onClick={handleReset}
                  size="large"
                  sx={{
                    borderColor: '#EB0029',
                    color: '#EB0029',
                    fontSize: '1.1rem',
                    py: 2,
                    px: 5,
                    '&:hover': { borderColor: '#c70023', backgroundColor: 'rgba(235, 0, 41, 0.04)' }
                  }}
                >
                  Reiniciar Proceso
                </Button>
              </Box>
            </Box>
          )}

          {activeStep === 2 && txtGenerado && (
            <Box sx={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
              <DownloadIcon sx={{ fontSize: 140, color: '#6366f1', mb: 3 }} />
              <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
                Paso 3: Descargar TXT
              </Typography>

              <Alert
                severity="success"
                sx={{
                  mb: 4,
                  textAlign: 'left',
                  fontSize: '1rem',
                  py: 2,
                  '& .MuiAlert-message': {
                    width: '100%'
                  }
                }}
              >
                <Typography variant="h6" sx={{ mb: 2 }}>
                  <strong>✓ TXT Generado Exitosamente</strong>
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body1">
                    • Total de líneas: <strong>{txtGenerado.totalLineas || txtGenerado.totalEmpleados}</strong>
                  </Typography>
                  <Typography variant="body1">
                    • Tipo: <strong>{tipoOperacion === 'proveedores' ? 'Proveedores' : 'Nómina'}</strong>
                  </Typography>
                </Box>
              </Alert>

              {/* Vista previa simplificada */}
              <Paper
                sx={{
                  p: 3,
                  mb: 4,
                  backgroundColor: '#f8f9fa',
                  maxHeight: 250,
                  overflow: 'auto',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                  textAlign: 'left',
                  border: '2px solid #e0e0e0'
                }}
              >
                <Typography
                  variant="caption"
                  component="pre"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    fontSize: '0.9rem'
                  }}
                >
                  {txtGenerado.content?.substring(0, 500)}...
                </Typography>
              </Paper>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  onClick={handleDownloadTXT}
                  startIcon={<DownloadIcon />}
                  size="large"
                  sx={{
                    backgroundColor: '#EB0029',
                    fontSize: '1.1rem',
                    py: 2,
                    px: 5,
                    '&:hover': { backgroundColor: '#c70023' }
                  }}
                >
                  Descargar TXT
                </Button>

                <Button
                  variant="outlined"
                  onClick={handleReset}
                  size="large"
                  sx={{
                    borderColor: '#EB0029',
                    color: '#EB0029',
                    fontSize: '1.1rem',
                    py: 2,
                    px: 5,
                    '&:hover': { borderColor: '#c70023', backgroundColor: 'rgba(235, 0, 41, 0.04)' }
                  }}
                >
                  Procesar Otro Archivo
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Modal de validación */}
      <ValidationModal
        open={showValidationModal}
        registros={registrosMapeados}
        tipoOperacion={tipoOperacion}
        onClose={() => setShowValidationModal(false)}
        onConfirm={handleValidationConfirm}
      />
    </Box>
  );
}
