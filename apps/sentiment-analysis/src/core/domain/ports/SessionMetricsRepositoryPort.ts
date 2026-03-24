import { SessionMetrics } from '../entities/SessionMetrics';

export interface SessionMetricsFilter {
  analysisId?: string;
  minProductivity?: number;
  maxProductivity?: number;
  dateFrom?: Date;
  dateTo?: Date;
  hasBlockers?: boolean;
}

export interface SessionMetricsRepositoryPort {
  /**
   * Guarda las métricas de sesión en el repositorio
   * @param metrics Las métricas de sesión a guardar
   * @returns Promesa con las métricas guardadas
   */
  save(metrics: SessionMetrics): Promise<SessionMetrics>;

  /**
   * Busca métricas de sesión por su ID
   * @param id El ID de las métricas
   * @returns Promesa con las métricas o null si no se encuentran
   */
  findById(id: string): Promise<SessionMetrics | null>;

  /**
   * Busca métricas de sesión por ID de análisis
   * @param analysisId El ID del análisis
   * @returns Promesa con las métricas o null si no se encuentran
   */
  findByAnalysisId(analysisId: string): Promise<SessionMetrics | null>;

  /**
   * Busca métricas de sesión para múltiples IDs de análisis
   * @param analysisIds Arreglo de IDs de análisis
   * @returns Promesa con arreglo de métricas
   */
  findByAnalysisIds(analysisIds: string[]): Promise<SessionMetrics[]>;

  /**
   * Busca métricas de sesión dentro de un rango de fechas
   * @param from Fecha de inicio
   * @param to Fecha de fin
   * @returns Promesa con arreglo de métricas
   */
  findByDateRange(from: Date, to: Date): Promise<SessionMetrics[]>;

  /**
   * Busca todas las métricas de sesión con filtrado opcional
   * @param filter Criterios de filtrado opcionales
   * @returns Promesa con arreglo de métricas
   */
  findAll(filter?: SessionMetricsFilter): Promise<SessionMetrics[]>;

  /**
   * Elimina métricas de sesión por ID
   * @param id El ID de las métricas
   * @returns Promise<boolean> que indica éxito
   */
  deleteById(id: string): Promise<boolean>;

  /**
   * Actualiza métricas de sesión existentes
   * @param id El ID de las métricas
   * @param updates Datos parciales de métricas a actualizar
   * @returns Promesa con las métricas actualizadas o null si no se encuentran
   */
  update(id: string, updates: Partial<SessionMetrics>): Promise<SessionMetrics | null>;

  /**
   * Obtiene el conteo de sesiones
   * @returns Promesa con el conteo
   */
  count(): Promise<number>;
}
