import { SessionMetrics } from '../../core/domain/entities/SessionMetrics';
import {
  SessionMetricsRepositoryPort,
  SessionMetricsFilter,
} from '../../core/domain/ports/SessionMetricsRepositoryPort';

// Use globalThis to persist data across Next.js hot reloads in development
const getMetricsStore = (): Map<string, SessionMetrics> => {
  if (!(globalThis as any).__sessionMetricsStore) {
    (globalThis as any).__sessionMetricsStore = new Map<string, SessionMetrics>();
    console.log('[MetricsRepo] Initialized new global metrics store');
  }
  return (globalThis as any).__sessionMetricsStore;
};

export class InMemorySessionMetricsRepository implements SessionMetricsRepositoryPort {

  async save(metrics: SessionMetrics): Promise<SessionMetrics> {
    try {
      const store = getMetricsStore();
      store.set(metrics.id, metrics);
      console.log(`[MetricsRepo] Saved metrics for analysis ${metrics.analysisId}, total in cache: ${store.size}`);
      return metrics;
    } catch (error) {
      throw new Error(
        `Failed to save session metrics: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async findById(id: string): Promise<SessionMetrics | null> {
    try {
      const store = getMetricsStore();
      const result = store.get(id) || null;
      console.log(`[MetricsRepo] Find by ID ${id}: ${result ? 'found' : 'not found'}`);
      return result;
    } catch (error) {
      throw new Error(
        `Failed to find session metrics by ID: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async findByAnalysisId(analysisId: string): Promise<SessionMetrics | null> {
    try {
      const store = getMetricsStore();
      const metricsArray = Array.from(store.values());
      const result = metricsArray.find(m => m.analysisId === analysisId) || null;
      console.log(`[MetricsRepo] Find by analysis ID ${analysisId}: ${result ? 'found' : 'not found'}, total in cache: ${store.size}`);
      return result;
    } catch (error) {
      throw new Error(
        `Failed to find session metrics by analysis ID: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async findByAnalysisIds(analysisIds: string[]): Promise<SessionMetrics[]> {
    try {
      const store = getMetricsStore();
      const metricsArray = Array.from(store.values());
      return metricsArray.filter(m => analysisIds.includes(m.analysisId));
    } catch (error) {
      throw new Error(
        `Failed to find session metrics by analysis IDs: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async findByDateRange(from: Date, to: Date): Promise<SessionMetrics[]> {
    try {
      const store = getMetricsStore();
      const metricsArray = Array.from(store.values());
      return metricsArray.filter(m => m.createdAt >= from && m.createdAt <= to);
    } catch (error) {
      throw new Error(
        `Failed to find session metrics by date range: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async findAll(filter?: SessionMetricsFilter): Promise<SessionMetrics[]> {
    try {
      const store = getMetricsStore();
      let metricsArray = Array.from(store.values());

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
      const store = getMetricsStore();
      return store.delete(id);
    } catch (error) {
      throw new Error(
        `Failed to delete session metrics: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async update(id: string, updates: Partial<SessionMetrics>): Promise<SessionMetrics | null> {
    try {
      const store = getMetricsStore();
      const existing = store.get(id);
      if (!existing) {
        return null;
      }

      const updated = { ...existing, ...updates, updatedAt: new Date() };
      store.set(id, updated);
      return updated;
    } catch (error) {
      throw new Error(
        `Failed to update session metrics: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async count(): Promise<number> {
    const store = getMetricsStore();
    return store.size;
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
    const store = getMetricsStore();
    store.clear();
  }
}
