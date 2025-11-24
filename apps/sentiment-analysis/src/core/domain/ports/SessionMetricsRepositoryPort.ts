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
   * Saves session metrics to the repository
   * @param metrics The session metrics to save
   * @returns Promise with the saved metrics
   */
  save(metrics: SessionMetrics): Promise<SessionMetrics>;

  /**
   * Finds session metrics by its ID
   * @param id The metrics ID
   * @returns Promise with the metrics or null if not found
   */
  findById(id: string): Promise<SessionMetrics | null>;

  /**
   * Finds session metrics by analysis ID
   * @param analysisId The analysis ID
   * @returns Promise with the metrics or null if not found
   */
  findByAnalysisId(analysisId: string): Promise<SessionMetrics | null>;

  /**
   * Finds session metrics for multiple analysis IDs
   * @param analysisIds Array of analysis IDs
   * @returns Promise with array of metrics
   */
  findByAnalysisIds(analysisIds: string[]): Promise<SessionMetrics[]>;

  /**
   * Finds session metrics within a date range
   * @param from Start date
   * @param to End date
   * @returns Promise with array of metrics
   */
  findByDateRange(from: Date, to: Date): Promise<SessionMetrics[]>;

  /**
   * Finds all session metrics with optional filtering
   * @param filter Optional filter criteria
   * @returns Promise with array of metrics
   */
  findAll(filter?: SessionMetricsFilter): Promise<SessionMetrics[]>;

  /**
   * Deletes session metrics by ID
   * @param id The metrics ID
   * @returns Promise<boolean> indicating success
   */
  deleteById(id: string): Promise<boolean>;

  /**
   * Updates existing session metrics
   * @param id The metrics ID
   * @param updates Partial metrics data to update
   * @returns Promise with the updated metrics or null if not found
   */
  update(id: string, updates: Partial<SessionMetrics>): Promise<SessionMetrics | null>;

  /**
   * Gets the count of sessions
   * @returns Promise with the count
   */
  count(): Promise<number>;
}
