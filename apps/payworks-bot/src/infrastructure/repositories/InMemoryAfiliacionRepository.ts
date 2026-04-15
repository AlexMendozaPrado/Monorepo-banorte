import { AfiliacionEntity } from '@/core/domain/entities/Afiliacion';
import { AfiliacionRepositoryPort } from '@/core/domain/ports/AfiliacionRepositoryPort';
import { AfiliacionFileParser } from '@/infrastructure/parsers/AfiliacionFileParser';

/**
 * In-memory affiliation repository hydrated from a user-uploaded CSV/TXT.
 *
 * The plan explicitly rules out an Oracle connection — the user refreshes
 * the export when they need fresh data. This repository therefore holds
 * whatever was last parsed and exposes O(1) lookup by `ID_AFILIACION`.
 */
export class InMemoryAfiliacionRepository implements AfiliacionRepositoryPort {
  private readonly byId = new Map<string, AfiliacionEntity>();
  private readonly parser = new AfiliacionFileParser();

  findByIdAfiliacion(id: string): AfiliacionEntity | undefined {
    return this.byId.get(id.trim());
  }

  existsById(id: string): boolean {
    return this.byId.has(id.trim());
  }

  loadFromFile(buffer: Buffer, filename: string): number {
    const parsed = this.parser.parse(buffer, filename);
    this.byId.clear();
    for (const a of parsed) {
      if (a.idAfiliacion) this.byId.set(a.idAfiliacion.trim(), a);
    }
    return this.byId.size;
  }

  listAll(): readonly AfiliacionEntity[] {
    return Array.from(this.byId.values());
  }

  clear(): void {
    this.byId.clear();
  }
}
