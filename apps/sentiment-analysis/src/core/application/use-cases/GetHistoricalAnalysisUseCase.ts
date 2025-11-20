import { SentimentAnalysis } from '../../domain/entities/SentimentAnalysis';
import { 
  SentimentAnalysisRepositoryPort, 
  AnalysisFilter, 
  PaginationOptions, 
  PaginatedResult 
} from '../../domain/ports/SentimentAnalysisRepositoryPort';

export interface GetHistoricalAnalysisQuery {
  filter?: AnalysisFilter;
  pagination?: PaginationOptions;
}

export interface HistoricalAnalysisResult {
  analyses: PaginatedResult<SentimentAnalysis>;
  statistics: {
    totalAnalyses: number;
    positiveCount: number;
    neutralCount: number;
    negativeCount: number;
    averageConfidence: number;
    mostCommonChannel: string;
  };
}

export class GetHistoricalAnalysisUseCase {
  constructor(
    private readonly repository: SentimentAnalysisRepositoryPort
  ) {}

  async execute(query: GetHistoricalAnalysisQuery = {}): Promise<HistoricalAnalysisResult> {
    try {
      // Validate and set default pagination
      const pagination = this.validateAndSetDefaults(query.pagination);
      
      // Get paginated analyses
      const analyses = await this.repository.findAll(query.filter, pagination);
      
      // Get statistics for the same filter
      const statistics = await this.repository.getStatistics(query.filter);

      return {
        analyses,
        statistics,
      };
    } catch (error) {
      console.error('Error in GetHistoricalAnalysisUseCase:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        query,
      });
      throw error;
    }
  }

  async getRecentAnalyses(clientName?: string, limit: number = 10): Promise<SentimentAnalysis[]> {
    try {
      if (clientName) {
        return await this.repository.findRecentByClient(clientName, limit);
      }

      // Get recent analyses for all clients
      const result = await this.repository.findAll(
        undefined,
        {
          page: 1,
          limit,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        }
      );

      return result.data;
    } catch (error) {
      console.error('Error getting recent analyses:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        clientName,
        limit,
      });
      throw error;
    }
  }

  async getAnalysisById(id: string): Promise<SentimentAnalysis | null> {
    try {
      if (!id || id.trim().length === 0) {
        throw new Error('Analysis ID is required.');
      }

      return await this.repository.findById(id);
    } catch (error) {
      console.error('Error getting analysis by ID:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        id,
      });
      throw error;
    }
  }

  private validateAndSetDefaults(pagination?: PaginationOptions): PaginationOptions {
    const defaults: PaginationOptions = {
      page: 1,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };

    if (!pagination) {
      return defaults;
    }

    // Validate page
    if (pagination.page && pagination.page < 1) {
      throw new Error('Page number must be greater than 0.');
    }

    // Validate limit
    if (pagination.limit && (pagination.limit < 1 || pagination.limit > 100)) {
      throw new Error('Limit must be between 1 and 100.');
    }

    // Validate sort order
    if (pagination.sortOrder && !['asc', 'desc'].includes(pagination.sortOrder)) {
      throw new Error('Sort order must be either "asc" or "desc".');
    }

    return {
      page: pagination.page || defaults.page,
      limit: pagination.limit || defaults.limit,
      sortBy: pagination.sortBy || defaults.sortBy,
      sortOrder: pagination.sortOrder || defaults.sortOrder,
    };
  }
}
