'use client';

import { useState, useCallback } from 'react';
import { ServiceDTO } from '@/core/application/dtos/ServiceDTO';
import { ServiceCategory } from '@/core/domain/entities/Service';
import { ProjectStatus } from '@/core/domain/value-objects/ProjectStatus';
import { EntityType } from '@/core/domain/value-objects/EntityType';

/**
 * Input para crear un servicio
 */
export interface CreateServiceData {
  name: string;
  category: ServiceCategory;
  description: string;
  documentationUrl: string;
  logoUrl?: string;
  versions: {
    web?: { currentVersion: string };
    ios?: { currentVersion: string };
    android?: { currentVersion: string };
  };
  // Campos Banorte
  projectStatus?: ProjectStatus;
  entity?: EntityType;
  hasASM?: boolean;
  implementationDate?: string;
  dateConfirmed?: boolean;
  responsibleBusiness?: string;
  responsibleIT?: string;
  responsibleERN?: string;
}

/**
 * Input para actualizar un servicio
 */
export interface UpdateServiceData {
  name?: string;
  category?: ServiceCategory;
  description?: string;
  documentationUrl?: string;
  logoUrl?: string;
  versions?: {
    web?: { currentVersion: string } | null;
    ios?: { currentVersion: string } | null;
    android?: { currentVersion: string } | null;
  };
  // Campos Banorte
  projectStatus?: ProjectStatus;
  entity?: EntityType;
  hasASM?: boolean;
  implementationDate?: string;
  dateConfirmed?: boolean;
  responsibleBusiness?: string;
  responsibleIT?: string;
  responsibleERN?: string;
}

interface UseServiceMutationsReturn {
  createService: (data: CreateServiceData) => Promise<ServiceDTO | null>;
  updateService: (id: string, data: UpdateServiceData) => Promise<ServiceDTO | null>;
  deleteService: (id: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Hook para operaciones CRUD de servicios
 */
export function useServiceMutations(): UseServiceMutationsReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const createService = useCallback(async (data: CreateServiceData): Promise<ServiceDTO | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        return result.data as ServiceDTO;
      } else {
        setError(result.error?.message || 'Failed to create service');
        return null;
      }
    } catch (err) {
      setError('Network error. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateService = useCallback(async (id: string, data: UpdateServiceData): Promise<ServiceDTO | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/services/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        return result.data as ServiceDTO;
      } else {
        setError(result.error?.message || 'Failed to update service');
        return null;
      }
    } catch (err) {
      setError('Network error. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteService = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        return true;
      } else {
        setError(result.error?.message || 'Failed to delete service');
        return false;
      }
    } catch (err) {
      setError('Network error. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createService,
    updateService,
    deleteService,
    loading,
    error,
    clearError,
  };
}
