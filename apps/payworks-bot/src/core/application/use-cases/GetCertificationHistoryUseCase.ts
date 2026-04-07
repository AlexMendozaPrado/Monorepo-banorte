import { CertificationRepositoryPort } from '@/core/domain/ports/CertificationRepositoryPort';
import { CertificationSession } from '@/core/domain/entities/CertificationSession';

export class GetCertificationHistoryUseCase {
  constructor(
    private readonly certificationRepo: CertificationRepositoryPort,
  ) {}

  async execute(): Promise<CertificationSession[]> {
    return this.certificationRepo.findAll();
  }

  async findById(id: string): Promise<CertificationSession | null> {
    return this.certificationRepo.findById(id);
  }
}
