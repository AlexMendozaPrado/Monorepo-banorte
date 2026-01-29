import { Project } from '../entities/Project';

/**
 * Puerto (interfaz) para el repositorio de Proyectos
 */
export interface ProjectRepository {
  /**
   * Obtiene todos los proyectos
   */
  findAll(): Promise<Project[]>;

  /**
   * Busca un proyecto por ID
   */
  findById(id: string): Promise<Project | null>;

  /**
   * Busca proyectos por estado
   */
  findByStatus(status: Project['status']): Promise<Project[]>;

  /**
   * Busca proyectos por nombre (búsqueda parcial)
   */
  findByName(name: string): Promise<Project[]>;

  /**
   * Busca proyectos creados en un rango de fechas
   */
  findByDateRange(from: Date, to: Date): Promise<Project[]>;

  /**
   * Busca proyectos que contengan una capacidad específica
   */
  findByCapability(capabilityId: string): Promise<Project[]>;

  /**
   * Busca proyectos que contengan una funcionalidad específica
   */
  findByFunctionality(functionalityId: string): Promise<Project[]>;

  /**
   * Guarda un proyecto
   */
  save(project: Project): Promise<void>;

  /**
   * Elimina un proyecto
   */
  delete(id: string): Promise<void>;

  /**
   * Verifica si existe un proyecto con el ID dado
   */
  exists(id: string): Promise<boolean>;

  /**
   * Obtiene el conteo total de proyectos
   */
  count(): Promise<number>;

  /**
   * Obtiene proyectos paginados
   */
  findPaginated(page: number, limit: number): Promise<PaginatedProjectResult>;

  /**
   * Obtiene proyectos con filtros
   */
  findWithFilters(filters: ProjectFilters): Promise<Project[]>;

  /**
   * Obtiene estadísticas de proyectos
   */
  getStats(): Promise<ProjectStats>;
}

/**
 * Filtros para búsqueda de proyectos
 */
export interface ProjectFilters {
  status?: Project['status'][];
  hasCapabilities?: boolean;
  hasFunctionalities?: boolean;
  minItems?: number;
  maxItems?: number;
  minEffort?: number;
  maxEffort?: number;
  searchTerm?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  updatedAfter?: Date;
  updatedBefore?: Date;
}

/**
 * Resultado paginado para proyectos
 */
export interface PaginatedProjectResult {
  projects: Project[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Estadísticas de proyectos
 */
export interface ProjectStats {
  totalProjects: number;
  projectsByStatus: Record<Project['status'], number>;
  averageItemsPerProject: number;
  averageEffortPerProject: number;
  totalEstimatedEffort: number;
  mostUsedCapabilities: Array<{
    capabilityId: string;
    capabilityName: string;
    usageCount: number;
  }>;
  mostUsedFunctionalities: Array<{
    functionalityId: string;
    functionalityName: string;
    usageCount: number;
  }>;
}
