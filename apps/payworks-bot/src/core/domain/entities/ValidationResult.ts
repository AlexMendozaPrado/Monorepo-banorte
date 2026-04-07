import { TransactionType } from '../value-objects/TransactionType';
import { CardBrand } from '../value-objects/CardBrand';
import { ValidationVerdict } from '../value-objects/ValidationVerdict';
import { FieldRule } from '../value-objects/FieldRequirement';

export interface FieldValidationResult {
  field: string;
  rule: FieldRule;
  found: boolean;
  value: string | undefined;
  verdict: 'PASS' | 'FAIL';
  source: 'SERVLET' | 'PROSA' | 'BD';
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
