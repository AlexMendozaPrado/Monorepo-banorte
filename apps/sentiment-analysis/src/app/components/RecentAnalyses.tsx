'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import {
  History as HistoryIcon,
  PictureAsPdf as PdfIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { AnalysisResponse } from '../../shared/types/api';
import {
  formatSentiment,
  getSentimentColor,
  getSentimentIcon,
  formatDate,
  truncateText,
} from '../../shared/utils/formatters';

export function RecentAnalyses() {
  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentAnalyses = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/analyses/recent?limit=5');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al cargar análisis recientes');
      }

      if (result.success) {
        setRecentAnalyses(result.data || []);
      } else {
        throw new Error(result.error || 'Error desconocido');
      }
    } catch (err) {
      console.error('Error fetching recent analyses:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentAnalyses();
  }, []);

  const handleRefresh = () => {
    fetchRecentAnalyses();
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <HistoryIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" component="h3">
              Análisis Recientes
            </Typography>
          </Box>
          <Button
            size="small"
            onClick={handleRefresh}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
          >
            Actualizar
          </Button>
        </Box>

        {loading && !recentAnalyses.length ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : recentAnalyses.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="body2" color="text.secondary">
              No hay análisis recientes disponibles.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Los análisis aparecerán aquí una vez que proceses tu primer documento.
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {recentAnalyses.map((analysis, index) => (
              <ListItem
                key={analysis.id}
                divider={index < recentAnalyses.length - 1}
                sx={{
                  px: 0,
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    borderRadius: 1,
                  },
                }}
              >
                <ListItemIcon>
                  <PdfIcon sx={{ color: 'error.main' }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                        {truncateText(analysis.clientName, 20)}
                      </Typography>
                      <Chip
                        label={`${getSentimentIcon(analysis.overallSentiment)} ${formatSentiment(analysis.overallSentiment)}`}
                        size="small"
                        sx={{
                          backgroundColor: getSentimentColor(analysis.overallSentiment),
                          color: 'white',
                          fontSize: '0.75rem',
                          height: 20,
                        }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        {truncateText(analysis.documentName, 30)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        {analysis.channel} • {formatDate(analysis.createdAt)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}

        {recentAnalyses.length > 0 && (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button variant="outlined" size="small" href="#history">
              Ver Todos los Análisis
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
