'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '@banorte/ui';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { SearchArea, ViewMode, SortOption, HierarchyLevel } from './SearchArea';
import { AdaptableCard } from './AdaptableCard';
import { CapabilityList } from './CapabilityList';
import { DetailPanel } from './DetailPanel';
import { Capability } from '../../core/domain/entities/Capability';
import { SubCapability } from '../../core/domain/entities/SubCapability';
import { BaseFunction } from '../../core/domain/entities/BaseFunction';
import { Functionality } from '../../core/domain/entities/Functionality';
import { CapabilityGroup } from '../../core/domain/entities/CapabilityGroup';
import { JsonCapabilityGroupRepository } from '../../infrastructure/repositories/JsonCapabilityGroupRepository';

const ITEMS_PER_PAGE = 6;

type AdaptableDataItem =
  | { item: Capability; parent: Capability }
  | { item: SubCapability; parent: Capability }
  | { item: BaseFunction; parent: Capability; subParent: SubCapability }
  | { item: Functionality; parent: Capability; subParent: SubCapability; baseFunctionParent: BaseFunction };

export function ExplorerPage() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Main state
  const [capabilityGroups, setCapabilityGroups] = useState<CapabilityGroup[]>([]);
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [subCapabilities, setSubCapabilities] = useState<{ subCapability: SubCapability; parent: Capability }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [hierarchyLevel, setHierarchyLevel] = useState<HierarchyLevel>('subcapability');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [currentPage, setCurrentPage] = useState(1);

  // Navigation state
  const [, setSelectedCapabilityId] = useState<string>('');
  const [detailCapability, setDetailCapability] = useState<Capability | null>(null);
  const [selectedItemContext, setSelectedItemContext] = useState<{
    level: HierarchyLevel;
    item: Capability | SubCapability | BaseFunction | Functionality;
    subParent?: SubCapability;
    baseFunctionParent?: BaseFunction;
  } | undefined>(undefined);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Repository
  const [groupRepository] = useState(() => new JsonCapabilityGroupRepository());

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const groups = await groupRepository.findAll();
        setCapabilityGroups(groups);

        const allCapabilities = groups.flatMap(group => group.capabilities);
        setCapabilities(allCapabilities);

        const allSubCapabilities = allCapabilities.flatMap(capability =>
          capability.subCapabilities?.map(subCapability => ({
            subCapability,
            parent: capability,
          })) || []
        );
        setSubCapabilities(allSubCapabilities);
      } catch (err) {
        setError('Error al cargar las capacidades BIAN');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [groupRepository]);

  // Update sidebar for mobile
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  // Generate adaptable data based on hierarchy level
  const adaptableData = useMemo((): AdaptableDataItem[] => {
    if (!capabilities || capabilities.length === 0) return [];

    switch (hierarchyLevel) {
      case 'capability':
        return capabilities.map(capability => ({ item: capability, parent: capability }));
      case 'subcapability':
        return capabilities.flatMap(capability =>
          capability.subCapabilities?.map(subCapability => ({ item: subCapability, parent: capability })) || []
        );
      case 'baseFunction':
        return capabilities.flatMap(capability =>
          capability.subCapabilities?.flatMap(subCapability =>
            subCapability.baseFunctions?.map(baseFunction => ({
              item: baseFunction,
              parent: capability,
              subParent: subCapability,
            })) || []
          ) || []
        );
      case 'functionality':
        return capabilities.flatMap(capability =>
          capability.subCapabilities?.flatMap(subCapability =>
            subCapability.baseFunctions?.flatMap(baseFunction =>
              baseFunction.functionalities?.map(functionality => ({
                item: functionality,
                parent: capability,
                subParent: subCapability,
                baseFunctionParent: baseFunction,
              })) || []
            ) || []
          ) || []
        );
      default:
        return subCapabilities.map(({ subCapability, parent }) => ({ item: subCapability, parent }));
    }
  }, [capabilities, subCapabilities, hierarchyLevel]);

  // Filter and sort
  const filteredAndSortedData = useMemo((): AdaptableDataItem[] => {
    if (!adaptableData || adaptableData.length === 0) return [];

    let filtered = adaptableData;

    // Text search
    if (searchTerm) {
      filtered = filtered.filter((data) => {
        const searchLower = searchTerm.toLowerCase();
        const item = data.item;

        let nameMatch = false;
        let descriptionMatch = false;
        let parentMatch = false;

        if ('name' in item) nameMatch = item.name.toLowerCase().includes(searchLower);
        if ('description' in item && item.description) descriptionMatch = item.description.toLowerCase().includes(searchLower);
        if (data.parent) parentMatch = data.parent.name.toLowerCase().includes(searchLower);

        let deepMatch = false;
        switch (hierarchyLevel) {
          case 'capability': {
            const capability = item as Capability;
            deepMatch = capability.subCapabilities?.some(sc =>
              sc.name.toLowerCase().includes(searchLower) ||
              sc.description.toLowerCase().includes(searchLower)
            ) || false;
            break;
          }
          case 'subcapability': {
            const subCap = item as SubCapability;
            deepMatch = subCap.baseFunctions?.some(bf =>
              bf.name.toLowerCase().includes(searchLower) ||
              bf.functionalities?.some(func => func.name.toLowerCase().includes(searchLower))
            ) || false;
            break;
          }
          case 'baseFunction': {
            const baseFunc = item as BaseFunction;
            deepMatch = baseFunc.functionalities?.some(func =>
              func.name.toLowerCase().includes(searchLower)
            ) || false;
            break;
          }
        }

        return nameMatch || descriptionMatch || parentMatch || deepMatch;
      });
    }

    // Sort
    switch (sortBy) {
      case 'alphabetical':
        filtered.sort((a, b) => {
          const aName = 'name' in a.item ? a.item.name : '';
          const bName = 'name' in b.item ? b.item.name : '';
          return aName.localeCompare(bName);
        });
        break;
      case 'id':
        filtered.sort((a, b) => {
          const aId = 'id' in a.item ? (typeof a.item.id === 'string' ? a.item.id : a.item.id.value) : '';
          const bId = 'id' in b.item ? (typeof b.item.id === 'string' ? b.item.id : b.item.id.value) : '';
          return aId.localeCompare(bId);
        });
        break;
    }

    return filtered;
  }, [adaptableData, searchTerm, sortBy, hierarchyLevel]);

  // Pagination
  const totalPages = Math.ceil((filteredAndSortedData?.length || 0) / ITEMS_PER_PAGE);
  const paginatedData = filteredAndSortedData?.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  ) || [];

  // Handlers
  const handleCapabilitySelect = (capabilityId: string) => {
    setSelectedCapabilityId(capabilityId);
    const capability = capabilities.find(cap => cap.id.value === capabilityId);
    if (capability) {
      setDetailCapability(capability);
      setDetailPanelOpen(true);
    }
  };

  const handleSubCapabilitySelect = (capabilityId: string, _subCapabilityId: string) => {
    handleCapabilitySelect(capabilityId);
  };

  const handleFunctionalitySelect = (capabilityId: string, _subCapabilityId: string, _functionalityId: string) => {
    handleCapabilitySelect(capabilityId);
  };

  const handleViewDetails = (capability: Capability, context?: {
    level: HierarchyLevel;
    item: Capability | SubCapability | BaseFunction | Functionality;
    subParent?: SubCapability;
    baseFunctionParent?: BaseFunction;
  }) => {
    setDetailCapability(capability);
    setSelectedItemContext(context);
    setDetailPanelOpen(true);
  };

  const handleAddToProject = (capability: Capability) => {
    console.log('Agregando a proyecto:', capability.name);
    setSnackbarMessage(`"${capability.name}" agregado al proyecto exitosamente`);
    setSnackbarOpen(true);
  };

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, hierarchyLevel]);

  // Auto-dismiss snackbar
  useEffect(() => {
    if (snackbarOpen) {
      const timer = setTimeout(() => setSnackbarOpen(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [snackbarOpen]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-10 h-10 border-4 border-banorte-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-card text-red-700">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Header onMenuClick={handleMenuClick} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          capabilityGroups={capabilityGroups}
          onCapabilitySelect={handleCapabilitySelect}
          onSubCapabilitySelect={handleSubCapabilitySelect}
          onFunctionalitySelect={handleFunctionalitySelect}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isMobile={isMobile}
        />

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0">
          <SearchArea
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            hierarchyLevel={hierarchyLevel}
            onHierarchyLevelChange={setHierarchyLevel}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            sortBy={sortBy}
            onSortChange={setSortBy}
            resultsCount={filteredAndSortedData?.length || 0}
          />

          {/* Results */}
          <div className="flex-1 p-6 overflow-auto">
            {(!filteredAndSortedData || filteredAndSortedData.length === 0) ? (
              <div className="text-center py-16">
                <h3 className="text-lg font-display text-banorte-gray mb-2">No se encontraron resultados</h3>
                <p className="text-sm text-banorte-gray">Intenta ajustar los filtros o terminos de busqueda</p>
              </div>
            ) : (
              <>
                {viewMode === 'cards' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedData.map((data, index) => {
                      const keyId = 'id' in data.item
                        ? (typeof data.item.id === 'string' ? data.item.id : data.item.id.value)
                        : `item-${index}`;
                      return (
                        <AdaptableCard
                          key={`${data.parent?.id.value}-${keyId}`}
                          hierarchyLevel={hierarchyLevel}
                          data={data}
                          onViewDetails={handleViewDetails}
                          onAddToProject={handleAddToProject}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <CapabilityList
                    capabilities={paginatedData.map(({ parent }) => parent!)}
                    onViewDetails={handleViewDetails}
                    onAddToProject={handleAddToProject}
                  />
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => p - 1)}
                      className={cn(
                        'h-10 px-4 rounded-btn text-sm font-display transition-colors',
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white border border-gray-300 text-banorte-dark hover:bg-gray-50'
                      )}
                    >
                      Anterior
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={cn(
                          'h-10 w-10 rounded-btn text-sm font-display transition-colors',
                          page === currentPage
                            ? 'bg-banorte-red text-white'
                            : 'bg-white border border-gray-300 text-banorte-dark hover:bg-gray-50'
                        )}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => p + 1)}
                      className={cn(
                        'h-10 px-4 rounded-btn text-sm font-display transition-colors',
                        currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white border border-gray-300 text-banorte-dark hover:bg-gray-50'
                      )}
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Detail panel */}
      <DetailPanel
        open={detailPanelOpen}
        capability={detailCapability}
        selectedItem={selectedItemContext}
        onClose={() => {
          setDetailPanelOpen(false);
          setSelectedItemContext(undefined);
        }}
        onAddToProject={handleAddToProject}
      />

      {/* Toast notification */}
      {snackbarOpen && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
          <div className="flex items-center gap-3 px-4 py-3 bg-green-600 text-white rounded-card shadow-lg">
            <span className="text-sm">{snackbarMessage}</span>
            <button onClick={() => setSnackbarOpen(false)} className="text-white/80 hover:text-white">
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
