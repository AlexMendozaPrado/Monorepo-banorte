'use client';

import React from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { cn, SearchInput, Select } from '@banorte/ui';

export type ViewMode = 'cards' | 'list';
export type SortOption = 'relevance' | 'alphabetical' | 'id';
export type HierarchyLevel = 'capability' | 'subcapability' | 'baseFunction' | 'functionality';

interface SearchAreaProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  hierarchyLevel: HierarchyLevel;
  onHierarchyLevelChange: (level: HierarchyLevel) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  resultsCount: number;
}

const hierarchyLevelOptions: { id: HierarchyLevel; label: string }[] = [
  { id: 'capability', label: 'Capacidad' },
  { id: 'subcapability', label: 'SubCapacidad' },
  { id: 'baseFunction', label: 'Func. Base' },
  { id: 'functionality', label: 'Funcionalidades' },
];

export function SearchArea({
  searchTerm,
  onSearchChange,
  hierarchyLevel,
  onHierarchyLevelChange,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  resultsCount,
}: SearchAreaProps) {
  return (
    <div className="p-6 bg-white border-b border-banorte-bg">
      {/* Search bar */}
      <div className="mb-4">
        <SearchInput
          placeholder="Que capacidad BIAN necesitas hoy?"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-[45px]"
        />
      </div>

      <div className="flex flex-col gap-3">
        {/* Hierarchy level chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-banorte-gray font-medium mr-1">Ver por:</span>
          {hierarchyLevelOptions.map((level) => (
            <button
              key={level.id}
              onClick={() => onHierarchyLevelChange(level.id)}
              className={cn(
                'h-8 px-3 rounded-full text-[13px] font-display font-medium transition-colors',
                hierarchyLevel === level.id
                  ? 'bg-banorte-red text-white'
                  : 'bg-banorte-bg text-banorte-dark hover:bg-gray-300'
              )}
            >
              {level.label}
            </button>
          ))}
        </div>

        {/* View controls + sort */}
        <div className="flex justify-between items-center flex-wrap gap-3">
          <span className="text-sm text-banorte-gray">
            Mostrando 1-6 de {resultsCount} resultados
          </span>

          <div className="flex items-center gap-4">
            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-banorte-gray">Ordenar por:</span>
              <Select
                value={sortBy}
                onChange={(val) => onSortChange(val as SortOption)}
                options={[
                  { value: 'relevance', label: 'Relevancia' },
                  { value: 'alphabetical', label: 'Alfabetico' },
                  { value: 'id', label: 'ID' },
                ]}
                className="h-8 min-w-[140px] text-[13px]"
              />
            </div>

            {/* View toggle */}
            <div className="flex border border-gray-300 rounded overflow-hidden">
              <button
                onClick={() => onViewModeChange('cards')}
                className={cn(
                  'h-8 w-10 flex items-center justify-center transition-colors',
                  viewMode === 'cards'
                    ? 'bg-banorte-red text-white'
                    : 'bg-white text-banorte-gray hover:bg-gray-50'
                )}
                aria-label="vista de tarjetas"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={cn(
                  'h-8 w-10 flex items-center justify-center transition-colors border-l border-gray-300',
                  viewMode === 'list'
                    ? 'bg-banorte-red text-white'
                    : 'bg-white text-banorte-gray hover:bg-gray-50'
                )}
                aria-label="vista de lista"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
