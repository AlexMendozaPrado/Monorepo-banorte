import { SemanticVersion } from '../../value-objects/SemanticVersion';
import { PlatformType } from '../../value-objects/PlatformType';

/**
 * Información extraída del scraping de versiones
 */
export interface ScrapedVersionInfo {
  version: SemanticVersion;
  releaseDate?: Date;
  changelog?: string;
  releaseNotesUrl?: string;
  breakingChanges?: string[];
  securityAdvisories?: string[];
}

/**
 * Estado de salud de un scraper
 */
export interface ScraperHealthStatus {
  serviceId: string;
  isHealthy: boolean;
  lastCheckedAt: Date;
  error?: string;
  responseTimeMs?: number;
}

/**
 * Puerto para scrapers de versiones
 *
 * Cada implementación de este puerto maneja el scraping
 * de un SDK/servicio específico.
 */
export interface IVersionScraperPort {
  /**
   * Identificador único del servicio que este scraper maneja
   */
  readonly serviceId: string;

  /**
   * Nombre del servicio para logging y display
   */
  readonly serviceName: string;

  /**
   * Plataformas soportadas por este scraper
   */
  readonly supportedPlatforms: PlatformType[];

  /**
   * Obtiene la última versión disponible para una plataforma
   *
   * @param platform Plataforma a consultar
   * @returns Información de la versión scrapeada
   * @throws ScrapingException si hay error al obtener la versión
   */
  scrapeLatestVersion(platform: PlatformType): Promise<ScrapedVersionInfo>;

  /**
   * Verifica si el scraper puede acceder a la documentación del servicio
   *
   * @returns true si el scraper está funcionando correctamente
   */
  healthCheck(): Promise<boolean>;

  /**
   * Obtiene información detallada del estado del scraper
   */
  getHealthStatus(): Promise<ScraperHealthStatus>;
}
