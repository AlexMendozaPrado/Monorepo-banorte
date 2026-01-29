'use client';

import React from 'react';
import { Eye, Plus } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@banorte/ui';
import { Chip } from './ui/Chip';
import { Capability } from '../../core/domain/entities/Capability';

interface CapabilityListProps {
  capabilities: Capability[];
  onViewDetails: (capability: Capability) => void;
  onAddToProject?: (capability: Capability) => void;
}

const categoryColors: Record<string, string> = {
  'informacion': '#2196F3',
  'documentos': '#4CAF50',
  'gestion': '#9C27B0',
  'validacion': '#FF9800',
  'busqueda': '#4CAF50',
  'default': '#5B6670',
};

const getCategoryColor = (category: string): string => {
  return categoryColors[category.toLowerCase()] ?? categoryColors['default'] ?? '#5B6670';
};

const determineCategory = (capability: Capability): string => {
  const name = capability.name.toLowerCase();
  const subCapDescriptions = capability.subCapabilities.map(sc => sc.description.toLowerCase()).join(' ');

  if (name.includes('informacion') || name.includes('información') || subCapDescriptions.includes('informacion')) return 'informacion';
  if (name.includes('documento') || subCapDescriptions.includes('documento')) return 'documentos';
  if (name.includes('gestion') || name.includes('gestión') || subCapDescriptions.includes('gestion')) return 'gestion';
  if (name.includes('validacion') || name.includes('validación') || subCapDescriptions.includes('validacion')) return 'validacion';
  if (name.includes('busqueda') || name.includes('búsqueda') || subCapDescriptions.includes('busqueda')) return 'busqueda';
  return 'default';
};

export function CapabilityList({
  capabilities,
  onViewDetails,
  onAddToProject,
}: CapabilityListProps) {
  return (
    <div className="border border-banorte-bg rounded-card overflow-hidden">
      <Table className="min-w-[650px]">
        <TableHeader>
          <TableRow hoverable={false}>
            <TableHead>ID</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead align="center"># Funcionalidades</TableHead>
            <TableHead align="center">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {capabilities.map((capability) => {
            const category = determineCategory(capability);
            const categoryColor = getCategoryColor(category);
            const functionalityCount = capability.getTotalFunctionalities();

            return (
              <TableRow
                key={capability.id.value}
                onClick={() => onViewDetails(capability)}
              >
                <TableCell>
                  <Chip
                    label={capability.id.value}
                    color="#F4F7F8"
                    textColor="#5B6670"
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-display font-semibold text-banorte-dark text-sm mb-0.5">
                      {capability.name}
                    </p>
                    <p className="text-xs text-banorte-gray line-clamp-2">
                      {capability.subCapabilities.length > 0
                        ? capability.subCapabilities[0]?.description
                        : `Capacidad con ${capability.getTotalSubCapabilities()} subcapacidades`}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Chip
                    label={category.charAt(0).toUpperCase() + category.slice(1)}
                    color={categoryColor}
                    textColor="white"
                    className="font-medium"
                  />
                </TableCell>
                <TableCell align="center">
                  <span className="font-display font-semibold text-banorte-dark text-sm">
                    {functionalityCount}
                  </span>
                </TableCell>
                <TableCell align="center">
                  <div className="flex justify-center gap-1">
                    <button
                      className="p-1.5 rounded-full text-banorte-red hover:bg-red-50 transition-colors"
                      title="Ver detalles"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(capability);
                      }}
                    >
                      <Eye size={18} />
                    </button>
                    {onAddToProject && (
                      <button
                        className="p-1.5 rounded-full text-green-600 hover:bg-green-50 transition-colors"
                        title="Agregar a proyecto"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToProject(capability);
                        }}
                      >
                        <Plus size={18} />
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
