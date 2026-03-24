import {
  SentimentAnalysisRepositoryPort,
  AnalysisFilter,
  PaginationOptions,
  PaginatedResult,
} from '../../core/domain/ports/SentimentAnalysisRepositoryPort';
import { SentimentAnalysis } from '../../core/domain/entities/SentimentAnalysis';
import { SentimentType } from '../../core/domain/value-objects/SentimentType';

/**
 * Implementación mock de SentimentAnalysisRepositoryPort para testing.
 * Simula almacenamiento en memoria — reemplaza a la BD real (Supabase)
 * cumpliendo el mismo contrato (Port).
 */
export class SentimentAnalysisRepositoryMock implements SentimentAnalysisRepositoryPort {
  private analyses: Map<string, SentimentAnalysis> = new Map();
  private shouldFail: boolean = false;

  async save(analysis: SentimentAnalysis): Promise<SentimentAnalysis> {
    if (this.shouldFail) {
      throw new Error('Failed to save analysis');
    }

    this.analyses.set(analysis.id, analysis);
    return analysis;
  }

  async findById(id: string): Promise<SentimentAnalysis | null> {
    if (this.shouldFail) {
      throw new Error('Failed to find analysis');
    }

    return this.analyses.get(id) || null;
  }

  async findAll(
    filter?: AnalysisFilter,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<SentimentAnalysis>> {
    if (this.shouldFail) {
      throw new Error('Failed to find analyses');
    }

    let results = Array.from(this.analyses.values());

    // Aplicar filtros
    if (filter) {
      results = this.applyFilters(results, filter);
    }

    // Aplicar ordenamiento
    if (pagination?.sortBy) {
      results = this.applySorting(results, pagination);
    }

    // Calcular paginación
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const total = results.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      data: results.slice(start, end),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findRecentByClient(clientName: string, limit: number = 10): Promise<SentimentAnalysis[]> {
    if (this.shouldFail) {
      throw new Error('Failed to find recent analyses');
    }

    return Array.from(this.analyses.values())
      .filter(a => a.clientName === clientName)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async getStatistics(filter?: AnalysisFilter): Promise<{
    totalAnalyses: number;
    positiveCount: number;
    neutralCount: number;
    negativeCount: number;
    averageConfidence: number;
    mostCommonChannel: string;
  }> {
    if (this.shouldFail) {
      throw new Error('Failed to get statistics');
    }

    let results = Array.from(this.analyses.values());

    if (filter) {
      results = this.applyFilters(results, filter);
    }

    const positiveCount = results.filter(a => a.overallSentiment === SentimentType.POSITIVE).length;
    const neutralCount = results.filter(a => a.overallSentiment === SentimentType.NEUTRAL).length;
    const negativeCount = results.filter(a => a.overallSentiment === SentimentType.NEGATIVE).length;

    const averageConfidence = results.length > 0
      ? results.reduce((sum, a) => sum + a.confidence, 0) / results.length
      : 0;

    // Encontrar el canal más común
    const channelCounts = new Map<string, number>();
    results.forEach(a => {
      channelCounts.set(a.channel, (channelCounts.get(a.channel) || 0) + 1);
    });

    let mostCommonChannel = '';
    let maxCount = 0;
    channelCounts.forEach((count, channel) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommonChannel = channel;
      }
    });

    return {
      totalAnalyses: results.length,
      positiveCount,
      neutralCount,
      negativeCount,
      averageConfidence,
      mostCommonChannel,
    };
  }

  async deleteById(id: string): Promise<boolean> {
    if (this.shouldFail) {
      throw new Error('Failed to delete analysis');
    }

    return this.analyses.delete(id);
  }

  async update(id: string, updates: Partial<SentimentAnalysis>): Promise<SentimentAnalysis | null> {
    if (this.shouldFail) {
      throw new Error('Failed to update analysis');
    }

    const existing = this.analyses.get(id);
    if (!existing) {
      return null;
    }

    const updated = { ...existing, ...updates };
    this.analyses.set(id, updated);
    return updated;
  }

  // ─── Métodos de utilidad para tests ─────────────────────────

  /** Fuerza que todas las operaciones del repositorio fallen */
  setShouldFail(shouldFail: boolean): void {
    this.shouldFail = shouldFail;
  }

  /** Vacía el repositorio */
  clear(): void {
    this.analyses.clear();
  }

  /** Carga datos iniciales (seed) para los tests */
  seed(analyses: SentimentAnalysis[]): void {
    analyses.forEach(a => this.analyses.set(a.id, a));
  }

  /** Devuelve todos los análisis guardados (para verificar en asserts) */
  getAll(): SentimentAnalysis[] {
    return Array.from(this.analyses.values());
  }

  /** Limpia todo el estado — se llama en afterEach() */
  reset(): void {
    this.analyses.clear();
    this.shouldFail = false;
  }

  // ─── Métodos privados ──────────────────────────────────────

  private applyFilters(results: SentimentAnalysis[], filter: AnalysisFilter): SentimentAnalysis[] {
    return results.filter(analysis => {
      if (filter.clientName && analysis.clientName !== filter.clientName) {
        return false;
      }
      if (filter.sentimentType && analysis.overallSentiment !== filter.sentimentType) {
        return false;
      }
      if (filter.channel && analysis.channel !== filter.channel) {
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

  private applySorting(results: SentimentAnalysis[], pagination: PaginationOptions): SentimentAnalysis[] {
    const sortBy = pagination.sortBy || 'createdAt';
    const sortOrder = pagination.sortOrder || 'desc';

    return results.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }
}

/**
 * Factory para crear un mock ya configurado
 */
export const createRepositoryMock = (config?: {
  shouldFail?: boolean;
  seedData?: SentimentAnalysis[];
}): SentimentAnalysisRepositoryMock => {
  const mock = new SentimentAnalysisRepositoryMock();

  if (config?.shouldFail) {
    mock.setShouldFail(config.shouldFail);
  }

  if (config?.seedData) {
    mock.seed(config.seedData);
  }

  return mock;
};
