import { CapabilityRepository, CapabilityFilters, PaginatedResult } from '../../core/domain/ports/CapabilityRepository';
import { Capability } from '../../core/domain/entities/Capability';
import { CapabilityId } from '../../core/domain/value-objects/CapabilityId';
import { StyleType } from '../../core/domain/value-objects/StyleType';
import { JsonCapabilityGroupRepository } from './JsonCapabilityGroupRepository';

/**
 * Implementacion del repositorio de capacidades usando datos JSON v2.0
 * Extrae las capacidades desde los grupos de capacidades
 */
export class JsonCapabilityRepository implements CapabilityRepository {
  private capabilities: Capability[] = [];
  private groupRepository: JsonCapabilityGroupRepository;

  constructor() {
    this.groupRepository = new JsonCapabilityGroupRepository();
    this.loadData();
  }

  /**
   * Carga las capacidades desde los grupos
   */
  private async loadData(): Promise<void> {
    try {
      const groups = await this.groupRepository.findAll();
      this.capabilities = groups.flatMap(group => group.capabilities);
    } catch (error) {
      console.error('Error loading capabilities from groups:', error);
      this.capabilities = [];
    }
  }

  /**
   * Recarga las capacidades desde los grupos
   */
  private async reloadCapabilities(): Promise<void> {
    await this.loadData();
  }

  /**
   * Obtiene todas las capacidades
   */
  async findAll(): Promise<Capability[]> {
    if (this.capabilities.length === 0) {
      await this.reloadCapabilities();
    }
    return [...this.capabilities];
  }

  /**
   * Busca una capacidad por ID
   */
  async findById(id: CapabilityId): Promise<Capability | null> {
    if (this.capabilities.length === 0) {
      await this.reloadCapabilities();
    }
    const capability = this.capabilities.find(cap => cap.id.equals(id));
    return capability || null;
  }

  /**
   * Busca capacidades por grupo
   */
  async findByGroupId(groupId: string): Promise<Capability[]> {
    if (this.capabilities.length === 0) {
      await this.reloadCapabilities();
    }
    return this.capabilities.filter(cap => cap.groupId === groupId);
  }

  /**
   * Busca capacidades por estilo del grupo
   */
  async findByGroupStyle(style: StyleType): Promise<Capability[]> {
    const groups = await this.groupRepository.findByStyle(style);
    const groupIds = groups.map(group => group.id);

    if (this.capabilities.length === 0) {
      await this.reloadCapabilities();
    }

    return this.capabilities.filter(cap => groupIds.includes(cap.groupId));
  }

  /**
   * Busca capacidades por nombre
   */
  async findByName(name: string): Promise<Capability[]> {
    const searchTerm = name.toLowerCase();
    return this.capabilities.filter(cap =>
      cap.name.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Busca capacidades activas
   */
  async findActive(): Promise<Capability[]> {
    return this.capabilities.filter(cap => cap.isActive);
  }

  /**
   * Busqueda profunda en todos los niveles (nueva estructura v2.0)
   */
  async search(query: string): Promise<Capability[]> {
    const searchTerm = query.toLowerCase();
    return this.capabilities.filter(cap =>
      cap.name.toLowerCase().includes(searchTerm) ||
      cap.subCapabilities.some(subCap =>
        subCap.name.toLowerCase().includes(searchTerm) ||
        subCap.description.toLowerCase().includes(searchTerm) ||
        subCap.baseFunctions.some(baseFunc =>
          baseFunc.name.toLowerCase().includes(searchTerm) ||
          baseFunc.description.toLowerCase().includes(searchTerm) ||
          baseFunc.functionalities.some(func =>
            func.name.toLowerCase().includes(searchTerm) ||
            func.description.toLowerCase().includes(searchTerm) ||
            (func.commonComponentName?.toLowerCase().includes(searchTerm) ?? false) ||
            (func.systemApplication?.toLowerCase().includes(searchTerm) ?? false)
          )
        )
      )
    );
  }

  /**
   * Obtiene capacidades con filtros avanzados
   */
  async findWithFilters(filters: CapabilityFilters): Promise<Capability[]> {
    if (this.capabilities.length === 0) {
      await this.reloadCapabilities();
    }

    let result = [...this.capabilities];

    // Filtrar por grupos especificos
    if (filters.groupIds && filters.groupIds.length > 0) {
      result = result.filter(cap =>
        filters.groupIds!.includes(cap.groupId)
      );
    }

    // Filtrar por estilos de grupo
    if (filters.groupStyles && filters.groupStyles.length > 0) {
      const groups = await this.groupRepository.findAll();
      const matchingGroupIds = groups
        .filter(group => filters.groupStyles!.some(style => group.style.equals(style)))
        .map(group => group.id);

      result = result.filter(cap => matchingGroupIds.includes(cap.groupId));
    }

    // Filtrar por estado activo
    if (filters.isActive !== undefined) {
      result = result.filter(cap => cap.isActive === filters.isActive);
    }

    // Filtrar por presencia de subcapacidades
    if (filters.hasBusinessCapabilities !== undefined) {
      result = result.filter(cap =>
        cap.hasSubCapabilities() === filters.hasBusinessCapabilities
      );
    }

    // Filtrar por numero minimo de subcapacidades
    if (filters.minBusinessCapabilities !== undefined) {
      result = result.filter(cap =>
        cap.getTotalSubCapabilities() >= filters.minBusinessCapabilities!
      );
    }

    // Filtrar por numero maximo de subcapacidades
    if (filters.maxBusinessCapabilities !== undefined) {
      result = result.filter(cap =>
        cap.getTotalSubCapabilities() <= filters.maxBusinessCapabilities!
      );
    }

    // Filtrar por numero minimo de funcionalidades
    if (filters.minFunctionalities !== undefined) {
      result = result.filter(cap =>
        cap.getTotalFunctionalities() >= filters.minFunctionalities!
      );
    }

    // Filtrar por numero maximo de funcionalidades
    if (filters.maxFunctionalities !== undefined) {
      result = result.filter(cap =>
        cap.getTotalFunctionalities() <= filters.maxFunctionalities!
      );
    }

    // Filtrar por termino de busqueda
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      result = result.filter(cap =>
        cap.name.toLowerCase().includes(searchTerm)
      );
    }

    // Filtrar por fecha de creacion
    if (filters.createdAfter) {
      result = result.filter(cap => cap.createdAt >= filters.createdAfter!);
    }

    if (filters.createdBefore) {
      result = result.filter(cap => cap.createdAt <= filters.createdBefore!);
    }

    return result;
  }

  /**
   * Guarda una capacidad (simulado - en memoria)
   */
  async save(capability: Capability): Promise<void> {
    const index = this.capabilities.findIndex(cap => cap.id.equals(capability.id));
    if (index >= 0) {
      this.capabilities[index] = capability;
    } else {
      this.capabilities.push(capability);
    }
  }

  /**
   * Elimina una capacidad
   */
  async delete(id: CapabilityId): Promise<void> {
    this.capabilities = this.capabilities.filter(cap => !cap.id.equals(id));
  }

  /**
   * Verifica si existe una capacidad
   */
  async exists(id: CapabilityId): Promise<boolean> {
    return this.capabilities.some(cap => cap.id.equals(id));
  }

  /**
   * Obtiene el conteo total de capacidades
   */
  async count(): Promise<number> {
    return this.capabilities.length;
  }

  /**
   * Obtiene capacidades paginadas
   */
  async findPaginated(page: number, limit: number): Promise<PaginatedResult<Capability>> {
    const offset = (page - 1) * limit;
    const items = this.capabilities.slice(offset, offset + limit);
    const total = this.capabilities.length;
    const totalPages = Math.ceil(total / limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1
    };
  }
}
