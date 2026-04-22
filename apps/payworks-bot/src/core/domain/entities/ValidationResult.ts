import { TransactionType } from '../value-objects/TransactionType';
import { CardBrand } from '../value-objects/CardBrand';
import { ValidationVerdict } from '../value-objects/ValidationVerdict';
import { FieldRule } from '../value-objects/FieldRequirement';
import { ValidationLayer } from '../value-objects/ValidationLayer';

export interface FieldValidationResult {
  /** Name used when reading the log (keyed by `logName` in the new matrix). */
  field: string;
  /** Original Spanish name as it appears in the official manual (e.g. `ID_AFILIACION`). */
  manualName?: string;
  /** Human-readable label for the UI (e.g. `ID Afiliación`). */
  displayName?: string;
  rule: FieldRule;
  found: boolean;
  value: string | undefined;
  verdict: 'PASS' | 'FAIL';
  failReason?: string;
  failDetail?: string;
  source: 'SERVLET' | 'PROSA' | 'BD' | 'THREEDS' | 'CYBERSOURCE' | 'AN5822';
  /**
   * Validation layer this field belongs to. Used by the UI to group
   * per-layer results (Servlet / 3DS / Cybersource / Agregador / EMV / AN5822).
   */
  layer?: ValidationLayer;
}

export interface ValidationResult {
  transactionRef: string;
  transactionType: TransactionType;
  cardBrand: CardBrand;
  verdict: ValidationVerdict;
  fieldResults: FieldValidationResult[];
}

export class ValidationResultEntity implements ValidationResult {
  constructor(
    public readonly transactionRef: string,
    public readonly transactionType: TransactionType,
    public readonly cardBrand: CardBrand,
    public readonly fieldResults: FieldValidationResult[],
  ) {}

  get verdict(): ValidationVerdict {
    const hasFailures = this.fieldResults.some(f => f.verdict === 'FAIL');
    return hasFailures ? ValidationVerdict.RECHAZADO : ValidationVerdict.APROBADO;
  }

  getFailedFields(): FieldValidationResult[] {
    return this.fieldResults.filter(f => f.verdict === 'FAIL');
  }

  getPassedFields(): FieldValidationResult[] {
    return this.fieldResults.filter(f => f.verdict === 'PASS');
  }

  getPassedCount(): number {
    return this.getPassedFields().length;
  }

  getFailedCount(): number {
    return this.getFailedFields().length;
  }

  getTotalValidated(): number {
    return this.fieldResults.filter(f => f.rule !== 'N/A').length;
  }
}
