import { CertificationRepositoryPort } from '@/core/domain/ports/CertificationRepositoryPort';
import { CertificationSession } from '@/core/domain/entities/CertificationSession';

export class InMemoryCertificationRepository implements CertificationRepositoryPort {
  private store = new Map<string, CertificationSession>();

  async save(session: CertificationSession): Promise<CertificationSession> {
    this.store.set(session.id, session);
    return session;
  }

  async findById(id: string): Promise<CertificationSession | null> {
    return this.store.get(id) || null;
  }

  async findAll(): Promise<CertificationSession[]> {
    return Array.from(this.store.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async deleteById(id: string): Promise<boolean> {
    return this.store.delete(id);
  }

  clear(): void {
    this.store.clear();
  }

  count(): number {
    return this.store.size;
  }
}
