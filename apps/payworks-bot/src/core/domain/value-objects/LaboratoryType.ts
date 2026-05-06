/**
 * Identificador del laboratorio que ejecuta la certificación. Determina la
 * nomenclatura del folio oficial (NOMENCLATURAS FOLIOS LABS, abr-2026):
 *
 *   CAV / VIP            → folios `VIP-…` y `VIPR-…` (Comercios Alto Valor)
 *   ECOMM                → folios estándar TNP (`CE-…`, `CE3DS-…`, `CYB3D-…`, etc.)
 *   AGREGADORES_AGREGADOR → sufijos `A-CE`, `A-CP`, `A-CTLSSINTSEG`, `A-INTERSEG`
 *   AGREGADORES_INTEGRADOR → sufijos `I-CE`, `I-CP`, `I-CTLSSINTSEG`, `I-INTERSEG`
 *
 * Es input del usuario al iniciar una certificación (no se infiere). Cada
 * laboratorio tiene su propia secuencia de folios; mezclarlos rompe la
 * trazabilidad operativa.
 */
export enum LaboratoryType {
  CAV = 'CAV',
  ECOMM = 'ECOMM',
  AGREGADORES_AGREGADOR = 'AGREGADORES_AGREGADOR',
  AGREGADORES_INTEGRADOR = 'AGREGADORES_INTEGRADOR',
}

export interface LaboratoryFolioParams {
  /** True para laboratorio CAV (folios VIP-…). False para ECOMM/Agregadores. */
  isVIP: boolean;
  /**
   * Modificador opcional que el FolioGenerator usa para distinguir variantes
   * dentro de un mismo `integrationType`. Para AGREGADORES_INTEGRADOR vale
   * `'integrador'`, lo que fuerza el match a las entradas `VIP-I-…` o `I-…`
   * en folio-nomenclatures.json. Undefined para CAV/ECOMM/AGREGADOR.
   */
  modifier?: string;
}

export class LaboratoryTypeValueObject {
  constructor(private readonly value: LaboratoryType) {
    if (!Object.values(LaboratoryType).includes(value)) {
      throw new Error(`Tipo de laboratorio inválido: ${value}`);
    }
  }

  getValue(): LaboratoryType {
    return this.value;
  }

  getDisplayName(): string {
    switch (this.value) {
      case LaboratoryType.CAV:
        return 'CAV / VIP (Comercios Alto Valor)';
      case LaboratoryType.ECOMM:
        return 'ECOMM (TNP estándar)';
      case LaboratoryType.AGREGADORES_AGREGADOR:
        return 'Agregadores — Agregador';
      case LaboratoryType.AGREGADORES_INTEGRADOR:
        return 'Agregadores — Integrador';
    }
  }

  /**
   * Derivación a parámetros del FolioGenerator.
   *
   * - CAV → `isVIP=true`, sin modifier (los matches VIP-* se detectan por
   *   `isVIP=true` en el config; el modifier `integrador` solo aplica a
   *   AGREGADORES_INTEGRADOR cuando el lab es CAV combinado con producto
   *   integrador, lo que el VO no modela hoy).
   * - ECOMM → `isVIP=false`, sin modifier.
   * - AGREGADORES_AGREGADOR → `isVIP=false`, sin modifier.
   * - AGREGADORES_INTEGRADOR → `isVIP=false`, `modifier='integrador'`.
   */
  toFolioParams(): LaboratoryFolioParams {
    switch (this.value) {
      case LaboratoryType.CAV:
        return { isVIP: true };
      case LaboratoryType.ECOMM:
        return { isVIP: false };
      case LaboratoryType.AGREGADORES_AGREGADOR:
        return { isVIP: false };
      case LaboratoryType.AGREGADORES_INTEGRADOR:
        return { isVIP: false, modifier: 'integrador' };
    }
  }
}
