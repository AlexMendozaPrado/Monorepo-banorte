import axios, { AxiosResponse } from 'axios';
import * as cheerio from 'cheerio';
import {
  IVersionScraperPort,
  ScrapedVersionInfo,
  ScraperHealthStatus,
} from '@/core/domain/ports/external-services/IVersionScraperPort';
import { SemanticVersion } from '@/core/domain/value-objects/SemanticVersion';
import { PlatformType } from '@/core/domain/value-objects/PlatformType';
import { ScrapingException } from '@/core/domain/exceptions/DomainException';
import { ScrapingConfig } from '../config/scraping.config';

/**
 * Cache entry para versiones scrapeadas
 */
interface CacheEntry {
  data: ScrapedVersionInfo;
  timestamp: number;
}

/**
 * Scraper base para obtener versiones de SDKs
 *
 * Implementa lógica común de scraping con cache, retry y rate limiting.
 */
export class BaseVersionScraper implements IVersionScraperPort {
  protected cache: Map<string, CacheEntry> = new Map();
  protected readonly cacheTTL: number = 3600000; // 1 hora en ms
  protected lastRequestTime: number = 0;

  constructor(protected readonly config: ScrapingConfig) {}

  get serviceId(): string {
    return this.config.serviceId;
  }

  get serviceName(): string {
    return this.config.name;
  }

  get supportedPlatforms(): PlatformType[] {
    return Object.keys(this.config.platforms) as PlatformType[];
  }

  /**
   * Obtiene la última versión disponible para una plataforma
   */
  async scrapeLatestVersion(platform: PlatformType): Promise<ScrapedVersionInfo> {
    // Verificar cache
    const cacheKey = `${this.serviceId}-${platform}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      console.log(`[${this.serviceName}] Cache hit for ${platform}`);
      return cached.data;
    }

    const platformConfig = this.config.platforms[platform];
    if (!platformConfig) {
      throw new ScrapingException(
        `Platform ${platform} not supported for ${this.serviceName}`,
        undefined,
        undefined
      );
    }

    try {
      // Rate limiting
      await this.respectRateLimit();

      console.log(`[${this.serviceName}] Scraping ${platform} from ${platformConfig.url}`);

      const response = await this.fetchWithRetry(platformConfig.url);
      const $ = cheerio.load(response.data);

      // Extraer versión usando selectores configurados
      const versionText = this.extractText($, platformConfig.selectors.version);

      if (!versionText) {
        throw new ScrapingException(
          `Could not find version element at ${platformConfig.url}`,
          platformConfig.url
        );
      }

      // Extraer número de versión usando patrón
      const pattern = platformConfig.versionPattern || /(\d+\.\d+\.\d+)/;
      const versionMatch = versionText.match(pattern);

      if (!versionMatch || !versionMatch[1]) {
        throw new ScrapingException(
          `Could not extract version from text: "${versionText.substring(0, 100)}"`,
          platformConfig.url
        );
      }

      const version = SemanticVersion.fromString(versionMatch[1]);

      // Extraer información adicional
      const releaseDate = platformConfig.selectors.releaseDate
        ? this.extractDate($, platformConfig.selectors.releaseDate)
        : undefined;

      const changelog = platformConfig.selectors.changelog
        ? this.extractText($, platformConfig.selectors.changelog)
        : undefined;

      const result: ScrapedVersionInfo = {
        version,
        releaseDate,
        changelog: changelog?.substring(0, 500), // Limitar longitud
        releaseNotesUrl: platformConfig.url,
      };

      // Actualizar cache
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      });

      console.log(`[${this.serviceName}] Found version ${version.toString()} for ${platform}`);

      return result;
    } catch (error) {
      if (error instanceof ScrapingException) {
        throw error;
      }

      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new ScrapingException(
        `Failed to scrape ${this.serviceName} ${platform}: ${message}`,
        platformConfig.url
      );
    }
  }

  /**
   * Verifica si el scraper puede acceder a la documentación
   */
  async healthCheck(): Promise<boolean> {
    try {
      const platform = this.supportedPlatforms[0];
      if (!platform) return false;

      const platformConfig = this.config.platforms[platform];
      if (!platformConfig) return false;

      const response = await axios.head(platformConfig.url, {
        timeout: 5000,
        headers: {
          'User-Agent': 'BanorteSDKVersionChecker/1.0',
        },
      });

      return response.status >= 200 && response.status < 400;
    } catch {
      return false;
    }
  }

  /**
   * Obtiene información detallada del estado del scraper
   */
  async getHealthStatus(): Promise<ScraperHealthStatus> {
    const startTime = Date.now();

    try {
      const isHealthy = await this.healthCheck();
      const responseTime = Date.now() - startTime;

      return {
        serviceId: this.serviceId,
        isHealthy,
        lastCheckedAt: new Date(),
        responseTimeMs: responseTime,
      };
    } catch (error) {
      return {
        serviceId: this.serviceId,
        isHealthy: false,
        lastCheckedAt: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Invalida el cache para una plataforma
   */
  invalidateCache(platform?: PlatformType): void {
    if (platform) {
      this.cache.delete(`${this.serviceId}-${platform}`);
    } else {
      // Invalidar todo el cache de este servicio
      for (const key of this.cache.keys()) {
        if (key.startsWith(this.serviceId)) {
          this.cache.delete(key);
        }
      }
    }
  }

  /**
   * Fetch con retry
   */
  protected async fetchWithRetry(url: string, attempt: number = 1): Promise<AxiosResponse> {
    try {
      return await axios.get(url, {
        timeout: this.config.timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BanorteSDKVersionChecker/1.0)',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
      });
    } catch (error) {
      if (attempt < this.config.retries) {
        const delay = this.config.rateLimit * attempt;
        console.log(`[${this.serviceName}] Retry ${attempt}/${this.config.retries} after ${delay}ms`);
        await this.sleep(delay);
        return this.fetchWithRetry(url, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Respeta el rate limit configurado
   */
  protected async respectRateLimit(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;

    if (elapsed < this.config.rateLimit) {
      await this.sleep(this.config.rateLimit - elapsed);
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Extrae texto de un selector
   */
  protected extractText($: cheerio.CheerioAPI, selector: string): string | undefined {
    const element = $(selector).first();
    const text = element.text().trim();
    return text || undefined;
  }

  /**
   * Extrae fecha de un selector
   */
  protected extractDate($: cheerio.CheerioAPI, selector: string): Date | undefined {
    const text = this.extractText($, selector);
    if (!text) return undefined;

    const date = new Date(text);
    return isNaN(date.getTime()) ? undefined : date;
  }

  /**
   * Sleep helper
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
