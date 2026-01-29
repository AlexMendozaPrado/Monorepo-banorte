'use client';

import React, { useState } from 'react';
import { X, Plus, GitCompare, Download, Share2, ChevronRight, ChevronDown } from 'lucide-react';
import { Button, cn } from '@banorte/ui';
import { Chip } from './ui/Chip';
import { Capability } from '../../core/domain/entities/Capability';
import { SubCapability } from '../../core/domain/entities/SubCapability';
import { BaseFunction } from '../../core/domain/entities/BaseFunction';
import { Functionality } from '../../core/domain/entities/Functionality';
import type { HierarchyLevel } from './SearchArea';

interface DetailPanelProps {
  open: boolean;
  capability: Capability | null;
  selectedItem?: {
    level: HierarchyLevel;
    item: Capability | SubCapability | BaseFunction | Functionality;
    subParent?: SubCapability;
    baseFunctionParent?: BaseFunction;
  };
  onClose: () => void;
  onAddToProject?: (capability: Capability) => void;
}

export function DetailPanel({
  open,
  capability,
  selectedItem,
  onClose,
  onAddToProject,
}: DetailPanelProps) {
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>(false);

  const generateBreadcrumbs = () => {
    if (!selectedItem) {
      return [
        { label: 'Inicio', active: false },
        { label: 'Capacidades', active: false },
        { label: capability?.name || '', active: true },
      ];
    }
    const breadcrumbs = [
      { label: 'Inicio', active: false },
      { label: 'Capacidades', active: false },
    ];
    switch (selectedItem.level) {
      case 'capability':
        breadcrumbs.push({ label: (selectedItem.item as Capability).name, active: true });
        break;
      case 'subcapability':
        breadcrumbs.push(
          { label: capability?.name || '', active: false },
          { label: (selectedItem.item as SubCapability).name, active: true }
        );
        break;
      case 'baseFunction':
        breadcrumbs.push(
          { label: capability?.name || '', active: false },
          { label: selectedItem.subParent?.name || '', active: false },
          { label: (selectedItem.item as BaseFunction).name, active: true }
        );
        break;
      case 'functionality':
        breadcrumbs.push(
          { label: capability?.name || '', active: false },
          { label: selectedItem.subParent?.name || '', active: false },
          { label: selectedItem.baseFunctionParent?.name || '', active: false },
          { label: (selectedItem.item as Functionality).name, active: true }
        );
        break;
    }
    return breadcrumbs;
  };

  const getMainContent = () => {
    if (!selectedItem) {
      return {
        title: capability?.name || '',
        id: capability?.id.value || '',
        description: (capability?.subCapabilities?.length ?? 0) > 0
          ? capability?.subCapabilities?.[0]?.description || 'Sin descripcion disponible'
          : 'Capacidad BIAN sin descripcion detallada disponible.',
        type: 'Capacidad',
      };
    }
    const { item, level } = selectedItem;
    switch (level) {
      case 'capability': {
        const cap = item as Capability;
        return {
          title: cap.name,
          id: cap.id.value,
          description: cap.subCapabilities.length > 0
            ? cap.subCapabilities[0]?.description
            : 'Capacidad BIAN sin descripcion detallada disponible.',
          type: 'Capacidad',
        };
      }
      case 'subcapability': {
        const sub = item as SubCapability;
        return { title: sub.name, id: sub.id, description: sub.description || 'Subcapacidad sin descripcion.', type: 'Subcapacidad' };
      }
      case 'baseFunction': {
        const bf = item as BaseFunction;
        return { title: bf.name, id: bf.id, description: bf.description || 'Funcionalidad base sin descripcion.', type: 'Funcionalidad Base' };
      }
      case 'functionality': {
        const func = item as Functionality;
        return { title: func.name, id: func.id, description: func.description || 'Funcionalidad sin descripcion.', type: 'Funcionalidad' };
      }
      default:
        return { title: capability?.name || '', id: capability?.id.value || '', description: 'Sin descripcion disponible.', type: 'Elemento' };
    }
  };

  if (!capability) return null;

  const breadcrumbs = generateBreadcrumbs();
  const mainContent = getMainContent();
  const functionalityCount = capability.getTotalFunctionalities();

  const renderStatsChips = () => {
    if (!selectedItem) {
      return (
        <>
          <Chip label={`${capability.getTotalSubCapabilities()} subcapacidades`} color="#EBF0F2" textColor="#5B6670" />
          <Chip label={`${functionalityCount} funcionalidades`} color="#EBF0F2" textColor="#5B6670" />
        </>
      );
    }
    switch (selectedItem.level) {
      case 'capability': {
        const cap = selectedItem.item as Capability;
        return (
          <>
            <Chip label={`${cap.getTotalSubCapabilities()} subcapacidades`} color="#EBF0F2" textColor="#5B6670" />
            <Chip label={`${cap.getTotalFunctionalities()} funcionalidades`} color="#EBF0F2" textColor="#5B6670" />
          </>
        );
      }
      case 'subcapability': {
        const sub = selectedItem.item as SubCapability;
        return (
          <>
            <Chip label={`${sub.baseFunctions.length} funcionalidades base`} color="#EBF0F2" textColor="#5B6670" />
            <Chip label={`${sub.getTotalFunctionalities()} funcionalidades`} color="#EBF0F2" textColor="#5B6670" />
          </>
        );
      }
      case 'baseFunction': {
        const bf = selectedItem.item as BaseFunction;
        return <Chip label={`${bf.functionalities.length} funcionalidades`} color="#EBF0F2" textColor="#5B6670" />;
      }
      case 'functionality': {
        const func = selectedItem.item as Functionality;
        return (
          <>
            {func.level && <Chip label={`Nivel ${func.level}`} color="#4CAF50" textColor="white" />}
            {func.systemApplication && <Chip label={func.systemApplication} color="#2196F3" textColor="white" />}
            {func.commonComponentName && <Chip label={func.commonComponentName} color="#9C27B0" textColor="white" />}
          </>
        );
      }
      default:
        return null;
    }
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      )}

      {/* Panel */}
      <div
        className={cn(
          'fixed top-16 right-0 z-50 w-[400px] h-[calc(100vh-64px)] bg-white shadow-xl',
          'transition-transform duration-300 ease-in-out overflow-y-auto',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 mr-4">
              <h2 className="font-display text-lg font-bold text-banorte-dark mb-2">
                {mainContent.title}
              </h2>
              <div className="flex gap-2 items-center">
                <Chip label={mainContent.type} color="#EB0029" textColor="white" className="font-medium" />
                <Chip label={mainContent.id} color="#F4F7F8" textColor="#5B6670" />
              </div>
            </div>
            <button onClick={onClose} className="p-1 text-banorte-gray hover:text-banorte-dark transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1 mb-6 flex-wrap">
            {breadcrumbs.map((bc, index) => (
              <React.Fragment key={index}>
                {index > 0 && <ChevronRight size={14} className="text-banorte-gray flex-shrink-0" />}
                <span className={cn('text-sm', bc.active ? 'font-medium text-banorte-dark' : 'text-banorte-gray')}>
                  {bc.label}
                </span>
              </React.Fragment>
            ))}
          </nav>

          {/* Description */}
          <div className="mb-6">
            <h3 className="font-display text-base font-semibold text-banorte-dark mb-3">
              Descripcion Detallada
            </h3>
            <p className="text-sm text-banorte-gray leading-relaxed mb-3">{mainContent.description}</p>
            <div className="flex gap-2 flex-wrap">{renderStatsChips()}</div>
          </div>

          <hr className="border-banorte-bg mb-6" />

          {/* Functionalities accordion */}
          <h3 className="font-display text-base font-semibold text-banorte-dark mb-3">Funcionalidades</h3>
          <div className="mb-6 max-h-[400px] overflow-y-auto">
            {capability.subCapabilities.map((subCapability, index) => {
              const panelId = `panel${index}`;
              const isExpanded = expandedAccordion === panelId;
              return (
                <div key={subCapability.id} className="border border-banorte-bg rounded mb-1.5">
                  <button
                    className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedAccordion(isExpanded ? false : panelId)}
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      <span className="font-medium text-sm text-banorte-dark truncate flex-1">
                        {subCapability.name}
                      </span>
                      <Chip
                        label={subCapability.baseFunctions.length}
                        color="#EBF0F2"
                        textColor="#5B6670"
                        className="mx-2 flex-shrink-0"
                      />
                    </div>
                    <ChevronDown
                      size={16}
                      className={cn('text-banorte-gray transition-transform flex-shrink-0', isExpanded && 'rotate-180')}
                    />
                  </button>
                  {isExpanded && (
                    <div className="px-3 pb-3">
                      <p className="text-xs text-banorte-gray mb-3">{subCapability.description}</p>
                      {subCapability.baseFunctions.map((baseFunction) => (
                        <div key={baseFunction.id} className="mb-3">
                          <div className="bg-gray-50 rounded p-2 mb-1.5">
                            <p className="text-[13px] font-semibold text-banorte-dark">{baseFunction.name}</p>
                            <p className="text-[11px] text-banorte-gray">{baseFunction.id} &bull; {baseFunction.functionalities.length} funcionalidades</p>
                          </div>
                          {baseFunction.functionalities.length > 0 && (
                            <div className="ml-4 space-y-1.5">
                              {baseFunction.functionalities.map((functionality) => (
                                <div key={functionality.id} className="p-2 bg-gray-50/50 rounded border border-banorte-bg">
                                  <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-medium text-banorte-dark">{functionality.name}</span>
                                    {functionality.level && (
                                      <Chip label={`Nivel ${functionality.level}`} color="#4CAF50" textColor="white" size="sm" />
                                    )}
                                  </div>
                                  <p className="text-[11px] text-banorte-gray">
                                    ID: {functionality.id}
                                    {functionality.systemApplication && ` \u2022 ${functionality.systemApplication}`}
                                  </p>
                                  <p className="text-[11px] text-banorte-gray leading-snug">{functionality.description}</p>
                                  {functionality.commonComponentName && (
                                    <Chip label={functionality.commonComponentName} color="#9C27B0" textColor="white" size="sm" className="mt-1.5" />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <hr className="border-banorte-bg mb-6" />

          {/* Metadata */}
          <div className="mb-6">
            <h3 className="font-display text-sm font-semibold text-banorte-dark mb-3">Metadatos</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-banorte-gray">Ultima actualizacion:</span>
                <span className="text-xs font-medium text-banorte-dark">{capability.updatedAt.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-banorte-gray">Version BIAN:</span>
                <span className="text-xs font-medium text-banorte-dark">12.0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-banorte-gray">Estado:</span>
                <Chip label="Activo" color="#4CAF50" textColor="white" size="sm" />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 mt-auto">
            {onAddToProject && (
              <Button variant="primary" fullWidth onClick={() => onAddToProject(capability)}>
                <Plus size={16} className="mr-2" />
                Agregar a Mi Proyecto
              </Button>
            )}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <GitCompare size={14} className="mr-1.5" />
                Comparar
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Download size={14} className="mr-1.5" />
                Exportar
              </Button>
            </div>
            <button className="text-sm text-banorte-gray hover:text-banorte-dark flex items-center justify-center gap-1.5 py-2 transition-colors">
              <Share2 size={14} />
              Compartir con Equipo
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
