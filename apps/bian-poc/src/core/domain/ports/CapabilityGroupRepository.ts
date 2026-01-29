import { CapabilityGroup } from '../entities/CapabilityGroup';
import { StyleType } from '../value-objects/StyleType';

/**
 * Port para acceso a datos de grupos de capacidades
 */
export interface CapabilityGroupRepository {
  /**
   * Obtiene todos los grupos de capacidades
   */
  findAll(): Promise<CapabilityGroup[]>;

  /**
   * Busca un grupo por ID
   */
  findById(id: string): Promise<CapabilityGroup | null>;

  /**
   * Busca grupos por estilo
   */
  findByStyle(style: StyleType): Promise<CapabilityGroup[]>;

  /**
   * Busca grupos activos
   */
  findActive(): Promise<CapabilityGroup[]>;

  /**
   * Busca grupos por nombre
   */
  findByName(name: string): Promise<CapabilityGroup[]>;

  /**
   * Búsqueda textual en grupos
   */
  search(query: string): Promise<CapabilityGroup[]>;

  /**
   * Guarda un grupo
   */
  save(group: CapabilityGroup): Promise<void>;

  /**
   * Elimina un grupo
   */
  delete(id: string): Promise<void>;

  /**
   * Verifica si existe un grupo
   */
  exists(id: string): Promise<boolean>;

  /**
   * Obtiene el conteo total de grupos
   */
  count(): Promise<number>;
}

/**
 * Filtros para búsqueda avanzada de grupos de capacidades
 */
export interface CapabilityGroupFilters {
  styles?: StyleType[];
  isActive?: boolean;
  searchTerm?: string;
  hasCapabilities?: boolean;
  minCapabilities?: number;
  maxCapabilities?: number;
  createdAfter?: Date;
  createdBefore?: Date;
}

/**
 * Resultado paginado
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}