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
   * Saves a sentiment analysis to the repository
   * @param analysis The sentiment analysis to save
   * @returns Promise with the saved analysis
   */
  save(analysis: SentimentAnalysis): Promise<SentimentAnalysis>;

  /**
   * Finds a sentiment analysis by its ID
   * @param id The analysis ID
   * @returns Promise with the analysis or null if not found
   */
  findById(id: string): Promise<SentimentAnalysis | null>;

  /**
   * Finds all sentiment analyses with optional filtering and pagination
   * @param filter Optional filter criteria
   * @param pagination Optional pagination options
   * @returns Promise with paginated results
   */
  findAll(
    filter?: AnalysisFilter,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<SentimentAnalysis>>;

  /**
   * Finds recent analyses for a specific client
   * @param clientName The client name
   * @param limit Maximum number of results
   * @returns Promise with the recent analyses
   */
  findRecentByClient(clientName: string, limit?: number): Promise<SentimentAnalysis[]>;

  /**
   * Gets analysis statistics
   * @param filter Optional filter criteria
   * @returns Promise with statistics
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
   * Deletes a sentiment analysis by its ID
   * @param id The analysis ID
   * @returns Promise<boolean> indicating success
   */
  deleteById(id: string): Promise<boolean>;

  /**
   * Updates an existing sentiment analysis
   * @param id The analysis ID
   * @param updates Partial analysis data to update
   * @returns Promise with the updated analysis or null if not found
   */
  update(id: string, updates: Partial<SentimentAnalysis>): Promise<SentimentAnalysis | null>;
}
