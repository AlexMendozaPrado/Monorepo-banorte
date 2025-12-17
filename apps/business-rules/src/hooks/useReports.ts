'use client';

import { useState, useEffect, useCallback } from 'react';
import reportsService, { type ReportsData } from '../services/reportsService';

// Type definitions
export interface ExportResult {
  success: boolean;
  error?: string;
}

export interface UseReportsReturn {
  reportsData: ReportsData;
  loading: boolean;
  error: string | null;
  refreshData: () => void;
  exportToPDF: () => Promise<ExportResult>;
  exportToCSV: () => Promise<ExportResult>;
}

const defaultReportsData: ReportsData = {
  activeRules: 0,
  inactiveRules: 0,
  simulationRules: 0,
  totalUsers: 0,
  activeUsers: 0,
  totalSimulations: 0,
  textSimulations: 0,
  fileSimulations: 0,
  recentActivity: null,
  mostSuccessfulRule: null,
  mostUsedRuleId: '--',
  leastUsedRuleId: '--'
};

export const useReports = (): UseReportsReturn => {
  const [reportsData, setReportsData] = useState<ReportsData>(defaultReportsData);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to get current user
  const getCurrentUser = (): { id: number } | null => {
    if (typeof window === 'undefined') return null;
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  };

  // Fetch reports data from service
  const fetchReportsData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const currentUser = getCurrentUser();
      const userId = currentUser?.id || null;
      const data = await reportsService.getReportsData(userId);
      setReportsData(data);
    } catch (err) {
      console.error('Error fetching reports data:', err);
      setError('Error al cargar datos de reportes');
    } finally {
      setLoading(false);
    }
  }, []);

  // Export reports data as PDF
  const exportToPDF = useCallback(async (): Promise<ExportResult> => {
    try {
      setLoading(true);
      const blob = await reportsService.exportToPDF();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte-reglas-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (err) {
      console.error('Error exporting to PDF:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError('Error al exportar PDF');
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Export reports data as CSV
  const exportToCSV = useCallback(async (): Promise<ExportResult> => {
    try {
      setLoading(true);
      const blob = await reportsService.exportToCSV();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte-reglas-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (err) {
      console.error('Error exporting to CSV:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError('Error al exportar CSV');
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh data
  const refreshData = useCallback((): void => {
    fetchReportsData();
  }, [fetchReportsData]);

  // Load data on mount
  useEffect(() => {
    fetchReportsData();
  }, [fetchReportsData]);

  return {
    reportsData,
    loading,
    error,
    refreshData,
    exportToPDF,
    exportToCSV
  };
};

export default useReports;
