import { SentimentAnalysis } from '../../core/domain/entities/SentimentAnalysis';
import { SentimentType } from '../../core/domain/value-objects/SentimentType';
import { 
  SentimentAnalysisRepositoryPort, 
  AnalysisFilter, 
  PaginationOptions, 
  PaginatedResult 
} from '../../core/domain/ports/SentimentAnalysisRepositoryPort';

export class InMemorySentimentAnalysisRepository implements SentimentAnalysisRepositoryPort {
  private analyses: Map<string, SentimentAnalysis> = new Map();

  async save(analysis: SentimentAnalysis): Promise<SentimentAnalysis> {
    try {
      this.analyses.set(analysis.id, analysis);
      return analysis;
    } catch (error) {
      throw new Error(`Failed to save analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findById(id: string): Promise<SentimentAnalysis | null> {
    try {
      return this.analyses.get(id) || null;
    } catch (error) {
      throw new Error(`Failed to find analysis by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findAll(
    filter?: AnalysisFilter,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<SentimentAnalysis>> {
    try {
      let filteredAnalyses = Array.from(this.analyses.values());

      // Apply filters
      if (filter) {
        filteredAnalyses = this.applyFilters(filteredAnalyses, filter);
      }

      // Apply sorting
      if (pagination?.sortBy) {
        filteredAnalyses = this.applySorting(filteredAnalyses, pagination);
      }

      // Calculate pagination
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const paginatedData = filteredAnalyses.slice(startIndex, endIndex);
      const totalPages = Math.ceil(filteredAnalyses.length / limit);

      return {
        data: paginatedData,
        total: filteredAnalyses.length,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      throw new Error(`Failed to find analyses: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findRecentByClient(clientName: string, limit: number = 10): Promise<SentimentAnalysis[]> {
    try {
      const clientAnalyses = Array.from(this.analyses.values())
        .filter(analysis => analysis.clientName === clientName)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, limit);

      return clientAnalyses;
    } catch (error) {
      throw new Error(`Failed to find recent analyses for client: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getStatistics(filter?: AnalysisFilter): Promise<{
    totalAnalyses: number;
    positiveCount: number;
    neutralCount: number;
    negativeCount: number;
    averageConfidence: number;
    mostCommonChannel: string;
  }> {
    try {
      let analyses = Array.from(this.analyses.values());

      if (filter) {
        analyses = this.applyFilters(analyses, filter);
      }

      const totalAnalyses = analyses.length;
      
      if (totalAnalyses === 0) {
        return {
          totalAnalyses: 0,
          positiveCount: 0,
          neutralCount: 0,
          negativeCount: 0,
          averageConfidence: 0,
          mostCommonChannel: '',
        };
      }

      const positiveCount = analyses.filter(a => a.overallSentiment === SentimentType.POSITIVE).length;
      const neutralCount = analyses.filter(a => a.overallSentiment === SentimentType.NEUTRAL).length;
      const negativeCount = analyses.filter(a => a.overallSentiment === SentimentType.NEGATIVE).length;

      const averageConfidence = analyses.reduce((sum, a) => sum + a.confidence, 0) / totalAnalyses;

      // Find most common channel
      const channelCounts = analyses.reduce((counts, analysis) => {
        counts[analysis.channel] = (counts[analysis.channel] || 0) + 1;
        return counts;
      }, {} as Record<string, number>);

      const mostCommonChannel = Object.entries(channelCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || '';

      return {
        totalAnalyses,
        positiveCount,
        neutralCount,
        negativeCount,
        averageConfidence,
        mostCommonChannel,
      };
    } catch (error) {
      throw new Error(`Failed to get statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteById(id: string): Promise<boolean> {
    try {
      return this.analyses.delete(id);
    } catch (error) {
      throw new Error(`Failed to delete analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async update(id: string, updates: Partial<SentimentAnalysis>): Promise<SentimentAnalysis | null> {
    try {
      const existing = this.analyses.get(id);
      if (!existing) {
        return null;
      }

      const updated = { ...existing, ...updates, updatedAt: new Date() };
      this.analyses.set(id, updated);
      return updated;
    } catch (error) {
      throw new Error(`Failed to update analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private applyFilters(analyses: SentimentAnalysis[], filter: AnalysisFilter): SentimentAnalysis[] {
    return analyses.filter(analysis => {
      if (filter.clientName && !analysis.clientName.toLowerCase().includes(filter.clientName.toLowerCase())) {
        return false;
      }

      if (filter.sentimentType && analysis.overallSentiment !== filter.sentimentType) {
        return false;
      }

      if (filter.channel && !analysis.channel.toLowerCase().includes(filter.channel.toLowerCase())) {
        return false;
      }

      if (filter.dateFrom && analysis.createdAt < filter.dateFrom) {
        return false;
      }

      if (filter.dateTo && analysis.createdAt > filter.dateTo) {
        return false;
      }

      if (filter.minConfidence !== undefined && analysis.confidence < filter.minConfidence) {
        return false;
      }

      if (filter.maxConfidence !== undefined && analysis.confidence > filter.maxConfidence) {
        return false;
      }

      return true;
    });
  }

  private applySorting(analyses: SentimentAnalysis[], pagination: PaginationOptions): SentimentAnalysis[] {
    const { sortBy, sortOrder = 'desc' } = pagination;
    
    return analyses.sort((a, b) => {
      let aValue: any = a[sortBy!];
      let bValue: any = b[sortBy!];

      // Handle date sorting
      if (aValue instanceof Date && bValue instanceof Date) {
        aValue = aValue.getTime();
        bValue = bValue.getTime();
      }

      // Handle string sorting
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }

  // Utility methods for testing and development
  async clear(): Promise<void> {
    this.analyses.clear();
  }

  async count(): Promise<number> {
    return this.analyses.size;
  }

  async seedWithSampleData(): Promise<void> {
    // This method can be used to populate the repository with sample data for testing
    // Implementation would go here if needed for the POC
  }
}
