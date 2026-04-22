import { CardBrand } from './CardBrand';
import { IntegrationType } from './IntegrationType';
import { TransactionType } from './TransactionType';
import { FieldSpec } from './MandatoryFieldsMatrix';

/**
 * Flujos del mandato AN5822 MasterCard (CIT/MIT sobre credenciales
 * almacenadas). Modelados como 3 trayectorias más un marcador de
 * no-aplicable para VISA/AMEX, productos Tarjeta Presente, o tipos
 * de transacción fuera del alcance del mandato (VOID/REVERSAL).
 *
 * Fuente: Manual Ecommerce Tradicional v2.5 §11-13, MOTO v1.5 §9-11,
 * Cargos Periódicos Post v2.1 §10-12, Agregadores v2.6.4 §12-14.
 */
export enum An5822Flow {
  FIRST_CIT = 'firstCIT',
  SUBSEQ_CIT = 'subseqCIT',
  SUBSEQ_MIT = 'subseqMIT',
  NOT_APPLICABLE = 'N/A',
}

/**
 * Valores fijos esperados por flujo+producto en `PAYMENT_IND`, `AMOUNT_TYPE`,
 * `PAYMENT_INFO` y (solo Cargos Periódicos) `COF`. `COF = null` indica que el
 * campo NO debe venir en ese flujo/producto.
 */
export interface An5822ExpectedValues {
  PAYMENT_IND: string;
  AMOUNT_TYPE: string[];
  PAYMENT_INFO: string;
  COF: string | null;
}

/** Mapeo producto → flujo → valores esperados. */
export type An5822ProductMapping = {
  [product in IntegrationType]?: {
    [flow in Exclude<An5822Flow, An5822Flow.NOT_APPLICABLE>]?: An5822ExpectedValues;
  };
};

/**
 * Shape del archivo `config/mandatory-fields/layer-an5822.json` después de
 * parsearlo. Separado de `MandatoryFieldsMatrix` porque la capa AN5822 es
 * transversal (MC-only) con su propio modelo por flujo.
 */
export interface LayerAn5822Config {
  _meta: {
    note?: string;
    sources?: string[];
    productMapping: An5822ProductMapping;
  };
  integrationType?: string;
  manualVersion: string;
  manualDate?: string;
  displayName?: string;
  an5822: {
    firstCIT: Record<string, FieldSpec>;
    subseqCIT: Record<string, FieldSpec>;
    subseqMIT: Record<string, FieldSpec>;
  };
}

/**
 * Campos observados en el log servlet relevantes para AN5822. El
 * orquestador los extrae del `ServletLogEntity` y los pasa al detector y
 * validator.
 */
export interface An5822ObservedFields {
  PAYMENT_IND?: string;
  AMOUNT_TYPE?: string;
  PAYMENT_INFO?: string;
  COF?: string;
}

/**
 * Productos que NO están cubiertos por AN5822 (Tarjeta Presente). Se
 * mantienen aquí para que el detector tenga una lista negra estable.
 */
export const AN5822_EXCLUDED_PRODUCTS: ReadonlySet<IntegrationType> = new Set([
  IntegrationType.API_PW2_SEGURO,
  IntegrationType.INTERREDES_REMOTO,
]);

/**
 * Tipos de transacción que NO activan AN5822 aún en MC (típicamente
 * cancelaciones/reversos que no generan nuevas credenciales).
 */
export const AN5822_EXCLUDED_TRANSACTIONS: ReadonlySet<TransactionType> = new Set([
  TransactionType.VOID,
  TransactionType.REVERSAL,
]);

/**
 * Conveniencia: marcas cubiertas por AN5822. El mandato es MasterCard-only.
 */
export const AN5822_APPLICABLE_BRANDS: ReadonlySet<CardBrand> = new Set([
  CardBrand.MASTERCARD,
]);
