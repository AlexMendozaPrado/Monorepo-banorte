import {
  Service,
  ServiceCategory,
  ServiceVersions,
} from '@/core/domain/entities/Service';
import {
  IServiceRepository,
  ServiceFilters,
  ServiceStatistics,
} from '@/core/domain/ports/repositories/IServiceRepository';
import { ServiceNotFoundException } from '@/core/domain/exceptions/DomainException';
import { GitHubApiClient } from '../services/GitHubApiClient';
import { PlatformType, ALL_PLATFORMS } from '@/core/domain/value-objects/PlatformType';
import { SDKVersion } from '@/core/domain/entities/SDKVersion';
import { v4 as uuidv4 } from 'uuid';

interface ServiceConfigJSON {
  $schema?: string;
  version: string;
  lastUpdated: string;
  services: ServiceJSON[];
}

interface ServiceJSON {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  documentationUrl: string;
  logoUrl?: string;
  versions: {
    web?: { currentVersion: string; status?: string };
    ios?: { currentVersion: string; status?: string };
    android?: { currentVersion: string; status?: string };
  };
}

/**
 * Implementación del repositorio de servicios usando GitHub como backend
 *
 * Lee y escribe el archivo services.config.json directamente en GitHub.
 * Cada operación de escritura genera un commit automático.
 */
export class GitHubServiceRepository implements IServiceRepository {
  private readonly githubClient: GitHubApiClient;
  private readonly configPath: string;

  // Cache local para reducir llamadas a GitHub en lecturas
  private cache: {
    services: Map<string, Service>;
    sha: string;
    timestamp: number;
  } | null = null;

  // TTL del cache en milisegundos (30 segundos)
  private readonly cacheTTL = 30000;

  constructor(
    githubClient: GitHubApiClient,
    configPath: string = 'apps/sdk-version-control/src/infrastructure/config/services.config.json'
  ) {
    this.githubClient = githubClient;
    this.configPath = configPath;
  }

  /**
   * Carga los servicios desde GitHub (con cache)
   */
  private async loadServices(forceRefresh = false): Promise<{ services: Map<string, Service>; sha: string }> {
    const now = Date.now();

    // Usar cache si es válido
    if (!forceRefresh && this.cache && (now - this.cache.timestamp) < this.cacheTTL) {
      return { services: this.cache.services, sha: this.cache.sha };
    }

    try {
      const { content, sha } = await this.githubClient.getFileContent(this.configPath);
      const config: ServiceConfigJSON = JSON.parse(content);

      const services = new Map<string, Service>();

      for (const serviceData of config.services) {
        const service = this.jsonToService(serviceData);
        services.set(service.id, service);
      }

      // Actualizar cache
      this.cache = { services, sha, timestamp: now };

      console.log(`[GitHubServiceRepository] Loaded ${services.size} services from GitHub`);

      return { services, sha };
    } catch (error) {
      console.error('[GitHubServiceRepository] Failed to load from GitHub:', error);
      throw error;
    }
  }

  /**
   * Guarda los servicios en GitHub
   */
  private async saveServices(
    services: Map<string, Service>,
    sha: string,
    commitMessage: string
  ): Promise<void> {
    const config: ServiceConfigJSON = {
      $schema: './services.schema.json',
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      services: Array.from(services.values())
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(service => this.serviceToJson(service)),
    };

    const content = JSON.stringify(config, null, 2) + '\n';

    await this.githubClient.updateFile(this.configPath, content, commitMessage, sha);

    // Invalidar cache para forzar recarga
    this.cache = null;

    console.log(`[GitHubServiceRepository] Saved to GitHub: ${commitMessage}`);
  }

  /**
   * Convierte JSON a entidad Service
   */
  private jsonToService(data: ServiceJSON): Service {
    const versions: ServiceVersions = {};

    if (data.versions.web) {
      versions.web = SDKVersion.create({
        platform: 'web',
        currentVersion: data.versions.web.currentVersion,
      });
    }
    if (data.versions.ios) {
      versions.ios = SDKVersion.create({
        platform: 'ios',
        currentVersion: data.versions.ios.currentVersion,
      });
    }
    if (data.versions.android) {
      versions.android = SDKVersion.create({
        platform: 'android',
        currentVersion: data.versions.android.currentVersion,
      });
    }

    return Service.reconstitute({
      id: data.id,
      name: data.name,
      category: data.category,
      description: data.description,
      documentationUrl: data.documentationUrl,
      logoUrl: data.logoUrl,
      versions,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Convierte entidad Service a JSON
   */
  private serviceToJson(service: Service): ServiceJSON {
    const versions: ServiceJSON['versions'] = {};

    if (service.versions.web) {
      versions.web = {
        currentVersion: service.versions.web.currentVersion.toString(),
        status: service.versions.web.status,
      };
    }
    if (service.versions.ios) {
      versions.ios = {
        currentVersion: service.versions.ios.currentVersion.toString(),
        status: service.versions.ios.status,
      };
    }
    if (service.versions.android) {
      versions.android = {
        currentVersion: service.versions.android.currentVersion.toString(),
        status: service.versions.android.status,
      };
    }

    return {
      id: service.id,
      name: service.name,
      category: service.category,
      description: service.description,
      documentationUrl: service.documentationUrl,
      logoUrl: service.logoUrl,
      versions,
    };
  }

  // ============ IServiceRepository Implementation ============

  async findAll(filters?: ServiceFilters): Promise<Service[]> {
    const { services } = await this.loadServices();
    let result = Array.from(services.values());

    if (filters?.category) {
      result = result.filter(s => s.category === filters.category);
    }

    if (filters?.platform) {
      result = result.filter(s => s.versions[filters.platform!] !== undefined);
    }

    if (filters?.status) {
      result = result.filter(s => s.getOverallStatus() === filters.status);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        s =>
          s.name.toLowerCase().includes(searchLower) ||
          s.description.toLowerCase().includes(searchLower) ||
          s.category.toLowerCase().includes(searchLower)
      );
    }

    return result.sort((a, b) => a.name.localeCompare(b.name));
  }

  async findById(id: string): Promise<Service | null> {
    const { services } = await this.loadServices();
    return services.get(id) || null;
  }

  async findByName(name: string): Promise<Service | null> {
    const { services } = await this.loadServices();
    return (
      Array.from(services.values()).find(
        s => s.name.toLowerCase() === name.toLowerCase()
      ) || null
    );
  }

  async save(service: Service): Promise<Service> {
    const { services, sha } = await this.loadServices(true); // Force refresh para tener SHA actualizado

    // Asignar ID si no tiene
    const serviceToSave = service.id ? service : Service.create({
      ...service,
      id: uuidv4(),
    } as any);

    services.set(serviceToSave.id, serviceToSave);

    await this.saveServices(
      services,
      sha,
      `feat(services): add ${serviceToSave.name}`
    );

    return serviceToSave;
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      category: ServiceCategory;
      description: string;
      documentationUrl: string;
      logoUrl: string;
      versions: ServiceVersions;
      lastCheckedAt: Date;
    }>
  ): Promise<Service> {
    const { services, sha } = await this.loadServices(true);

    const existing = services.get(id);
    if (!existing) {
      throw new ServiceNotFoundException(id);
    }

    const updated = Service.reconstitute({
      id: existing.id,
      name: data.name ?? existing.name,
      category: data.category ?? existing.category,
      description: data.description ?? existing.description,
      documentationUrl: data.documentationUrl ?? existing.documentationUrl,
      logoUrl: data.logoUrl ?? existing.logoUrl,
      versions: data.versions ?? existing.versions,
      lastCheckedAt: data.lastCheckedAt ?? existing.lastCheckedAt,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    });

    services.set(id, updated);

    await this.saveServices(
      services,
      sha,
      `chore(services): update ${updated.name}`
    );

    return updated;
  }

  async delete(id: string): Promise<void> {
    const { services, sha } = await this.loadServices(true);

    const existing = services.get(id);
    if (!existing) {
      throw new ServiceNotFoundException(id);
    }

    const serviceName = existing.name;
    services.delete(id);

    await this.saveServices(
      services,
      sha,
      `chore(services): remove ${serviceName}`
    );
  }

  async findOutdated(): Promise<Service[]> {
    const { services } = await this.loadServices();
    return Array.from(services.values()).filter(s => {
      const status = s.getOverallStatus();
      return status === 'outdated' || status === 'critical';
    });
  }

  async findByCategory(category: ServiceCategory): Promise<Service[]> {
    const { services } = await this.loadServices();
    return Array.from(services.values())
      .filter(s => s.category === category)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async getStatistics(): Promise<ServiceStatistics> {
    const { services } = await this.loadServices();
    const serviceList = Array.from(services.values());

    const byStatus = {
      current: 0,
      warning: 0,
      outdated: 0,
      critical: 0,
    };

    const byCategory: Record<ServiceCategory, number> = {
      Identity: 0,
      Analytics: 0,
      Attribution: 0,
      Monitoring: 0,
      Payments: 0,
      Engagement: 0,
      CMS: 0,
      Other: 0,
    };

    const byPlatform: Record<PlatformType, number> = {
      web: 0,
      ios: 0,
      android: 0,
    };

    serviceList.forEach(service => {
      const status = service.getOverallStatus();
      if (status in byStatus) {
        byStatus[status as keyof typeof byStatus]++;
      }

      byCategory[service.category]++;

      ALL_PLATFORMS.forEach(platform => {
        if (service.versions[platform]) {
          byPlatform[platform]++;
        }
      });
    });

    return {
      total: serviceList.length,
      current: byStatus.current,
      warning: byStatus.warning,
      outdated: byStatus.outdated,
      critical: byStatus.critical,
      byCategory,
      byPlatform,
    };
  }

  async exists(id: string): Promise<boolean> {
    const { services } = await this.loadServices();
    return services.has(id);
  }
}
