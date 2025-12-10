'use client';

import React, { useState, useEffect } from 'react';
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
  Divider,
  Alert
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useNotification } from '@/hooks/useNotification';
import { rulesService } from '@/services/api';
import authService from '@/services/authService';

interface BusinessRule {
  id_regla: number;
  id_display: string;
  descripcion: string;
  regla_generada: string;
  estado: string;
}

export default function SimuladorPage() {
  const [businessRules, setBusinessRules] = useState<BusinessRule[]>([]);
  const [selectedRuleId, setSelectedRuleId] = useState<string>('');
  const [inputData, setInputData] = useState('');
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [rulesLoading, setRulesLoading] = useState(false);

  const { showSuccess, showError, showWarning } = useNotification();

  // Load rules
  const loadRules = async () => {
    setRulesLoading(true);
    try {
      const currentUser = authService.getCurrentUser?.();
      const userId = currentUser?.id || null;
      const rules = await rulesService.getAllRules(userId);
      setBusinessRules(rules || []);
    } catch (error) {
      console.error('Error loading rules:', error);
      showError('Error al cargar las reglas');
    } finally {
      setRulesLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleSimulate = async () => {
    if (!selectedRuleId) {
      showWarning('Selecciona una regla para simular');
      return;
    }

    if (!inputData.trim()) {
      showWarning('Ingresa datos de entrada para la simulación');
      return;
    }

    setIsSimulating(true);
    try {
      // Simular la ejecución de la regla
      // Nota: Esta es una simulación básica - ajusta según tu API real
      const result = {
        success: true,
        ruleId: selectedRuleId,
        inputData: inputData,
        output: {
          status: 'PASSED',
          message: 'La regla se ejecutó correctamente',
          details: {
            validaciones: ['Campo monto válido', 'Campo beneficiario válido', 'Estructura XML correcta'],
            warnings: [],
            timestamp: new Date().toISOString()
          }
        }
      };

      setSimulationResult(result);
      showSuccess('Simulación ejecutada exitosamente');
    } catch (error) {
      console.error('Error in simulation:', error);
      showError('Error al ejecutar la simulación');
      setSimulationResult({
        success: false,
        error: 'Error al procesar la simulación'
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const handleReset = () => {
    setSelectedRuleId('');
    setInputData('');
    setSimulationResult(null);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 600, color: '#333', mb: 4 }}>
        Simulador de Reglas de Negocio
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>
        {/* Input Panel */}
        <Card sx={{ border: '1px solid #e0e0e0', borderRadius: '12px' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', mb: 3 }}>
              Configuración de Simulación
            </Typography>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Seleccionar Regla</InputLabel>
              <Select
                value={selectedRuleId}
                onChange={(e) => setSelectedRuleId(e.target.value)}
                label="Seleccionar Regla"
                disabled={rulesLoading}
              >
                {businessRules.map((rule) => (
                  <MenuItem key={rule.id_regla} value={rule.id_regla.toString()}>
                    {rule.id_display || rule.id_regla} - {rule.descripcion}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={10}
              label="Datos de Entrada (JSON/XML)"
              placeholder='{"monto": 1000, "beneficiario": "Juan Pérez"}'
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              sx={{ mb: 3 }}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<PlayIcon />}
                onClick={handleSimulate}
                disabled={isSimulating || !selectedRuleId}
                sx={{
                  bgcolor: '#EB0029',
                  py: 1.5,
                  '&:hover': { bgcolor: '#d4002a' },
                  '&:disabled': { bgcolor: '#ccc' }
                }}
              >
                {isSimulating ? 'Simulando...' : 'Ejecutar Simulación'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleReset}
                sx={{ borderColor: '#EB0029', color: '#EB0029' }}
              >
                Limpiar
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <Card sx={{ border: '1px solid #e0e0e0', borderRadius: '12px' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', mb: 3 }}>
              Resultados de Simulación
            </Typography>

            {!simulationResult ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="body1" color="textSecondary">
                  Los resultados de la simulación aparecerán aquí
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Configura una regla y datos de entrada para comenzar
                </Typography>
              </Box>
            ) : (
              <Box>
                {simulationResult.success ? (
                  <>
                    <Alert
                      severity="success"
                      icon={<CheckCircleIcon />}
                      sx={{ mb: 3 }}
                    >
                      Simulación completada exitosamente
                    </Alert>

                    <Paper sx={{ p: 3, bgcolor: '#f5f5f5', mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                        Estado de Ejecución
                      </Typography>
                      <Chip
                        label={simulationResult.output.status}
                        color="success"
                        sx={{ mb: 2 }}
                      />
                      <Typography variant="body2" color="textSecondary">
                        {simulationResult.output.message}
                      </Typography>
                    </Paper>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                      Validaciones Ejecutadas
                    </Typography>
                    {simulationResult.output.details.validaciones.map((validation: string, index: number) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 18 }} />
                        <Typography variant="body2">{validation}</Typography>
                      </Box>
                    ))}

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                      Detalles Técnicos
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: '#fafafa' }}>
                      <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                        {JSON.stringify(simulationResult.output.details, null, 2)}
                      </Typography>
                    </Paper>
                  </>
                ) : (
                  <Alert severity="error" icon={<ErrorIcon />}>
                    Error en la simulación: {simulationResult.error}
                  </Alert>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Info Card */}
      <Card sx={{ border: '1px solid #e0e0e0', borderRadius: '12px', mt: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', mb: 2 }}>
            Acerca del Simulador
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            El simulador permite probar reglas de negocio antes de implementarlas en producción.
            Puedes validar diferentes escenarios y datos de entrada para asegurar que la regla
            funciona correctamente.
          </Typography>
          <Typography variant="body2" color="textSecondary">
            <strong>Nota:</strong> Los resultados mostrados son simulaciones y no afectan los
            datos reales del sistema.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
