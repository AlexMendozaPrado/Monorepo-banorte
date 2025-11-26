'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  MenuItem,
} from '@mui/material';
import {
  TrendingUp as TrendsIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { SessionTrendsResponse, ApiResponse } from '../../../shared/types/api';
import { SessionTrendsDynamic } from '../../components/SessionTrendsDynamic';

export default function TrendsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trends, setTrends] = useState<SessionTrendsResponse | null>(null);

  // Form state
  const [fromDate, setFromDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 3); // 3 months ago
    return date.toISOString().split('T')[0];
  });

  const [toDate, setToDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [clientName, setClientName] = useState('');
  const [channel, setChannel] = useState('');

  const handleSearch = async () => {
    if (!fromDate || !toDate) {
      setError('Por favor selecciona un rango de fechas');
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      setError('La fecha inicial debe ser anterior a la fecha final');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Build query params
      const params = new URLSearchParams({
        from: fromDate,
        to: toDate,
      });

      if (clientName) params.append('clientName', clientName);
      if (channel) params.append('channel', channel);

      const response = await fetch(`/api/sessions/trends?${params.toString()}`);
      const data: ApiResponse<SessionTrendsResponse> = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.error || 'Error al calcular tendencias');
      }

      setTrends(data.data);
    } catch (err) {
      console.error('Error fetching trends:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TrendsIcon sx={{ mr: 1, color: 'primary.main', fontSize: 40 }} />
          <Typography variant="h4" component="h1">
            Tendencias Históricas
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Analiza la evolución de tus sesiones a través del tiempo
        </Typography>
      </Box>

      {/* Filters */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filtros de Búsqueda
          </Typography>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Desde"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Hasta"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Cliente (opcional)"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                fullWidth
                placeholder="Ej: Banorte"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Canal (opcional)"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                fullWidth
                placeholder="Ej: Reunión Semanal"
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSearch}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
                fullWidth
                sx={{ py: 1.5 }}
              >
                {loading ? 'Calculando tendencias...' : 'Buscar Tendencias'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress size={60} />
        </Box>
      )}

      {/* Results */}
      {!loading && trends && (
        <Box>
          <SessionTrendsDynamic trends={trends} />
        </Box>
      )}

      {/* Initial State */}
      {!loading && !trends && !error && (
        <Card variant="outlined" sx={{ textAlign: 'center', py: 8 }}>
          <CardContent>
            <TrendsIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Selecciona un rango de fechas y haz clic en "Buscar Tendencias"
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Podrás visualizar la evolución de tus sesiones, métricas clave y proyecciones
            </Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
