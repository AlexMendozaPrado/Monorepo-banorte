'use client';

import { useState, useEffect, useCallback } from 'react';
import { ServiceDTO, ServiceSummaryDTO } from '@/core/application/dtos/ServiceDTO';
import { ServiceFilters, ServiceStatistics } from '@/core/domain/ports/repositories/IServiceRepository';

interface UseServicesReturn {
  services: ServiceDTO[];
  statistics: ServiceStatistics | null;
  loading: boolean;
  error: string | null;
  filters: ServiceFilters;
  setFilters: (filters: ServiceFilters) => void;
  refetch: () => Promise<void>;
}

const defaultStatistics: ServiceStatistics = {
  total: 0,
  current: 0,
  warning: 0,
  outdated: 0,
  critical: 0,
  byCategory: {
    Identity: 0,
    Analytics: 0,
    Attribution: 0,
    Monitoring: 0,
    Payments: 0,
    Engagement: 0,
    CMS: 0,
    Other: 0,
  },
  byPlatform: {
    web: 0,
    ios: 0,
    android: 0,
  },
};

/**
 * Hook para gestionar la lista de servicios
 * Responde a cambios en los filtros en tiempo real
 */
export function useServices(filters: ServiceFilters = {}): UseServicesReturn {
  const [services, setServices] = useState<ServiceDTO[]>([]);
  const [statistics, setStatistics] = useState<ServiceStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Serializar filtros para usar como dependencia
  const filtersKey = JSON.stringify(filters);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      if (filters.category) params.set('category', filters.category);
      if (filters.platform) params.set('platform', filters.platform);
      if (filters.status) params.set('status', filters.status);
      if (filters.search) params.set('search', filters.search);

      const response = await fetch(`/api/services?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setServices(data.data.services);
        setStatistics(data.data.statistics);
        setError(null);
      } else {
        setError(data.error?.message || 'Failed to fetch services');
        setServices([]);
        setStatistics(defaultStatistics);
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setServices([]);
      setStatistics(defaultStatistics);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return {
    services,
    statistics,
    loading,
    error,
    filters,
    setFilters: () => {}, // Los filtros ahora son controlados externamente
    refetch: fetchServices,
  };
}

/**
 * Hook para obtener un servicio por ID
 */
export function useService(serviceId: string | null) {
  const [service, setService] = useState<ServiceDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!serviceId) {
      setService(null);
      return;
    }

    const fetchService = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/services/${serviceId}`);
        const data = await response.json();

        if (data.success) {
          setService(data.data);
        } else {
          setError(data.error?.message || 'Failed to fetch service');
          setService(null);
        }
      } catch {
        setError('Network error');
        setService(null);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [serviceId]);

  return { service, loading, error };
}
