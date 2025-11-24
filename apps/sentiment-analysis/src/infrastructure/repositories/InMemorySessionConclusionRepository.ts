import { SessionConclusion } from '../../core/domain/value-objects/SessionConclusion';
import { SessionConclusionRepositoryPort } from '../../core/domain/ports/SessionConclusionRepositoryPort';

export class InMemorySessionConclusionRepository implements SessionConclusionRepositoryPort {
  private conclusions: Map<string, SessionConclusion> = new Map();

  async save(conclusion: SessionConclusion): Promise<SessionConclusion> {
    try {
      this.conclusions.set(conclusion.id, conclusion);
      return conclusion;
    } catch (error) {
      throw new Error(
        `Failed to save session conclusion: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async findById(id: string): Promise<SessionConclusion | null> {
    try {
      return this.conclusions.get(id) || null;
    } catch (error) {
      throw new Error(
        `Failed to find session conclusion by ID: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async findByAnalysisId(analysisId: string): Promise<SessionConclusion | null> {
    try {
      const conclusionsArray = Array.from(this.conclusions.values());
      return conclusionsArray.find(c => c.analysisId === analysisId) || null;
    } catch (error) {
      throw new Error(
        `Failed to find session conclusion by analysis ID: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async findAll(): Promise<SessionConclusion[]> {
    try {
      return Array.from(this.conclusions.values());
    } catch (error) {
      throw new Error(
        `Failed to find all session conclusions: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async deleteById(id: string): Promise<boolean> {
    try {
      return this.conclusions.delete(id);
    } catch (error) {
      throw new Error(
        `Failed to delete session conclusion: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async update(id: string, updates: Partial<SessionConclusion>): Promise<SessionConclusion | null> {
    try {
      const existing = this.conclusions.get(id);
      if (!existing) {
        return null;
      }

      const updated = { ...existing, ...updates, updatedAt: new Date() };
      this.conclusions.set(id, updated);
      return updated;
    } catch (error) {
      throw new Error(
        `Failed to update session conclusion: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Utility methods for testing and development
  async clear(): Promise<void> {
    this.conclusions.clear();
  }

  async count(): Promise<number> {
    return this.conclusions.size;
  }
}
