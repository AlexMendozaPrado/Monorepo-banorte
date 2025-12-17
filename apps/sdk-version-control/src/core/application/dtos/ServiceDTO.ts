import { Service, ServiceCategory } from '../../domain/entities/Service';
import { SDKVersion } from '../../domain/entities/SDKVersion';
import { PlatformType } from '../../domain/value-objects/PlatformType';
import { VersionStatus } from '../../domain/value-objects/VersionStatus';

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
