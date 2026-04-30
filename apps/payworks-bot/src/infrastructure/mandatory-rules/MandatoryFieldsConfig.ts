import { ExtraSection, MandatoryFieldsPort } from '@/core/domain/ports/MandatoryFieldsPort';
import { IntegrationType } from '@/core/domain/value-objects/IntegrationType';
import {
  FieldSpec,
  MandatoryFieldsMatrix,
  TransactionKey,
} from '@/core/domain/value-objects/MandatoryFieldsMatrix';
import { FieldRule } from '@/core/domain/value-objects/FieldRequirement';

import ecommerceTradicional from '@/config/mandatory-fields/ecommerce-tradicional.json';
import moto from '@/config/mandatory-fields/moto.json';
import cargosPeriodicosPost from '@/config/mandatory-fields/cargos-periodicos-post.json';
import ventanaComercioElectronico from '@/config/mandatory-fields/ventana-comercio-electronico.json';
import agregadoresComercioElectronico from '@/config/mandatory-fields/agregadores-comercio-electronico.json';
import agregadoresCargosPeriodicos from '@/config/mandatory-fields/agregadores-cargos-periodicos.json';
import apiPw2Seguro from '@/config/mandatory-fields/api-pw2-seguro.json';
import interredesRemoto from '@/config/mandatory-fields/interredes-remoto.json';
import agregadoresIntegradoresTp from '@/config/mandatory-fields/agregadores-integradores-tp.json';

/**
 * Registry of product → matrix. Keys are logName-indexed FieldSpec maps
 * (see `MandatoryFieldsMatrix.ts`). All 8 official products are registered.
 *
 * Transversal layer matrices (3DS, Cybersource, AN5822) live under
 * `src/config/mandatory-fields/layer-*.json` and are loaded separately
 * in F8 when the full flow is wired end-to-end.
 */
const MATRICES: Record<IntegrationType, MandatoryFieldsMatrix> = {
  [IntegrationType.ECOMMERCE_TRADICIONAL]: ecommerceTradicional as unknown as MandatoryFieldsMatrix,
  [IntegrationType.MOTO]: moto as unknown as MandatoryFieldsMatrix,
  [IntegrationType.CARGOS_PERIODICOS_POST]: cargosPeriodicosPost as unknown as MandatoryFieldsMatrix,
  [IntegrationType.VENTANA_COMERCIO_ELECTRONICO]: ventanaComercioElectronico as unknown as MandatoryFieldsMatrix,
  [IntegrationType.AGREGADORES_COMERCIO_ELECTRONICO]: agregadoresComercioElectronico as unknown as MandatoryFieldsMatrix,
  [IntegrationType.AGREGADORES_CARGOS_PERIODICOS]: agregadoresCargosPeriodicos as unknown as MandatoryFieldsMatrix,
  [IntegrationType.API_PW2_SEGURO]: apiPw2Seguro as unknown as MandatoryFieldsMatrix,
  [IntegrationType.INTERREDES_REMOTO]: interredesRemoto as unknown as MandatoryFieldsMatrix,
  [IntegrationType.AGREGADORES_INTEGRADORES_TP]: agregadoresIntegradoresTp as unknown as MandatoryFieldsMatrix,
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
