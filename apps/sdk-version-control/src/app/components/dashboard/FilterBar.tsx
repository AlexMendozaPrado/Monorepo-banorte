'use client';

import React from 'react';
import { Search, Download, GitCompare, Plus, Filter, X } from 'lucide-react';
import { ServiceFilters } from '@/core/domain/ports/repositories/IServiceRepository';
import { VersionStatus } from '@/core/domain/value-objects/VersionStatus';
import { ProjectStatus, PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS, ALL_PROJECT_STATUSES } from '@/core/domain/value-objects/ProjectStatus';
import { EntityType, ENTITY_TYPE_LABELS, ENTITY_TYPE_COLORS, ALL_ENTITY_TYPES } from '@/core/domain/value-objects/EntityType';

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

  const handleProjectStatusChange = (status: ProjectStatus | '') => {
    onFiltersChange({
      ...filters,
      projectStatus: status || undefined,
    });
  };

  const handleEntityChange = (entity: EntityType | '') => {
    onFiltersChange({
      ...filters,
      entity: entity || undefined,
    });
  };

  const handleASMChange = (value: 'all' | 'yes' | 'no') => {
    onFiltersChange({
      ...filters,
      hasASM: value === 'all' ? undefined : value === 'yes',
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = filters.status || filters.projectStatus || filters.entity || filters.hasASM !== undefined || filters.search;

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

      {/* Status Filters Row */}
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

      {/* Banorte Filters Row */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="flex items-center gap-2 text-sm text-banorte-gray">
          <Filter size={16} />
          <span className="font-medium">Filtros:</span>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Project Status Filter */}
          <select
            value={filters.projectStatus || ''}
            onChange={(e) => handleProjectStatusChange(e.target.value as ProjectStatus | '')}
            className="px-3 py-1.5 border border-gray-200 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-banorte-red focus:border-banorte-red"
          >
            <option value="">Estado Proyecto</option>
            {ALL_PROJECT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {PROJECT_STATUS_LABELS[status]}
              </option>
            ))}
          </select>

          {/* Entity Filter */}
          <select
            value={filters.entity || ''}
            onChange={(e) => handleEntityChange(e.target.value as EntityType | '')}
            className="px-3 py-1.5 border border-gray-200 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-banorte-red focus:border-banorte-red"
          >
            <option value="">Entidad</option>
            {ALL_ENTITY_TYPES.map((entity) => (
              <option key={entity} value={entity}>
                {ENTITY_TYPE_LABELS[entity]}
              </option>
            ))}
          </select>

          {/* ASM Filter */}
          <select
            value={filters.hasASM === undefined ? 'all' : filters.hasASM ? 'yes' : 'no'}
            onChange={(e) => handleASMChange(e.target.value as 'all' | 'yes' | 'no')}
            className="px-3 py-1.5 border border-gray-200 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-banorte-red focus:border-banorte-red"
          >
            <option value="all">ASM</option>
            <option value="yes">Con ASM</option>
            <option value="no">Sin ASM</option>
          </select>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-banorte-red hover:bg-red-50 rounded-md transition-colors"
            >
              <X size={14} />
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Active Filters Badges */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 ml-auto">
            {filters.projectStatus && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: PROJECT_STATUS_COLORS[filters.projectStatus] }}
              >
                {PROJECT_STATUS_LABELS[filters.projectStatus]}
                <button
                  onClick={() => handleProjectStatusChange('')}
                  className="hover:opacity-75"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {filters.entity && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: ENTITY_TYPE_COLORS[filters.entity] }}
              >
                {ENTITY_TYPE_LABELS[filters.entity]}
                <button
                  onClick={() => handleEntityChange('')}
                  className="hover:opacity-75"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {filters.hasASM !== undefined && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                filters.hasASM ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                ASM: {filters.hasASM ? 'Si' : 'No'}
                <button
                  onClick={() => handleASMChange('all')}
                  className="hover:opacity-75"
                >
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
