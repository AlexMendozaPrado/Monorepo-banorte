import {
  IVersionCheckerPort,
  CheckOptions,
  BatchCheckResult,
} from '@/core/domain/ports/external-services/IVersionCheckerPort';
import {
  IVersionScraperPort,
  ScraperHealthStatus,
} from '@/core/domain/ports/external-services/IVersionScraperPort';
import { Service } from '@/core/domain/entities/Service';
import {
  VersionCheckResult,
  createSuccessResult,
  createErrorResult,
  createCheckSummary,
} from '@/core/domain/entities/VersionCheckResult';
import { calculateVersionStatus } from '@/core/domain/value-objects/VersionStatus';
import { PlatformType } from '@/core/domain/value-objects/PlatformType';

/**
 * Servicio que orquesta la verificación de versiones usando scrapers
 */
export class WebScraperVersionChecker implements IVersionCheckerPort {
  private scrapers: Map<string, IVersionScraperPort>;

  constructor(scrapers: IVersionScraperPort[]) {
    this.scrapers = new Map(scrapers.map(s => [s.serviceId, s]));
    console.log(`[WebScraperVersionChecker] Initialized with ${scrapers.length} scrapers`);
  }

  /**
   * Verifica actualizaciones para un servicio específico
   */
  async checkService(
    service: Service,
    options?: CheckOptions
  ): Promise<VersionCheckResult[]> {
    const scraper = this.scrapers.get(service.id);

    if (!scraper) {
      console.warn(`[WebScraperVersionChecker] No scraper found for: ${service.id}`);
      return [];
    }

    const platforms = options?.platforms || service.getConfiguredPlatforms();
    const results: VersionCheckResult[] = [];

    for (const platform of platforms) {
      const currentVersion = service.versions[platform]?.currentVersion;

      if (!currentVersion) {
        continue;
      }

      try {
        const scraped = await scraper.scrapeLatestVersion(platform);

        results.push(
          createSuccessResult({
            serviceId: service.id,
            serviceName: service.name,
            platform,
            previousVersion: currentVersion,
            latestVersion: scraped.version,
            status: calculateVersionStatus(currentVersion, scraped.version),
            changelog: scraped.changelog,
            releaseNotesUrl: scraped.releaseNotesUrl,
            breakingChanges: scraped.breakingChanges,
          })
        );
      } catch (error) {
        console.error(
          `[WebScraperVersionChecker] Error checking ${service.name} ${platform}:`,
          error
        );

        results.push(
          createErrorResult({
            serviceId: service.id,
            serviceName: service.name,
            platform,
            previousVersion: currentVersion,
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        );
      }
    }

    return results;
  }

  /**
   * Verifica actualizaciones para múltiples servicios
   */
  async checkAllServices(
    services: Service[],
    options?: CheckOptions
  ): Promise<BatchCheckResult> {
    const results = new Map<string, VersionCheckResult[]>();
    const allResults: VersionCheckResult[] = [];

    // Ejecutar en paralelo con límite de concurrencia
    const CONCURRENCY = 3;

    for (let i = 0; i < services.length; i += CONCURRENCY) {
      const batch = services.slice(i, i + CONCURRENCY);

      const batchPromises = batch.map(async service => {
        const serviceResults = await this.checkService(service, options);
        return { serviceId: service.id, results: serviceResults };
      });

      const batchResults = await Promise.all(batchPromises);

      for (const { serviceId, results: serviceResults } of batchResults) {
        results.set(serviceId, serviceResults);
        allResults.push(...serviceResults);
      }
    }

    // Obtener estado de salud de scrapers
    const scrapersHealth = new Map<string, boolean>();
    for (const service of services) {
      const scraper = this.scrapers.get(service.id);
      scrapersHealth.set(service.id, scraper !== undefined);
    }

    return {
      results,
      summary: createCheckSummary(allResults),
      scrapersHealth,
    };
  }

  /**
   * Obtiene el estado de salud de todos los scrapers
   */
  async getScrapersHealth(): Promise<Map<string, ScraperHealthStatus>> {
    const health = new Map<string, ScraperHealthStatus>();

    const healthChecks = Array.from(this.scrapers.entries()).map(
      async ([id, scraper]) => {
        const status = await scraper.getHealthStatus();
        return { id, status };
      }
    );

    const results = await Promise.all(healthChecks);

    for (const { id, status } of results) {
      health.set(id, status);
    }

    return health;
  }

  /**
   * Verifica si hay un scraper disponible para un servicio
   */
  hasScraperFor(serviceId: string): boolean {
    return this.scrapers.has(serviceId);
  }

  /**
   * Obtiene la lista de IDs de servicios con scrapers configurados
   */
  getAvailableScraperIds(): string[] {
    return Array.from(this.scrapers.keys());
  }

  /**
   * Registra un nuevo scraper
   */
  registerScraper(scraper: IVersionScraperPort): void {
    this.scrapers.set(scraper.serviceId, scraper);
    console.log(`[WebScraperVersionChecker] Registered scraper for: ${scraper.serviceId}`);
  }

  /**
   * Elimina un scraper
   */
  unregisterScraper(serviceId: string): boolean {
    return this.scrapers.delete(serviceId);
  }
}
