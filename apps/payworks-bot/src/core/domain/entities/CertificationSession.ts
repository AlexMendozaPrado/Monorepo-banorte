import { IntegrationType } from '../value-objects/IntegrationType';
import { ValidationVerdict } from '../value-objects/ValidationVerdict';
import { ValidationResult } from './ValidationResult';

export type OperationMode = 'semi' | 'auto';

export interface CertificationSession {
  id: string;
  merchantName: string;
  integrationType: IntegrationType;
  operationMode: OperationMode;
  results: ValidationResult[];
  createdAt: Date;
  coordinadorCertificacion?: string;
  responsableNombre?: string;
  responsableEmail?: string;
  responsableTelefono?: string;
}

export class CertificationSessionEntity implements CertificationSession {
  constructor(
    public readonly id: string,
    public readonly merchantName: string,
    public readonly integrationType: IntegrationType,
    public readonly operationMode: OperationMode,
    public readonly results: ValidationResult[],
    public readonly createdAt: Date,
    public readonly coordinadorCertificacion?: string,
    public readonly responsableNombre?: string,
    public readonly responsableEmail?: string,
    public readonly responsableTelefono?: string,
  ) {
    this.validateEntity();
  }

  private validateEntity(): void {
    if (!this.id || this.id.trim() === '') {
      throw new Error('El ID de la sesion no puede estar vacio');
    }
    if (!this.merchantName || this.merchantName.trim() === '') {
      throw new Error('El nombre del comercio no puede estar vacio');
    }
  }

  getVerdict(): ValidationVerdict {
    if (this.results.length === 0) return ValidationVerdict.PENDIENTE;
    const hasRejected = this.results.some(r => r.verdict === ValidationVerdict.RECHAZADO);
    return hasRejected ? ValidationVerdict.RECHAZADO : ValidationVerdict.APROBADO;
  }

  getApprovedCount(): number {
    return this.results.filter(r => r.verdict === ValidationVerdict.APROBADO).length;
  }

  getRejectedCount(): number {
    return this.results.filter(r => r.verdict === ValidationVerdict.RECHAZADO).length;
  }

  getTotalTransactions(): number {
    return this.results.length;
  }

  isFullyApproved(): boolean {
    return this.results.length > 0 && this.getRejectedCount() === 0;
  }

  getApprovalRate(): number {
    if (this.results.length === 0) return 0;
    return (this.getApprovedCount() / this.results.length) * 100;
  }
}
