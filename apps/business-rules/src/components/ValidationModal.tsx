'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Divider,
  type SelectChangeEvent
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  AutoFixHigh as AutoFixHighIcon,
  Rule as RuleIcon
} from '@mui/icons-material';

import validationRulesService from '../services/validationRules.service';
import ruleValidationService from '../services/ruleValidation.service';
import type { RegistroValidacion, Validaciones } from '../types/xmlValidation.types';
import type { MappedEmpleado } from '../services/mapeoAltamira.service';

// Type definitions
interface BusinessRule {
  id: number;
  nombre: string;
  descripcion?: string;
  status?: string;
}

interface ValidationModalProps {
  open: boolean;
  onClose: () => void;
  registros: RegistroValidacion[] | MappedEmpleado[];
  tipoOperacion: 'proveedores' | 'nomina' | null;
  onConfirm: (registrosValidados: RegistroValidacion[] | MappedEmpleado[]) => void;
}

interface ValidationState {
  isValidating: boolean;
  isValidated: boolean;
  validationErrors: string[];
  validationWarnings: string[];
  validatedData: (RegistroValidacion | MappedEmpleado)[];
}

interface AISuggestion {
  campo: string;
  sugerencia: string;
  valorSugerido?: string;
}

interface AIValidationState {
  isValidating: boolean;
  suggestions: AISuggestion[];
  error: string | null;
}

const ValidationModal: React.FC<ValidationModalProps> = ({
  open,
  onClose,
  registros,
  tipoOperacion,
  onConfirm
}) => {
  // State
  const [validationState, setValidationState] = useState<ValidationState>({
    isValidating: false,
    isValidated: false,
    validationErrors: [],
    validationWarnings: [],
    validatedData: []
  });

  const [aiValidation, setAIValidation] = useState<AIValidationState>({
    isValidating: false,
    suggestions: [],
    error: null
  });

  const [businessRules, setBusinessRules] = useState<BusinessRule[]>([]);
  const [selectedRule, setSelectedRule] = useState<number | ''>('');
  const [loadingRules, setLoadingRules] = useState<boolean>(false);
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>('validation');

  // Load business rules on mount
  useEffect(() => {
    if (open) {
      loadBusinessRules();
    }
  }, [open]);

  // Load business rules from API
  const loadBusinessRules = async (): Promise<void> => {
    try {
      setLoadingRules(true);
      const rules = await ruleValidationService.getActiveRules();
      setBusinessRules(rules);
    } catch (error) {
      console.error('Error loading business rules:', error);
      setBusinessRules([]);
    } finally {
      setLoadingRules(false);
    }
  };

  // Get records to validate
  const getRecords = useCallback((): RegistroValidacion[] | MappedEmpleado[] => {
    if (!registros || registros.length === 0) return [];
    return registros;
  }, [registros]);

  // Validate all records
  const handleValidation = useCallback(async (): Promise<void> => {
    setValidationState(prev => ({
      ...prev,
      isValidating: true,
      validationErrors: [],
      validationWarnings: []
    }));

    try {
      const records = getRecords();
      const errors: string[] = [];
      const warnings: string[] = [];
      const validatedRecords: (RegistroValidacion | MappedEmpleado)[] = [];

      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        const validations: Validaciones = {
          longitudCuenta: false,
          formatoFecha: false,
          rangoImporte: false,
          camposObligatorios: false
        };

        if (tipoOperacion === 'proveedores') {
          const provRecord = record as RegistroValidacion;

          // Validate account length
          const cuentaResult = validationRulesService.validateCuenta(
            provRecord.cuentaDestino,
            provRecord.tipoOperacion === '04' ? 18 : 10
          );
          validations.longitudCuenta = cuentaResult.isValid;
          if (!cuentaResult.isValid) {
            errors.push(`Registro ${i + 1}: ${cuentaResult.error}`);
          }

          // Validate amount
          const importeResult = validationRulesService.validateImporte(provRecord.importe);
          validations.rangoImporte = importeResult.isValid;
          if (!importeResult.isValid) {
            errors.push(`Registro ${i + 1}: ${importeResult.error}`);
          }

          // Validate date
          const fechaResult = validationRulesService.validateFecha(provRecord.fechaEjecucion);
          validations.formatoFecha = fechaResult.isValid;
          if (!fechaResult.isValid) {
            warnings.push(`Registro ${i + 1}: ${fechaResult.error}`);
          }

          // Validate required fields
          const camposRequeridos = Boolean(
            provRecord.beneficiario?.nombre &&
            provRecord.cuentaDestino &&
            provRecord.importe
          );
          validations.camposObligatorios = camposRequeridos;
          if (!camposRequeridos) {
            errors.push(`Registro ${i + 1}: Faltan campos obligatorios`);
          }

          validatedRecords.push({
            ...provRecord,
            validaciones: validations
          });
        } else {
          const empRecord = record as MappedEmpleado;

          // Validate CLABE
          const clabeResult = validationRulesService.validateCLABE(empRecord.clabe);
          validations.longitudCuenta = clabeResult.isValid;
          if (!clabeResult.isValid) {
            errors.push(`Empleado ${i + 1}: ${clabeResult.error}`);
          }

          // Validate salary
          const salarioResult = validationRulesService.validateImporte(empRecord.salario);
          validations.rangoImporte = salarioResult.isValid;
          if (!salarioResult.isValid) {
            errors.push(`Empleado ${i + 1}: ${salarioResult.error}`);
          }

          // Validate RFC if present
          if (empRecord.rfc) {
            const rfcResult = validationRulesService.validateRFC(empRecord.rfc);
            if (!rfcResult.isValid) {
              warnings.push(`Empleado ${i + 1}: ${rfcResult.error}`);
            }
          }

          // Validate required fields
          const camposRequeridos = Boolean(
            empRecord.nombre &&
            empRecord.clabe &&
            empRecord.salario
          );
          validations.camposObligatorios = camposRequeridos;
          if (!camposRequeridos) {
            errors.push(`Empleado ${i + 1}: Faltan campos obligatorios`);
          }

          validatedRecords.push({
            ...empRecord,
            validaciones: validations
          });
        }
      }

      setValidationState({
        isValidating: false,
        isValidated: true,
        validationErrors: errors,
        validationWarnings: warnings,
        validatedData: validatedRecords
      });
    } catch (error) {
      console.error('Validation error:', error);
      setValidationState(prev => ({
        ...prev,
        isValidating: false,
        validationErrors: ['Error durante la validación']
      }));
    }
  }, [getRecords, tipoOperacion]);

  // Validate with AI using selected business rule
  const handleAIValidation = async (): Promise<void> => {
    if (!selectedRule) return;

    setAIValidation({
      isValidating: true,
      suggestions: [],
      error: null
    });

    try {
      const records = getRecords();
      const result = await ruleValidationService.validateWithRule(
        selectedRule as number,
        records,
        tipoOperacion
      );

      setAIValidation({
        isValidating: false,
        suggestions: result.suggestions || [],
        error: null
      });
    } catch (error) {
      console.error('AI validation error:', error);
      setAIValidation({
        isValidating: false,
        suggestions: [],
        error: 'Error al validar con regla de negocio'
      });
    }
  };

  // Handle rule selection
  const handleRuleChange = (event: SelectChangeEvent<number | ''>): void => {
    setSelectedRule(event.target.value as number | '');
  };

  // Confirm validation and pass records back to parent
  const handleConfirm = (): void => {
    // Use validated data if available, otherwise use original records
    const recordsToConfirm = validationState.validatedData.length > 0
      ? validationState.validatedData
      : registros;

    console.log('✅ ValidationModal: Confirmando', recordsToConfirm.length, 'registros');
    // Cast to expected type - we know the array is homogeneous based on tipoOperacion
    onConfirm(recordsToConfirm as RegistroValidacion[] | MappedEmpleado[]);
  };

  // Handle accordion change
  const handleAccordionChange = (panel: string) => (
    _event: React.SyntheticEvent,
    isExpanded: boolean
  ): void => {
    setExpandedAccordion(isExpanded ? panel : false);
  };

  // Get validation status chip
  const getValidationChip = (validations: Validaciones): React.ReactNode => {
    const allValid = Object.values(validations).every(v => v);
    const someValid = Object.values(validations).some(v => v);

    if (allValid) {
      return <Chip icon={<CheckCircleIcon />} label="Válido" color="success" size="small" />;
    } else if (someValid) {
      return <Chip icon={<WarningIcon />} label="Advertencias" color="warning" size="small" />;
    }
    return <Chip icon={<ErrorIcon />} label="Errores" color="error" size="small" />;
  };

  // Check if can confirm (validation passed or skipped)
  const canConfirm = (): boolean => {
    // Allow confirmation if validated with no errors, or if not validated yet (user skips validation)
    if (validationState.isValidated) {
      return validationState.validationErrors.length === 0;
    }
    // Allow confirmation even without validation (user can skip)
    return registros.length > 0;
  };

  // Get records for display
  const displayRecords = getRecords();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            Validación de Registros - {tipoOperacion === 'nomina' ? 'Nómina' : 'Proveedores'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Summary */}
        <Box mb={3}>
          <Alert severity="info">
            <Typography variant="body2">
              Se encontraron <strong>{displayRecords.length}</strong> registros para validar.
              {tipoOperacion === 'nomina' && displayRecords.length > 0 && (
                <> Total a dispersar: <strong>
                  ${(displayRecords as MappedEmpleado[]).reduce((sum, emp) => sum + (emp.salario || 0), 0).toLocaleString('es-MX')}
                </strong></>
              )}
            </Typography>
          </Alert>
        </Box>

        {/* Validation Section */}
        <Accordion
          expanded={expandedAccordion === 'validation'}
          onChange={handleAccordionChange('validation')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center" gap={1}>
              <CheckCircleIcon color="primary" />
              <Typography variant="subtitle1">Validación de Formato</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box mb={2}>
              <Button
                variant="contained"
                onClick={handleValidation}
                disabled={validationState.isValidating}
                startIcon={validationState.isValidating ? <CircularProgress size={20} /> : <RefreshIcon />}
              >
                {validationState.isValidating ? 'Validando...' : 'Ejecutar Validación'}
              </Button>
            </Box>

            {validationState.isValidating && <LinearProgress sx={{ mb: 2 }} />}

            {validationState.isValidated && (
              <>
                {validationState.validationErrors.length > 0 && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2">Errores encontrados:</Typography>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {validationState.validationErrors.slice(0, 10).map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                      {validationState.validationErrors.length > 10 && (
                        <li>... y {validationState.validationErrors.length - 10} errores más</li>
                      )}
                    </ul>
                  </Alert>
                )}

                {validationState.validationWarnings.length > 0 && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2">Advertencias:</Typography>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {validationState.validationWarnings.slice(0, 5).map((warning, idx) => (
                        <li key={idx}>{warning}</li>
                      ))}
                      {validationState.validationWarnings.length > 5 && (
                        <li>... y {validationState.validationWarnings.length - 5} advertencias más</li>
                      )}
                    </ul>
                  </Alert>
                )}

                {validationState.validationErrors.length === 0 && (
                  <Alert severity="success">
                    Todos los registros pasaron la validación de formato.
                  </Alert>
                )}
              </>
            )}
          </AccordionDetails>
        </Accordion>

        {/* Business Rules Section */}
        <Accordion
          expanded={expandedAccordion === 'rules'}
          onChange={handleAccordionChange('rules')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center" gap={1}>
              <RuleIcon color="secondary" />
              <Typography variant="subtitle1">Validación con Reglas de Negocio</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box display="flex" gap={2} alignItems="flex-end" mb={2}>
              <FormControl sx={{ minWidth: 300 }}>
                <InputLabel>Seleccionar Regla de Negocio</InputLabel>
                <Select
                  value={selectedRule}
                  onChange={handleRuleChange}
                  label="Seleccionar Regla de Negocio"
                  disabled={loadingRules}
                >
                  {businessRules.map((rule) => (
                    <MenuItem key={rule.id} value={rule.id}>
                      {rule.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                color="secondary"
                onClick={handleAIValidation}
                disabled={!selectedRule || aiValidation.isValidating}
                startIcon={aiValidation.isValidating ? <CircularProgress size={20} /> : <AutoFixHighIcon />}
              >
                Validar con IA
              </Button>
            </Box>

            {aiValidation.isValidating && <LinearProgress sx={{ mb: 2 }} />}

            {aiValidation.error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {aiValidation.error}
              </Alert>
            )}

            {aiValidation.suggestions.length > 0 && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Sugerencias de la IA:</Typography>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {aiValidation.suggestions.map((suggestion, idx) => (
                    <li key={idx}>
                      <strong>{suggestion.campo}:</strong> {suggestion.sugerencia}
                      {suggestion.valorSugerido && (
                        <span> → <em>{suggestion.valorSugerido}</em></span>
                      )}
                    </li>
                  ))}
                </ul>
              </Alert>
            )}
          </AccordionDetails>
        </Accordion>

        <Divider sx={{ my: 3 }} />

        {/* Records Table */}
        <Typography variant="subtitle1" gutterBottom>
          Detalle de Registros
        </Typography>

        <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                {tipoOperacion === 'proveedores' ? (
                  <>
                    <TableCell>Beneficiario</TableCell>
                    <TableCell>Cuenta Destino</TableCell>
                    <TableCell align="right">Importe</TableCell>
                    <TableCell>Referencia</TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>Empleado</TableCell>
                    <TableCell>CLABE</TableCell>
                    <TableCell align="right">Salario</TableCell>
                    <TableCell>RFC</TableCell>
                  </>
                )}
                <TableCell align="center">Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayRecords.map((record, index) => {
                const validatedRecord = validationState.validatedData[index];
                const validations = validatedRecord?.validaciones || {
                  longitudCuenta: false,
                  formatoFecha: false,
                  rangoImporte: false,
                  camposObligatorios: false
                };

                if (tipoOperacion === 'proveedores') {
                  const provRecord = record as RegistroValidacion;
                  return (
                    <TableRow key={provRecord.id || index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Tooltip title={provRecord.beneficiario?.nombre || '-'}>
                          <span>{(provRecord.beneficiario?.nombre || '-').substring(0, 30)}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell>{provRecord.cuentaDestino}</TableCell>
                      <TableCell align="right">
                        ${provRecord.importe?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>{provRecord.referencia}</TableCell>
                      <TableCell align="center">
                        {validationState.isValidated ? getValidationChip(validations) : '-'}
                      </TableCell>
                    </TableRow>
                  );
                } else {
                  const empRecord = record as MappedEmpleado;
                  return (
                    <TableRow key={empRecord.id || index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Tooltip title={empRecord.nombre}>
                          <span>{empRecord.nombre.substring(0, 30)}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell>{empRecord.clabe}</TableCell>
                      <TableCell align="right">
                        ${empRecord.salario?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>{empRecord.rfc || '-'}</TableCell>
                      <TableCell align="center">
                        {validationState.isValidated ? getValidationChip(validations) : '-'}
                      </TableCell>
                    </TableRow>
                  );
                }
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={!canConfirm()}
          sx={{
            backgroundColor: '#EB0029',
            '&:hover': { backgroundColor: '#c70023' }
          }}
        >
          Confirmar y Generar TXT
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ValidationModal;
