'use client';

import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  ShowChart as ChartIcon,
  CalendarToday as CalendarIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { SessionTrendsResponse } from '../../shared/types/api';
import { formatDate } from '../../shared/utils/formatters';

interface SessionTrendsProps {
  trends: SessionTrendsResponse;
}

export function SessionTrends({ trends }: SessionTrendsProps) {
  // Map API trend values to display trend values
  const mapTrendValue = (trend: 'increasing' | 'decreasing' | 'stable'): 'improving' | 'declining' | 'stable' => {
    if (trend === 'increasing') return 'improving';
    if (trend === 'decreasing') return 'declining';
    return 'stable';
  };

  const getTrendIcon = (trend: 'improving' | 'declining' | 'stable') => {
    if (trend === 'improving') return <TrendingUpIcon sx={{ color: '#6CC04A' }} />;
    if (trend === 'declining') return <TrendingDownIcon sx={{ color: '#EB0029' }} />;
    return <TrendingFlatIcon sx={{ color: '#FFA400' }} />;
  };

  const getTrendColor = (trend: 'improving' | 'declining' | 'stable'): string => {
    if (trend === 'improving') return '#6CC04A';
    if (trend === 'declining') return '#EB0029';
    return '#FFA400';
  };

  const getStatusColor = (status: 'resolved' | 'ongoing' | 'new'): string => {
    if (status === 'resolved') return '#6CC04A';
    if (status === 'ongoing') return '#FFA400';
    return '#EB0029';
  };

  // Transform time series data for charts
  const timeSeriesData = trends.timeSeries.map((point) => ({
    date: new Date(point.date).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' }),
    productivity: point.productivityScore,
    sentiment: point.sentimentScore * 14.28, // Convert 1-7 to 0-100 scale
    blockers: point.blockersCount,
    achievements: point.achievementsCount,
  }));

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <ChartIcon sx={{ mr: 1, color: 'primary.main', fontSize: 32 }} />
        <Typography variant="h5" component="h3">
          Tendencias de Sesiones
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <CalendarIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                {trends.sessionsCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sesiones Analizadas
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                {new Date(trends.timeRange.from).toLocaleDateString('es-MX')} - {new Date(trends.timeRange.to).toLocaleDateString('es-MX')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <AssessmentIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                {trends.averageProductivity.toFixed(0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Productividad Promedio
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                {getTrendIcon(trends.productivityTrend)}
                <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                  {trends.productivityTrend === 'improving' ? 'Mejorando' : trends.productivityTrend === 'declining' ? 'Declinando' : 'Estable'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <AssessmentIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                {trends.averageSentiment.toFixed(1)}/7
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sentiment Promedio
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                {getTrendIcon(trends.sentimentTrend)}
                <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                  {trends.sentimentTrend === 'improving' ? 'Mejorando' : trends.sentimentTrend === 'declining' ? 'Declinando' : 'Estable'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <AssessmentIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                {trends.averageDuration.toFixed(0)} min
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Duración Promedio
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                {trends.totalParticipants} participantes totales
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Time Series Chart */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Evolución en el Tiempo
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={timeSeriesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorProductivity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6CC04A" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#6CC04A" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorSentiment" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFA400" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#FFA400" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="productivity"
                    stroke="#6CC04A"
                    fillOpacity={1}
                    fill="url(#colorProductivity)"
                    name="Productividad"
                  />
                  <Area
                    type="monotone"
                    dataKey="sentiment"
                    stroke="#FFA400"
                    fillOpacity={1}
                    fill="url(#colorSentiment)"
                    name="Sentiment"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Metrics Evolution */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Evolución de Blockers y Logros
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={timeSeriesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="blockers" fill="#FF671B" name="Blockers" />
                  <Bar dataKey="achievements" fill="#6CC04A" name="Logros" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* NPS & Errors Evolution */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Evolución de NPS y Errores
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={[...trends.npsEvolution.map((nps, idx) => ({
                    date: new Date(nps.date).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' }),
                    nps: nps.value,
                    errors: trends.errorsEvolution[idx]?.value || 0,
                  }))]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="nps" stroke="#6CC04A" strokeWidth={2} name="NPS" />
                  <Line yAxisId="right" type="monotone" dataKey="errors" stroke="#EB0029" strokeWidth={2} name="Errores" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recurring Topics */}
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Temas Recurrentes
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Tema</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Ocurrencias</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Sentiment Promedio</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Tendencia</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Primera / Última</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {trends.recurringTopics.map((topic, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell>{topic.topic}</TableCell>
                        <TableCell align="center">
                          <Chip label={topic.occurrences} size="small" color="primary" />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={topic.averageSentiment.toFixed(1)}
                            size="small"
                            sx={{
                              bgcolor: topic.averageSentiment >= 5 ? '#6CC04A' : topic.averageSentiment >= 4 ? '#FFA400' : '#FF671B',
                              color: 'white',
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                            {getTrendIcon(mapTrendValue(topic.trend))}
                            <Typography variant="caption" sx={{ color: getTrendColor(mapTrendValue(topic.trend)) }}>
                              {topic.trend === 'increasing' ? 'Aumentando' : topic.trend === 'decreasing' ? 'Disminuyendo' : 'Estable'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={topic.status}
                            size="small"
                            sx={{
                              bgcolor: getStatusColor(topic.status),
                              color: 'white',
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="caption" color="text.secondary">
                            {new Date(topic.firstSeen).toLocaleDateString('es-MX')}
                            {' / '}
                            {new Date(topic.lastSeen).toLocaleDateString('es-MX')}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Projection */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ bgcolor: '#e3f2fd' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Proyección Próxima Sesión
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Basado en las últimas 3 sesiones
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2">Productividad Estimada:</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#6CC04A' }}>
                      {trends.nextSessionProjection.estimatedProductivity}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2">Sentiment Estimado:</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#FFA400' }}>
                      {trends.nextSessionProjection.estimatedSentiment.toFixed(1)}/7
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Confianza:</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {(trends.nextSessionProjection.confidence * 100).toFixed(0)}%
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Additional Stats */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Estadísticas Adicionales
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Día Más Productivo:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {trends.mostProductiveDay || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Promedio Blockers/Sesión:
                    </Typography>
                    <Chip
                      label={trends.averageBlockersPerSession.toFixed(1)}
                      size="small"
                      sx={{ bgcolor: '#FF671B', color: 'white' }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Promedio Logros/Sesión:
                    </Typography>
                    <Chip
                      label={trends.averageAchievementsPerSession.toFixed(1)}
                      size="small"
                      sx={{ bgcolor: '#6CC04A', color: 'white' }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
