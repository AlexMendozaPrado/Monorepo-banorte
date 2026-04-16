import { AfiliacionEntity } from '../entities/Afiliacion';

export interface AfiliacionRepositoryPort {
  /** Returns the affiliation record for the given ID, or undefined. */
  findByIdAfiliacion(id: string): AfiliacionEntity | undefined;

  /** Returns whether the repository already knows about this affiliation. */
  existsById(id: string): boolean;

  /**
   * Hydrates the repository from the user-uploaded file buffer.
   * Replaces any previously loaded data.
   *
   * @returns the count of affiliations loaded.
   */
  loadFromFile(buffer: Buffer, filename: string): number;

  /** Returns all loaded affiliations (read-only). */
  listAll(): readonly AfiliacionEntity[];

  /** Clears the in-memory cache. */
  clear(): void;
}
