'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Chip,
  Alert,
  Tabs,
  Tab,
  CircularProgress,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  CloudUpload as CloudUploadIcon,
  TextSnippet as TextSnippetIcon,
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  ExpandMore as ExpandMoreIcon,
  AccessTime as AccessTimeIcon,
  Assignment as AssignmentIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { useNotification } from '@/hooks/useNotification';
import { rulesService, aiService } from '@/services/api';
import simulationService, { type SimulationHistoryEntry as ServiceHistoryEntry } from '@/services/simulationService';
import authService from '@/services/authService';

interface BusinessRule {
  id_regla: number;
  id_display: string;
  descripcion: string;
  regla_generada: string;
  estado: string;
  status?: string;
  usuario?: string;
}

interface SimulationResult {
  xml?: string;
  validation?: unknown;
  processing_notes?: string;
  analysis?: string;
  results?: {
    status?: string;
    confidence?: number;
    details?: string;
  };
  recommendations?: string;
}

// Using ServiceHistoryEntry from simulationService for history items

export default function SimuladorPage() {
  // Rules state
  const [businessRules, setBusinessRules] = useState<BusinessRule[]>([]);
  const [selectedRuleId, setSelectedRuleId] = useState<string>('');
  const [selectedRule, setSelectedRule] = useState<BusinessRule | null>(null);
  const [rulesLoading, setRulesLoading] = useState(false);
  const [rulesError, setRulesError] = useState<string | null>(null);

  // Input state
  const [testInputType, setTestInputType] = useState(0); // 0 = text, 1 = file
  const [testText, setTestText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulation state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState<SimulationResult | null>(null);
  const [simulationError, setSimulationError] = useState<string | null>(null);

  // History modal state
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [simulationHistory, setSimulationHistory] = useState<ServiceHistoryEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedSimulationDetails, setSelectedSimulationDetails] = useState<ServiceHistoryEntry | null>(null);

  const { showSuccess, showError, showWarning, showInfo } = useNotification();

  // Load rules on mount
  const loadRules = async () => {
    setRulesLoading(true);
    setRulesError(null);
    try {
      const currentUser = authService.getCurrentUser?.();
      const userId = currentUser?.id || null;
      const rules = await rulesService.getAllRules(userId);
      setBusinessRules(rules || []);
    } catch (error: any) {
      console.error('Error loading rules:', error);
      setRulesError(error.message);
      showError('Error al cargar las reglas');
    } finally {
      setRulesLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  // Handle rule selection
  const handleRuleSelection = (event: any) => {
    const ruleId = event.target.value;
    setSelectedRuleId(ruleId);
    const rule = businessRules.find(r => r.id_regla.toString() === ruleId);
    setSelectedRule(rule || null);
  };

  // Handle test input type change
  const handleTestInputTypeChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTestInputType(newValue);
    setSimulationResults(null);
    setSimulationError(null);
  };

  // File handling
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const handleFileDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files[0];
    if (file) validateAndSetFile(file);
  };

  // MIME types permitidos para validación completa
  const ALLOWED_FILE_TYPES: Record<string, string[]> = {
    '.txt': ['text/plain'],
    '.xml': ['text/xml', 'application/xml'],
    '.csv': ['text/csv', 'application/csv', 'text/plain'],
    '.json': ['application/json', 'text/json']
  };

  const validateAndSetFile = (file: File) => {
    const fileName = file.name.toLowerCase();
    const extension = '.' + fileName.split('.').pop();
    const allowedExtensions = Object.keys(ALLOWED_FILE_TYPES);

    if (!allowedExtensions.includes(extension)) {
      showError(`Solo se permiten archivos: ${allowedExtensions.join(', ')}`);
      return;
    }

    // Validar MIME type (warning solo, algunos navegadores no lo reportan)
    const expectedMimes = ALLOWED_FILE_TYPES[extension];
    if (file.type && !expectedMimes.includes(file.type) && file.type !== '') {
      console.warn(`MIME type ${file.type} inesperado para extensión ${extension}`);
    }

    if (file.size > 10 * 1024 * 1024) {
      showError('El archivo no puede ser mayor a 10MB');
      return;
    }

    setSelectedFile(file);
    setSimulationResults(null);
    setSimulationError(null);
    showSuccess(`Archivo "${file.name}" cargado exitosamente`);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Run simulation with real AI
  const handleRunSimulation = async () => {
    if (!selectedRule) {
      showError('Por favor selecciona una regla primero');
      return;
    }

    if (testInputType === 0 && !testText.trim()) {
      showError('Por favor ingresa datos de prueba');
      return;
    }

    if (testInputType === 1 && !selectedFile) {
      showError('Por favor selecciona un archivo');
      return;
    }

    setIsSimulating(true);
    setSimulationResults(null);
    setSimulationError(null);

    try {
      let fileContent: string;
      let fileType: string;
      let fileName: string;

      if (testInputType === 0) {
        // Text input - detectar si es JSON
        fileContent = testText;
        try {
          JSON.parse(testText.trim());
          fileType = 'json';
        } catch {
          fileType = 'txt';
        }
        fileName = 'input_text';
      } else {
        // File input
        fileContent = await selectedFile!.text();
        const ext = selectedFile!.name.split('.').pop()?.toLowerCase() || 'txt';
        // Mapear extensión a tipo
        const extToType: Record<string, string> = {
          xml: 'xml',
          json: 'json',
          csv: 'csv',
          txt: 'txt'
        };
        fileType = extToType[ext] || 'txt';
        fileName = selectedFile!.name;
      }

      // Call AI service for payment mapping
      const aiResp = await aiService.processPaymentMapping({
        fileContent,
        fileType,
        fileName
      });

      const result: SimulationResult = {
        xml: aiResp?.xml,
        validation: aiResp?.validation,
        processing_notes: aiResp?.processing_notes,
        analysis: aiResp?.analysis,
        results: aiResp?.results,
        recommendations: aiResp?.recommendations
      };

      setSimulationResults(result);
      showSuccess('Simulación completada exitosamente');

      // Save simulation to history
      try {
        await simulationService.saveSimulation({
          ruleId: selectedRule.id_regla,
          inputType: testInputType === 0 ? 'text' : 'file',
          inputData: fileContent,
          fileName: fileName,
          aiResponse: aiResp
        });
        showInfo('Simulación guardada en el historial');
      } catch (saveErr) {
        console.error('Error saving simulation:', saveErr);
        showWarning('La simulación no pudo guardarse en el historial');
      }

    } catch (error: any) {
      console.error('Simulation error:', error);
      setSimulationError(error.message);
      showError('Error en la simulación: ' + error.message);
    } finally {
      setIsSimulating(false);
    }
  };

  // View history modal
  const handleViewHistory = async () => {
    if (!selectedRule) {
      showError('Por favor selecciona una regla primero');
      return;
    }

    setHistoryModalOpen(true);
    setLoadingHistory(true);

    try {
      const history = await simulationService.getSimulationHistory(selectedRule.id_regla);
      setSimulationHistory(Array.isArray(history) ? history : []);
    } catch (error: any) {
      console.error('Error loading simulation history:', error);
      showError('Error al cargar el historial: ' + error.message);
      setSimulationHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleCloseHistoryModal = () => {
    setHistoryModalOpen(false);
    setSimulationHistory([]);
    setSelectedSimulationDetails(null);
  };

  const handleViewSimulationDetails = async (simulationId: number) => {
    try {
      const details = await simulationService.getSimulationDetails(simulationId);
      setSelectedSimulationDetails(details as ServiceHistoryEntry);
    } catch (error: any) {
      console.error('Error loading simulation details:', error);
      showError('Error al cargar detalles: ' + error.message);
    }
  };

  const handleReset = () => {
    setTestText('');
    setSelectedFile(null);
    setSimulationResults(null);
    setSimulationError(null);
  };

  const ruleStatus = selectedRule?.status || selectedRule?.estado;
  const isRuleActive = ruleStatus?.toLowerCase() === 'activa';

  return (
    <Box sx={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#333' }}>
          Simulador de Reglas de Negocio
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Actualizar reglas">
            <IconButton onClick={loadRules} disabled={rulesLoading}>
              {rulesLoading ? <CircularProgress size={20} /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {rulesError && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Error al cargar las reglas. <Button onClick={loadRules}>Reintentar</Button>
        </Alert>
      )}

      <Paper sx={{ p: 4, mb: 4, borderRadius: 2 }}>
        {/* Rule Selection */}
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
          Seleccionar Regla a Simular
        </Typography>

        <Box sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Selecciona una regla de negocio</InputLabel>
            <Select
              value={selectedRuleId}
              onChange={handleRuleSelection}
              label="Selecciona una regla de negocio"
              disabled={rulesLoading}
            >
              {businessRules.length === 0 ? (
                <MenuItem disabled>No hay reglas disponibles</MenuItem>
              ) : (
                businessRules.map((rule) => (
                  <MenuItem key={rule.id_regla} value={rule.id_regla.toString()}>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {rule.id_display || `Regla ${rule.id_regla}`}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666', fontSize: '0.85rem' }}>
                        {rule.descripcion?.substring(0, 60)}...
                      </Typography>
                    </Box>
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </Box>

        {/* Selected Rule Details */}
        {selectedRule && (
          <Box sx={{ maxWidth: 600, mx: 'auto', p: 3, bgcolor: '#f8f9fa', borderRadius: 2, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: '#EB0029', fontWeight: 600 }}>
                Detalles de la Regla
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<HistoryIcon />}
                onClick={handleViewHistory}
                sx={{ borderColor: '#EB0029', color: '#EB0029' }}
              >
                Ver Historial
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2">
                <strong>ID:</strong> {selectedRule.id_display}
              </Typography>
              <Typography variant="body2">
                <strong>Estado:</strong>{' '}
                <Chip
                  label={ruleStatus || 'Desconocido'}
                  size="small"
                  color={isRuleActive ? 'success' : 'default'}
                />
              </Typography>
              <Typography variant="body2">
                <strong>Descripción:</strong> {selectedRule.descripcion}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Test Input Section */}
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
          Datos de Prueba
        </Typography>

        {/* Input Type Tabs */}
        <Box sx={{ maxWidth: 800, mx: 'auto', mb: 3 }}>
          <Tabs
            value={testInputType}
            onChange={handleTestInputTypeChange}
            centered
            sx={{
              '& .Mui-selected': { color: '#EB0029 !important' },
              '& .MuiTabs-indicator': { backgroundColor: '#EB0029' }
            }}
          >
            <Tab icon={<TextSnippetIcon />} label="Texto de Prueba" iconPosition="start" />
            <Tab icon={<CloudUploadIcon />} label="Archivo de Datos" iconPosition="start" />
          </Tabs>
        </Box>

        {/* Text Input Tab */}
        {testInputType === 0 && (
          <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            <TextField
              fullWidth
              multiline
              rows={8}
              placeholder={`Ingresa datos de prueba en JSON o texto:\n\n{\n  "monto": 1000,\n  "tipo_transaccion": "Transferencia",\n  "beneficiario": "Juan Pérez"\n}`}
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              sx={{ fontFamily: 'monospace' }}
            />
            <Typography variant="body2" sx={{ mt: 1, color: '#666', fontStyle: 'italic' }}>
              La IA interpretará automáticamente los datos.
            </Typography>
          </Box>
        )}

        {/* File Upload Tab */}
        {testInputType === 1 && (
          <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            <Box
              onDrop={handleFileDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
              onClick={() => fileInputRef.current?.click()}
              sx={{
                border: `2px dashed ${dragOver ? '#EB0029' : '#ccc'}`,
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                backgroundColor: dragOver ? '#fff5f5' : '#f9f9f9',
                cursor: 'pointer',
                '&:hover': { borderColor: '#EB0029', backgroundColor: '#fff5f5' }
              }}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".txt,.xml,.csv,.json"
                style={{ display: 'none' }}
              />

              {selectedFile ? (
                <Box>
                  <AttachFileIcon sx={{ fontSize: 48, color: '#EB0029', mb: 2 }} />
                  <Typography variant="h6" sx={{ mb: 1, color: '#EB0029' }}>
                    {selectedFile.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </Typography>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={(e) => { e.stopPropagation(); handleFileRemove(); }}
                  >
                    Remover
                  </Button>
                </Box>
              ) : (
                <Box>
                  <CloudUploadIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                  <Typography variant="h6">Arrastra tu archivo aquí</Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    o haz clic para seleccionar (TXT, XML, CSV, JSON - máx 10MB)
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}

        {/* Simulation Button */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          {isSimulating && (
            <Box sx={{ mb: 3 }}>
              <LinearProgress sx={{ mb: 2, '& .MuiLinearProgress-bar': { backgroundColor: '#EB0029' } }} />
              <Typography variant="body2" sx={{ color: '#666' }}>
                Procesando con Gemini AI...
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              disabled={!selectedRule || !isRuleActive || isSimulating ||
                (testInputType === 0 && !testText.trim()) ||
                (testInputType === 1 && !selectedFile)}
              onClick={handleRunSimulation}
              startIcon={isSimulating ? <CircularProgress size={20} color="inherit" /> : <PlayIcon />}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                bgcolor: '#EB0029',
                '&:hover': { bgcolor: '#D32F2F' },
                '&:disabled': { bgcolor: '#ccc' }
              }}
            >
              {isSimulating ? 'Simulando...' : 'Ejecutar Simulación'}
            </Button>
            <Button
              variant="outlined"
              onClick={handleReset}
              startIcon={<RefreshIcon />}
              sx={{ borderColor: '#EB0029', color: '#EB0029' }}
            >
              Limpiar
            </Button>
          </Box>

          {selectedRule && !isRuleActive && (
            <Typography variant="body2" sx={{ color: '#dc3545', mt: 2 }}>
              Solo se pueden simular reglas con estado "Activa"
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Simulation Results */}
      {(simulationResults || simulationError) && (
        <Paper sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
            Resultados de la Simulación
          </Typography>

          {simulationError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="h6">Error en la Simulación</Typography>
              <Typography variant="body2">{simulationError}</Typography>
            </Alert>
          )}

          {simulationResults && (
            <Box>
              <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 3 }}>
                Simulación completada exitosamente con Gemini AI
              </Alert>

              {selectedRule && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                    Regla Aplicada:
                  </Typography>
                  <Chip label={`${selectedRule.id_display} - ${selectedRule.descripcion?.substring(0, 50)}...`} />
                </Box>
              )}

              {/* XML Output */}
              {simulationResults.xml && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                    XML Mapeado por IA:
                  </Typography>
                  <Paper sx={{ p: 3, bgcolor: '#f8f9fa', maxHeight: 300, overflow: 'auto' }}>
                    <Typography
                      component="pre"
                      sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.85rem' }}
                    >
                      {simulationResults.xml}
                    </Typography>
                  </Paper>
                </Box>
              )}

              {/* Processing Notes */}
              {simulationResults.processing_notes && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                    Notas de Procesamiento:
                  </Typography>
                  <Alert severity="info">
                    <Typography variant="body2">{simulationResults.processing_notes}</Typography>
                  </Alert>
                </Box>
              )}

              {/* Analysis Section */}
              {simulationResults.analysis && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssignmentIcon sx={{ color: '#1976d2' }} />
                    Análisis de IA:
                  </Typography>
                  <Paper sx={{ p: 3, bgcolor: '#e3f2fd', border: '1px solid #90caf9' }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {simulationResults.analysis}
                    </Typography>
                  </Paper>
                </Box>
              )}

              {/* Results Details */}
              {simulationResults.results && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                    Detalles del Resultado:
                  </Typography>
                  <Paper sx={{ p: 3, bgcolor: '#f5f5f5' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {simulationResults.results.status && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>Estado:</Typography>
                          <Chip
                            label={simulationResults.results.status}
                            color={simulationResults.results.status.toLowerCase() === 'success' ? 'success' : 'warning'}
                            size="small"
                          />
                        </Box>
                      )}
                      {typeof simulationResults.results.confidence === 'number' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>Confianza:</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={simulationResults.results.confidence * 100}
                              sx={{ flex: 1, height: 8, borderRadius: 4 }}
                            />
                            <Typography variant="body2" sx={{ minWidth: 45 }}>
                              {(simulationResults.results.confidence * 100).toFixed(0)}%
                            </Typography>
                          </Box>
                        </Box>
                      )}
                      {simulationResults.results.details && (
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Detalles:</Typography>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', bgcolor: '#fff', p: 2, borderRadius: 1 }}>
                            {simulationResults.results.details}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Paper>
                </Box>
              )}

              {/* Recommendations */}
              {simulationResults.recommendations && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon sx={{ color: '#4caf50' }} />
                    Recomendaciones de IA:
                  </Typography>
                  <Paper sx={{ p: 3, bgcolor: '#e8f5e9', border: '1px solid #a5d6a7' }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {simulationResults.recommendations}
                    </Typography>
                  </Paper>
                </Box>
              )}

              {/* Validation Results */}
              {simulationResults.validation && (
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                    Resultado de Validación:
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: '#fafafa' }}>
                    <Typography component="pre" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}>
                      {JSON.stringify(simulationResults.validation, null, 2)}
                    </Typography>
                  </Paper>
                </Box>
              )}
            </Box>
          )}
        </Paper>
      )}

      {/* Simulation History Modal */}
      <Dialog open={historyModalOpen} onClose={handleCloseHistoryModal} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AssignmentIcon sx={{ color: '#EB0029' }} />
          Historial de Simulaciones
          {selectedRule && <Chip label={selectedRule.id_display} size="small" />}
        </DialogTitle>
        <DialogContent>
          {loadingHistory ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress sx={{ color: '#EB0029' }} />
              <Typography sx={{ mt: 2 }}>Cargando historial...</Typography>
            </Box>
          ) : simulationHistory.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <AssignmentIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" color="textSecondary">
                Sin simulaciones previas
              </Typography>
            </Box>
          ) : (
            <Box>
              <TableContainer component={Paper} elevation={0}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Archivo</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {simulationHistory.map((sim) => (
                      <TableRow key={sim.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AccessTimeIcon sx={{ fontSize: 16, color: '#666' }} />
                            {new Date(sim.created_at).toLocaleString('es-MX')}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={sim.input_type === 'text' ? 'Texto' : 'Archivo'}
                            size="small"
                            color={sim.input_type === 'text' ? 'primary' : 'secondary'}
                          />
                        </TableCell>
                        <TableCell>{sim.file_name || 'N/A'}</TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleViewSimulationDetails(sim.id)}
                            sx={{ color: '#EB0029' }}
                          >
                            Ver
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {selectedSimulationDetails && (
                <Accordion sx={{ mt: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">
                      Detalles de Simulación #{selectedSimulationDetails.id}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          Datos de Entrada:
                        </Typography>
                        <Paper sx={{ p: 2, bgcolor: '#f8f9fa', maxHeight: 150, overflow: 'auto' }}>
                          <Typography component="pre" sx={{ fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
                            {selectedSimulationDetails.input_data}
                          </Typography>
                        </Paper>
                      </Box>
                      {selectedSimulationDetails.ai_response && (
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Respuesta de IA:
                          </Typography>
                          <Paper sx={{ p: 2, bgcolor: '#f0f7ff' }}>
                            <Typography component="pre" sx={{ fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
                              {JSON.stringify(selectedSimulationDetails.ai_response, null, 2)}
                            </Typography>
                          </Paper>
                        </Box>
                      )}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHistoryModal} variant="contained" sx={{ bgcolor: '#EB0029' }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
