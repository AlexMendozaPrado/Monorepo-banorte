import { MandatoryFieldsPort } from '@/core/domain/ports/MandatoryFieldsPort';
import { IntegrationType } from '@/core/domain/value-objects/IntegrationType';
import { MandatoryFieldsMatrix } from '@/core/domain/value-objects/MandatoryFieldsMatrix';
import { FieldRule } from '@/core/domain/value-objects/FieldRequirement';

import ecommerceTradicional from '@/config/mandatory-fields/ecommerce-tradicional.json';

const MATRICES: Record<string, any> = {
  [IntegrationType.ECOMMERCE_TRADICIONAL]: ecommerceTradicional,
};

export class MandatoryFieldsConfig implements MandatoryFieldsPort {
  getMatrix(integrationType: IntegrationType): MandatoryFieldsMatrix {
    const config = MATRICES[integrationType];
    if (!config) {
      throw new Error(`No se encontro matriz de mandatorios para: ${integrationType}. Disponibles: ${Object.keys(MATRICES).join(', ')}`);
    }
    return config as MandatoryFieldsMatrix;
  }

  getFieldRule(integrationType: IntegrationType, transactionKey: string, fieldName: string): FieldRule {
    const matrix = this.getMatrix(integrationType);
    const fieldRules = matrix.servlet[fieldName];
    if (!fieldRules) return 'N/A';
    return (fieldRules as Record<string, FieldRule>)[transactionKey] || 'N/A';
  }

  getServletFieldNames(integrationType: IntegrationType): string[] {
    const matrix = this.getMatrix(integrationType);
    return Object.keys(matrix.servlet);
  }
}
