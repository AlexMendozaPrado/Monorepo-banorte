import { SessionConclusion } from '../value-objects/SessionConclusion';

export interface SessionConclusionRepositoryPort {
  /**
   * Saves session conclusion to the repository
   * @param conclusion The session conclusion to save
   * @returns Promise with the saved conclusion
   */
  save(conclusion: SessionConclusion): Promise<SessionConclusion>;

  /**
   * Finds session conclusion by its ID
   * @param id The conclusion ID
   * @returns Promise with the conclusion or null if not found
   */
  findById(id: string): Promise<SessionConclusion | null>;

  /**
   * Finds session conclusion by analysis ID
   * @param analysisId The analysis ID
   * @returns Promise with the conclusion or null if not found
   */
  findByAnalysisId(analysisId: string): Promise<SessionConclusion | null>;

  /**
   * Finds all session conclusions
   * @returns Promise with array of conclusions
   */
  findAll(): Promise<SessionConclusion[]>;

  /**
   * Deletes session conclusion by ID
   * @param id The conclusion ID
   * @returns Promise<boolean> indicating success
   */
  deleteById(id: string): Promise<boolean>;

  /**
   * Updates existing session conclusion
   * @param id The conclusion ID
   * @param updates Partial conclusion data to update
   * @returns Promise with the updated conclusion or null if not found
   */
  update(id: string, updates: Partial<SessionConclusion>): Promise<SessionConclusion | null>;
}
