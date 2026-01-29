import { SearchResult, SearchFilters } from '../entities/SearchResult';
import { Capability } from '../entities/Capability';
import { Functionality } from '../entities/Functionality';

/**
 * Puerto (interfaz) para el servicio de búsqueda
 */
export interface SearchService {
  /**
   * Realiza una búsqueda general
   */
  search(query: string, filters?: SearchFilters): Promise<SearchResult>;

  /**
   * Busca solo capacidades
   */
  searchCapabilities(query: string, filters?: SearchFilters): Promise<Capability[]>;

  /**
   * Busca solo funcionalidades
   */
  searchFunctionalities(query: string, filters?: SearchFilters): Promise<Functionality[]>;

  /**
   * Obtiene sugerencias de búsqueda
   */
  getSuggestions(partialQuery: string): Promise<string[]>;

  /**
   * Búsqueda avanzada con múltiples criterios
   */
  advancedSearch(criteria: AdvancedSearchCriteria): Promise<SearchResult>;

  /**
   * Búsqueda por similitud semántica
   */
  semanticSearch(query: string, threshold?: number): Promise<SearchResult>;

  /**
   * Indexa contenido para búsqueda
   */
  indexContent(capabilities: Capability[]): Promise<void>;

  /**
   * Limpia el índice de búsqueda
   */
  clearIndex(): Promise<void>;

  /**
   * Obtiene estadísticas de búsqueda
   */
  getSearchStats(): Promise<SearchStats>;
}

/**
 * Criterios para búsqueda avanzada
 */
export interface AdvancedSearchCriteria {
  query?: string;
  exactMatch?: boolean;
  categories?: string[];
  complexity?: ('Low' | 'Medium' | 'High')[];
  hasDocuments?: boolean;
  isActive?: boolean;
  dateRange?: {
    from: Date;
    to: Date;
  };
  sortBy?: 'relevance' | 'name' | 'category' | 'date';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

/**
 * Estadísticas de búsqueda
 */
export interface SearchStats {
  totalSearches: number;
  averageSearchTime: number;
  mostSearchedTerms: Array<{
    term: string;
    count: number;
  }>;
  searchesWithResults: number;
  searchesWithoutResults: number;
  lastIndexUpdate: Date;
  indexSize: number;
}
