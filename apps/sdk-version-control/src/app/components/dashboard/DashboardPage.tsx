'use client';

import React, { useState, useCallback } from 'react';
import { useServices } from '@/app/hooks/useServices';
import { useComparison } from '@/app/hooks/useComparison';
import { ServiceFilters } from '@/core/domain/ports/repositories/IServiceRepository';
import { FilterBar } from './FilterBar';
import { SummaryStats } from './SummaryStats';
import { ServiceCard } from './ServiceCard';
import { FloatingActionBar } from './FloatingActionBar';
import { ComparisonPanel } from './ComparisonPanel';

export function DashboardPage() {
  // Filters state
  const [filters, setFilters] = useState<ServiceFilters>({});

  // Compare mode state
  const [compareMode, setCompareMode] = useState(false);
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());

  // Comparison panel state
  const [showComparisonPanel, setShowComparisonPanel] = useState(false);

  // Fetch services
  const { services, statistics, loading, error, refetch } = useServices(filters);

  // Comparison hook
  const { comparison, loading: comparisonLoading, compareServices } = useComparison();

  // Toggle compare mode
  const handleToggleCompareMode = useCallback(() => {
    setCompareMode(prev => !prev);
    if (compareMode) {
      setSelectedServices(new Set());
    }
  }, [compareMode]);

  // Toggle service selection
  const handleToggleSelect = useCallback((serviceId: string) => {
    setSelectedServices(prev => {
      const next = new Set(prev);
      if (next.has(serviceId)) {
        next.delete(serviceId);
      } else {
        next.add(serviceId);
      }
      return next;
    });

    // Auto-enable compare mode if not already enabled
    if (!compareMode) {
      setCompareMode(true);
    }
  }, [compareMode]);

  // Clear selection
  const handleClearSelection = useCallback(() => {
    setSelectedServices(new Set());
  }, []);

  // Execute comparison
  const handleCompare = useCallback(async () => {
    const ids = Array.from(selectedServices);
    if (ids.length >= 2) {
      await compareServices(ids);
      setShowComparisonPanel(true);
    }
  }, [selectedServices, compareServices]);

  // Close comparison panel
  const handleCloseComparison = useCallback(() => {
    setShowComparisonPanel(false);
  }, []);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: ServiceFilters) => {
    setFilters(newFilters);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-banorte-bg p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-lg font-bold text-red-800 mb-2">Error al cargar servicios</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-banorte-red hover:bg-banorte-red-hover text-white rounded-md font-medium transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-banorte-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Bar */}
        <FilterBar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          compareMode={compareMode}
          onToggleCompare={handleToggleCompareMode}
          selectedCount={selectedServices.size}
        />

        {/* Summary Stats */}
        <SummaryStats stats={statistics} loading={loading} />

        {/* Service Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-card p-5 animate-pulse"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gray-200"></div>
                  <div>
                    <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-16 bg-gray-100 rounded"></div>
                  ))}
                </div>
                <div className="h-10 bg-gray-100 rounded"></div>
              </div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="bg-white rounded-lg shadow-card p-12 text-center">
            <p className="text-banorte-gray text-lg">
              No se encontraron servicios con los filtros seleccionados.
            </p>
            <button
              onClick={() => setFilters({})}
              className="mt-4 text-banorte-red hover:text-banorte-red-hover font-medium underline"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                compareMode={compareMode}
                isSelected={selectedServices.has(service.id)}
                onToggleSelect={handleToggleSelect}
              />
            ))}
          </div>
        )}

        {/* Floating Action Bar */}
        <FloatingActionBar
          selectedCount={selectedServices.size}
          onClear={handleClearSelection}
          onCompare={handleCompare}
        />

        {/* Comparison Panel */}
        <ComparisonPanel
          isOpen={showComparisonPanel}
          onClose={handleCloseComparison}
          comparison={comparison}
          loading={comparisonLoading}
        />
      </div>
    </div>
  );
}
