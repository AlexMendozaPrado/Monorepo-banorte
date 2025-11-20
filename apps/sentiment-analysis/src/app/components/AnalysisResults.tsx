'use client';

import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  SentimentSatisfied as SentimentIcon,
  Psychology as PsychologyIcon,
  Assessment as AssessmentIcon,
  Timer as TimerIcon,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { AnalysisResponse } from '../../shared/types/api';
import { EmotionScore } from '../../core/domain/value-objects/EmotionScore';
import {
  formatSentiment,
  getSentimentColor,
  getSentimentIcon,
  formatConfidence,
  getConfidenceColor,
  formatEmotion,
  getEmotionColor,
  formatDate,
  formatProcessingTime,
  formatNumber,
  getReadabilityLevel,
  getReadabilityColor,
} from '../../shared/utils/formatters';

interface AnalysisResultsProps {
  analysis: AnalysisResponse & { extendedAnalysis?: any };
}

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  const extendedData = analysis.extendedAnalysis;
  // Prepare emotion data for charts
  const validEmotions: Array<keyof EmotionScore> = ['joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust'];
  const emotionData = validEmotions
    .filter(emotion => emotion in analysis.emotionScores)
    .map(emotion => ({
      name: formatEmotion(emotion),
      value: analysis.emotionScores[emotion],
      color: getEmotionColor(emotion),
    }));

  const sentimentData = [
    {
      name: 'Confianza',
      value: analysis.confidence * 100,
      color: getConfidenceColor(analysis.confidence),
    },
  ];

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <AssessmentIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h5" component="h3">
            Resultados del Análisis
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Overall Sentiment */}
          <Grid item xs={12} md={6} lg={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <SentimentIcon
                  sx={{
                    fontSize: 40,
                    color: getSentimentColor(analysis.overallSentiment),
                    mb: 1,
                  }}
                />
                <Typography variant="h6" gutterBottom>
                  Sentimiento General
                </Typography>
                <Chip
                  label={`${getSentimentIcon(analysis.overallSentiment)} ${formatSentiment(analysis.overallSentiment)}`}
                  sx={{
                    backgroundColor: getSentimentColor(analysis.overallSentiment),
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Confidence */}
          <Grid item xs={12} md={6} lg={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <PsychologyIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Nivel de Confianza
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    color: getConfidenceColor(analysis.confidence),
                    fontWeight: 'bold',
                  }}
                >
                  {formatConfidence(analysis.confidence)}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={analysis.confidence * 100}
                  sx={{
                    mt: 1,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getConfidenceColor(analysis.confidence),
                    },
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Processing Time */}
          <Grid item xs={12} md={6} lg={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <TimerIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Tiempo de Procesamiento
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {formatProcessingTime(analysis.processingTimeMs)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Document Info */}
          <Grid item xs={12} md={6} lg={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Información del Documento
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Cliente: {analysis.clientName}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Canal: {analysis.channel}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Fecha: {formatDate(analysis.createdAt)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Emotion Distribution Chart */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Distribución de Emociones
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={emotionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${(value * 100).toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {emotionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${(value * 100).toFixed(1)}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Emotion Bars */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Intensidad de Emociones
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={emotionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                    <Tooltip formatter={(value: number) => `${(value * 100).toFixed(1)}%`} />
                    <Bar dataKey="value" fill="#8884d8">
                      {emotionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Text Metrics */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Métricas del Texto
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      Palabras
                    </Typography>
                    <Typography variant="h6">
                      {formatNumber(analysis.analysisMetrics.wordCount)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      Oraciones
                    </Typography>
                    <Typography variant="h6">
                      {formatNumber(analysis.analysisMetrics.sentenceCount)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      Párrafos
                    </Typography>
                    <Typography variant="h6">
                      {formatNumber(analysis.analysisMetrics.paragraphCount)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      Promedio Palabras/Oración
                    </Typography>
                    <Typography variant="h6">
                      {analysis.analysisMetrics.averageWordsPerSentence.toFixed(1)}
                    </Typography>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Nivel de Legibilidad
                    </Typography>
                    <Typography variant="h6">
                      {getReadabilityLevel(analysis.analysisMetrics.readabilityScore)}
                    </Typography>
                  </Box>
                  <Chip
                    label={`${analysis.analysisMetrics.readabilityScore.toFixed(1)} puntos`}
                    sx={{
                      backgroundColor: getReadabilityColor(analysis.analysisMetrics.readabilityScore),
                      color: 'white',
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Extended Analysis Section */}
          {extendedData && (
            <Grid item xs={12}>
              <Card variant="outlined" sx={{ mt: 3, bgcolor: '#f5f5f5' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    📊 Análisis Extendido Detallado
                  </Typography>
                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={3}>
                    {/* Sentimiento Detallado */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Sentimiento Detallado (Escala 1-7)
                      </Typography>
                      <Typography variant="h4" color="primary" fontWeight="bold">
                        {extendedData.sentimentScore}/7
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Confianza: {extendedData.confidenceLevel}%
                      </Typography>
                    </Grid>

                    {/* Palabras Clave */}
                    {extendedData.keywords && extendedData.keywords.length > 0 && (
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          Palabras Clave Principales
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {extendedData.keywords.slice(0, 6).map((kw: any, idx: number) => (
                            <Chip
                              key={idx}
                              label={`${kw.word} (${kw.frequency})`}
                              size="small"
                              color={kw.sentiment >= 5 ? "success" : kw.sentiment >= 4 ? "default" : "error"}
                            />
                          ))}
                        </Box>
                      </Grid>
                    )}

                    {/* Alertas */}
                    {extendedData.alerts && extendedData.alerts.length > 0 && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          ⚠️ Alertas y Recomendaciones
                        </Typography>
                        {extendedData.alerts.map((alert: any) => (
                          <Box
                            key={alert.id}
                            sx={{
                              p: 2,
                              mb: 1,
                              bgcolor: alert.priority === 'Alta' ? '#ffebee' : alert.priority === 'Media' ? '#fff3e0' : '#e3f2fd',
                              borderLeft: 4,
                              borderColor: alert.priority === 'Alta' ? 'error.main' : alert.priority === 'Media' ? 'warning.main' : 'info.main',
                            }}
                          >
                            <Typography variant="body2" fontWeight="bold">
                              [{alert.priority}] {alert.message}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {alert.context}
                            </Typography>
                          </Box>
                        ))}
                      </Grid>
                    )}

                    {/* Timeline */}
                    {extendedData.timeline && extendedData.timeline.length > 0 && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          📅 Timeline Emocional
                        </Typography>
                        {extendedData.timeline.map((point: any, idx: number) => (
                          <Box key={idx} sx={{ mb: 1 }}>
                            <Typography variant="body2">
                              <strong>{point.time}:</strong> Sentimiento {point.sentiment}/7 - {point.context}
                            </Typography>
                          </Box>
                        ))}
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
}
