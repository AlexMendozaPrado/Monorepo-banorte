import { IntegrationType } from '../value-objects/IntegrationType';
import { MandatoryFieldsMatrix } from '../value-objects/MandatoryFieldsMatrix';
import { FieldRule } from '../value-objects/FieldRequirement';

export interface MandatoryFieldsPort {
  getMatrix(integrationType: IntegrationType): MandatoryFieldsMatrix;
  getFieldRule(integrationType: IntegrationType, transactionKey: string, fieldName: string): FieldRule;
  getServletFieldNames(integrationType: IntegrationType): string[];
}
