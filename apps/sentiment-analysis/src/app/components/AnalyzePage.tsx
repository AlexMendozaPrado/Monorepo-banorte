'use client';

import { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Upload as UploadIcon, Analytics as AnalyticsIcon } from '@mui/icons-material';
import { FileUploadZone } from './FileUploadZone';
import { AnalysisResults } from './AnalysisResults';
import { RecentAnalyses } from './RecentAnalyses';
import { AnalysisResponse } from '../../shared/types/api';

export function AnalyzePage() {
  const [file, setFile] = useState<File | null>(null);
  const [clientName, setClientName] = useState('');
  const [channel, setChannel] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const channels = [
    'Sucursal',
    'Call Center',
    'Banca Digital',
    'Banca Móvil',
    'Correo Electrónico',
    'Chat en Línea',
    'Redes Sociales',
    'Otro',
  ];

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!file || !clientName.trim() || !channel) {
      setError('Por favor completa todos los campos y selecciona un archivo.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('clientName', clientName.trim());
      formData.append('channel', channel);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al analizar el documento');
      }

      if (result.success) {
        setAnalysisResult(result.data);
        // Reset form
        setFile(null);
        setClientName('');
        setChannel('');
      } else {
        throw new Error(result.error || 'Error desconocido');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Error al procesar el análisis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setClientName('');
    setChannel('');
    setError(null);
    setAnalysisResult(null);
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Analysis Form */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <AnalyticsIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h5" component="h2">
                  Nuevo Análisis de Sentimientos
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nombre del Cliente"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    disabled={isAnalyzing}
                    placeholder="Ej: Juan Pérez"
                    required
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Canal de Comunicación</InputLabel>
                    <Select
                      value={channel}
                      label="Canal de Comunicación"
                      onChange={(e) => setChannel(e.target.value)}
                      disabled={isAnalyzing}
                    >
                      {channels.map((ch) => (
                        <MenuItem key={ch} value={ch}>
                          {ch}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FileUploadZone
                    onFileSelect={handleFileSelect}
                    selectedFile={file}
                    disabled={isAnalyzing}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      onClick={handleReset}
                      disabled={isAnalyzing}
                    >
                      Limpiar
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleAnalyze}
                      disabled={!file || !clientName.trim() || !channel || isAnalyzing}
                      startIcon={
                        isAnalyzing ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <UploadIcon />
                        )
                      }
                    >
                      {isAnalyzing ? 'Analizando...' : 'Analizar Documento'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {analysisResult && (
            <Box sx={{ mt: 3 }}>
              <AnalysisResults analysis={analysisResult} />
            </Box>
          )}
        </Grid>

        {/* Recent Analyses Sidebar */}
        <Grid item xs={12} lg={4}>
          <RecentAnalyses />
        </Grid>
      </Grid>
    </Box>
  );
}
