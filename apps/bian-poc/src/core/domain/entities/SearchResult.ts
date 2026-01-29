import { Capability } from './Capability';
import { Functionality } from './Functionality';

/**
 * Entidad que representa el resultado de una búsqueda
 */
export class SearchResult {
  constructor(
    public readonly query: string,
    public readonly capabilities: Capability[] = [],
    public readonly functionalities: Functionality[] = [],
    public readonly totalResults: number = 0,
    public readonly searchTime: number = 0, // en milisegundos
    public readonly filters: SearchFilters = {},
    public readonly suggestions: string[] = [],
    public readonly executedAt: Date = new Date()
  ) {}

  /**
   * Verifica si hay resultados
   */
  hasResults(): boolean {
    return this.totalResults > 0;
  }

  /**
   * Obtiene todos los resultados combinados
   */
  getAllResults(): (Capability | Functionality)[] {
    return [...this.capabilities, ...this.functionalities];
  }

  /**
   * Obtiene el número de capacidades encontradas
   */
  getCapabilitiesCount(): number {
    return this.capabilities.length;
  }

  /**
   * Obtiene el número de funcionalidades encontradas
   */
  getFunctionalitiesCount(): number {
    return this.functionalities.length;
  }

  /**
   * Verifica si la búsqueda fue rápida (menos de 1 segundo)
   */
  isFastSearch(): boolean {
    return this.searchTime < 1000;
  }

  /**
   * Obtiene las capacidades ordenadas por relevancia
   */
  getCapabilitiesByRelevance(): Capability[] {
    // Por ahora retorna las capacidades tal como están
    // En el futuro se puede implementar un algoritmo de relevancia
    return this.capabilities;
  }

  /**
   * Obtiene las funcionalidades ordenadas por relevancia
   */
  getFunctionalitiesByRelevance(): Functionality[] {
    // Por ahora retorna las funcionalidades tal como están
    // En el futuro se puede implementar un algoritmo de relevancia
    return this.functionalities;
  }
}

/**
 * Interfaz para los filtros de búsqueda
 */
export interface SearchFilters {
  categories?: string[];
  complexity?: ('Low' | 'Medium' | 'High')[];
  hasDocuments?: boolean;
  isActive?: boolean;
  dateRange?: {
    from: Date;
    to: Date;
  };
}
