import { SemanticVersion } from '../value-objects/SemanticVersion';
import { PlatformType } from '../value-objects/PlatformType';
import { VersionStatus } from '../value-objects/VersionStatus';

/**
 * Resultado de verificar actualizaciones para un servicio/plataforma
 */
export interface VersionCheckResult {
  serviceId: string;
  serviceName: string;
  platform: PlatformType;
  previousVersion: SemanticVersion;
  latestVersion: SemanticVersion;
  status: VersionStatus;
  checkedAt: Date;
  changelog?: string;
  releaseNotesUrl?: string;
  breakingChanges?: string[];
  securityAdvisories?: string[];
  error?: string;
}

/**
 * Crea un resultado de verificación exitoso
 */
export function createSuccessResult(data: {
  serviceId: string;
  serviceName: string;
  platform: PlatformType;
  previousVersion: SemanticVersion;
  latestVersion: SemanticVersion;
  status: VersionStatus;
  changelog?: string;
  releaseNotesUrl?: string;
  breakingChanges?: string[];
}): VersionCheckResult {
  return {
    ...data,
    checkedAt: new Date(),
  };
}

/**
 * Crea un resultado de verificación con error
 */
export function createErrorResult(data: {
  serviceId: string;
  serviceName: string;
  platform: PlatformType;
  previousVersion: SemanticVersion;
  error: string;
}): VersionCheckResult {
  return {
    serviceId: data.serviceId,
    serviceName: data.serviceName,
    platform: data.platform,
    previousVersion: data.previousVersion,
    latestVersion: data.previousVersion, // Mantiene la misma si hay error
    status: 'unknown',
    checkedAt: new Date(),
    error: data.error,
  };
}

/**
 * Resumen de verificación de múltiples servicios
 */
export interface VersionCheckSummary {
  totalChecked: number;
  servicesChecked: number;
  updatesFound: number;
  criticalUpdates: number;
  errors: number;
  checkedAt: Date;
}

/**
 * Crea un resumen de verificación
 */
export function createCheckSummary(results: VersionCheckResult[]): VersionCheckSummary {
  const serviceIds = new Set(results.map(r => r.serviceId));

  return {
    totalChecked: results.length,
    servicesChecked: serviceIds.size,
    updatesFound: results.filter(r =>
      r.status === 'warning' || r.status === 'outdated'
    ).length,
    criticalUpdates: results.filter(r => r.status === 'critical').length,
    errors: results.filter(r => r.error !== undefined).length,
    checkedAt: new Date(),
  };
}
