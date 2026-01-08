'use client';

import React from 'react';
import {
  Globe,
  Smartphone,
  TabletSmartphone,
  ExternalLink,
  RefreshCw,
  Info,
  Plus,
  Pencil,
  Trash2,
  Calendar,
} from 'lucide-react';
import { ServiceDTO, PlatformVersionDTO } from '@/core/application/dtos/ServiceDTO';
import { PlatformType } from '@/core/domain/value-objects/PlatformType';
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS } from '@/core/domain/value-objects/ProjectStatus';
import { ENTITY_TYPE_LABELS, ENTITY_TYPE_COLORS } from '@/core/domain/value-objects/EntityType';
import { StatusBadge } from './StatusBadge';

interface ServiceCardProps {
  service: ServiceDTO;
  compareMode: boolean;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onEdit?: (service: ServiceDTO) => void;
  onDelete?: (service: ServiceDTO) => void;
}

const platformIcons = {
  web: Globe,
  ios: Smartphone,
  android: TabletSmartphone,
};

function PlatformCell({
  type,
  data,
}: {
  type: PlatformType;
  data: PlatformVersionDTO | undefined;
}) {
  const Icon = platformIcons[type];

  if (!data) {
    return (
      <div className="flex flex-col p-2 rounded bg-gray-50/50 opacity-50">
        <div className="flex items-center gap-1.5 mb-1 text-gray-400">
          <Icon size={14} />
          <span className="text-xs font-medium uppercase">{type}</span>
        </div>
        <span className="text-xs text-gray-400">N/A</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-2 rounded bg-gray-50/50">
      <div className="flex items-center gap-1.5 mb-1 text-banorte-gray">
        <Icon size={14} />
        <span className="text-xs font-medium uppercase">{type}</span>
      </div>
      <div className="flex items-center gap-2 mb-0.5">
        <span className="font-bold text-banorte-dark text-sm">
          {data.currentVersion}
        </span>
        <StatusBadge status={data.status} size="sm" />
      </div>
      {data.latestVersion && data.currentVersion !== data.latestVersion && (
        <span className="text-[10px] text-banorte-gray">
          Latest: {data.latestVersion}
        </span>
      )}
    </div>
  );
}

export function ServiceCard({
  service,
  compareMode,
  isSelected,
  onToggleSelect,
  onEdit,
  onDelete,
}: ServiceCardProps) {
  return (
    <div
      className={`
        relative bg-white rounded-lg transition-all duration-200
        ${
          isSelected
            ? 'ring-2 ring-banorte-red bg-red-50/30 shadow-md'
            : 'shadow-card hover:shadow-hover hover:-translate-y-0.5 border border-transparent'
        }
      `}
    >
      {/* Checkbox for Compare Mode */}
      {compareMode && (
        <div
          className="absolute top-4 left-4 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(service.id)}
            className="w-5 h-5 rounded border-gray-300 text-banorte-red focus:ring-banorte-red cursor-pointer"
          />
        </div>
      )}

      <div className={`p-5 ${compareMode ? 'pl-12' : ''}`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-lg flex-shrink-0">
              {service.logoUrl ? (
                <img
                  src={service.logoUrl}
                  alt={service.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                service.name.charAt(0)
              )}
            </div>
            <div>
              <h3 className="font-bold text-banorte-dark text-lg leading-tight">
                {service.name}
              </h3>
              <span className="inline-block px-2 py-0.5 mt-1 text-xs font-medium bg-gray-100 text-banorte-gray rounded-full">
                {service.category}
              </span>
            </div>
          </div>
        </div>

        {/* Badges Strip - ProjectStatus, Entity, ASM */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span
            className="inline-flex items-center px-2 py-0.5 text-xs font-bold rounded-full text-white"
            style={{ backgroundColor: PROJECT_STATUS_COLORS[service.projectStatus] }}
          >
            {PROJECT_STATUS_LABELS[service.projectStatus]}
          </span>
          <span
            className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full text-white"
            style={{ backgroundColor: ENTITY_TYPE_COLORS[service.entity] }}
          >
            {ENTITY_TYPE_LABELS[service.entity]}
          </span>
          <span
            className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
              service.hasASM
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            ASM: {service.hasASM ? 'Si' : 'No'}
          </span>
        </div>

        {/* Platform Grid */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <PlatformCell type="web" data={service.versions.web} />
          <PlatformCell type="ios" data={service.versions.ios} />
          <PlatformCell type="android" data={service.versions.android} />
        </div>

        {/* Footer with avatars, date, and actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          {/* Left: Overlapping avatar circles + date */}
          <div className="flex items-center gap-3">
            {/* Avatars */}
            {service.responsibles && service.responsibles.length > 0 && (
              <div className="flex -space-x-2">
                {service.responsibles.slice(0, 3).map((person, idx) => {
                  const colors = ['bg-[#EC0029]', 'bg-[#3B82F6]', 'bg-[#6B7280]'];
                  const initials = person.name
                    .split(' ')
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase();
                  return (
                    <div
                      key={idx}
                      className={`w-7 h-7 rounded-full ${colors[idx]} text-white text-xs font-bold flex items-center justify-center border-2 border-white`}
                      title={`${person.role.toUpperCase()}: ${person.name}`}
                    >
                      {initials || '?'}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Implementation date */}
            <div className="flex items-center gap-1 text-xs text-banorte-gray">
              <Calendar size={12} />
              <span className="font-medium">
                {service.formattedImplementationDate || 'Por confirmar'}
              </span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <a
              href={service.documentationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-banorte-red hover:text-banorte-red-hover hover:underline"
            >
              Ver docs
            </a>
            <div className="flex gap-1">
              <button
                className="p-1.5 text-gray-400 hover:text-banorte-red hover:bg-red-50 rounded transition-colors"
                title="Verificar actualizaciones"
              >
                <RefreshCw size={14} />
              </button>
              <button
                className="p-1.5 text-gray-400 hover:text-banorte-dark hover:bg-gray-100 rounded transition-colors"
                title="Ver detalles"
              >
                <Info size={14} />
              </button>
              {onEdit && (
                <button
                  onClick={() => onEdit(service)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Editar servicio"
                >
                  <Pencil size={14} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(service)}
                  className="p-1.5 text-gray-400 hover:text-banorte-red hover:bg-red-50 rounded transition-colors"
                  title="Eliminar servicio"
                >
                  <Trash2 size={14} />
                </button>
              )}
              {!compareMode && (
                <button
                  onClick={() => onToggleSelect(service.id)}
                  className="p-1.5 text-gray-400 hover:text-banorte-red hover:bg-red-50 rounded transition-colors"
                  title="Añadir a comparar"
                >
                  <Plus size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
