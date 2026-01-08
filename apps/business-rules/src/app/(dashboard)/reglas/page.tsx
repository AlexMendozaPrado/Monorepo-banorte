'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  AttachMoney as MoneyIcon,
  Public as RegionIcon,
  Category as CategoryIcon,
  Rule as RuleIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useNotification } from '@/hooks/useNotification';
import { useGlobalNotifications } from '@/contexts/NotificationsContext';
import { rulesService } from '@/services/api';
import authService from '@/services/authService';

interface BusinessRule {
  id_regla: number;
  id_display: string;
  descripcion: string;
  regla_generada: string;
  regla_estandarizada: any;
  estado: string;
  fecha_creacion: string;
  usuario_id: number;
  // Extended fields
  usuario?: string;
  email?: string;
  empresa?: string;
  monto_minimo?: number;
  monto_maximo?: number;
  region?: string;
  tipo_transaccion?: string;
}

export default function ReglasPage() {
  const [businessRules, setBusinessRules] = useState<BusinessRule[]>([]);
  const [rulesLoading, setRulesLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  // Modal states
  const [openModal, setOpenModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState<BusinessRule | null>(null);
  const [editedRule, setEditedRule] = useState<Partial<BusinessRule>>({});
  const [isEditing, setIsEditing] = useState(false);

  // Delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { showSuccess, showError, showWarning } = useNotification();
  const { addNotification } = useGlobalNotifications();

  // Load rules
  const refreshRules = async () => {
    setRulesLoading(true);
    try {
      const currentUser = authService.getCurrentUser?.();
      const userId = currentUser?.id || null;
      const rules = await rulesService.getAllRules(userId);
      setBusinessRules(rules || []);
    } catch (error) {
      console.error('Error loading rules:', error);
      showError('Error al cargar las reglas');
      setBusinessRules([]);
    } finally {
      setRulesLoading(false);
    }
  };

  useEffect(() => {
    refreshRules();
  }, []);

  // Handle pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle view details
  const handleViewDetails = (rule: BusinessRule) => {
    setSelectedRule(rule);
    setEditedRule({ ...rule });
    setIsEditing(false);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedRule(null);
    setEditedRule({});
    setIsEditing(false);
  };

  // Handle edit
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing && selectedRule) {
      setEditedRule({ ...selectedRule });
    }
  };

  const handleInputChange = (field: keyof BusinessRule, value: any) => {
    setEditedRule(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = async () => {
    if (!selectedRule) return;

    try {
      await rulesService.updateRule(selectedRule.id_regla, editedRule);
      setSelectedRule({ ...selectedRule, ...editedRule } as BusinessRule);
      setIsEditing(false);
      refreshRules();
      showSuccess('Regla actualizada exitosamente');
      addNotification({
        type: 'success',
        title: 'Regla Actualizada',
        message: `La regla ${selectedRule.id_display} fue actualizada correctamente`
      });
    } catch (error) {
      console.error('Error updating rule:', error);
      showError('Error al actualizar la regla');
    }
  };

  // Handle delete
  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRule) return;

    setIsDeleting(true);
    try {
      await rulesService.deleteRule(selectedRule.id_regla);
      setDeleteConfirmOpen(false);
      setOpenModal(false);
      setSelectedRule(null);
      setEditedRule({});
      setIsEditing(false);
      refreshRules();
      showSuccess('Regla eliminada exitosamente');
      addNotification({
        type: 'info',
        title: 'Regla Eliminada',
        message: `La regla ${selectedRule.id_display} ha sido eliminada del sistema`
      });
    } catch (error) {
      console.error('Error deleting rule:', error);
      showError('Error al eliminar la regla');
    } finally {
      setIsDeleting(false);
    }
  };

  // Export XML
  const handleExportGeminiXML = () => {
    if (!selectedRule?.regla_estandarizada) {
      showWarning('No hay contenido para exportar');
      return;
    }

    let content = '';
    const g = selectedRule.regla_estandarizada;
    try {
      if (typeof g === 'string') {
        content = g;
      } else if (typeof g === 'object') {
        if (g.xml) content = g.xml;
        else content = JSON.stringify(g, null, 2);
      } else {
        content = String(g);
      }
    } catch (e) {
      content = String(g || '');
    }

    // Remove code fence if present
    content = content.replace(/```(?:xml)?\n([\s\S]*?)```/i, '$1').trim();

    // Try to extract only the XML part
    let xmlOnly = '';
    const mappedMatch = content.match(/<MappedPayment[\s\S]*?<\/MappedPayment>/i);
    if (mappedMatch) {
      xmlOnly = mappedMatch[0];
    } else {
      const anyXmlMatch = content.match(/<([A-Za-z][A-Za-z0-9:_-]*)(?:\s[^>]*)?>[\s\S]*?<\/\1>/);
      if (anyXmlMatch) xmlOnly = anyXmlMatch[0];
      else xmlOnly = '';
    }

    if (!xmlOnly) {
      showWarning('No se encontró contenido XML en la respuesta de la IA');
      return;
    }

    content = xmlOnly.trim();

    const blob = new Blob([content], { type: 'application/xml' });
    const filename = `regla_${selectedRule?.id_regla || selectedRule?.id_display || 'export'}_gemini.xml`;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    showSuccess('Descarga iniciada');
  };

  // Format date
  const formatDate = (date: string | Date | null) => {
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

  // Get status chip color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'activa':
        return 'success';
      case 'inactiva':
        return 'default';
      case 'simulacion':
        return 'warning';
      default:
        return 'info';
    }
  };

  // Paginated data
  const paginatedRules = businessRules.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#333' }}>
          Gestión de Reglas de Negocio
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={refreshRules}
          disabled={rulesLoading}
          sx={{ borderColor: '#EB0029', color: '#EB0029', '&:hover': { borderColor: '#d4002a', bgcolor: 'rgba(235, 0, 41, 0.04)' } }}
        >
          Actualizar
        </Button>
      </Box>

      {/* Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
        {rulesLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#EB0029' }} />
          </Box>
        ) : businessRules.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="textSecondary">
              No hay reglas registradas
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Crea tu primera regla desde el Dashboard
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Descripción</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Usuario</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Empresa</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Estado</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Fecha</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5', textAlign: 'center' }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedRules.map((rule) => (
                    <TableRow
                      key={rule.id_regla}
                      onMouseEnter={() => setHoveredRow(rule.id_regla)}
                      onMouseLeave={() => setHoveredRow(null)}
                      sx={{
                        '&:hover': { bgcolor: '#f9f9f9' },
                        cursor: 'pointer'
                      }}
                      onClick={() => handleViewDetails(rule)}
                    >
                      <TableCell>
                        <Chip
                          label={rule.id_display || rule.id_regla}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell sx={{ maxWidth: 250 }}>
                        <Typography variant="body2" noWrap>
                          {rule.descripcion || 'Sin descripción'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {rule.usuario || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {rule.empresa || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={rule.estado || 'Activa'}
                          color={getStatusColor(rule.estado) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(rule.fecha_creacion)}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Tooltip title="Ver detalles">
                          <IconButton
                            size="small"
                            onClick={(e) => { e.stopPropagation(); handleViewDetails(rule); }}
                            sx={{ color: '#EB0029' }}
                          >
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
              count={businessRules.length}
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

      {/* Details Modal */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '12px' } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {isEditing ? 'Editar Regla' : 'Detalles de Regla'}
          </Typography>
          <Box>
            {!isEditing && (
              <>
                <Tooltip title="Exportar XML">
                  <IconButton onClick={handleExportGeminiXML} sx={{ color: '#EB0029' }}>
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Editar">
                  <IconButton onClick={handleEditToggle} sx={{ color: '#EB0029' }}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Eliminar">
                  <IconButton onClick={handleDeleteClick} sx={{ color: '#f44336' }}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedRule && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Sección: Información General */}
              <Card variant="outlined" sx={{ bgcolor: '#fafafa' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <InfoIcon sx={{ color: '#EB0029' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Información General
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        label="ID"
                        value={selectedRule.id_display || selectedRule.id_regla}
                        disabled
                        sx={{ flex: 1 }}
                      />
                      <FormControl sx={{ flex: 1 }} disabled={!isEditing}>
                        <InputLabel>Estado</InputLabel>
                        <Select
                          value={isEditing ? editedRule.estado || '' : selectedRule.estado}
                          onChange={(e) => handleInputChange('estado', e.target.value)}
                          label="Estado"
                        >
                          <MenuItem value="activa">Activa</MenuItem>
                          <MenuItem value="inactiva">Inactiva</MenuItem>
                          <MenuItem value="simulacion">Simulación</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                    <TextField
                      label="Fecha de Creación"
                      value={formatDate(selectedRule.fecha_creacion)}
                      disabled
                      fullWidth
                    />
                  </Box>
                </CardContent>
              </Card>

              {/* Sección: Detalles del Usuario */}
              <Card variant="outlined" sx={{ bgcolor: '#fafafa' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <PersonIcon sx={{ color: '#EB0029' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Detalles del Usuario
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        label="Usuario"
                        value={isEditing ? editedRule.usuario || '' : selectedRule.usuario || ''}
                        onChange={(e) => handleInputChange('usuario', e.target.value)}
                        disabled={!isEditing}
                        sx={{ flex: 1 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <TextField
                        label="Email"
                        value={isEditing ? editedRule.email || '' : selectedRule.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled={!isEditing}
                        sx={{ flex: 1 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>
                    <TextField
                      label="Empresa"
                      value={isEditing ? editedRule.empresa || '' : selectedRule.empresa || ''}
                      onChange={(e) => handleInputChange('empresa', e.target.value)}
                      disabled={!isEditing}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BusinessIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>

              {/* Sección: Descripción de la Regla */}
              <Card variant="outlined" sx={{ bgcolor: '#fafafa' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <RuleIcon sx={{ color: '#EB0029' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Descripción de la Regla
                    </Typography>
                  </Box>
                  <TextField
                    label="Descripción"
                    value={isEditing ? editedRule.descripcion || '' : selectedRule.descripcion}
                    onChange={(e) => handleInputChange('descripcion', e.target.value)}
                    disabled={!isEditing}
                    multiline
                    rows={3}
                    fullWidth
                  />
                </CardContent>
              </Card>

              {/* Sección: Configuración Adicional */}
              <Card variant="outlined" sx={{ bgcolor: '#fafafa' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <CategoryIcon sx={{ color: '#EB0029' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Configuración Adicional
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        label="Monto Mínimo"
                        type="number"
                        value={isEditing ? editedRule.monto_minimo || '' : selectedRule.monto_minimo || ''}
                        onChange={(e) => handleInputChange('monto_minimo', parseFloat(e.target.value) || 0)}
                        disabled={!isEditing}
                        sx={{ flex: 1 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MoneyIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <TextField
                        label="Monto Máximo"
                        type="number"
                        value={isEditing ? editedRule.monto_maximo || '' : selectedRule.monto_maximo || ''}
                        onChange={(e) => handleInputChange('monto_maximo', parseFloat(e.target.value) || 0)}
                        disabled={!isEditing}
                        sx={{ flex: 1 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MoneyIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        label="Región"
                        value={isEditing ? editedRule.region || '' : selectedRule.region || ''}
                        onChange={(e) => handleInputChange('region', e.target.value)}
                        disabled={!isEditing}
                        sx={{ flex: 1 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <RegionIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <FormControl sx={{ flex: 1 }} disabled={!isEditing}>
                        <InputLabel>Tipo Transacción</InputLabel>
                        <Select
                          value={isEditing ? editedRule.tipo_transaccion || '' : selectedRule.tipo_transaccion || ''}
                          onChange={(e) => handleInputChange('tipo_transaccion', e.target.value)}
                          label="Tipo Transacción"
                        >
                          <MenuItem value="">Sin especificar</MenuItem>
                          <MenuItem value="transferencia">Transferencia</MenuItem>
                          <MenuItem value="pago">Pago</MenuItem>
                          <MenuItem value="nomina">Nómina</MenuItem>
                          <MenuItem value="proveedores">Proveedores</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Sección: Regla Generada */}
              <Card variant="outlined" sx={{ bgcolor: '#fafafa' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <RuleIcon sx={{ color: '#EB0029' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Regla Generada por IA
                    </Typography>
                  </Box>
                  <TextField
                    label="Contenido de la Regla"
                    value={isEditing ? editedRule.regla_generada || '' : selectedRule.regla_generada}
                    onChange={(e) => handleInputChange('regla_generada', e.target.value)}
                    disabled={!isEditing}
                    multiline
                    rows={5}
                    fullWidth
                    sx={{
                      '& .MuiInputBase-root': {
                        fontFamily: 'monospace',
                        fontSize: '0.875rem'
                      }
                    }}
                  />
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
          {isEditing ? (
            <>
              <Button onClick={handleEditToggle} startIcon={<CancelIcon />}>
                Cancelar
              </Button>
              <Button
                variant="contained"
                onClick={handleSaveChanges}
                startIcon={<SaveIcon />}
                sx={{ bgcolor: '#EB0029', '&:hover': { bgcolor: '#d4002a' } }}
              >
                Guardar Cambios
              </Button>
            </>
          ) : (
            <Button onClick={handleCloseModal}>Cerrar</Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleDeleteCancel} PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle sx={{ color: '#f44336' }}>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar la regla <strong>{selectedRule?.id_display || selectedRule?.id_regla}</strong>?
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleDeleteCancel} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
            sx={{ bgcolor: '#f44336', '&:hover': { bgcolor: '#d32f2f' } }}
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
