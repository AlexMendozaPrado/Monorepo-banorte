'use client';

import { useState, useEffect, useCallback } from 'react';
import historialService, { type HistorialEntry, type HistorialStats } from '../services/historialService';

// Type definitions
export interface UseHistorialReturn {
  historialData: HistorialEntry[];
  filteredData: HistorialEntry[];
  stats: HistorialStats;
  loading: boolean;
  error: string | null;
  fetchHistorialData: () => Promise<void>;
  fetchFilteredData: (searchTerm: string, filterBy: string) => Promise<void>;
  refreshData: () => void;
  clearFilters: () => void;
}

const defaultStats: HistorialStats = {
  totalRules: 0,
  activeRules: 0,
  inactiveRules: 0,
  simulationRules: 0,
  recentRules: 0
};

export const useHistorial = (): UseHistorialReturn => {
  const [historialData, setHistorialData] = useState<HistorialEntry[]>([]);
  const [filteredData, setFilteredData] = useState<HistorialEntry[]>([]);
  const [stats, setStats] = useState<HistorialStats>(defaultStats);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all historial data
  const fetchHistorialData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const data = await historialService.getHistorialData();
      setHistorialData(data);
      setFilteredData(data);
    } catch (err) {
      console.error('Error fetching historial data:', err);
      setError('Error al cargar datos del historial');
      setHistorialData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch filtered historial data
  const fetchFilteredData = useCallback(async (searchTerm: string, filterBy: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const data = await historialService.getFilteredHistorial(searchTerm, filterBy);
      setFilteredData(data);
    } catch (err) {
      console.error('Error fetching filtered historial data:', err);
      setError('Error al filtrar datos del historial');
      setFilteredData(historialData);
    } finally {
      setLoading(false);
    }
  }, [historialData]);

  // Fetch historial statistics
  const fetchStats = useCallback(async (): Promise<void> => {
    try {
      const statsData = await historialService.getHistorialStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching historial stats:', err);
      setStats(defaultStats);
    }
  }, []);

  // Refresh all data
  const refreshData = useCallback((): void => {
    fetchHistorialData();
    fetchStats();
  }, [fetchHistorialData, fetchStats]);

  // Load data on mount
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Clear filters and show all data
  const clearFilters = useCallback((): void => {
    setFilteredData(historialData);
  }, [historialData]);

  return {
    historialData,
    filteredData,
    stats,
    loading,
    error,
    fetchHistorialData,
    fetchFilteredData,
    refreshData,
    clearFilters
  };
};

export default useHistorial;
