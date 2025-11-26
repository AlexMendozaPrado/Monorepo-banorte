'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Description as ConclusionIcon,
  CompareArrows as CompareIcon,
} from '@mui/icons-material';
import { SessionDashboardResponse, ApiResponse } from '../../../../shared/types/api';
import { SessionMetricsCards } from '../../../components/SessionMetricsCards';
import { LikertScaleDisplay } from '../../../components/LikertScaleDisplay';
import { EmotionalTimeline } from '../../../components/EmotionalTimeline';
import { BlockersAchievements } from '../../../components/BlockersAchievements';
import { SessionConclusion } from '../../../components/SessionConclusion';
import { formatDate, getSentimentColor, formatSentiment } from '../../../../shared/utils/formatters';
import { SentimentType } from '../../../../core/domain/value-objects/SentimentType';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function SessionDashboardPage() {
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<SessionDashboardResponse | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (!id) {
      setError('ID de análisis no proporcionado');
      setLoading(false);
      return;
    }

    fetchDashboard();
  }, [id]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/sessions/dashboard/${id}`);
      const data: ApiResponse<SessionDashboardResponse> = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.error || 'Error al cargar el dashboard');
      }

      setDashboard(data.data);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!dashboard) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">No se encontró información del dashboard</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <DashboardIcon sx={{ mr: 1, color: 'primary.main', fontSize: 40 }} />
          <Typography variant="h4" component="h1">
            Dashboard de Sesión
          </Typography>
        </Box>

        <Card variant="outlined" sx={{ bgcolor: '#f5f5f5' }}>
          <CardContent>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Cliente
                </Typography>
                <Typography variant="h6">{dashboard.analysis.clientName}</Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Documento
                </Typography>
                <Typography variant="h6">{dashboard.analysis.documentName}</Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Canal
                </Typography>
                <Typography variant="h6">{dashboard.analysis.channel}</Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Sentimiento
                </Typography>
                <Chip
                  label={formatSentiment(dashboard.analysis.overallSentiment)}
                  sx={{
                    bgcolor: getSentimentColor(dashboard.analysis.overallSentiment),
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                />
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Fecha
                </Typography>
                <Typography variant="body1">{formatDate(dashboard.analysis.createdAt)}</Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Duración
                </Typography>
                <Typography variant="h6">{dashboard.metrics.duration} min</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="dashboard tabs">
          <Tab icon={<DashboardIcon />} label="Métricas" iconPosition="start" />
          <Tab icon={<ConclusionIcon />} label="Conclusión" iconPosition="start" />
          <Tab icon={<CompareIcon />} label="Comparación" iconPosition="start" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Metrics Cards */}
          <SessionMetricsCards metrics={dashboard.metrics} />

          {/* Likert Scale */}
          <LikertScaleDisplay
            score={dashboard.analysis.overallSentiment === SentimentType.POSITIVE ? 6 : dashboard.analysis.overallSentiment === SentimentType.NEUTRAL ? 4 : 2}
            confidence={dashboard.analysis.confidence}
            keywords={dashboard.metrics.keywords}
          />

          {/* Emotional Timeline */}
          <EmotionalTimeline timeline={dashboard.metrics.emotionalTimeline} />

          {/* Blockers & Achievements */}
          <BlockersAchievements
            blockers={dashboard.metrics.blockers}
            achievements={dashboard.metrics.achievements}
            actionItems={dashboard.metrics.actionItems}
          />
        </Box>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <SessionConclusion conclusion={dashboard.conclusion} />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {dashboard.historicalComparison ? (
            <>
              {/* Previous Session Comparison */}
              {dashboard.historicalComparison.previousSession && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Comparación con Sesión Anterior
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mt: 2 }}>
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Card variant="outlined" sx={{ bgcolor: '#f5f5f5' }}>
                          <CardContent>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Sesión Anterior
                            </Typography>
                            <Typography variant="body2">
                              Productividad: <strong>{dashboard.historicalComparison.previousSession.productivityScore}</strong>
                            </Typography>
                            <Typography variant="body2">
                              Efectividad: <strong>{dashboard.historicalComparison.previousSession.effectivenessScore}</strong>
                            </Typography>
                            <Typography variant="body2">
                              Blockers: <strong>{dashboard.historicalComparison.previousSession.blockers.length}</strong>
                            </Typography>
                            <Typography variant="body2">
                              Logros: <strong>{dashboard.historicalComparison.previousSession.achievements.length}</strong>
                            </Typography>
                          </CardContent>
                        </Card>
                      </Box>

                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Card variant="outlined" sx={{ bgcolor: '#e8f5e9' }}>
                          <CardContent>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Sesión Actual
                            </Typography>
                            <Typography variant="body2">
                              Productividad: <strong>{dashboard.metrics.productivityScore}</strong>
                              {dashboard.metrics.productivityScore > dashboard.historicalComparison.previousSession.productivityScore && ' ▲'}
                              {dashboard.metrics.productivityScore < dashboard.historicalComparison.previousSession.productivityScore && ' ▼'}
                            </Typography>
                            <Typography variant="body2">
                              Efectividad: <strong>{dashboard.metrics.effectivenessScore}</strong>
                              {dashboard.metrics.effectivenessScore > dashboard.historicalComparison.previousSession.effectivenessScore && ' ▲'}
                              {dashboard.metrics.effectivenessScore < dashboard.historicalComparison.previousSession.effectivenessScore && ' ▼'}
                            </Typography>
                            <Typography variant="body2">
                              Blockers: <strong>{dashboard.metrics.blockers.length}</strong>
                              {dashboard.metrics.blockers.length < dashboard.historicalComparison.previousSession.blockers.length && ' ▼ Mejoró'}
                              {dashboard.metrics.blockers.length > dashboard.historicalComparison.previousSession.blockers.length && ' ▲ Empeoró'}
                            </Typography>
                            <Typography variant="body2">
                              Logros: <strong>{dashboard.metrics.achievements.length}</strong>
                              {dashboard.metrics.achievements.length > dashboard.historicalComparison.previousSession.achievements.length && ' ▲'}
                              {dashboard.metrics.achievements.length < dashboard.historicalComparison.previousSession.achievements.length && ' ▼'}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              )}

              {/* Averages Comparison */}
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Comparación con Promedios Históricos
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
                    <Box sx={{ flex: 1, minWidth: 200 }}>
                      <Typography variant="body2" color="text.secondary">
                        Productividad
                      </Typography>
                      <Typography variant="h5">
                        {dashboard.metrics.productivityScore} <Typography component="span" variant="body2" color="text.secondary">
                          vs {dashboard.historicalComparison.averages.productivity} (promedio)
                        </Typography>
                      </Typography>
                      <Chip
                        label={`${dashboard.metrics.productivityScore > dashboard.historicalComparison.averages.productivity ? '+' : ''}${(dashboard.metrics.productivityScore - dashboard.historicalComparison.averages.productivity).toFixed(0)} puntos`}
                        size="small"
                        color={dashboard.metrics.productivityScore > dashboard.historicalComparison.averages.productivity ? 'success' : 'error'}
                        sx={{ mt: 1 }}
                      />
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 200 }}>
                      <Typography variant="body2" color="text.secondary">
                        Efectividad
                      </Typography>
                      <Typography variant="h5">
                        {dashboard.metrics.effectivenessScore} <Typography component="span" variant="body2" color="text.secondary">
                          vs {dashboard.historicalComparison.averages.effectiveness} (promedio)
                        </Typography>
                      </Typography>
                      <Chip
                        label={`${dashboard.metrics.effectivenessScore > dashboard.historicalComparison.averages.effectiveness ? '+' : ''}${(dashboard.metrics.effectivenessScore - dashboard.historicalComparison.averages.effectiveness).toFixed(0)} puntos`}
                        size="small"
                        color={dashboard.metrics.effectivenessScore > dashboard.historicalComparison.averages.effectiveness ? 'success' : 'error'}
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Box>

                  <Alert severity="info" sx={{ mt: 3 }}>
                    {dashboard.metrics.productivityScore > dashboard.historicalComparison.averages.productivity &&
                     dashboard.metrics.effectivenessScore > dashboard.historicalComparison.averages.effectiveness
                      ? '✓ Esta sesión superó los promedios históricos en todas las métricas clave. Tendencia positiva.'
                      : 'Esta sesión presenta oportunidades de mejora comparada con el promedio histórico.'}
                  </Alert>
                </CardContent>
              </Card>
            </>
          ) : (
            <Alert severity="info">No hay suficientes datos históricos para comparar</Alert>
          )}
        </Box>
      </TabPanel>
    </Container>
  );
}
