import { CertificationRepositoryPort } from '@/core/domain/ports/CertificationRepositoryPort';
import { CertificationSession } from '@/core/domain/entities/CertificationSession';

/**
 * In-memory repository. Uses `globalThis` to persist the store across
 * Next.js hot-reloads in dev mode. Without this, each module reload
 * produces a new empty Map and sessions saved by POST /validar are not
 * findable from GET /carta/[id].
 */
type GlobalWithStore = typeof globalThis & {
  __banortePayworksCertificationStore?: Map<string, CertificationSession>;
};

function getGlobalStore(): Map<string, CertificationSession> {
  const g = globalThis as GlobalWithStore;
  if (!g.__banortePayworksCertificationStore) {
    g.__banortePayworksCertificationStore = new Map();
  }
  return g.__banortePayworksCertificationStore;
}

export class InMemoryCertificationRepository implements CertificationRepositoryPort {
  private get store(): Map<string, CertificationSession> {
    return getGlobalStore();
  }

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
