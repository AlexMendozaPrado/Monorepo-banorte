'use client';

import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  Speed as ProductivityIcon,
  CheckCircle as EffectivenessIcon,
  AutoFixHigh as ResolutionIcon,
  People as EngagementIcon,
  Timer as DurationIcon,
  Groups as ParticipantsIcon,
} from '@mui/icons-material';
import { SessionMetricsResponse } from '../../shared/types/api';
import { formatNumber } from '../../shared/utils/formatters';

interface SessionMetricsCardsProps {
  metrics: SessionMetricsResponse;
}

export function SessionMetricsCards({ metrics }: SessionMetricsCardsProps) {
  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#6CC04A'; // success.main - green
    if (score >= 60) return '#FFA400'; // warning.main - orange
    return '#FF671B'; // error.main - red
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bueno';
    if (score >= 40) return 'Regular';
    return 'Bajo';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <ProductivityIcon sx={{ mr: 1, color: 'primary.main', fontSize: 32 }} />
        <Typography variant="h5" component="h3">
          Métricas de Sesión
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {/* Productivity Score */}
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <ProductivityIcon
                sx={{
                  fontSize: 40,
                  color: getScoreColor(metrics.productivityScore),
                  mb: 1,
                }}
              />
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: getScoreColor(metrics.productivityScore) }}>
                {metrics.productivityScore}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Productividad
              </Typography>
              <Chip
                label={getScoreLabel(metrics.productivityScore)}
                size="small"
                sx={{
                  backgroundColor: getScoreColor(metrics.productivityScore),
                  color: 'white',
                  fontWeight: 'bold',
                }}
              />
              <LinearProgress
                variant="determinate"
                value={metrics.productivityScore}
                sx={{
                  mt: 2,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: getScoreColor(metrics.productivityScore),
                  },
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Effectiveness Score */}
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <EffectivenessIcon
                sx={{
                  fontSize: 40,
                  color: getScoreColor(metrics.effectivenessScore),
                  mb: 1,
                }}
              />
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: getScoreColor(metrics.effectivenessScore) }}>
                {metrics.effectivenessScore}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Efectividad
              </Typography>
              <Chip
                label={getScoreLabel(metrics.effectivenessScore)}
                size="small"
                sx={{
                  backgroundColor: getScoreColor(metrics.effectivenessScore),
                  color: 'white',
                  fontWeight: 'bold',
                }}
              />
              <LinearProgress
                variant="determinate"
                value={metrics.effectivenessScore}
                sx={{
                  mt: 2,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: getScoreColor(metrics.effectivenessScore),
                  },
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Resolution Rate */}
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <ResolutionIcon
                sx={{
                  fontSize: 40,
                  color: getScoreColor(metrics.resolutionRate),
                  mb: 1,
                }}
              />
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: getScoreColor(metrics.resolutionRate) }}>
                {metrics.resolutionRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Tasa de Resolución
              </Typography>
              <Chip
                label={getScoreLabel(metrics.resolutionRate)}
                size="small"
                sx={{
                  backgroundColor: getScoreColor(metrics.resolutionRate),
                  color: 'white',
                  fontWeight: 'bold',
                }}
              />
              <LinearProgress
                variant="determinate"
                value={metrics.resolutionRate}
                sx={{
                  mt: 2,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: getScoreColor(metrics.resolutionRate),
                  },
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Engagement Score */}
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <EngagementIcon
                sx={{
                  fontSize: 40,
                  color: getScoreColor(metrics.engagementScore),
                  mb: 1,
                }}
              />
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: getScoreColor(metrics.engagementScore) }}>
                {metrics.engagementScore}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Participación
              </Typography>
              <Chip
                label={getScoreLabel(metrics.engagementScore)}
                size="small"
                sx={{
                  backgroundColor: getScoreColor(metrics.engagementScore),
                  color: 'white',
                  fontWeight: 'bold',
                }}
              />
              <LinearProgress
                variant="determinate"
                value={metrics.engagementScore}
                sx={{
                  mt: 2,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: getScoreColor(metrics.engagementScore),
                  },
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Duration & Participants */}
        <Grid item xs={12} sm={6}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DurationIcon sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="h6">Duración de Sesión</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                {metrics.duration} min
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Tiempo total de la sesión
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ParticipantsIcon sx={{ mr: 1, color: 'secondary.main' }} />
                <Typography variant="h6">Participantes</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                {metrics.participantCount}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Personas en la sesión
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Time Distribution */}
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Distribución de Tiempo
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Problemas
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={metrics.problemsTimePercentage}
                      sx={{
                        flex: 1,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#FF671B',
                        },
                      }}
                    />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#FF671B', minWidth: '50px' }}>
                      {metrics.problemsTimePercentage}%
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Logros
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={metrics.achievementsTimePercentage}
                      sx={{
                        flex: 1,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#6CC04A',
                        },
                      }}
                    />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#6CC04A', minWidth: '50px' }}>
                      {metrics.achievementsTimePercentage}%
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Coordinación
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={metrics.coordinationTimePercentage}
                      sx={{
                        flex: 1,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#323E48',
                        },
                      }}
                    />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#323E48', minWidth: '50px' }}>
                      {metrics.coordinationTimePercentage}%
                    </Typography>
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
