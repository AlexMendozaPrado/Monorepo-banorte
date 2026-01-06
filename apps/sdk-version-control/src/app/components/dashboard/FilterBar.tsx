'use client';

import React from 'react';
import { Search, Download, GitCompare, Plus } from 'lucide-react';
import { ServiceFilters } from '@/core/domain/ports/repositories/IServiceRepository';
import { VersionStatus } from '@/core/domain/value-objects/VersionStatus';

interface FilterBarProps {
  filters: ServiceFilters;
  onFiltersChange: (filters: ServiceFilters) => void;
  compareMode: boolean;
  onToggleCompare: () => void;
  selectedCount: number;
  onAddService?: () => void;
}

const statusFilters: { id: string; label: string; status?: VersionStatus }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'outdated', label: 'Desactualizados', status: 'outdated' },
  { id: 'current', label: 'Al día', status: 'current' },
  { id: 'critical', label: 'Críticos', status: 'critical' },
];

export function FilterBar({
  filters,
  onFiltersChange,
  compareMode,
  onToggleCompare,
  selectedCount,
  onAddService,
}: FilterBarProps) {
  const activeFilter = filters.status || 'all';

  const handleFilterChange = (filterId: string) => {
    const filter = statusFilters.find(f => f.id === filterId);
    onFiltersChange({
      ...filters,
      status: filter?.status,
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      search: e.target.value || undefined,
    });
  };

  return (
    <div className="mb-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-banorte-dark">
            SDK Version Control
          </h1>
          <p className="text-banorte-gray mt-1">
            Monitoreo de versiones para homologación entre plataformas
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onAddService && (
            <button
              onClick={onAddService}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors shadow-sm"
            >
              <Plus size={18} />
              <span className="font-medium hidden sm:inline">Agregar Servicio</span>
            </button>
          )}

          <button
            onClick={onToggleCompare}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors border ${
              compareMode
                ? 'bg-red-50 border-banorte-red text-banorte-red'
                : 'bg-white border-gray-200 text-banorte-dark hover:bg-gray-50'
            }`}
          >
            <GitCompare size={18} />
            <span className="font-medium">Comparar Servicios</span>
            {selectedCount > 0 && (
              <span className="bg-banorte-red text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {selectedCount}
              </span>
            )}
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-banorte-red hover:bg-banorte-red-hover text-white rounded-md transition-colors shadow-sm">
            <Download size={18} />
            <span className="font-medium hidden sm:inline">Exportar Reporte</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => handleFilterChange(filter.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeFilter === (filter.status || 'all')
                  ? 'bg-banorte-red text-white shadow-sm'
                  : 'bg-white text-banorte-gray hover:bg-gray-100'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar servicio..."
            value={filters.search || ''}
            onChange={handleSearchChange}
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-banorte-red focus:border-banorte-red sm:text-sm transition-shadow"
          />
        </div>
      </div>
    </div>
  );
}
