import { Service } from '../../entities/Service';
import { VersionCheckResult, VersionCheckSummary } from '../../entities/VersionCheckResult';
import { PlatformType } from '../../value-objects/PlatformType';
import { ScraperHealthStatus } from './IVersionScraperPort';

/**
 * Opciones para verificación de versiones
 */
export interface CheckOptions {
  /**
   * Plataformas específicas a verificar (si no se especifica, verifica todas)
   */
  platforms?: PlatformType[];

  /**
   * Forzar re-scraping aunque haya cache válido
   */
  forceRefresh?: boolean;

  /**
   * Timeout para cada verificación en ms
   */
  timeout?: number;
}

/**
 * Resultado de verificación para múltiples servicios
 */
export interface BatchCheckResult {
  results: Map<string, VersionCheckResult[]>;
  summary: VersionCheckSummary;
  scrapersHealth: Map<string, boolean>;
}

/**
 * Puerto para servicio de verificación de versiones
 *
 * Orquesta los scrapers individuales para verificar
 * actualizaciones de múltiples servicios.
 */
export interface IVersionCheckerPort {
  /**
   * Verifica actualizaciones para un servicio específico
   *
   * @param service Servicio a verificar
   * @param options Opciones de verificación
   * @returns Lista de resultados (uno por plataforma)
   */
  checkService(service: Service, options?: CheckOptions): Promise<VersionCheckResult[]>;

  /**
   * Verifica actualizaciones para múltiples servicios
   *
   * @param services Lista de servicios a verificar
   * @param options Opciones de verificación
   * @returns Mapa de resultados por ID de servicio
   */
  checkAllServices(
    services: Service[],
    options?: CheckOptions
  ): Promise<BatchCheckResult>;

  /**
   * Obtiene el estado de salud de todos los scrapers registrados
   *
   * @returns Mapa de ID de servicio a estado de salud
   */
  getScrapersHealth(): Promise<Map<string, ScraperHealthStatus>>;

  /**
   * Verifica si hay un scraper disponible para un servicio
   *
   * @param serviceId ID del servicio
   * @returns true si hay un scraper configurado
   */
  hasScraperFor(serviceId: string): boolean;

  /**
   * Obtiene la lista de IDs de servicios con scrapers configurados
   */
  getAvailableScraperIds(): string[];
}
