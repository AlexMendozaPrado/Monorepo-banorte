'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useNotification } from '@/hooks/useNotification';
import { rulesService } from '@/services/api';
import authService from '@/services/authService';

interface HistoryEntry {
  id: number;
  regla_id: number;
  regla_display: string;
  accion: string;
  usuario: string;
  detalles: string;
  fecha: string;
}

export default function HistorialPage() {
  const [historyData, setHistoryData] = useState<HistoryEntry[]>([]);
  const [filteredData, setFilteredData] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterAction, setFilterAction] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { showError } = useNotification();

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [historyData, filterAction, searchTerm]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const currentUser = authService.getCurrentUser?.();
      const userId = currentUser?.id || null;
      const rules = await rulesService.getAllRules(userId);

      // Generate mock history from rules data
      const history: HistoryEntry[] = rules.flatMap((rule: any, index: number) => [
        {
          id: index * 3 + 1,
          regla_id: rule.id_regla,
          regla_display: rule.id_display || `R-${rule.id_regla}`,
          accion: 'Creación',
          usuario: currentUser?.usuario || 'Usuario',
          detalles: `Regla "${rule.descripcion}" creada`,
          fecha: rule.fecha_creacion
        },
        ...(rule.estado === 'activa' ? [{
          id: index * 3 + 2,
          regla_id: rule.id_regla,
          regla_display: rule.id_display || `R-${rule.id_regla}`,
          accion: 'Activación',
          usuario: currentUser?.usuario || 'Usuario',
          detalles: 'Regla activada en producción',
          fecha: rule.fecha_creacion
        }] : [])
      ]);

      // Sort by date descending
      history.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

      setHistoryData(history);
    } catch (error) {
      console.error('Error loading history:', error);
      showError('Error al cargar el historial');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...historyData];

    // Filter by action
    if (filterAction !== 'all') {
      filtered = filtered.filter(entry => entry.accion.toLowerCase() === filterAction.toLowerCase());
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.regla_display.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.detalles.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.usuario.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredData(filtered);
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (date: string | Date) => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Fecha inválida';

    return dateObj.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'creación':
        return 'success';
      case 'modificación':
      case 'edición':
        return 'info';
      case 'eliminación':
        return 'error';
      case 'activación':
        return 'success';
      case 'desactivación':
        return 'warning';
      default:
        return 'default';
    }
  };

  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#333' }}>
          Historial de Actividades
        </Typography>
        <IconButton
          onClick={loadHistory}
          disabled={loading}
          sx={{ color: '#EB0029' }}
        >
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Filters */}
      <Card sx={{ border: '1px solid #e0e0e0', borderRadius: '12px', mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FilterIcon sx={{ color: '#666' }} />
            <TextField
              placeholder="Buscar por ID, detalles o usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{ flexGrow: 1 }}
            />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Tipo de Acción</InputLabel>
              <Select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                label="Tipo de Acción"
              >
                <MenuItem value="all">Todas las Acciones</MenuItem>
                <MenuItem value="creación">Creación</MenuItem>
                <MenuItem value="modificación">Modificación</MenuItem>
                <MenuItem value="eliminación">Eliminación</MenuItem>
                <MenuItem value="activación">Activación</MenuItem>
                <MenuItem value="desactivación">Desactivación</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* History Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#EB0029' }} />
          </Box>
        ) : filteredData.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="textSecondary">
              No hay actividades registradas
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {searchTerm || filterAction !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Las actividades aparecerán aquí conforme uses el sistema'}
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Fecha</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>ID Regla</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Acción</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Usuario</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Detalles</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5', textAlign: 'center' }}>Ver</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData.map((entry) => (
                    <TableRow
                      key={entry.id}
                      sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}
                    >
                      <TableCell>{formatDate(entry.fecha)}</TableCell>
                      <TableCell>
                        <Chip
                          label={entry.regla_display}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={entry.accion}
                          color={getActionColor(entry.accion) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{entry.usuario}</TableCell>
                      <TableCell sx={{ maxWidth: 300 }}>
                        <Typography variant="body2" noWrap>
                          {entry.detalles}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Tooltip title="Ver detalles">
                          <IconButton size="small" sx={{ color: '#EB0029' }}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Filas por página:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />
          </>
        )}
      </Paper>

      {/* Info Card */}
      <Card sx={{ border: '1px solid #e0e0e0', borderRadius: '12px', mt: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', mb: 2 }}>
            Acerca del Historial
          </Typography>
          <Typography variant="body2" color="textSecondary">
            El historial registra todas las acciones realizadas sobre las reglas de negocio,
            incluyendo creación, modificación, activación, desactivación y eliminación.
            Puedes filtrar por tipo de acción o buscar por ID de regla, usuario o detalles.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
