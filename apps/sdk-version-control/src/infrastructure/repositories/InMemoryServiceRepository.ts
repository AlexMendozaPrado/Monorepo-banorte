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
import { JSONConfigLoader } from '../services/JSONConfigLoader';
import { PlatformType, ALL_PLATFORMS } from '@/core/domain/value-objects/PlatformType';

/**
 * Implementación en memoria del repositorio de servicios
 *
 * Carga datos iniciales desde JSON y mantiene cambios en memoria.
 */
export class InMemoryServiceRepository implements IServiceRepository {
  private services: Map<string, Service> = new Map();
  private initialized = false;

  constructor() {
    this.initialize();
  }

  /**
   * Inicializa el repositorio cargando datos desde JSON
   */
  private initialize(): void {
    if (this.initialized) return;

    try {
      const loader = new JSONConfigLoader();
      const services = loader.loadServices();

      services.forEach(service => {
        this.services.set(service.id, service);
      });

      this.initialized = true;
      console.log(`[InMemoryServiceRepository] Loaded ${services.length} services from config`);
    } catch (error) {
      console.error('[InMemoryServiceRepository] Failed to load config:', error);
      this.initialized = true; // Mark as initialized even on error to prevent retry loops
    }
  }

  async findAll(filters?: ServiceFilters): Promise<Service[]> {
    let services = Array.from(this.services.values());

    if (filters?.category) {
      services = services.filter(s => s.category === filters.category);
    }

    if (filters?.platform) {
      services = services.filter(s => s.versions[filters.platform!] !== undefined);
    }

    if (filters?.status) {
      services = services.filter(s => s.getOverallStatus() === filters.status);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      services = services.filter(
        s =>
          s.name.toLowerCase().includes(searchLower) ||
          s.description.toLowerCase().includes(searchLower) ||
          s.category.toLowerCase().includes(searchLower)
      );
    }

    // Ordenar por nombre
    return services.sort((a, b) => a.name.localeCompare(b.name));
  }

  async findById(id: string): Promise<Service | null> {
    return this.services.get(id) || null;
  }

  async findByName(name: string): Promise<Service | null> {
    return (
      Array.from(this.services.values()).find(
        s => s.name.toLowerCase() === name.toLowerCase()
      ) || null
    );
  }

  async save(service: Service): Promise<Service> {
    this.services.set(service.id, service);
    return service;
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
    const existing = this.services.get(id);

    if (!existing) {
      throw new ServiceNotFoundException(id);
    }

    // Crear servicio actualizado usando reconstitute
    const updatedData = {
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
    };

    const updated = Service.reconstitute(updatedData);
    this.services.set(id, updated);

    return updated;
  }

  async delete(id: string): Promise<void> {
    if (!this.services.has(id)) {
      throw new ServiceNotFoundException(id);
    }
    this.services.delete(id);
  }

  async findOutdated(): Promise<Service[]> {
    return Array.from(this.services.values()).filter(s => {
      const status = s.getOverallStatus();
      return status === 'outdated' || status === 'critical';
    });
  }

  async findByCategory(category: ServiceCategory): Promise<Service[]> {
    return Array.from(this.services.values())
      .filter(s => s.category === category)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async getStatistics(): Promise<ServiceStatistics> {
    const services = Array.from(this.services.values());

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

    services.forEach(service => {
      // Por estado
      const status = service.getOverallStatus();
      if (status in byStatus) {
        byStatus[status as keyof typeof byStatus]++;
      }

      // Por categoría
      byCategory[service.category]++;

      // Por plataforma
      ALL_PLATFORMS.forEach(platform => {
        if (service.versions[platform]) {
          byPlatform[platform]++;
        }
      });
    });

    return {
      total: services.length,
      current: byStatus.current,
      warning: byStatus.warning,
      outdated: byStatus.outdated,
      critical: byStatus.critical,
      byCategory,
      byPlatform,
    };
  }

  async exists(id: string): Promise<boolean> {
    return this.services.has(id);
  }
}
