'use client';

import React from 'react';
import { Eye, Plus } from 'lucide-react';
import { Button, cn, Card, CardHeader, CardContent, CardFooter } from '@banorte/ui';
import { Chip } from './ui/Chip';
import { Capability } from '../../core/domain/entities/Capability';
import { SubCapability } from '../../core/domain/entities/SubCapability';
import { BaseFunction } from '../../core/domain/entities/BaseFunction';
import { Functionality } from '../../core/domain/entities/Functionality';
import type { HierarchyLevel } from './SearchArea';

interface AdaptableCardProps {
  hierarchyLevel: HierarchyLevel;
  data: {
    item: Capability | SubCapability | BaseFunction | Functionality;
    parent?: Capability;
    subParent?: SubCapability;
    baseFunctionParent?: BaseFunction;
  };
  onViewDetails: (capability: Capability, context?: {
    level: HierarchyLevel;
    item: Capability | SubCapability | BaseFunction | Functionality;
    subParent?: SubCapability;
    baseFunctionParent?: BaseFunction;
  }) => void;
  onAddToProject?: (capability: Capability) => void;
}

const categoryColors: Record<string, string> = {
  'informacion': '#2196F3',
  'documentos': '#4CAF50',
  'gestion': '#9C27B0',
  'validacion': '#FF9800',
  'busqueda': '#4CAF50',
  'oferta': '#9C27B0',
  'contratacion': '#9C27B0',
  'default': '#5B6670',
};

const getCategoryColor = (category: string): string => {
  return categoryColors[category.toLowerCase()] ?? categoryColors['default'] ?? '#5B6670';
};

const determineCategory = (name: string, description?: string): string => {
  const nameText = name.toLowerCase();
  const descText = description?.toLowerCase() || '';

  if (nameText.includes('informacion') || nameText.includes('información') || descText.includes('informacion')) return 'informacion';
  if (nameText.includes('documento') || descText.includes('documento')) return 'documentos';
  if (nameText.includes('gestion') || nameText.includes('gestión') || descText.includes('gestion')) return 'gestion';
  if (nameText.includes('validacion') || nameText.includes('validación') || descText.includes('validacion')) return 'validacion';
  if (nameText.includes('busqueda') || nameText.includes('búsqueda') || descText.includes('busqueda')) return 'busqueda';
  if (nameText.includes('oferta') || descText.includes('oferta')) return 'oferta';
  if (nameText.includes('contratacion') || nameText.includes('contratación') || descText.includes('contratacion')) return 'contratacion';
  return 'default';
};

export function AdaptableCard({
  hierarchyLevel,
  data,
  onViewDetails,
  onAddToProject,
}: AdaptableCardProps) {
  const { item, parent, subParent, baseFunctionParent } = data;

  const renderCapabilityCard = (capability: Capability) => {
    const category = determineCategory(capability.name);
    const subCapabilityCount = capability.getTotalSubCapabilities();
    const functionalityCount = capability.getTotalFunctionalities();
    return {
      title: capability.name,
      id: capability.id.value,
      description: capability.subCapabilities.length > 0
        ? capability.subCapabilities[0]?.description || `Capacidad con ${subCapabilityCount} subcapacidades`
        : `Capacidad con ${subCapabilityCount} subcapacidades`,
      category,
      categoryColor: getCategoryColor(category),
      stats: `${functionalityCount} funcionalidades`,
      chips: capability.subCapabilities.slice(0, 2).map(sc => sc.name),
      extraCount: capability.subCapabilities.length > 2 ? capability.subCapabilities.length - 2 : 0,
      targetCapability: capability,
    };
  };

  const renderSubCapabilityCard = (subCapability: SubCapability) => {
    const category = determineCategory(subCapability.name, subCapability.description);
    const functionalityCount = subCapability.getTotalFunctionalities();
    return {
      title: subCapability.name,
      id: subCapability.id,
      description: subCapability.description || `Subcapacidad con ${subCapability.baseFunctions.length} funcionalidades base`,
      category,
      categoryColor: getCategoryColor(category),
      stats: `${functionalityCount} funcionalidades`,
      chips: subCapability.baseFunctions.slice(0, 3).map(bf => bf.name),
      extraCount: subCapability.baseFunctions.length > 3 ? subCapability.baseFunctions.length - 3 : 0,
      targetCapability: parent!,
    };
  };

  const renderBaseFunctionCard = (baseFunction: BaseFunction) => {
    const category = determineCategory(baseFunction.name, baseFunction.description);
    const functionalityCount = baseFunction.functionalities.length;
    return {
      title: baseFunction.name,
      id: baseFunction.id,
      description: baseFunction.description || `Funcionalidad base con ${functionalityCount} funcionalidades`,
      category,
      categoryColor: getCategoryColor(category),
      stats: `${functionalityCount} funcionalidades`,
      chips: baseFunction.functionalities.slice(0, 3).map(func => func.name),
      extraCount: baseFunction.functionalities.length > 3 ? baseFunction.functionalities.length - 3 : 0,
      targetCapability: parent!,
    };
  };

  const renderFunctionalityCard = (functionality: Functionality) => {
    const category = determineCategory(functionality.name, functionality.description);
    const levelText = functionality.level ? `Nivel ${functionality.level}` : '';
    const systemText = functionality.systemApplication || '';
    const ccText = functionality.commonComponentName || '';
    return {
      title: functionality.name,
      id: functionality.id,
      description: functionality.description || 'Funcionalidad del sistema',
      category,
      categoryColor: getCategoryColor(category),
      stats: [levelText, systemText].filter(Boolean).join(' | ') || 'Funcionalidad',
      chips: ccText ? [ccText] : [],
      extraCount: 0,
      targetCapability: parent!,
    };
  };

  let cardData;
  switch (hierarchyLevel) {
    case 'capability':
      cardData = renderCapabilityCard(item as Capability);
      break;
    case 'subcapability':
      cardData = renderSubCapabilityCard(item as SubCapability);
      break;
    case 'baseFunction':
      cardData = renderBaseFunctionCard(item as BaseFunction);
      break;
    case 'functionality':
      cardData = renderFunctionalityCard(item as Functionality);
      break;
    default:
      cardData = renderSubCapabilityCard(item as SubCapability);
  }

  const context = {
    level: hierarchyLevel,
    item,
    subParent,
    baseFunctionParent,
  };

  return (
    <Card
      noPadding
      hoverEffect
      onClick={() => onViewDetails(cardData.targetCapability, context)}
      className="h-full flex flex-col cursor-pointer border-gray-300"
    >
      {/* Header */}
      <CardHeader className="flex items-start justify-between p-5 pb-2 mb-0">
        <h3 className="font-display text-base font-semibold text-banorte-dark leading-tight flex-1 mr-2">
          {cardData.title}
        </h3>
        <Chip
          label={cardData.id}
          color="#F4F7F8"
          textColor="#5B6670"
          className="flex-shrink-0"
        />
      </CardHeader>

      {/* Content */}
      <CardContent className="flex-grow px-5 pb-2">
        <p className="text-sm text-banorte-gray mb-3 leading-snug line-clamp-3">
          {cardData.description}
        </p>

        <div className="flex items-center gap-2 mb-3">
          <Chip
            label={cardData.category.charAt(0).toUpperCase() + cardData.category.slice(1)}
            color={cardData.categoryColor}
            textColor="white"
            className="font-medium"
          />
          <span className="text-xs text-banorte-gray">{cardData.stats}</span>
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {cardData.chips.map((chipText, index) => (
            <Chip
              key={index}
              label={chipText}
              variant="outlined"
              className="text-banorte-gray"
            />
          ))}
          {cardData.extraCount > 0 && (
            <Chip
              label={`+${cardData.extraCount} mas`}
              variant="outlined"
              className="text-banorte-gray"
            />
          )}
        </div>
      </CardContent>

      {/* Actions */}
      <CardFooter className="flex gap-2 px-5 pb-5 pt-2 mt-0 border-t-0">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(cardData.targetCapability, context);
          }}
        >
          <Eye size={14} className="mr-1.5" />
          Ver mas
        </Button>

        {onAddToProject && (
          <Button
            variant="primary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onAddToProject(cardData.targetCapability);
            }}
          >
            <Plus size={14} className="mr-1.5" />
            Agregar
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
