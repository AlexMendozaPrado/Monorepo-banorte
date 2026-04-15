import { ExtraSection, MandatoryFieldsPort } from '@/core/domain/ports/MandatoryFieldsPort';
import { IntegrationType } from '@/core/domain/value-objects/IntegrationType';
import {
  FieldSpec,
  MandatoryFieldsMatrix,
  TransactionKey,
} from '@/core/domain/value-objects/MandatoryFieldsMatrix';
import { FieldRule } from '@/core/domain/value-objects/FieldRequirement';

import ecommerceTradicional from '@/config/mandatory-fields/ecommerce-tradicional.json';

/**
 * Registry of product → matrix. Keys are logName-indexed FieldSpec maps
 * (see `MandatoryFieldsMatrix.ts`).
 *
 * NOTE (F3): only ECOMMERCE_TRADICIONAL is registered with the new schema.
 * F4 will add the remaining 7 products and the transversal 3DS / Cybersource
 * / AN5822 layer JSONs and wire them in here.
 */
const MATRICES: Partial<Record<IntegrationType, MandatoryFieldsMatrix>> = {
  [IntegrationType.ECOMMERCE_TRADICIONAL]: ecommerceTradicional as unknown as MandatoryFieldsMatrix,
};

function isMetaKey(key: string): boolean {
  return key.startsWith('_');
}

export class MandatoryFieldsConfig implements MandatoryFieldsPort {
  getMatrix(integrationType: IntegrationType): MandatoryFieldsMatrix {
    const config = MATRICES[integrationType];
    if (!config) {
      const available = Object.keys(MATRICES).join(', ');
      throw new Error(
        `No se encontró matriz de mandatorios para: ${integrationType}. Disponibles: ${available}`,
      );
    }
    return config;
  }

  getServletLogNames(integrationType: IntegrationType): string[] {
    const matrix = this.getMatrix(integrationType);
    return Object.keys(matrix.servlet).filter(k => !isMetaKey(k));
  }

  getServletFieldSpec(
    integrationType: IntegrationType,
    logName: string,
  ): FieldSpec | undefined {
    const matrix = this.getMatrix(integrationType);
    return matrix.servlet[logName];
  }

  getServletFieldRule(
    integrationType: IntegrationType,
    transactionKey: TransactionKey,
    logName: string,
  ): FieldRule {
    const spec = this.getServletFieldSpec(integrationType, logName);
    if (!spec) return 'N/A';
    return spec.rules[transactionKey] ?? 'N/A';
  }

  hasExtraSection(integrationType: IntegrationType, section: ExtraSection): boolean {
    const matrix = this.getMatrix(integrationType);
    const block = matrix[section];
    if (!block) return false;
    return Object.keys(block).some(k => !isMetaKey(k));
  }

  getExtraLogNames(integrationType: IntegrationType, section: ExtraSection): string[] {
    const matrix = this.getMatrix(integrationType);
    const block = matrix[section];
    if (!block) return [];
    return Object.keys(block).filter(k => !isMetaKey(k));
  }

  getExtraFieldSpec(
    integrationType: IntegrationType,
    section: ExtraSection,
    logName: string,
  ): FieldSpec | undefined {
    const matrix = this.getMatrix(integrationType);
    const block = matrix[section];
    return block?.[logName];
  }

  getExtraFieldRule(
    integrationType: IntegrationType,
    section: ExtraSection,
    transactionKey: TransactionKey,
    logName: string,
  ): FieldRule {
    const spec = this.getExtraFieldSpec(integrationType, section, logName);
    if (!spec) return 'N/A';
    return spec.rules[transactionKey] ?? 'N/A';
  }
}
