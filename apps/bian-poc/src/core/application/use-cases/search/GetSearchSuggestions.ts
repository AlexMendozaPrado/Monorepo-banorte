import { SearchService } from '../../../domain/ports/SearchService';
import { CapabilityRepository } from '../../../domain/ports/CapabilityRepository';

/**
 * Caso de uso para obtener sugerencias de búsqueda (v2.0)
 */
export class GetSearchSuggestions {
  constructor(
    private readonly searchService: SearchService,
    private readonly capabilityRepository: CapabilityRepository
  ) {}

  /**
   * Ejecuta la obtención de sugerencias
   */
  async execute(request: GetSearchSuggestionsRequest): Promise<GetSearchSuggestionsResponse> {
    try {
      // Validar entrada
      this.validateRequest(request);

      const startTime = Date.now();

      // Obtener sugerencias del servicio de búsqueda
      const searchSuggestions = await this.searchService.getSuggestions(request.partialQuery);

      // Obtener sugerencias adicionales basadas en categorías y nombres
      const additionalSuggestions = await this.getAdditionalSuggestions(request.partialQuery);

      // Combinar y filtrar sugerencias
      const allSuggestions = [...searchSuggestions, ...additionalSuggestions];
      const uniqueSuggestions = Array.from(new Set(allSuggestions));

      // Ordenar por relevancia y limitar resultados
      const sortedSuggestions = this.sortSuggestionsByRelevance(
        uniqueSuggestions,
        request.partialQuery
      );

      const limitedSuggestions = sortedSuggestions.slice(0, request.maxSuggestions || 10);

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      return {
        success: true,
        suggestions: limitedSuggestions,
        totalFound: uniqueSuggestions.length,
        executionTime,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        suggestions: [],
        totalFound: 0,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        executionTime: 0,
        timestamp: new Date()
      };
    }
  }

  /**
   * Valida la solicitud
   */
  private validateRequest(request: GetSearchSuggestionsRequest): void {
    if (!request.partialQuery || typeof request.partialQuery !== 'string') {
      throw new Error('Partial query is required and must be a string');
    }

    if (request.partialQuery.trim().length === 0) {
      throw new Error('Partial query cannot be empty');
    }

    if (request.partialQuery.length > 100) {
      throw new Error('Partial query is too long (maximum 100 characters)');
    }

    if (request.maxSuggestions && (request.maxSuggestions < 1 || request.maxSuggestions > 50)) {
      throw new Error('Max suggestions must be between 1 and 50');
    }
  }

  /**
   * Obtiene sugerencias adicionales basadas en capacidades existentes (v2.0)
   */
  private async getAdditionalSuggestions(partialQuery: string): Promise<string[]> {
    const suggestions: string[] = [];
    const query = partialQuery.toLowerCase();

    try {
      // Buscar en nombres de capacidades
      const capabilities = await this.capabilityRepository.findAll();

      capabilities.forEach(capability => {
        // Sugerir nombres de capacidades
        if (capability.name.toLowerCase().includes(query)) {
          suggestions.push(capability.name);
        }

        // Sugerir nombres de subcapacidades
        capability.subCapabilities.forEach(subCap => {
          if (subCap.name.toLowerCase().includes(query)) {
            suggestions.push(subCap.name);
          }

          // Sugerir palabras clave de los nombres de subcapacidades
          const nameWords = subCap.name
            .toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 3 && word.includes(query));
          suggestions.push(...nameWords);

          // Sugerir nombres de funcionalidades base
          subCap.baseFunctions.forEach(baseFunc => {
            if (baseFunc.name.toLowerCase().includes(query)) {
              suggestions.push(baseFunc.name);
            }
          });
        });

        // Sugerir nombres de funcionalidades
        capability.getAllFunctionalities().forEach(func => {
          if (func.name.toLowerCase().includes(query)) {
            suggestions.push(func.name);
          }
          // También sugerir por componente común
          if (func.commonComponentName?.toLowerCase().includes(query)) {
            suggestions.push(func.commonComponentName);
          }
        });
      });
    } catch (error) {
      // Si hay error obteniendo capacidades, continuar con sugerencias vacías
      console.warn('Error getting additional suggestions:', error);
    }

    return suggestions;
  }

  /**
   * Ordena las sugerencias por relevancia
   */
  private sortSuggestionsByRelevance(suggestions: string[], query: string): string[] {
    const queryLower = query.toLowerCase();

    return suggestions.sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();

      // Prioridad 1: Coincidencia exacta al inicio
      const aStartsWithQuery = aLower.startsWith(queryLower);
      const bStartsWithQuery = bLower.startsWith(queryLower);

      if (aStartsWithQuery && !bStartsWithQuery) return -1;
      if (!aStartsWithQuery && bStartsWithQuery) return 1;

      // Prioridad 2: Longitud (más corto es mejor)
      if (aStartsWithQuery && bStartsWithQuery) {
        return a.length - b.length;
      }

      // Prioridad 3: Posición de la coincidencia
      const aIndex = aLower.indexOf(queryLower);
      const bIndex = bLower.indexOf(queryLower);

      if (aIndex !== bIndex) {
        return aIndex - bIndex;
      }

      // Prioridad 4: Longitud total
      return a.length - b.length;
    });
  }
}

/**
 * Solicitud para obtener sugerencias de búsqueda
 */
export interface GetSearchSuggestionsRequest {
  partialQuery: string;
  maxSuggestions?: number;
}

/**
 * Respuesta con sugerencias de búsqueda
 */
export interface GetSearchSuggestionsResponse {
  success: boolean;
  suggestions: string[];
  totalFound: number;
  error?: string;
  executionTime: number;
  timestamp: Date;
}
