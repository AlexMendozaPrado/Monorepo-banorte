import { IntegrationType } from '../value-objects/IntegrationType';
import { LaboratoryType } from '../value-objects/LaboratoryType';
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
  lenguaje?: string;
  versionAplicacion?: string;
  urlSubdominio?: string;
  /**
   * Folio oficial de certificación generado a partir de las nomenclaturas
   * NOMENCLATURAS FOLIOS LABS del equipo Banorte. Formato típico
   * `CE3DS-0003652_9885405`. `undefined` cuando la nomenclatura está
   * pendiente del equipo (e.g. Tarjeta Presente estándar) — en ese caso el
   * generador devuelve un placeholder `PENDIENTE-...` que sí se persiste.
   */
  folio?: string;
  /**
   * Laboratorio que ejecutó la certificación. Determina el prefijo del
   * folio (CAV/VIP, ECOMM, Agregadores agregador/integrador). Optional
   * para retrocompatibilidad con sesiones creadas antes de la introducción
   * del selector (Fase C.4, may-2026).
   */
  laboratoryType?: LaboratoryType;
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
    public readonly lenguaje?: string,
    public readonly versionAplicacion?: string,
    public readonly urlSubdominio?: string,
    public readonly folio?: string,
    public readonly laboratoryType?: LaboratoryType,
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
