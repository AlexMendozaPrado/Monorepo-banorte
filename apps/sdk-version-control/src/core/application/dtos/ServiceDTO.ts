import { Service, ServiceCategory } from '../../domain/entities/Service';
import { SDKVersion } from '../../domain/entities/SDKVersion';
import { PlatformType } from '../../domain/value-objects/PlatformType';
import { VersionStatus } from '../../domain/value-objects/VersionStatus';
import { ProjectStatus } from '../../domain/value-objects/ProjectStatus';
import { EntityType } from '../../domain/value-objects/EntityType';
import { ResponsiblePerson } from '../../domain/value-objects/ResponsiblePerson';
import { ChannelVersion } from '../../domain/value-objects/Channel';

/**
 * DTO para versión de plataforma
 */
export interface PlatformVersionDTO {
  platform: PlatformType;
  currentVersion: string;
  latestVersion?: string;
  status: VersionStatus;
  releaseDate?: string;
  changelog?: string;
  breakingChanges?: string[];
  lastCheckedAt?: string;
}

/**
 * DTO para servicio completo
 */
export interface ServiceDTO {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  documentationUrl: string;
  logoUrl?: string;
  versions: {
    web?: PlatformVersionDTO;
    ios?: PlatformVersionDTO;
    android?: PlatformVersionDTO;
  };
  overallStatus: VersionStatus;
  hasUpdates: boolean;
  platformsCount: number;
  lastCheckedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Canales de Banorte
  channels: ChannelVersion[];
  channelsCount: number;
  // Campos Banorte
  projectStatus: ProjectStatus;
  entity: EntityType;
  hasASM: boolean;
  implementationDate: string;
  dateConfirmed: boolean;
  formattedImplementationDate: string;
  responsibleBusiness: string;
  responsibleIT: string;
  responsibleERN: string;
  responsibles: ResponsiblePerson[];
}

/**
 * DTO resumido para listados
 */
export interface ServiceSummaryDTO {
  id: string;
  name: string;
  category: ServiceCategory;
  logoUrl?: string;
  overallStatus: VersionStatus;
  platformsCount: number;
  updatesCount: number;
  lastCheckedAt?: string;
}

/**
 * Convierte SDKVersion a DTO de plataforma
 */
function toPlatformVersionDTO(version: SDKVersion): PlatformVersionDTO {
  return {
    platform: version.platform,
    currentVersion: version.currentVersion.toString(),
    latestVersion: version.latestVersion?.toString(),
    status: version.status,
    releaseDate: version.releaseDate?.toISOString(),
    changelog: version.changelog,
    breakingChanges: version.breakingChanges,
    lastCheckedAt: version.lastCheckedAt?.toISOString(),
  };
}

/**
 * Convierte Service a ServiceDTO
 */
export function toServiceDTO(service: Service): ServiceDTO {
  return {
    id: service.id,
    name: service.name,
    category: service.category,
    description: service.description,
    documentationUrl: service.documentationUrl,
    logoUrl: service.logoUrl,
    versions: {
      web: service.versions.web ? toPlatformVersionDTO(service.versions.web) : undefined,
      ios: service.versions.ios ? toPlatformVersionDTO(service.versions.ios) : undefined,
      android: service.versions.android ? toPlatformVersionDTO(service.versions.android) : undefined,
    },
    overallStatus: service.getOverallStatus(),
    hasUpdates: service.hasUpdatesAvailable(),
    platformsCount: service.getPlatformsCount(),
    lastCheckedAt: service.lastCheckedAt?.toISOString(),
    createdAt: service.createdAt.toISOString(),
    updatedAt: service.updatedAt.toISOString(),
    // Canales de Banorte
    channels: service.getChannels(),
    channelsCount: service.getChannelsCount(),
    // Campos Banorte
    projectStatus: service.projectStatus,
    entity: service.entity,
    hasASM: service.hasASM,
    implementationDate: service.implementationDate,
    dateConfirmed: service.dateConfirmed,
    formattedImplementationDate: service.getFormattedImplementationDate(),
    responsibleBusiness: service.responsibleBusiness,
    responsibleIT: service.responsibleIT,
    responsibleERN: service.responsibleERN,
    responsibles: service.getResponsibles(),
  };
}

/**
 * Convierte Service a ServiceSummaryDTO
 */
export function toServiceSummaryDTO(service: Service): ServiceSummaryDTO {
  return {
    id: service.id,
    name: service.name,
    category: service.category,
    logoUrl: service.logoUrl,
    overallStatus: service.getOverallStatus(),
    platformsCount: service.getPlatformsCount(),
    updatesCount: service.getPlatformsWithUpdates().length,
    lastCheckedAt: service.lastCheckedAt?.toISOString(),
  };
}
