import { Service, ServiceCategory, ServiceVersions } from '../../entities/Service';
import { PlatformType } from '../../value-objects/PlatformType';
import { VersionStatus } from '../../value-objects/VersionStatus';

/**
 * Filtros para búsqueda de servicios
 */
export interface ServiceFilters {
  category?: ServiceCategory;
  platform?: PlatformType;
  status?: VersionStatus;
  search?: string;
}

/**
 * Estadísticas de servicios
 */
export interface ServiceStatistics {
  total: number;
  current: number;
  warning: number;
  outdated: number;
  critical: number;
  byCategory: Record<ServiceCategory, number>;
  byPlatform: Record<PlatformType, number>;
}

/**
 * Puerto para repositorio de servicios
 */
export interface IServiceRepository {
  /**
   * Encuentra todos los servicios con filtros opcionales
   */
  findAll(filters?: ServiceFilters): Promise<Service[]>;

  /**
   * Encuentra un servicio por su ID
   */
  findById(id: string): Promise<Service | null>;

  /**
   * Encuentra un servicio por su nombre
   */
  findByName(name: string): Promise<Service | null>;

  /**
   * Guarda un nuevo servicio
   */
  save(service: Service): Promise<Service>;

  /**
   * Actualiza un servicio existente
   */
  update(id: string, data: Partial<{
    name: string;
    category: ServiceCategory;
    description: string;
    documentationUrl: string;
    logoUrl: string;
    versions: ServiceVersions;
    lastCheckedAt: Date;
  }>): Promise<Service>;

  /**
   * Elimina un servicio
   */
  delete(id: string): Promise<void>;

  /**
   * Encuentra servicios desactualizados
   */
  findOutdated(): Promise<Service[]>;

  /**
   * Encuentra servicios por categoría
   */
  findByCategory(category: ServiceCategory): Promise<Service[]>;

  /**
   * Obtiene estadísticas de todos los servicios
   */
  getStatistics(): Promise<ServiceStatistics>;

  /**
   * Verifica si existe un servicio con el ID dado
   */
  exists(id: string): Promise<boolean>;
}
