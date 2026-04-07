import { CertificationSession } from '../entities/CertificationSession';

export interface ReportGeneratorPort {
  generatePDF(session: CertificationSession): Promise<Buffer>;
}
