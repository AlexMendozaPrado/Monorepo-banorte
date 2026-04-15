import { ExtraSection, MandatoryFieldsPort } from '@/core/domain/ports/MandatoryFieldsPort';
import { IntegrationType } from '@/core/domain/value-objects/IntegrationType';
import { MandatoryFieldsMatrix } from '@/core/domain/value-objects/MandatoryFieldsMatrix';
import { FieldRule } from '@/core/domain/value-objects/FieldRequirement';

import ecommerceTradicional from '@/config/mandatory-fields/ecommerce-tradicional.json';
import ventanaComercios from '@/config/mandatory-fields/ventana-comercios.json';
import agregadoresEcomm from '@/config/mandatory-fields/agregadores-ecomm.json';
import agregadoresCargosAuto from '@/config/mandatory-fields/agregadores-cargos-auto.json';

// NOTE: F2 migration — JSONs still use old content and will be rewritten in F4
// against official manuals. MOTO / CARGOS_PERIODICOS_POST / API_PW2_SEGURO /
// INTERREDES_REMOTO remain unregistered until F4.
const MATRICES: Record<string, any> = {
  [IntegrationType.ECOMMERCE_TRADICIONAL]: ecommerceTradicional,
  [IntegrationType.VENTANA_COMERCIO_ELECTRONICO]: ventanaComercios,
  [IntegrationType.AGREGADORES_COMERCIO_ELECTRONICO]: agregadoresEcomm,
  [IntegrationType.AGREGADORES_CARGOS_PERIODICOS]: agregadoresCargosAuto,
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
    return Object.keys(matrix.servlet).filter(k => !k.startsWith('_'));
  }

  hasExtraSection(integrationType: IntegrationType, section: ExtraSection): boolean {
    const matrix = this.getMatrix(integrationType);
    return matrix[section] !== undefined && Object.keys(matrix[section] as object).length > 0;
  }

  getExtraFieldNames(integrationType: IntegrationType, section: ExtraSection): string[] {
    const matrix = this.getMatrix(integrationType);
    const block = matrix[section];
    if (!block) return [];
    return Object.keys(block).filter(k => !k.startsWith('_'));
  }

  getExtraFieldRule(
    integrationType: IntegrationType,
    section: ExtraSection,
    sectionKey: string,
    fieldName: string,
  ): FieldRule {
    const matrix = this.getMatrix(integrationType);
    const block = matrix[section];
    if (!block) return 'N/A';
    const fieldRules = (block as Record<string, Record<string, FieldRule>>)[fieldName];
    if (!fieldRules) return 'N/A';
    return fieldRules[sectionKey] || 'N/A';
  }
}
