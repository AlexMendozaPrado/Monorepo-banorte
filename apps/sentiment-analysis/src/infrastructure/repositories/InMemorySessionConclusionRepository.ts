import { SessionConclusion } from '../../core/domain/value-objects/SessionConclusion';
import { SessionConclusionRepositoryPort } from '../../core/domain/ports/SessionConclusionRepositoryPort';

// Use globalThis to persist data across Next.js hot reloads in development
const getConclusionStore = (): Map<string, SessionConclusion> => {
  if (!(globalThis as any).__sessionConclusionStore) {
    (globalThis as any).__sessionConclusionStore = new Map<string, SessionConclusion>();
    console.log('[ConclusionRepo] Initialized new global conclusion store');
  }
  return (globalThis as any).__sessionConclusionStore;
};

export class InMemorySessionConclusionRepository implements SessionConclusionRepositoryPort {

  async save(conclusion: SessionConclusion): Promise<SessionConclusion> {
    try {
      const store = getConclusionStore();
      store.set(conclusion.id, conclusion);
      console.log(`[ConclusionRepo] Saved conclusion for analysis ${conclusion.analysisId}, total in cache: ${store.size}`);
      return conclusion;
    } catch (error) {
      throw new Error(
        `Failed to save session conclusion: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async findById(id: string): Promise<SessionConclusion | null> {
    try {
      const store = getConclusionStore();
      const result = store.get(id) || null;
      console.log(`[ConclusionRepo] Find by ID ${id}: ${result ? 'found' : 'not found'}`);
      return result;
    } catch (error) {
      throw new Error(
        `Failed to find session conclusion by ID: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async findByAnalysisId(analysisId: string): Promise<SessionConclusion | null> {
    try {
      const store = getConclusionStore();
      const conclusionsArray = Array.from(store.values());
      const result = conclusionsArray.find(c => c.analysisId === analysisId) || null;
      console.log(`[ConclusionRepo] Find by analysis ID ${analysisId}: ${result ? 'found' : 'not found'}, total in cache: ${store.size}`);
      return result;
    } catch (error) {
      throw new Error(
        `Failed to find session conclusion by analysis ID: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async findAll(): Promise<SessionConclusion[]> {
    try {
      const store = getConclusionStore();
      return Array.from(store.values());
    } catch (error) {
      throw new Error(
        `Failed to find all session conclusions: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async deleteById(id: string): Promise<boolean> {
    try {
      const store = getConclusionStore();
      return store.delete(id);
    } catch (error) {
      throw new Error(
        `Failed to delete session conclusion: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async update(id: string, updates: Partial<SessionConclusion>): Promise<SessionConclusion | null> {
    try {
      const store = getConclusionStore();
      const existing = store.get(id);
      if (!existing) {
        return null;
      }

      const updated = { ...existing, ...updates, updatedAt: new Date() };
      store.set(id, updated);
      return updated;
    } catch (error) {
      throw new Error(
        `Failed to update session conclusion: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Utility methods for testing and development
  async clear(): Promise<void> {
    const store = getConclusionStore();
    store.clear();
  }

  async count(): Promise<number> {
    const store = getConclusionStore();
    return store.size;
  }
}
