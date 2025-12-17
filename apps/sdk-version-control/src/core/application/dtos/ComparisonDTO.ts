import { PlatformType } from '../../domain/value-objects/PlatformType';
import { VersionStatus } from '../../domain/value-objects/VersionStatus';
import { ServiceDTO } from './ServiceDTO';

/**
 * Versión de un servicio en la matriz de comparación
 */
export interface ComparisonVersionDTO {
  serviceId: string;
  serviceName: string;
  currentVersion: string;
  latestVersion?: string;
  status: VersionStatus;
}

/**
 * Fila de la matriz de comparación (una por plataforma)
 */
export interface ComparisonRowDTO {
  platform: PlatformType;
  versions: ComparisonVersionDTO[];
  hasDiscrepancies: boolean;
}

/**
 * Insight generado de la comparación
 */
export interface ComparisonInsightDTO {
  type: 'info' | 'warning' | 'critical';
  message: string;
  affectedServices?: string[];
}

/**
 * DTO completo de comparación
 */
export interface ComparisonDTO {
  services: ServiceDTO[];
  platforms: PlatformType[];
  matrix: ComparisonRowDTO[];
  insights: ComparisonInsightDTO[];
  generatedAt: string;
}

/**
 * Genera insights basados en la comparación
 */
export function generateComparisonInsights(
  services: ServiceDTO[],
  matrix: ComparisonRowDTO[]
): ComparisonInsightDTO[] {
  const insights: ComparisonInsightDTO[] = [];

  // Contar servicios desactualizados
  const outdatedServices = services.filter(s =>
    s.overallStatus === 'outdated' || s.overallStatus === 'critical'
  );

  if (outdatedServices.length > 0) {
    insights.push({
      type: outdatedServices.some(s => s.overallStatus === 'critical') ? 'critical' : 'warning',
      message: `${outdatedServices.length} de ${services.length} servicios requieren actualización`,
      affectedServices: outdatedServices.map(s => s.name),
    });
  }

  // Detectar discrepancias entre plataformas
  matrix.forEach(row => {
    if (row.hasDiscrepancies) {
      const versions = row.versions
        .filter(v => v.currentVersion !== 'N/A')
        .map(v => v.currentVersion);

      const uniqueVersions = [...new Set(versions)];

      if (uniqueVersions.length > 1) {
        insights.push({
          type: 'warning',
          message: `Discrepancia de versiones en ${row.platform.toUpperCase()}: ${uniqueVersions.join(', ')}`,
          affectedServices: row.versions
            .filter(v => v.currentVersion !== 'N/A')
            .map(v => v.serviceName),
        });
      }
    }
  });

  // Servicios críticos
  const criticalServices = services.filter(s => s.overallStatus === 'critical');
  if (criticalServices.length > 0) {
    insights.push({
      type: 'critical',
      message: `¡Atención! ${criticalServices.map(s => s.name).join(', ')} requieren actualización urgente`,
      affectedServices: criticalServices.map(s => s.name),
    });
  }

  // Servicios al día
  const currentServices = services.filter(s => s.overallStatus === 'current');
  if (currentServices.length === services.length) {
    insights.push({
      type: 'info',
      message: 'Todos los servicios comparados están actualizados',
    });
  } else if (currentServices.length > 0) {
    insights.push({
      type: 'info',
      message: `${currentServices.length} servicios están al día: ${currentServices.map(s => s.name).join(', ')}`,
    });
  }

  return insights;
}

/**
 * Construye la matriz de comparación
 */
export function buildComparisonMatrix(
  services: ServiceDTO[],
  platforms: PlatformType[]
): ComparisonRowDTO[] {
  return platforms.map(platform => {
    const versions: ComparisonVersionDTO[] = services.map(service => {
      const platformVersion = service.versions[platform];

      return {
        serviceId: service.id,
        serviceName: service.name,
        currentVersion: platformVersion?.currentVersion ?? 'N/A',
        latestVersion: platformVersion?.latestVersion,
        status: platformVersion?.status ?? 'unknown',
      };
    });

    // Detectar discrepancias (diferentes versiones entre servicios que tienen la plataforma)
    const validVersions = versions
      .filter(v => v.currentVersion !== 'N/A')
      .map(v => v.currentVersion);

    const hasDiscrepancies = new Set(validVersions).size > 1;

    return {
      platform,
      versions,
      hasDiscrepancies,
    };
  });
}
