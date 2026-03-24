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
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import { Upload as UploadIcon, Analytics as AnalyticsIcon, Dashboard as DashboardIcon, Assessment as AssessmentIcon, Description as DescriptionIcon } from '@mui/icons-material';
import { FileUploadZone } from './FileUploadZone';
import { AnalysisResultsDynamic } from './AnalysisResultsDynamic';
import { RecentAnalyses } from './RecentAnalyses';
import { SessionMetricsCards } from './SessionMetricsCards';
import { LikertScaleDisplay } from './LikertScaleDisplay';
import { EmotionalTimelineDynamic } from './EmotionalTimelineDynamic';
import { BlockersAchievements } from './BlockersAchievements';
import { SessionConclusion } from './SessionConclusion';
import { AnalysisResponse } from '../../shared/types/api';
import { SentimentType } from '../../core/domain/value-objects/SentimentType';

export function AnalyzePage() {
  const [file, setFile] = useState<File | null>(null);
  const [clientName, setClientName] = useState('');
  const [channel, setChannel] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  // Nota: Las métricas de sesión y conclusión ahora están incluidas en analysisResult
  // No se necesitan estados separados ni llamadas API adicionales

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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

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
        // Reiniciar formulario
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
        {/* Formulario de Análisis */}
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

          {/* Resultados del Análisis */}
          {analysisResult && (
            <Box sx={{ mt: 3 }}>
              <AnalysisResultsDynamic analysis={analysisResult} />

              {/* Métricas de Sesión y Conclusión (ahora incluidas en analysisResult) */}
              {analysisResult.metrics && (
                <Box sx={{ mt: 4 }}>
                  {/* Divisor */}
                  <Divider sx={{ my: 2 }} />

                  {/* Navegación de Pestañas */}
                  <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs
                      value={activeTab}
                      onChange={handleTabChange}
                      aria-label="Dashboard tabs"
                      variant="fullWidth"
                    >
                      <Tab
                        icon={<AssessmentIcon />}
                        iconPosition="start"
                        label="Métricas y KPIs"
                        id="tab-0"
                        aria-controls="tabpanel-0"
                      />
                      <Tab
                        icon={<DescriptionIcon />}
                        iconPosition="start"
                        label="Resumen Ejecutivo"
                        id="tab-1"
                        aria-controls="tabpanel-1"
                      />
                    </Tabs>
                  </Box>

                  {/* Panel de Pestaña 1: Métricas y KPIs */}
                  {activeTab === 0 && (
                    <Box
                      role="tabpanel"
                      id="tabpanel-0"
                      aria-labelledby="tab-0"
                      sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}
                    >
                      {/* Visualización de Escala Likert */}
                      <LikertScaleDisplay
                        score={analysisResult.overallSentiment === SentimentType.POSITIVE ? 6 : analysisResult.overallSentiment === SentimentType.NEUTRAL ? 4 : 2}
                        confidence={analysisResult.confidence}
                        keywords={analysisResult.metrics.keywords}
                      />

                      {/* Tarjetas de Métricas de Sesión */}
                      <SessionMetricsCards metrics={analysisResult.metrics} />

                      {/* Línea de Tiempo Emocional */}
                      <EmotionalTimelineDynamic timeline={analysisResult.metrics.emotionalTimeline} />

                      {/* Bloqueadores y Logros */}
                      <BlockersAchievements
                        blockers={analysisResult.metrics.blockers}
                        achievements={analysisResult.metrics.achievements}
                        actionItems={analysisResult.metrics.actionItems}
                      />
                    </Box>
                  )}

                  {/* Panel de Pestaña 2: Resumen Ejecutivo */}
                  {activeTab === 1 && analysisResult.conclusion && (
                    <Box
                      role="tabpanel"
                      id="tabpanel-1"
                      aria-labelledby="tab-1"
                    >
                      <SessionConclusion conclusion={analysisResult.conclusion} />
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          )}
        </Grid>

        {/* Barra Lateral de Análisis Recientes */}
        <Grid item xs={12} lg={4}>
          <RecentAnalyses />
        </Grid>
      </Grid>
    </Box>
  );
}
