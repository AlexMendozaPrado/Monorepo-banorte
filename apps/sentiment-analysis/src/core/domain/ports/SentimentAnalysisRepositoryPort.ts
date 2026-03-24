import { SentimentAnalysis } from '../entities/SentimentAnalysis';
import { SentimentType } from '../value-objects/SentimentType';

export interface AnalysisFilter {
  clientName?: string;
  sentimentType?: SentimentType;
  channel?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minConfidence?: number;
  maxConfidence?: number;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: keyof SentimentAnalysis;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SentimentAnalysisRepositoryPort {
  /**
   * Guarda un análisis de sentimiento en el repositorio
   * @param analysis El análisis de sentimiento a guardar
   * @returns Promesa con el análisis guardado
   */
  save(analysis: SentimentAnalysis): Promise<SentimentAnalysis>;

  /**
   * Busca un análisis de sentimiento por su ID
   * @param id El ID del análisis
   * @returns Promesa con el análisis o null si no se encuentra
   */
  findById(id: string): Promise<SentimentAnalysis | null>;

  /**
   * Busca todos los análisis de sentimiento con filtrado y paginación opcionales
   * @param filter Criterios de filtrado opcionales
   * @param pagination Opciones de paginación opcionales
   * @returns Promesa con resultados paginados
   */
  findAll(
    filter?: AnalysisFilter,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<SentimentAnalysis>>;

  /**
   * Busca análisis recientes para un cliente específico
   * @param clientName El nombre del cliente
   * @param limit Número máximo de resultados
   * @returns Promesa con los análisis recientes
   */
  findRecentByClient(clientName: string, limit?: number): Promise<SentimentAnalysis[]>;

  /**
   * Obtiene estadísticas de los análisis
   * @param filter Criterios de filtrado opcionales
   * @returns Promesa con las estadísticas
   */
  getStatistics(filter?: AnalysisFilter): Promise<{
    totalAnalyses: number;
    positiveCount: number;
    neutralCount: number;
    negativeCount: number;
    averageConfidence: number;
    mostCommonChannel: string;
  }>;

  /**
   * Elimina un análisis de sentimiento por su ID
   * @param id El ID del análisis
   * @returns Promise<boolean> que indica éxito
   */
  deleteById(id: string): Promise<boolean>;

  /**
   * Actualiza un análisis de sentimiento existente
   * @param id El ID del análisis
   * @param updates Datos parciales del análisis a actualizar
   * @returns Promesa con el análisis actualizado o null si no se encuentra
   */
  update(id: string, updates: Partial<SentimentAnalysis>): Promise<SentimentAnalysis | null>;
}
