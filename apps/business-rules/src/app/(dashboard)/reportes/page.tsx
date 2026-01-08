'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Button,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Rule as RuleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as CsvIcon
} from '@mui/icons-material';
import { useNotification } from '@/hooks/useNotification';
import { rulesService } from '@/services/api';
import authService from '@/services/authService';

// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface RuleData {
  id_regla: number;
  estado: string;
  fecha_creacion: string;
  descripcion: string;
}

export default function ReportesPage() {
  const [timeRange, setTimeRange] = useState('month');
  const [statsLoading, setStatsLoading] = useState(false);
  const [rules, setRules] = useState<RuleData[]>([]);
  const [stats, setStats] = useState({
    totalRules: 0,
    activeRules: 0,
    inactiveRules: 0,
    simulationRules: 0,
    rulesThisMonth: 0,
    rulesThisWeek: 0,
    successRate: 0
  });

  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    loadStats();
  }, [timeRange]);

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const currentUser = authService.getCurrentUser?.();
      const userId = currentUser?.id || null;
      const fetchedRules = await rulesService.getAllRules(userId);

      setRules(fetchedRules || []);

      // Calculate statistics
      const totalRules = fetchedRules.length;
      const activeRules = fetchedRules.filter((r: RuleData) => r.estado?.toLowerCase() === 'activa').length;
      const inactiveRules = fetchedRules.filter((r: RuleData) => r.estado?.toLowerCase() === 'inactiva').length;
      const simulationRules = fetchedRules.filter((r: RuleData) => r.estado?.toLowerCase() === 'simulacion').length;

      // Calculate rules created this month
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayOfWeek = new Date(now);
      firstDayOfWeek.setDate(now.getDate() - now.getDay());

      const rulesThisMonth = fetchedRules.filter((r: RuleData) => {
        const createdDate = new Date(r.fecha_creacion);
        return createdDate >= firstDayOfMonth;
      }).length;

      const rulesThisWeek = fetchedRules.filter((r: RuleData) => {
        const createdDate = new Date(r.fecha_creacion);
        return createdDate >= firstDayOfWeek;
      }).length;

      // Calculate success rate (active / total * 100)
      const successRate = totalRules > 0 ? Math.round((activeRules / totalRules) * 100) : 0;

      setStats({
        totalRules,
        activeRules,
        inactiveRules,
        simulationRules,
        rulesThisMonth,
        rulesThisWeek,
        successRate
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      showError('Error al cargar estadísticas');
    } finally {
      setStatsLoading(false);
    }
  };

  // Chart data for Pie chart (Status distribution)
  const pieChartData = {
    labels: ['Activas', 'Inactivas', 'Simulación'],
    datasets: [
      {
        data: [stats.activeRules, stats.inactiveRules, stats.simulationRules],
        backgroundColor: ['#4caf50', '#9e9e9e', '#ff9800'],
        borderColor: ['#388e3c', '#757575', '#f57c00'],
        borderWidth: 2
      }
    ]
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          font: { size: 12 }
        }
      },
      title: {
        display: true,
        text: 'Distribución por Estado',
        font: { size: 16, weight: 'bold' as const }
      }
    }
  };

  // Calculate monthly data for bar chart
  const getMonthlyData = () => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const currentYear = new Date().getFullYear();
    const monthlyCounts = new Array(12).fill(0);

    rules.forEach((rule) => {
      const date = new Date(rule.fecha_creacion);
      if (date.getFullYear() === currentYear) {
        monthlyCounts[date.getMonth()]++;
      }
    });

    return { months, data: monthlyCounts };
  };

  const monthlyData = getMonthlyData();

  const barChartData = {
    labels: monthlyData.months,
    datasets: [
      {
        label: 'Reglas Creadas',
        data: monthlyData.data,
        backgroundColor: '#EB0029',
        borderColor: '#c70023',
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: `Reglas Creadas por Mes (${new Date().getFullYear()})`,
        font: { size: 16, weight: 'bold' as const }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 }
      }
    }
  };

  // Export functions
  const exportToCSV = () => {
    try {
      const headers = ['ID', 'Estado', 'Fecha Creación', 'Descripción'];
      const csvContent = [
        headers.join(','),
        ...rules.map(rule =>
          [
            rule.id_regla,
            rule.estado,
            new Date(rule.fecha_creacion).toLocaleDateString('es-MX'),
            `"${(rule.descripcion || '').replace(/"/g, '""')}"`
          ].join(',')
        )
      ].join('\n');

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `reporte_reglas_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      showSuccess('CSV exportado exitosamente');
    } catch (error) {
      showError('Error al exportar CSV');
    }
  };

  const exportToPDF = () => {
    // Simple PDF generation using window.print()
    // For production, use a library like jsPDF
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        showError('Por favor permite las ventanas emergentes para exportar a PDF');
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Reporte de Reglas de Negocio</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #EB0029; }
            .stats { display: flex; gap: 20px; margin: 20px 0; flex-wrap: wrap; }
            .stat-card { padding: 15px; border: 1px solid #ddd; border-radius: 8px; min-width: 150px; }
            .stat-value { font-size: 24px; font-weight: bold; color: #333; }
            .stat-label { font-size: 12px; color: #666; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #EB0029; color: white; }
            tr:nth-child(even) { background-color: #f2f2f2; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <h1>Reporte de Reglas de Negocio</h1>
          <p>Generado: ${new Date().toLocaleString('es-MX')}</p>

          <div class="stats">
            <div class="stat-card">
              <div class="stat-value">${stats.totalRules}</div>
              <div class="stat-label">Total de Reglas</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${stats.activeRules}</div>
              <div class="stat-label">Reglas Activas</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${stats.inactiveRules}</div>
              <div class="stat-label">Reglas Inactivas</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${stats.simulationRules}</div>
              <div class="stat-label">En Simulación</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${stats.successRate}%</div>
              <div class="stat-label">Tasa de Éxito</div>
            </div>
          </div>

          <h2>Listado de Reglas</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              ${rules.map(rule => `
                <tr>
                  <td>${rule.id_regla}</td>
                  <td>${rule.estado}</td>
                  <td>${new Date(rule.fecha_creacion).toLocaleDateString('es-MX')}</td>
                  <td>${rule.descripcion || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>Banorte - Sistema de Reglas de Negocio</p>
          </div>
        </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.print();
      showSuccess('Documento listo para imprimir/guardar como PDF');
    } catch (error) {
      showError('Error al generar PDF');
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#333' }}>
          Reportes y Analíticas
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<CsvIcon />}
            onClick={exportToCSV}
            disabled={statsLoading || rules.length === 0}
            sx={{ borderColor: '#EB0029', color: '#EB0029' }}
          >
            Exportar CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<PdfIcon />}
            onClick={exportToPDF}
            disabled={statsLoading || rules.length === 0}
            sx={{ bgcolor: '#EB0029', '&:hover': { bgcolor: '#c70023' } }}
          >
            Exportar PDF
          </Button>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Período</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="Período"
              size="small"
            >
              <MenuItem value="week">Última Semana</MenuItem>
              <MenuItem value="month">Último Mes</MenuItem>
              <MenuItem value="quarter">Último Trimestre</MenuItem>
              <MenuItem value="year">Último Año</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {statsLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress sx={{ color: '#EB0029' }} />
        </Box>
      )}

      {/* Stats Grid */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 3,
        mb: 4
      }}>
        <StatCard
          title="Total de Reglas"
          value={stats.totalRules}
          subtitle="Reglas creadas"
          icon={<RuleIcon sx={{ fontSize: 32, color: '#EB0029' }} />}
          color="#EB0029"
        />
        <StatCard
          title="Reglas Activas"
          value={stats.activeRules}
          subtitle="En producción"
          icon={<CheckCircleIcon sx={{ fontSize: 32, color: '#4caf50' }} />}
          color="#4caf50"
        />
        <StatCard
          title="Reglas Este Mes"
          value={stats.rulesThisMonth}
          subtitle="Nuevas reglas"
          icon={<TrendingUpIcon sx={{ fontSize: 32, color: '#2196f3' }} />}
          color="#2196f3"
        />
        <StatCard
          title="Tasa de Éxito"
          value={`${stats.successRate}%`}
          subtitle="Reglas activas"
          icon={<CheckCircleIcon sx={{ fontSize: 32, color: '#ff9800' }} />}
          color="#ff9800"
        />
      </Box>

      {/* Charts Row */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' },
        gap: 3,
        mb: 4
      }}>
        {/* Pie Chart */}
        <Card sx={{ border: '1px solid #e0e0e0', borderRadius: '12px' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ height: 300 }}>
              {stats.totalRules > 0 ? (
                <Pie data={pieChartData} options={pieChartOptions} />
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Typography color="textSecondary">No hay datos para mostrar</Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card sx={{ border: '1px solid #e0e0e0', borderRadius: '12px' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ height: 300 }}>
              <Bar data={barChartData} options={barChartOptions} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Status Breakdown */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
        gap: 3,
        mb: 4
      }}>
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

        <Card sx={{ border: '1px solid #e0e0e0', borderRadius: '12px' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', mb: 3 }}>
              Resumen de Actividad
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  Esta Semana
                </Typography>
                <Typography variant="h4" sx={{ color: '#EB0029', fontWeight: 600 }}>
                  {stats.rulesThisWeek} <Typography component="span" variant="body2" color="textSecondary">reglas creadas</Typography>
                </Typography>
              </Paper>
              <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  Este Mes
                </Typography>
                <Typography variant="h4" sx={{ color: '#2196f3', fontWeight: 600 }}>
                  {stats.rulesThisMonth} <Typography component="span" variant="body2" color="textSecondary">reglas creadas</Typography>
                </Typography>
              </Paper>
            </Box>
          </CardContent>
        </Card>
      </Box>

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
            Utiliza los botones de exportación para descargar los datos en formato CSV o PDF.
            Los gráficos muestran la distribución actual de reglas y las tendencias de creación mensuales.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
