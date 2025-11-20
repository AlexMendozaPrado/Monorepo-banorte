'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  TableSortLabel,
  Box,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { AnalysisResponse, HistoricalAnalysisResponse } from '../../shared/types/api';
import {
  formatSentiment,
  getSentimentColor,
  getSentimentIcon,
  formatConfidence,
  formatDate,
  truncateText,
} from '../../shared/utils/formatters';

interface AnalysisTableProps {
  analyses: HistoricalAnalysisResponse['analyses'];
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  currentSort: {
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  };
}

export function AnalysisTable({ analyses, onPageChange, onSortChange, currentSort }: AnalysisTableProps) {
  const handleChangePage = (event: unknown, newPage: number) => {
    onPageChange(newPage + 1); // Convert from 0-based to 1-based
  };

  const handleSort = (property: string) => {
    const isAsc = currentSort.sortBy === property && currentSort.sortOrder === 'asc';
    onSortChange(property, isAsc ? 'desc' : 'asc');
  };

  const createSortHandler = (property: string) => () => {
    handleSort(property);
  };

  const columns = [
    { id: 'clientName', label: 'Cliente', sortable: true },
    { id: 'documentName', label: 'Documento', sortable: true },
    { id: 'overallSentiment', label: 'Sentimiento', sortable: true },
    { id: 'confidence', label: 'Confianza', sortable: true },
    { id: 'channel', label: 'Canal', sortable: true },
    { id: 'createdAt', label: 'Fecha', sortable: true },
    { id: 'actions', label: 'Acciones', sortable: false },
  ];

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.id}>
                  {column.sortable ? (
                    <TableSortLabel
                      active={currentSort.sortBy === column.id}
                      direction={currentSort.sortBy === column.id ? currentSort.sortOrder : 'asc'}
                      onClick={createSortHandler(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {analyses.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                  No se encontraron análisis que coincidan con los criterios de búsqueda.
                </TableCell>
              </TableRow>
            ) : (
              analyses.data.map((analysis) => (
                <TableRow key={analysis.id} hover>
                  <TableCell>
                    <Tooltip title={analysis.clientName}>
                      <span>{truncateText(analysis.clientName, 20)}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={analysis.documentName}>
                      <span>{truncateText(analysis.documentName, 25)}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${getSentimentIcon(analysis.overallSentiment)} ${formatSentiment(analysis.overallSentiment)}`}
                      sx={{
                        backgroundColor: getSentimentColor(analysis.overallSentiment),
                        color: 'white',
                        fontWeight: 'bold',
                      }}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{formatConfidence(analysis.confidence)}</span>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={analysis.channel}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {formatDate(analysis.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Ver detalles">
                      <IconButton
                        size="small"
                        onClick={() => {
                          // TODO: Implement view details functionality
                          console.log('View details for:', analysis.id);
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {analyses.data.length > 0 && (
        <TablePagination
          component="div"
          count={analyses.total}
          page={analyses.page - 1} // Convert from 1-based to 0-based
          onPageChange={handleChangePage}
          rowsPerPage={analyses.limit}
          rowsPerPageOptions={[10, 20, 50, 100]}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
        />
      )}
    </Paper>
  );
}
