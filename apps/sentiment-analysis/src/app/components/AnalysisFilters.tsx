'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Slider,
  Typography,
} from '@mui/material';
import {
  Clear as ClearIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { SentimentType } from '../../core/domain/value-objects/SentimentType';
import { HistoricalAnalysisRequest } from '../../shared/types/api';
import { formatSentiment } from '../../shared/utils/formatters';

interface AnalysisFiltersProps {
  filters: HistoricalAnalysisRequest;
  onFiltersChange: (filters: HistoricalAnalysisRequest) => void;
}

export function AnalysisFilters({ filters, onFiltersChange }: AnalysisFiltersProps) {
  const [localFilters, setLocalFilters] = useState<HistoricalAnalysisRequest>(filters);

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

  const sentimentTypes = Object.values(SentimentType);

  const handleFilterChange = (field: keyof HistoricalAnalysisRequest, value: any) => {
    const updatedFilters = { ...localFilters, [field]: value };
    setLocalFilters(updatedFilters);
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: HistoricalAnalysisRequest = {
      page: 1,
      limit: filters.limit || 20,
      sortBy: filters.sortBy || 'createdAt',
      sortOrder: filters.sortOrder || 'desc',
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const handleConfidenceChange = (event: Event, newValue: number | number[]) => {
    const [min, max] = newValue as number[];
    setLocalFilters({
      ...localFilters,
      minConfidence: min / 100,
      maxConfidence: max / 100,
    });
  };

  const confidenceRange = [
    (localFilters.minConfidence || 0) * 100,
    (localFilters.maxConfidence || 1) * 100,
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filtros de Búsqueda
          </Typography>
          
          <Grid container spacing={3}>
            {/* Client Name */}
            <Grid item xs={12} md={6} lg={3}>
              <TextField
                fullWidth
                label="Nombre del Cliente"
                value={localFilters.clientName || ''}
                onChange={(e) => handleFilterChange('clientName', e.target.value)}
                placeholder="Buscar por cliente..."
              />
            </Grid>

            {/* Channel */}
            <Grid item xs={12} md={6} lg={3}>
              <FormControl fullWidth>
                <InputLabel>Canal</InputLabel>
                <Select
                  value={localFilters.channel || ''}
                  label="Canal"
                  onChange={(e) => handleFilterChange('channel', e.target.value)}
                >
                  <MenuItem value="">Todos los canales</MenuItem>
                  {channels.map((channel) => (
                    <MenuItem key={channel} value={channel}>
                      {channel}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Sentiment Type */}
            <Grid item xs={12} md={6} lg={3}>
              <FormControl fullWidth>
                <InputLabel>Sentimiento</InputLabel>
                <Select
                  value={localFilters.sentimentType || ''}
                  label="Sentimiento"
                  onChange={(e) => handleFilterChange('sentimentType', e.target.value)}
                >
                  <MenuItem value="">Todos los sentimientos</MenuItem>
                  {sentimentTypes.map((sentiment) => (
                    <MenuItem key={sentiment} value={sentiment}>
                      {formatSentiment(sentiment)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Date From */}
            <Grid item xs={12} md={6} lg={3}>
              <DatePicker
                label="Fecha desde"
                value={localFilters.dateFrom ? new Date(localFilters.dateFrom) : null}
                onChange={(date) => handleFilterChange('dateFrom', date?.toISOString())}
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
            </Grid>

            {/* Date To */}
            <Grid item xs={12} md={6} lg={3}>
              <DatePicker
                label="Fecha hasta"
                value={localFilters.dateTo ? new Date(localFilters.dateTo) : null}
                onChange={(date) => handleFilterChange('dateTo', date?.toISOString())}
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
            </Grid>

            {/* Confidence Range */}
            <Grid item xs={12} md={6} lg={6}>
              <Typography gutterBottom>
                Rango de Confianza: {confidenceRange[0].toFixed(0)}% - {confidenceRange[1].toFixed(0)}%
              </Typography>
              <Slider
                value={confidenceRange}
                onChange={handleConfidenceChange}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}%`}
                min={0}
                max={100}
                step={5}
                marks={[
                  { value: 0, label: '0%' },
                  { value: 50, label: '50%' },
                  { value: 100, label: '100%' },
                ]}
              />
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={handleClearFilters}
                >
                  Limpiar Filtros
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={handleApplyFilters}
                >
                  Aplicar Filtros
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
}
