'use client';

import React, { useState, useMemo } from 'react';
import { cn, SearchInput } from '@banorte/ui';
import { TreeNavigation } from './TreeNavigation';
import { FunctionalitiesModal } from './FunctionalitiesModal';
import { CapabilityGroup } from '../../core/domain/entities/CapabilityGroup';
import { BaseFunction } from '../../core/domain/entities/BaseFunction';
import { Functionality } from '../../core/domain/entities/Functionality';

interface SidebarProps {
  capabilityGroups: CapabilityGroup[];
  onCapabilitySelect: (capabilityId: string) => void;
  onSubCapabilitySelect: (capabilityId: string, subCapabilityId: string) => void;
  onFunctionalitySelect: (capabilityId: string, subCapabilityId: string, functionalityId: string) => void;
  open: boolean;
  onClose: () => void;
  isMobile: boolean;
}

export function Sidebar({
  capabilityGroups,
  onCapabilitySelect,
  onSubCapabilitySelect,
  onFunctionalitySelect,
  open,
  onClose,
  isMobile,
}: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expanded, setExpanded] = useState<string[]>([]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBaseFunction, setSelectedBaseFunction] = useState<BaseFunction | null>(null);
  const [modalBreadcrumb, setModalBreadcrumb] = useState({
    groupName: '',
    capabilityName: '',
    subCapabilityName: '',
  });

  const handleOpenModal = (
    baseFunction: BaseFunction,
    groupName: string,
    capabilityName: string,
    subCapabilityName: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    setSelectedBaseFunction(baseFunction);
    setModalBreadcrumb({ groupName, capabilityName, subCapabilityName });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedBaseFunction(null);
  };

  const handleFunctionalitySelectFromModal = (functionality: Functionality) => {
    if (selectedBaseFunction) {
      for (const group of capabilityGroups) {
        for (const capability of group.capabilities) {
          for (const subCap of capability.subCapabilities) {
            if (subCap.baseFunctions.some(bf => bf.id === selectedBaseFunction.id)) {
              onFunctionalitySelect(capability.id.value, subCap.id, functionality.id);
              return;
            }
          }
        }
      }
    }
  };

  // Filter groups based on search
  const filteredCapabilityGroups = useMemo(() => {
    if (!capabilityGroups || capabilityGroups.length === 0) return [];
    if (!searchTerm) return capabilityGroups;

    return capabilityGroups.filter(group => {
      const searchLower = searchTerm.toLowerCase();
      const groupNameMatch = group.name.toLowerCase().includes(searchLower);
      const capabilityMatch = group.capabilities.some(capability => {
        const nameMatch = capability.name.toLowerCase().includes(searchLower);
        const subCapMatch = capability.subCapabilities.some(sc =>
          sc.name.toLowerCase().includes(searchLower) ||
          sc.description.toLowerCase().includes(searchLower) ||
          sc.baseFunctions.some(bf =>
            bf.name.toLowerCase().includes(searchLower) ||
            bf.functionalities.some(func =>
              func.name.toLowerCase().includes(searchLower)
            )
          )
        );
        return nameMatch || subCapMatch;
      });
      return groupNameMatch || capabilityMatch;
    });
  }, [capabilityGroups, searchTerm]);

  const handleSelect = (_: React.SyntheticEvent, nodeId: string) => {
    const parts = nodeId.split('-');

    if (parts.includes('group') && parts.length === 2) {
      return;
    } else if (parts.includes('cap') && !parts.includes('sub')) {
      const groupIndex = parseInt(parts[1] ?? '0');
      const capIndex = parseInt(parts[3] ?? '0');
      const group = capabilityGroups[groupIndex];
      const cap = group?.capabilities[capIndex];
      if (cap) {
        onCapabilitySelect(cap.id.value);
      }
    } else if (parts.includes('sub') && !parts.includes('base')) {
      const groupIndex = parseInt(parts[1] ?? '0');
      const capIndex = parseInt(parts[3] ?? '0');
      const subIndex = parseInt(parts[5] ?? '0');
      const group = capabilityGroups[groupIndex];
      const capability = group?.capabilities[capIndex];
      const subCapability = capability?.subCapabilities[subIndex];
      if (capability && subCapability) {
        onSubCapabilitySelect(capability.id.value, subCapability.id);
      }
    } else if (parts.includes('base') && !parts.includes('func')) {
      const groupIndex = parseInt(parts[1] ?? '0');
      const capIndex = parseInt(parts[3] ?? '0');
      const group = capabilityGroups[groupIndex];
      const cap = group?.capabilities[capIndex];
      if (cap) {
        onCapabilitySelect(cap.id.value);
      }
    } else if (parts.includes('func')) {
      const groupIndex = parseInt(parts[1] ?? '0');
      const capIndex = parseInt(parts[3] ?? '0');
      const subIndex = parseInt(parts[5] ?? '0');
      const baseIndex = parseInt(parts[7] ?? '0');
      const funcIndex = parseInt(parts[9] ?? '0');
      const group = capabilityGroups[groupIndex];
      const capability = group?.capabilities[capIndex];
      const subCapability = capability?.subCapabilities[subIndex];
      const baseFunc = subCapability?.baseFunctions[baseIndex];
      const functionality = baseFunc?.functionalities[funcIndex];
      if (capability && subCapability && functionality) {
        onFunctionalitySelect(capability.id.value, subCapability.id, functionality.id);
      }
    }
  };

  // Desktop: permanent sidebar
  // Mobile: overlay sidebar
  const sidebarContent = (
    <div className="p-3">
      {/* Search field */}
      <div className="mb-3">
        <SearchInput
          placeholder="Filtrar navegacion..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-[45px] text-sm"
        />
      </div>

      {/* Tree navigation (MUI x-tree-view) */}
      <TreeNavigation
        capabilityGroups={filteredCapabilityGroups}
        expanded={expanded}
        onExpandedChange={setExpanded}
        onSelect={handleSelect}
        onOpenModal={handleOpenModal}
      />
    </div>
  );

  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        {open && (
          <div className="fixed inset-0 z-[55] bg-black/30" onClick={onClose} />
        )}
        {/* Slide-in sidebar */}
        <aside
          className={cn(
            'fixed top-0 left-0 z-[56] w-[280px] h-screen bg-banorte-light border-r border-gray-300',
            'transition-transform duration-300 overflow-y-auto',
            open ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {sidebarContent}
        </aside>
        <FunctionalitiesModal
          open={modalOpen}
          onClose={handleCloseModal}
          baseFunction={selectedBaseFunction}
          breadcrumb={modalBreadcrumb}
          onFunctionalitySelect={handleFunctionalitySelectFromModal}
        />
      </>
    );
  }

  // Desktop: collapsible sidebar with transition
  return (
    <>
      <aside
        className={cn(
          'bg-banorte-light border-r border-gray-300 overflow-y-auto h-[calc(100vh-64px)] flex-shrink-0',
          'transition-all duration-300 ease-in-out',
          open ? 'w-[280px] opacity-100' : 'w-0 opacity-0 overflow-hidden border-r-0'
        )}
      >
        <div className="w-[280px]">
          {sidebarContent}
        </div>
      </aside>
      <FunctionalitiesModal
        open={modalOpen}
        onClose={handleCloseModal}
        baseFunction={selectedBaseFunction}
        breadcrumb={modalBreadcrumb}
        onFunctionalitySelect={handleFunctionalitySelectFromModal}
      />
    </>
  );
}
