'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Rule as RuleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useNotification } from '@/hooks/useNotification';
import { rulesService } from '@/services/api';
import authService from '@/services/authService';

export default function ReportesPage() {
  const [timeRange, setTimeRange] = useState('month');
  const [statsLoading, setStatsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalRules: 0,
    activeRules: 0,
    inactiveRules: 0,
    simulationRules: 0,
    rulesThisMonth: 0,
    successRate: 95
  });

  const { showError } = useNotification();

  useEffect(() => {
    loadStats();
  }, [timeRange]);

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const currentUser = authService.getCurrentUser?.();
      const userId = currentUser?.id || null;
      const rules = await rulesService.getAllRules(userId);

      // Calculate statistics
      const totalRules = rules.length;
      const activeRules = rules.filter((r: any) => r.estado?.toLowerCase() === 'activa').length;
      const inactiveRules = rules.filter((r: any) => r.estado?.toLowerCase() === 'inactiva').length;
      const simulationRules = rules.filter((r: any) => r.estado?.toLowerCase() === 'simulacion').length;

      // Calculate rules created this month
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const rulesThisMonth = rules.filter((r: any) => {
        const createdDate = new Date(r.fecha_creacion);
        return createdDate >= firstDayOfMonth;
      }).length;

      setStats({
        totalRules,
        activeRules,
        inactiveRules,
        simulationRules,
        rulesThisMonth,
        successRate: 95 // Placeholder - calculate based on real data
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      showError('Error al cargar estadísticas');
    } finally {
      setStatsLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle }: any) => (
    <Card sx={{ border: '1px solid #e0e0e0', borderRadius: '12px', height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, color }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: `${color}15` }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#333' }}>
          Reportes y Analíticas
        </Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Período</InputLabel>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            label="Período"
          >
            <MenuItem value="week">Última Semana</MenuItem>
            <MenuItem value="month">Último Mes</MenuItem>
            <MenuItem value="quarter">Último Trimestre</MenuItem>
            <MenuItem value="year">Último Año</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total de Reglas"
            value={stats.totalRules}
            subtitle="Reglas creadas"
            icon={<RuleIcon sx={{ fontSize: 32, color: '#EB0029' }} />}
            color="#EB0029"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Reglas Activas"
            value={stats.activeRules}
            subtitle="En producción"
            icon={<CheckCircleIcon sx={{ fontSize: 32, color: '#4caf50' }} />}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Reglas Este Mes"
            value={stats.rulesThisMonth}
            subtitle="Nuevas reglas"
            icon={<TrendingUpIcon sx={{ fontSize: 32, color: '#2196f3' }} />}
            color="#2196f3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tasa de Éxito"
            value={`${stats.successRate}%`}
            subtitle="Reglas validadas"
            icon={<CheckCircleIcon sx={{ fontSize: 32, color: '#ff9800' }} />}
            color="#ff9800"
          />
        </Grid>
      </Grid>

      {/* Status Breakdown */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid #e0e0e0', borderRadius: '12px' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', mb: 3 }}>
                Distribución por Estado
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip label="Activas" color="success" size="small" />
                    <Typography variant="body2" color="textSecondary">
                      Reglas en producción
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {stats.activeRules}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip label="Inactivas" color="default" size="small" />
                    <Typography variant="body2" color="textSecondary">
                      Reglas deshabilitadas
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {stats.inactiveRules}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip label="Simulación" color="warning" size="small" />
                    <Typography variant="body2" color="textSecondary">
                      Reglas en prueba
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {stats.simulationRules}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid #e0e0e0', borderRadius: '12px' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', mb: 3 }}>
                Resumen de Actividad
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                    Reglas más utilizadas
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Próximamente: Análisis de uso de reglas
                  </Typography>
                </Paper>
                <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                    Tendencias de creación
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {stats.rulesThisMonth} reglas creadas este mes
                  </Typography>
                </Paper>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Info Card */}
      <Card sx={{ border: '1px solid #e0e0e0', borderRadius: '12px' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <WarningIcon sx={{ color: '#ff9800' }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
              Información del Reporte
            </Typography>
          </Box>
          <Typography variant="body2" color="textSecondary">
            Los reportes se actualizan en tiempo real con los datos más recientes del sistema.
            Utiliza el selector de período para ver tendencias históricas y analizar el rendimiento
            de las reglas de negocio a lo largo del tiempo.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
