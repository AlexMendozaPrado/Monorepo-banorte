'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  History as HistoryIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { AnalysisTable } from './AnalysisTable';
import { AnalysisFilters } from './AnalysisFilters';
import { AnalysisStatistics } from './AnalysisStatistics';
import { HistoricalAnalysisResponse, HistoricalAnalysisRequest } from '../../shared/types/api';

export function HistoryPage() {
  const [data, setData] = useState<HistoricalAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<HistoricalAnalysisRequest>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const fetchAnalyses = async (newFilters?: HistoricalAnalysisRequest) => {
    try {
      setLoading(true);
      setError(null);

      const queryFilters = newFilters || filters;
      const queryParams = new URLSearchParams();

      Object.entries(queryFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/analyses/history?${queryParams.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al cargar el historial');
      }

      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.error || 'Error desconocido');
      }
    } catch (err) {
      console.error('Error fetching analyses:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const handleFiltersChange = (newFilters: HistoricalAnalysisRequest) => {
    const updatedFilters = { ...newFilters, page: 1 }; // Reset to first page
    setFilters(updatedFilters);
    fetchAnalyses(updatedFilters);
  };

  const handlePageChange = (page: number) => {
    const updatedFilters = { ...filters, page };
    setFilters(updatedFilters);
    fetchAnalyses(updatedFilters);
  };

  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    const updatedFilters = { ...filters, sortBy, sortOrder, page: 1 };
    setFilters(updatedFilters);
    fetchAnalyses(updatedFilters);
  };

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const exportFilters = { ...filters };
      delete exportFilters.page;
      delete exportFilters.limit;

      const response = await fetch('/api/analyses/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format,
          includeMetadata: true,
          includeEmotionScores: true,
          filter: exportFilters,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Error al exportar datos');
      }

      // Handle file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `sentiment-analysis-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export error:', err);
      setError(err instanceof Error ? err.message : 'Error al exportar datos');
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Header */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <HistoryIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h5" component="h2">
                    Historial de Análisis
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<FilterIcon />}
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleExport('csv')}
                    disabled={!data || data.analyses.total === 0}
                  >
                    Exportar CSV
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleExport('json')}
                    disabled={!data || data.analyses.total === 0}
                  >
                    Exportar JSON
                  </Button>
                </Box>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {/* Statistics */}
              {data && (
                <AnalysisStatistics statistics={data.statistics} />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Filters */}
        {showFilters && (
          <Grid item xs={12}>
            <AnalysisFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          </Grid>
        )}

        {/* Data Table */}
        <Grid item xs={12}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : data ? (
            <AnalysisTable
              analyses={data.analyses}
              onPageChange={handlePageChange}
              onSortChange={handleSortChange}
              currentSort={{
                sortBy: filters.sortBy || 'createdAt',
                sortOrder: filters.sortOrder || 'desc',
              }}
            />
          ) : (
            <Card>
              <CardContent>
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No se encontraron análisis.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
