'use client';

import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import {
  SentimentVeryDissatisfied,
  SentimentDissatisfied,
  SentimentNeutral,
  SentimentSatisfied,
  SentimentVerySatisfied,
} from '@mui/icons-material';

interface LikertScaleDisplayProps {
  score: number; // 1-7 scale
  confidence: number; // 0-1 scale
  keywords?: Array<{ word: string; frequency: number; sentiment: number }>;
}

export function LikertScaleDisplay({ score, confidence, keywords = [] }: LikertScaleDisplayProps) {
  const getLikertColor = (value: number): string => {
    if (value >= 6) return '#6CC04A'; // Very positive - green
    if (value >= 5) return '#FFA400'; // Positive - orange
    if (value >= 4) return '#FFD54F'; // Neutral/Positive - yellow
    if (value >= 3) return '#FF671B'; // Negative - red-orange
    return '#EB0029'; // Very negative - primary red
  };

  const getLikertLabel = (value: number): string => {
    if (value >= 6.5) return 'Muy Positivo';
    if (value >= 5.5) return 'Positivo';
    if (value >= 4.5) return 'Ligeramente Positivo';
    if (value >= 3.5) return 'Neutral';
    if (value >= 2.5) return 'Ligeramente Negativo';
    if (value >= 1.5) return 'Negativo';
    return 'Muy Negativo';
  };

  const getSentimentIcon = (value: number) => {
    if (value >= 6) return <SentimentVerySatisfied sx={{ fontSize: 48, color: getLikertColor(value) }} />;
    if (value >= 5) return <SentimentSatisfied sx={{ fontSize: 48, color: getLikertColor(value) }} />;
    if (value >= 4) return <SentimentNeutral sx={{ fontSize: 48, color: getLikertColor(value) }} />;
    if (value >= 3) return <SentimentDissatisfied sx={{ fontSize: 48, color: getLikertColor(value) }} />;
    return <SentimentVeryDissatisfied sx={{ fontSize: 48, color: getLikertColor(value) }} />;
  };

  return (
    <Card variant="outlined" sx={{ bgcolor: '#f5f5f5' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom color="primary">
          Sentimiento Numérico Detallado (Escala Likert)
        </Typography>

        {/* Icon and Score */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3, mt: 2 }}>
          {getSentimentIcon(score)}
          <Box sx={{ ml: 3 }}>
            <Typography variant="h2" sx={{ fontWeight: 'bold', color: getLikertColor(score) }}>
              {score.toFixed(1)}/7
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {getLikertLabel(score)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Confianza: {(confidence * 100).toFixed(0)}%
            </Typography>
          </Box>
        </Box>

        {/* Likert Scale Visual */}
        <Box sx={{ mt: 3, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', px: 2 }}>
            {/* Scale Line */}
            <Box
              sx={{
                position: 'absolute',
                left: '16px',
                right: '16px',
                top: '50%',
                height: '4px',
                background: 'linear-gradient(to right, #EB0029, #FF671B, #FFA400, #FFD54F, #FFA400, #6CC04A, #6CC04A)',
                borderRadius: '2px',
                zIndex: 0,
              }}
            />

            {/* Scale Points */}
            {[1, 2, 3, 4, 5, 6, 7].map((value) => (
              <Box
                key={value}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  zIndex: 1,
                }}
              >
                <Box
                  sx={{
                    width: Math.abs(score - value) < 0.3 ? 24 : 16,
                    height: Math.abs(score - value) < 0.3 ? 24 : 16,
                    borderRadius: '50%',
                    bgcolor: Math.abs(score - value) < 0.3 ? getLikertColor(score) : 'white',
                    border: `3px solid ${Math.abs(score - value) < 0.3 ? getLikertColor(score) : '#D1D5DB'}`,
                    transition: 'all 0.3s ease',
                    boxShadow: Math.abs(score - value) < 0.3 ? '0 4px 8px rgba(0,0,0,0.2)' : 'none',
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    mt: 0.5,
                    fontWeight: Math.abs(score - value) < 0.3 ? 'bold' : 'normal',
                    color: Math.abs(score - value) < 0.3 ? getLikertColor(score) : 'text.secondary',
                  }}
                >
                  {value}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Scale Labels */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, px: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
              Muy Negativo
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
              Neutral
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
              Muy Positivo
            </Typography>
          </Box>
        </Box>

        {/* Keywords */}
        {keywords.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              Palabras Clave Principales:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {keywords.slice(0, 8).map((kw, idx) => {
                const getKeywordColor = (sentiment: number) => {
                  if (sentiment >= 6) return 'success';
                  if (sentiment >= 5) return 'warning';
                  if (sentiment >= 4) return 'default';
                  return 'error';
                };

                return (
                  <Chip
                    key={idx}
                    label={`${kw.word} (${kw.frequency})`}
                    size="small"
                    color={getKeywordColor(kw.sentiment) as any}
                    variant="outlined"
                  />
                );
              })}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
