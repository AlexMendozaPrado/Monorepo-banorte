'use client';

import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Paper,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Send as SendIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useNotification } from '@/hooks/useNotification';
import { useGlobalNotifications } from '@/contexts/NotificationsContext';
import { rulesService } from '@/services/api';
import authService from '@/services/authService';
import { useNavigation } from '@/hooks/useNavigation';

export default function MapeoXMLPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [description, setDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mappingResult, setMappingResult] = useState<any>(null);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showSuccess, showError, showWarning } = useNotification();
  const { addNotification } = useGlobalNotifications();
  const { goToReglas } = useNavigation();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setFileContent(event.target?.result as string);
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleGenerateMapping = async () => {
    if (!selectedFile) {
      showWarning('Selecciona un archivo TXT o XML');
      return;
    }

    if (!description.trim()) {
      showWarning('Agrega una descripción para el mapeo');
      return;
    }

    setIsProcessing(true);
    try {
      const user = authService.getCurrentUser?.();
      if (!user?.id) {
        showError('No hay usuario autenticado. Inicia sesión nuevamente.');
        return;
      }

      const name = selectedFile.name.toLowerCase();
      const fileType = name.endsWith('.xml') ? 'xml' : 'txt';

      const result = await rulesService.generateMappedRule({
        usuario_id: user.id,
        descripcion: description.trim(),
        fileContent: fileContent,
        fileType,
        fileName: selectedFile.name
      });

      setMappingResult(result);
      showSuccess('¡Mapeo generado exitosamente!');
      addNotification({
        type: 'success',
        title: 'Mapeo Creado',
        message: `Mapeo ISO 20022 generado desde ${selectedFile.name}`
      });
    } catch (error) {
      console.error('Error generating mapping:', error);
      showError('Error al generar el mapeo');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setFileContent('');
    setDescription('');
    setMappingResult(null);
  };

  const handleExportResult = () => {
    if (!mappingResult) return;

    const blob = new Blob([JSON.stringify(mappingResult, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mapeo_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showSuccess('Resultado exportado');
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 600, color: '#333', mb: 4 }}>
        Mapeo de Archivos ISO 20022
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>
        {/* Input Panel */}
        <Card sx={{ border: '1px solid #e0e0e0', borderRadius: '12px' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', mb: 3 }}>
              Cargar Archivo
            </Typography>

            {/* File Upload Area */}
            <Box
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              sx={{
                border: `2px dashed ${dragOver ? '#EB0029' : '#e0e0e0'}`,
                borderRadius: '8px',
                p: 4,
                textAlign: 'center',
                backgroundColor: dragOver ? '#fff5f5' : '#fafafa',
                cursor: 'pointer',
                mb: 3,
                transition: 'all 0.3s'
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.xml"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <CloudUploadIcon sx={{ fontSize: 64, color: '#EB0029', mb: 2 }} />
              <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                {selectedFile ? selectedFile.name : 'Arrastra un archivo aquí'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                o haz clic para seleccionar un archivo TXT/XML
              </Typography>
            </Box>

            <TextField
              fullWidth
              label="Descripción del Mapeo"
              placeholder="Ej: Mapeo de archivo PAIN.001 para pagos internacionales"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={3}
              sx={{ mb: 3 }}
            />

            {isProcessing && <LinearProgress sx={{ mb: 2 }} />}

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<SendIcon />}
                onClick={handleGenerateMapping}
                disabled={isProcessing || !selectedFile}
                sx={{
                  bgcolor: '#EB0029',
                  py: 1.5,
                  '&:hover': { bgcolor: '#d4002a' },
                  '&:disabled': { bgcolor: '#ccc' }
                }}
              >
                {isProcessing ? 'Procesando...' : 'Generar Mapeo'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleReset}
                sx={{ borderColor: '#EB0029', color: '#EB0029' }}
              >
                Limpiar
              </Button>
            </Box>

            {mappingResult && (
              <Button
                fullWidth
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => goToReglas()}
                sx={{ mt: 2, borderColor: '#EB0029', color: '#EB0029' }}
              >
                Ver en Reglas
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Preview Panel */}
        <Card sx={{ border: '1px solid #e0e0e0', borderRadius: '12px' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', mb: 3 }}>
              Vista Previa del Archivo
            </Typography>

            {fileContent ? (
              <Paper sx={{ p: 2, bgcolor: '#fafafa', maxHeight: 400, overflow: 'auto' }}>
                <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
                  {fileContent.substring(0, 2000)}
                  {fileContent.length > 2000 && '\n\n... (contenido truncado)'}
                </Typography>
              </Paper>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="body1" color="textSecondary">
                  La vista previa del archivo aparecerá aquí
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Carga un archivo para comenzar
                </Typography>
              </Box>
            )}

            {mappingResult && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', mb: 2 }}>
                  Resultado del Mapeo
                </Typography>
                <Paper sx={{ p: 2, bgcolor: '#f0f7ff' }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    ✅ Mapeo generado exitosamente
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Regla guardada con ID: {mappingResult?.regla?.id_display || 'N/A'}
                  </Typography>
                </Paper>
                <Button
                  fullWidth
                  variant="text"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportResult}
                  sx={{ mt: 2, color: '#EB0029' }}
                >
                  Exportar Resultado
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Info Card */}
      <Card sx={{ border: '1px solid #e0e0e0', borderRadius: '12px', mt: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', mb: 2 }}>
            Acerca del Mapeo ISO 20022
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Esta herramienta permite mapear archivos de pago en formato ISO 20022 (PAIN.001, PAIN.002, etc.)
            a estructuras XML estandarizadas utilizando inteligencia artificial.
          </Typography>
          <Typography variant="body2" color="textSecondary">
            <strong>Formatos soportados:</strong> TXT (estructurado), XML (ISO 20022)
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
