'use client';

import React from 'react';
import {
  RefreshCw,
  Info,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Layers,
} from 'lucide-react';
import { ServiceDTO } from '@/core/application/dtos/ServiceDTO';
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS } from '@/core/domain/value-objects/ProjectStatus';
import { ENTITY_TYPE_LABELS, ENTITY_TYPE_COLORS } from '@/core/domain/value-objects/EntityType';
import {
  ChannelVersion,
  ChannelStatus,
  CHANNEL_LABELS,
  CHANNEL_SHORT_LABELS,
  CHANNEL_STATUS_COLORS,
  CHANNEL_STATUS_LABELS,
} from '@/core/domain/value-objects/Channel';

interface ServiceCardProps {
  service: ServiceDTO;
  compareMode: boolean;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onEdit?: (service: ServiceDTO) => void;
  onDelete?: (service: ServiceDTO) => void;
}

/**
 * Componente compacto que agrupa canales por estado
 * Muestra badges con abreviación y versión, agrupados por Productivo/Piloto/Desarrollo
 */
function GroupedChannelsBadges({ channels }: { channels: ChannelVersion[] }) {
  if (!channels || channels.length === 0) {
    return (
      <div className="text-center py-4 text-sm text-banorte-gray">
        Sin canales configurados
      </div>
    );
  }

  // Agrupar canales por estado
  const grouped = channels.reduce((acc, channel) => {
    if (!acc[channel.status]) acc[channel.status] = [];
    acc[channel.status].push(channel);
    return acc;
  }, {} as Record<ChannelStatus, ChannelVersion[]>);

  const statusOrder: ChannelStatus[] = ['productivo', 'piloto', 'desarrollo'];

  return (
    <div className="space-y-2">
      {statusOrder.map((status) => {
        const statusChannels = grouped[status];
        if (!statusChannels || statusChannels.length === 0) return null;

        const statusColor = CHANNEL_STATUS_COLORS[status];
        const statusLabel = CHANNEL_STATUS_LABELS[status];

        return (
          <div key={status} className="flex items-start gap-2">
            {/* Indicador de estado con tooltip */}
            <div
              className="flex-shrink-0 w-2 h-2 rounded-full mt-1.5"
              style={{ backgroundColor: statusColor }}
              title={statusLabel}
            />

            {/* Badges de canales en este estado */}
            <div className="flex flex-wrap gap-1">
              {statusChannels.map((channel) => {
                const channelShort = CHANNEL_SHORT_LABELS[channel.channel];
                const channelLabel = CHANNEL_LABELS[channel.channel];

                return (
                  <span
                    key={channel.channel}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 hover:bg-gray-200 transition-colors cursor-default"
                    title={`${channelLabel} - ${statusLabel} - v${channel.version}`}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: statusColor }}
                    />
                    {channelShort}
                    <span className="text-banorte-gray font-normal">
                      {channel.version}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        );
      })}
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

        {/* Badges Strip - ProjectStatus, Entity, ASM, Channels Count */}
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
          {service.channelsCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
              <Layers size={10} />
              {service.channelsCount} canal{service.channelsCount !== 1 ? 'es' : ''}
            </span>
          )}
        </div>

        {/* Channels - Grouped by Status (Compact View) */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Layers size={14} className="text-banorte-gray" />
            <span className="text-xs font-semibold text-banorte-gray uppercase tracking-wide">
              Canales
            </span>
          </div>
          <GroupedChannelsBadges channels={service.channels} />
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
