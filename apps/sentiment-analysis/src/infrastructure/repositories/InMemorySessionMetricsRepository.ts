import { SessionMetrics } from '../../core/domain/entities/SessionMetrics';
import {
  SessionMetricsRepositoryPort,
  SessionMetricsFilter,
} from '../../core/domain/ports/SessionMetricsRepositoryPort';

export class InMemorySessionMetricsRepository implements SessionMetricsRepositoryPort {
  private metrics: Map<string, SessionMetrics> = new Map();

  async save(metrics: SessionMetrics): Promise<SessionMetrics> {
    try {
      this.metrics.set(metrics.id, metrics);
      return metrics;
    } catch (error) {
      throw new Error(
        `Failed to save session metrics: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async findById(id: string): Promise<SessionMetrics | null> {
    try {
      return this.metrics.get(id) || null;
    } catch (error) {
      throw new Error(
        `Failed to find session metrics by ID: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async findByAnalysisId(analysisId: string): Promise<SessionMetrics | null> {
    try {
      const metricsArray = Array.from(this.metrics.values());
      return metricsArray.find(m => m.analysisId === analysisId) || null;
    } catch (error) {
      throw new Error(
        `Failed to find session metrics by analysis ID: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async findByAnalysisIds(analysisIds: string[]): Promise<SessionMetrics[]> {
    try {
      const metricsArray = Array.from(this.metrics.values());
      return metricsArray.filter(m => analysisIds.includes(m.analysisId));
    } catch (error) {
      throw new Error(
        `Failed to find session metrics by analysis IDs: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async findByDateRange(from: Date, to: Date): Promise<SessionMetrics[]> {
    try {
      const metricsArray = Array.from(this.metrics.values());
      return metricsArray.filter(m => m.createdAt >= from && m.createdAt <= to);
    } catch (error) {
      throw new Error(
        `Failed to find session metrics by date range: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async findAll(filter?: SessionMetricsFilter): Promise<SessionMetrics[]> {
    try {
      let metricsArray = Array.from(this.metrics.values());

      if (filter) {
        metricsArray = this.applyFilters(metricsArray, filter);
      }

      return metricsArray;
    } catch (error) {
      throw new Error(
        `Failed to find all session metrics: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async deleteById(id: string): Promise<boolean> {
    try {
      return this.metrics.delete(id);
    } catch (error) {
      throw new Error(
        `Failed to delete session metrics: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async update(id: string, updates: Partial<SessionMetrics>): Promise<SessionMetrics | null> {
    try {
      const existing = this.metrics.get(id);
      if (!existing) {
        return null;
      }

      const updated = { ...existing, ...updates, updatedAt: new Date() };
      this.metrics.set(id, updated);
      return updated;
    } catch (error) {
      throw new Error(
        `Failed to update session metrics: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async count(): Promise<number> {
    return this.metrics.size;
  }

  private applyFilters(metricsArray: SessionMetrics[], filter: SessionMetricsFilter): SessionMetrics[] {
    return metricsArray.filter(metrics => {
      if (filter.analysisId && metrics.analysisId !== filter.analysisId) {
        return false;
      }

      if (filter.minProductivity !== undefined && metrics.productivityScore < filter.minProductivity) {
        return false;
      }

      if (filter.maxProductivity !== undefined && metrics.productivityScore > filter.maxProductivity) {
        return false;
      }

      if (filter.dateFrom && metrics.createdAt < filter.dateFrom) {
        return false;
      }

      if (filter.dateTo && metrics.createdAt > filter.dateTo) {
        return false;
      }

      if (filter.hasBlockers !== undefined) {
        const hasBlockers = metrics.blockers.length > 0;
        if (filter.hasBlockers !== hasBlockers) {
          return false;
        }
      }

      return true;
    });
  }

  // Utility methods for testing and development
  async clear(): Promise<void> {
    this.metrics.clear();
  }
}
