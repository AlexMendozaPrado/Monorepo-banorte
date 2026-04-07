import { CertificationSession } from '../entities/CertificationSession';

export interface CertificationRepositoryPort {
  save(session: CertificationSession): Promise<CertificationSession>;
  findById(id: string): Promise<CertificationSession | null>;
  findAll(): Promise<CertificationSession[]>;
  deleteById(id: string): Promise<boolean>;
}
