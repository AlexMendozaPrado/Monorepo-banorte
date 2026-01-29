'use client';

import React, { useState, useMemo } from 'react';
import {
  X, Filter, List, LayoutGrid,
  Layers, Monitor, ChevronDown, ChevronUp,
  Plus, CheckCircle,
} from 'lucide-react';
import { Button, cn, SearchInput, Select, Card, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@banorte/ui';
import { Chip } from './ui/Chip';
import { Functionality } from '../../core/domain/entities/Functionality';
import { BaseFunction } from '../../core/domain/entities/BaseFunction';

interface FunctionalitiesModalProps {
  open: boolean;
  onClose: () => void;
  baseFunction: BaseFunction | null;
  breadcrumb: {
    groupName: string;
    capabilityName: string;
    subCapabilityName: string;
  };
  onFunctionalitySelect?: (functionality: Functionality) => void;
  onAddToProject?: (functionalities: Functionality[]) => void;
}

type ViewMode = 'table' | 'cards';

export function FunctionalitiesModal({
  open,
  onClose,
  baseFunction,
  breadcrumb,
  onFunctionalitySelect,
  onAddToProject,
}: FunctionalitiesModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedSystem, setSelectedSystem] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFunctionalities, setSelectedFunctionalities] = useState<string[]>([]);
  const [expandedCards, setExpandedCards] = useState<string[]>([]);

  const functionalities = baseFunction?.functionalities || [];

  const uniqueLevels = useMemo(() => {
    const levels = new Set<number>();
    functionalities.forEach(f => { if (f.level) levels.add(f.level); });
    return Array.from(levels).sort();
  }, [functionalities]);

  const uniqueSystems = useMemo(() => {
    const systems = new Set<string>();
    functionalities.forEach(f => { if (f.systemApplication) systems.add(f.systemApplication); });
    return Array.from(systems).sort();
  }, [functionalities]);

  const filteredFunctionalities = useMemo(() => {
    return functionalities.filter(func => {
      const matchesSearch = searchTerm === '' ||
        func.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        func.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (func.commonComponentName?.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesLevel = selectedLevel === 'all' || func.level?.toString() === selectedLevel;
      const matchesSystem = selectedSystem === 'all' || func.systemApplication === selectedSystem;
      return matchesSearch && matchesLevel && matchesSystem;
    });
  }, [functionalities, searchTerm, selectedLevel, selectedSystem]);

  const handleSelectAll = () => {
    if (selectedFunctionalities.length === filteredFunctionalities.length) {
      setSelectedFunctionalities([]);
    } else {
      setSelectedFunctionalities(filteredFunctionalities.map(f => f.id));
    }
  };

  const handleSelectFunctionality = (id: string) => {
    setSelectedFunctionalities(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleAddSelected = () => {
    if (onAddToProject) {
      const selected = functionalities.filter(f => selectedFunctionalities.includes(f.id));
      onAddToProject(selected);
    }
  };

  const getLevelColor = (level?: number) => {
    if (!level) return '#9e9e9e';
    const colors = ['#e0e0e0', '#81c784', '#4caf50', '#388e3c', '#1b5e20'];
    return colors[level - 1] ?? '#4caf50';
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLevel('all');
    setSelectedSystem('all');
  };

  if (!baseFunction || !open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-card shadow-2xl w-full max-w-5xl flex flex-col" style={{ minHeight: '70vh', maxHeight: '90vh' }}>
        {/* Header */}
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              {/* Breadcrumb */}
              <nav className="flex items-center gap-1 mb-2 text-xs text-banorte-gray">
                <span>{breadcrumb.groupName}</span>
                <span>/</span>
                <span>{breadcrumb.capabilityName}</span>
                <span>/</span>
                <span>{breadcrumb.subCapabilityName}</span>
                <span>/</span>
                <span className="font-bold text-banorte-dark">{baseFunction.name}</span>
              </nav>

              <div className="flex items-center gap-2">
                <Layers size={20} className="text-purple-700" />
                <h2 className="text-lg font-bold text-banorte-dark">{baseFunction.name}</h2>
                <Chip label={`${functionalities.length} funcionalidades`} color="#f3e5f5" textColor="#7b1fa2" />
              </div>

              {baseFunction.description && (
                <p className="text-sm text-banorte-gray mt-1">{baseFunction.description}</p>
              )}
            </div>
            <button onClick={onClose} className="p-1 text-banorte-gray hover:text-banorte-dark transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Search + filters toolbar */}
          <div className="mb-4">
            <div className="flex gap-3 items-center mb-2">
              <div className="flex-1 max-w-[400px]">
                <SearchInput
                  placeholder="Buscar funcionalidad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  'h-9 px-3 rounded text-sm flex items-center gap-1.5 transition-colors',
                  showFilters ? 'bg-banorte-red text-white' : 'border border-gray-300 text-banorte-gray hover:bg-gray-50'
                )}
              >
                <Filter size={14} />
                Filtros
                {(selectedLevel !== 'all' || selectedSystem !== 'all') && (
                  <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/30 text-[10px] font-bold">
                    {(selectedLevel !== 'all' ? 1 : 0) + (selectedSystem !== 'all' ? 1 : 0)}
                  </span>
                )}
              </button>

              <div className="flex border border-gray-300 rounded overflow-hidden">
                <button
                  onClick={() => setViewMode('table')}
                  className={cn('h-9 w-9 flex items-center justify-center', viewMode === 'table' ? 'bg-banorte-red text-white' : 'bg-white text-banorte-gray')}
                  title="Vista tabla"
                >
                  <List size={16} />
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={cn('h-9 w-9 flex items-center justify-center border-l border-gray-300', viewMode === 'cards' ? 'bg-banorte-red text-white' : 'bg-white text-banorte-gray')}
                  title="Vista tarjetas"
                >
                  <LayoutGrid size={16} />
                </button>
              </div>
            </div>

            {/* Filter panel */}
            {showFilters && (
              <div className="p-3 bg-gray-50 rounded mt-2 flex gap-3 items-center flex-wrap">
                <Select
                  value={selectedLevel}
                  onChange={(val) => setSelectedLevel(val)}
                  options={[
                    { value: 'all', label: 'Todos los niveles' },
                    ...uniqueLevels.map(level => ({ value: level.toString(), label: `Nivel ${level}` })),
                  ]}
                  className="h-9 min-w-[150px] text-sm"
                />

                <Select
                  value={selectedSystem}
                  onChange={(val) => setSelectedSystem(val)}
                  options={[
                    { value: 'all', label: 'Todos los sistemas' },
                    ...uniqueSystems.map(system => ({ value: system, label: system })),
                  ]}
                  className="h-9 min-w-[200px] text-sm"
                />

                <button onClick={clearFilters} className="text-sm text-banorte-gray hover:text-banorte-dark">
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>

          {/* Results counter */}
          <p className="text-sm text-banorte-gray mb-3">
            Mostrando {filteredFunctionalities.length} de {functionalities.length} funcionalidades
            {selectedFunctionalities.length > 0 && (
              <Chip label={`${selectedFunctionalities.length} seleccionadas`} color="#1976d2" textColor="white" className="ml-2" />
            )}
          </p>

          {/* Table view */}
          {viewMode === 'table' && (
            <div className="border border-gray-200 rounded overflow-auto" style={{ maxHeight: 'calc(90vh - 350px)' }}>
              <Table>
                <TableHeader sticky>
                  <TableRow hoverable={false}>
                    <TableHead className="w-10 px-3 py-2">
                      <input
                        type="checkbox"
                        checked={filteredFunctionalities.length > 0 && selectedFunctionalities.length === filteredFunctionalities.length}
                        ref={(el) => { if (el) el.indeterminate = selectedFunctionalities.length > 0 && selectedFunctionalities.length < filteredFunctionalities.length; }}
                        onChange={handleSelectAll}
                        className="accent-banorte-red"
                      />
                    </TableHead>
                    <TableHead className="min-w-[250px]">Nombre</TableHead>
                    <TableHead className="min-w-[300px]">Descripcion</TableHead>
                    <TableHead align="center" className="w-20">Nivel</TableHead>
                    <TableHead className="min-w-[120px]">Sistema</TableHead>
                    <TableHead className="min-w-[150px]">Componente Comun</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFunctionalities.map((func) => (
                    <TableRow
                      key={func.id}
                      selected={selectedFunctionalities.includes(func.id)}
                      onClick={() => onFunctionalitySelect?.(func)}
                    >
                      <TableCell className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedFunctionalities.includes(func.id)}
                          onChange={() => handleSelectFunctionality(func.id)}
                          className="accent-banorte-red"
                        />
                      </TableCell>
                      <TableCell className="px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle size={14} style={{ color: getLevelColor(func.level) }} />
                          <span className="font-medium">{func.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-2">
                        <span className="text-banorte-gray line-clamp-2">{func.description || '-'}</span>
                      </TableCell>
                      <TableCell align="center" className="px-3 py-2">
                        {func.level && (
                          <Chip label={`N${func.level}`} color={getLevelColor(func.level)} textColor="white" className="font-bold" />
                        )}
                      </TableCell>
                      <TableCell className="px-3 py-2">
                        {func.systemApplication && (
                          <Chip label={func.systemApplication} color="#EBF0F2" textColor="#5B6670" icon={<Monitor size={12} />} />
                        )}
                      </TableCell>
                      <TableCell className="px-3 py-2">
                        {func.commonComponentName && (
                          <Chip label={func.commonComponentName} color="#fff3e0" textColor="#e65100" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Cards view */}
          {viewMode === 'cards' && (
            <div
              className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3 overflow-y-auto"
              style={{ maxHeight: 'calc(90vh - 350px)' }}
            >
              {filteredFunctionalities.map((func) => (
                <Card
                  key={func.id}
                  noPadding
                  className={cn(
                    'cursor-pointer hover:shadow-md transition-shadow',
                    selectedFunctionalities.includes(func.id)
                      ? 'border-2 border-blue-500'
                      : 'border border-gray-200'
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={selectedFunctionalities.includes(func.id)}
                        onChange={() => handleSelectFunctionality(func.id)}
                        className="mt-0.5 accent-banorte-red"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <CheckCircle size={16} style={{ color: getLevelColor(func.level) }} />
                          <span className="text-sm font-bold flex-1">{func.name}</span>
                          {func.level && (
                            <Chip label={`N${func.level}`} color={getLevelColor(func.level)} textColor="white" size="sm" className="font-bold" />
                          )}
                        </div>
                        <p className={cn(
                          'text-sm text-banorte-gray mb-2',
                          expandedCards.includes(func.id) ? '' : 'line-clamp-2'
                        )}>
                          {func.description || 'Sin descripcion'}
                        </p>
                        <div className="flex gap-1 flex-wrap">
                          {func.systemApplication && (
                            <Chip label={func.systemApplication} color="#EBF0F2" textColor="#5B6670" size="sm" icon={<Monitor size={10} />} />
                          )}
                          {func.commonComponentName && (
                            <Chip label={`CC: ${func.commonComponentName}`} color="#fff3e0" textColor="#e65100" size="sm" />
                          )}
                        </div>
                        {func.description && func.description.length > 100 && (
                          <button
                            onClick={() => setExpandedCards(prev => prev.includes(func.id) ? prev.filter(i => i !== func.id) : [...prev, func.id])}
                            className="text-xs text-banorte-gray mt-1.5 flex items-center gap-0.5 hover:text-banorte-dark"
                          >
                            {expandedCards.includes(func.id) ? (
                              <>Ver menos <ChevronUp size={12} /></>
                            ) : (
                              <>Ver mas <ChevronDown size={12} /></>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredFunctionalities.length === 0 && (
            <div className="text-center py-8">
              <p className="text-banorte-gray">No se encontraron funcionalidades con los filtros aplicados</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-200 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cerrar</Button>
          {selectedFunctionalities.length > 0 && (
            <Button variant="primary" onClick={handleAddSelected}>
              <Plus size={16} className="mr-1.5" />
              Agregar {selectedFunctionalities.length} al proyecto
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
