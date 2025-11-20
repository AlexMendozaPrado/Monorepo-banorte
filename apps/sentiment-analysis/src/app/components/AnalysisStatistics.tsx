'use client';

import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  Assessment as AssessmentIcon,
  VerifiedUser as ConfidenceIcon,
  Tv as ChannelIcon,
} from '@mui/icons-material';
import { HistoricalAnalysisResponse } from '../../shared/types/api';
import { formatNumber, formatConfidence } from '../../shared/utils/formatters';

interface AnalysisStatisticsProps {
  statistics: HistoricalAnalysisResponse['statistics'];
}

export function AnalysisStatistics({ statistics }: AnalysisStatisticsProps) {
  const getSentimentPercentage = (count: number) => {
    return statistics.totalAnalyses > 0 ? (count / statistics.totalAnalyses) * 100 : 0;
  };

  const positivePercentage = getSentimentPercentage(statistics.positiveCount);
  const neutralPercentage = getSentimentPercentage(statistics.neutralCount);
  const negativePercentage = getSentimentPercentage(statistics.negativeCount);

  return (
    <Grid container spacing={2}>
      {/* Total Analyses */}
      <Grid item xs={12} sm={6} md={3}>
        <Card variant="outlined">
          <CardContent sx={{ textAlign: 'center' }}>
            <AssessmentIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {formatNumber(statistics.totalAnalyses)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total de Análisis
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Positive Sentiment */}
      <Grid item xs={12} sm={6} md={3}>
        <Card variant="outlined">
          <CardContent sx={{ textAlign: 'center' }}>
            <TrendingUpIcon sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
              {formatNumber(statistics.positiveCount)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Positivos ({positivePercentage.toFixed(1)}%)
            </Typography>
            <LinearProgress
              variant="determinate"
              value={positivePercentage}
              sx={{
                mt: 1,
                height: 6,
                borderRadius: 3,
                backgroundColor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: 'success.main',
                },
              }}
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Neutral Sentiment */}
      <Grid item xs={12} sm={6} md={3}>
        <Card variant="outlined">
          <CardContent sx={{ textAlign: 'center' }}>
            <TrendingFlatIcon sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
              {formatNumber(statistics.neutralCount)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Neutrales ({neutralPercentage.toFixed(1)}%)
            </Typography>
            <LinearProgress
              variant="determinate"
              value={neutralPercentage}
              sx={{
                mt: 1,
                height: 6,
                borderRadius: 3,
                backgroundColor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: 'warning.main',
                },
              }}
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Negative Sentiment */}
      <Grid item xs={12} sm={6} md={3}>
        <Card variant="outlined">
          <CardContent sx={{ textAlign: 'center' }}>
            <TrendingDownIcon sx={{ fontSize: 32, color: 'error.main', mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main' }}>
              {formatNumber(statistics.negativeCount)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Negativos ({negativePercentage.toFixed(1)}%)
            </Typography>
            <LinearProgress
              variant="determinate"
              value={negativePercentage}
              sx={{
                mt: 1,
                height: 6,
                borderRadius: 3,
                backgroundColor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: 'error.main',
                },
              }}
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Average Confidence */}
      <Grid item xs={12} sm={6} md={6}>
        <Card variant="outlined">
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ConfidenceIcon sx={{ mr: 1, color: 'secondary.main' }} />
              <Typography variant="h6">
                Confianza Promedio
              </Typography>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
              {formatConfidence(statistics.averageConfidence)}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={statistics.averageConfidence * 100}
              sx={{
                mt: 2,
                height: 8,
                borderRadius: 4,
                backgroundColor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: 'secondary.main',
                },
              }}
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Most Common Channel */}
      <Grid item xs={12} sm={6} md={6}>
        <Card variant="outlined">
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ChannelIcon sx={{ mr: 1, color: 'info.main' }} />
              <Typography variant="h6">
                Canal Más Común
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main' }}>
              {statistics.mostCommonChannel || 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Canal con mayor número de análisis
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
