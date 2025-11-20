import { SentimentAnalysis } from '../../domain/entities/SentimentAnalysis';
import { SentimentType } from '../../domain/value-objects/SentimentType';
import { 
  SentimentAnalysisRepositoryPort, 
  AnalysisFilter, 
  PaginationOptions, 
  PaginatedResult 
} from '../../domain/ports/SentimentAnalysisRepositoryPort';

export interface FilterCriteria {
  clientName?: string;
  sentimentType?: SentimentType;
  channel?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minConfidence?: number;
  maxConfidence?: number;
  searchText?: string;
}

export interface FilterAnalysisQuery {
  criteria: FilterCriteria;
  pagination?: PaginationOptions;
}

export interface FilteredAnalysisResult {
  analyses: PaginatedResult<SentimentAnalysis>;
  appliedFilters: AnalysisFilter;
  filterSummary: {
    totalMatches: number;
    sentimentDistribution: {
      positive: number;
      neutral: number;
      negative: number;
    };
    channelDistribution: Record<string, number>;
    averageConfidence: number;
  };
}

export class FilterAnalysisUseCase {
  constructor(
    private readonly repository: SentimentAnalysisRepositoryPort
  ) {}

  async execute(query: FilterAnalysisQuery): Promise<FilteredAnalysisResult> {
    try {
      // Validate and convert criteria to repository filter
      const filter = this.convertCriteriaToFilter(query.criteria);
      
      // Validate pagination
      const pagination = this.validatePagination(query.pagination);

      // Get filtered analyses
      const analyses = await this.repository.findAll(filter, pagination);

      // Get statistics for the filtered results
      const statistics = await this.repository.getStatistics(filter);

      // Calculate filter summary
      const filterSummary = this.calculateFilterSummary(analyses.data, statistics);

      return {
        analyses,
        appliedFilters: filter,
        filterSummary,
      };
    } catch (error) {
      console.error('Error in FilterAnalysisUseCase:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        query,
      });
      throw error;
    }
  }

  async getAvailableFilterOptions(): Promise<{
    clients: string[];
    channels: string[];
    sentimentTypes: SentimentType[];
    dateRange: {
      earliest: Date | null;
      latest: Date | null;
    };
    confidenceRange: {
      min: number;
      max: number;
    };
  }> {
    try {
      // Get all analyses to extract filter options
      const allAnalyses = await this.repository.findAll(undefined, {
        page: 1,
        limit: 1000, // Get a large sample to extract options
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      const clients = [...new Set(allAnalyses.data.map(a => a.clientName))].sort();
      const channels = [...new Set(allAnalyses.data.map(a => a.channel))].sort();
      const sentimentTypes = Object.values(SentimentType);

      const dates = allAnalyses.data.map(a => a.createdAt).sort();
      const confidences = allAnalyses.data.map(a => a.confidence);

      return {
        clients,
        channels,
        sentimentTypes,
        dateRange: {
          earliest: dates.length > 0 ? dates[0] : null,
          latest: dates.length > 0 ? dates[dates.length - 1] : null,
        },
        confidenceRange: {
          min: confidences.length > 0 ? Math.min(...confidences) : 0,
          max: confidences.length > 0 ? Math.max(...confidences) : 1,
        },
      };
    } catch (error) {
      console.error('Error getting filter options:', error);
      throw error;
    }
  }

  private convertCriteriaToFilter(criteria: FilterCriteria): AnalysisFilter {
    const filter: AnalysisFilter = {};

    if (criteria.clientName && criteria.clientName.trim().length > 0) {
      filter.clientName = criteria.clientName.trim();
    }

    if (criteria.sentimentType) {
      filter.sentimentType = criteria.sentimentType;
    }

    if (criteria.channel && criteria.channel.trim().length > 0) {
      filter.channel = criteria.channel.trim();
    }

    if (criteria.dateFrom) {
      filter.dateFrom = criteria.dateFrom;
    }

    if (criteria.dateTo) {
      filter.dateTo = criteria.dateTo;
    }

    if (criteria.minConfidence !== undefined && criteria.minConfidence >= 0 && criteria.minConfidence <= 1) {
      filter.minConfidence = criteria.minConfidence;
    }

    if (criteria.maxConfidence !== undefined && criteria.maxConfidence >= 0 && criteria.maxConfidence <= 1) {
      filter.maxConfidence = criteria.maxConfidence;
    }

    return filter;
  }

  private validatePagination(pagination?: PaginationOptions): PaginationOptions {
    const defaults: PaginationOptions = {
      page: 1,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };

    if (!pagination) {
      return defaults;
    }

    return {
      page: Math.max(1, pagination.page || defaults.page),
      limit: Math.min(100, Math.max(1, pagination.limit || defaults.limit)),
      sortBy: pagination.sortBy || defaults.sortBy,
      sortOrder: pagination.sortOrder || defaults.sortOrder,
    };
  }

  private calculateFilterSummary(
    analyses: SentimentAnalysis[], 
    statistics: any
  ): FilteredAnalysisResult['filterSummary'] {
    const channelDistribution: Record<string, number> = {};
    
    analyses.forEach(analysis => {
      channelDistribution[analysis.channel] = (channelDistribution[analysis.channel] || 0) + 1;
    });

    return {
      totalMatches: statistics.totalAnalyses,
      sentimentDistribution: {
        positive: statistics.positiveCount,
        neutral: statistics.neutralCount,
        negative: statistics.negativeCount,
      },
      channelDistribution,
      averageConfidence: statistics.averageConfidence,
    };
  }
}
