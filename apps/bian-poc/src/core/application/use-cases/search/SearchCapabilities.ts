import { SearchAcrossAllLevelsUseCase, SearchResultDto } from './SearchAcrossAllLevelsUseCase';

/**
 * Caso de uso para buscar capacidades (actualizado para nueva estructura)
 */
export class SearchCapabilities {
  constructor(private readonly searchAcrossAllLevelsUseCase: SearchAcrossAllLevelsUseCase) {}

  /**
   * Ejecuta la búsqueda de capacidades en todos los niveles
   */
  async execute(request: SearchCapabilitiesRequest): Promise<SearchCapabilitiesResponse> {
    try {
      const startTime = Date.now();

      // Validar entrada
      this.validateRequest(request);

      // Realizar búsqueda en todos los niveles
      const searchResults = await this.searchAcrossAllLevelsUseCase.execute(request.query);

      // Aplicar filtros si están presentes
      const filteredResults = request.filters
        ? this.applyFilters(searchResults, request.filters)
        : searchResults;

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      return {
        success: true,
        results: filteredResults,
        totalResults: filteredResults.length,
        executionTime,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        results: [],
        totalResults: 0,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        executionTime: 0,
        timestamp: new Date()
      };
    }
  }

  /**
   * Valida la solicitud de búsqueda
   */
  private validateRequest(request: SearchCapabilitiesRequest): void {
    if (!request.query || typeof request.query !== 'string') {
      throw new Error('Query is required and must be a string');
    }

    if (request.query.trim().length === 0) {
      throw new Error('Query cannot be empty');
    }

    if (request.query.length > 500) {
      throw new Error('Query is too long (maximum 500 characters)');
    }

    // Validar filtros si están presentes
    if (request.filters) {
      this.validateFilters(request.filters);
    }
  }

  /**
   * Valida los filtros de búsqueda
   */
  private validateFilters(filters: SearchFilters): void {
    if (filters.levels && filters.levels.length === 0) {
      throw new Error('Levels filter cannot be empty array');
    }

    if (filters.styles && filters.styles.length === 0) {
      throw new Error('Styles filter cannot be empty array');
    }
  }

  /**
   * Aplica filtros a los resultados de búsqueda
   */
  private applyFilters(results: SearchResultDto[], filters: SearchFilters): SearchResultDto[] {
    let filtered = results;

    // Filtrar por niveles específicos
    if (filters.levels && filters.levels.length > 0) {
      filtered = filtered.filter(result =>
        filters.levels!.includes(result.level)
      );
    }

    // Filtrar por estilos específicos
    if (filters.styles && filters.styles.length > 0) {
      filtered = filtered.filter(result =>
        filters.styles!.includes(result.style.name)
      );
    }

    // Filtrar solo elementos activos
    if (filters.activeOnly) {
      filtered = filtered.filter(result =>
        result.level === 'functionality'
          ? true // Las funcionalidades no tienen isActive en el DTO, asumimos true
          : true
      );
    }

    return filtered;
  }
}

/**
 * Solicitud para búsqueda de capacidades (nueva estructura)
 */
export interface SearchCapabilitiesRequest {
  query: string;
  filters?: SearchFilters;
}

/**
 * Respuesta de búsqueda de capacidades (nueva estructura)
 */
export interface SearchCapabilitiesResponse {
  success: boolean;
  results: SearchResultDto[];
  totalResults: number;
  error?: string;
  executionTime: number;
  timestamp: Date;
}

/**
 * Filtros de búsqueda (adaptado para nueva estructura)
 */
export interface SearchFilters {
  levels?: ('group' | 'capability' | 'subcapability' | 'baseFunction' | 'functionality')[];
  styles?: string[];
  activeOnly?: boolean;
}
