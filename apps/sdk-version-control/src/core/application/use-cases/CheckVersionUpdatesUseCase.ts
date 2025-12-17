import { IServiceRepository } from '../../domain/ports/repositories/IServiceRepository';
import { IVersionCheckerPort, CheckOptions } from '../../domain/ports/external-services/IVersionCheckerPort';
import { VersionCheckResult, createCheckSummary, VersionCheckSummary } from '../../domain/entities/VersionCheckResult';
import { ResponseDTO, ResponseDTOBuilder } from '../dtos/ResponseDTO';
import { PlatformType } from '../../domain/value-objects/PlatformType';
import { VersionStatus } from '../../domain/value-objects/VersionStatus';

/**
 * Input para verificar actualizaciones
 */
export interface CheckVersionUpdatesInput {
  /**
   * IDs de servicios a verificar (vacío = todos)
   */
  serviceIds?: string[];

  /**
   * Opciones de verificación
   */
  options?: CheckOptions;
}

/**
 * DTO para resultado de verificación
 */
export interface VersionCheckResultDTO {
  serviceId: string;
  serviceName: string;
  platform: PlatformType;
  previousVersion: string;
  latestVersion: string;
  status: VersionStatus;
  checkedAt: string;
  changelog?: string;
  releaseNotesUrl?: string;
  breakingChanges?: string[];
  error?: string;
}

/**
 * Output de verificación
 */
export interface CheckVersionUpdatesOutput {
  results: VersionCheckResultDTO[];
  summary: VersionCheckSummary;
  scrapersHealth: Record<string, boolean>;
}

/**
 * Convierte VersionCheckResult a DTO
 */
function toVersionCheckResultDTO(result: VersionCheckResult): VersionCheckResultDTO {
  return {
    serviceId: result.serviceId,
    serviceName: result.serviceName,
    platform: result.platform,
    previousVersion: result.previousVersion.toString(),
    latestVersion: result.latestVersion.toString(),
    status: result.status,
    checkedAt: result.checkedAt.toISOString(),
    changelog: result.changelog,
    releaseNotesUrl: result.releaseNotesUrl,
    breakingChanges: result.breakingChanges,
    error: result.error,
  };
}

/**
 * Caso de uso: Verificar actualizaciones de versiones
 *
 * Ejecuta web scraping para obtener las últimas versiones disponibles
 * y actualiza el estado de los servicios.
 */
export class CheckVersionUpdatesUseCase {
  constructor(
    private readonly serviceRepository: IServiceRepository,
    private readonly versionChecker: IVersionCheckerPort
  ) {}

  async execute(input: CheckVersionUpdatesInput = {}): Promise<ResponseDTO<CheckVersionUpdatesOutput>> {
    try {
      // Obtener servicios a verificar
      let services = await this.serviceRepository.findAll();

      if (input.serviceIds && input.serviceIds.length > 0) {
        services = services.filter(s => input.serviceIds!.includes(s.id));
      }

      if (services.length === 0) {
        return ResponseDTOBuilder.success({
          results: [],
          summary: {
            totalChecked: 0,
            servicesChecked: 0,
            updatesFound: 0,
            criticalUpdates: 0,
            errors: 0,
            checkedAt: new Date(),
          },
          scrapersHealth: {},
        });
      }

      // Ejecutar verificación
      const batchResult = await this.versionChecker.checkAllServices(
        services,
        input.options
      );

      // Recopilar todos los resultados
      const allResults: VersionCheckResult[] = [];
      for (const results of batchResult.results.values()) {
        allResults.push(...results);
      }

      // Actualizar servicios con los nuevos datos
      for (const [serviceId, checkResults] of batchResult.results) {
        const service = services.find(s => s.id === serviceId);
        if (!service) continue;

        const updatedVersions = { ...service.versions };

        for (const result of checkResults) {
          const currentVersion = updatedVersions[result.platform];
          if (currentVersion && !result.error) {
            updatedVersions[result.platform] = currentVersion.withLatestVersion(
              result.latestVersion,
              result.changelog,
              result.breakingChanges
            );
          }
        }

        await this.serviceRepository.update(serviceId, {
          versions: updatedVersions,
          lastCheckedAt: new Date(),
        });
      }

      // Convertir scrapers health a objeto plano
      const scrapersHealthObj: Record<string, boolean> = {};
      for (const [id, status] of batchResult.scrapersHealth) {
        scrapersHealthObj[id] = status;
      }

      return ResponseDTOBuilder.success({
        results: allResults.map(toVersionCheckResultDTO),
        summary: batchResult.summary,
        scrapersHealth: scrapersHealthObj,
      });
    } catch (error) {
      console.error('[CheckVersionUpdatesUseCase] Error:', error);
      return ResponseDTOBuilder.fromException(
        error instanceof Error ? error : new Error('Version check failed'),
        'CHECK_ERROR'
      );
    }
  }
}
