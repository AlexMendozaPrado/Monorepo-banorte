export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CertificationResponse {
  id: string;
  merchantName: string;
  integrationType: string;
  operationMode: string;
  verdict: string;
  totalTransactions: number;
  approvedCount: number;
  rejectedCount: number;
  approvalRate: number;
  results: TransactionResultResponse[];
  createdAt: string;
}

export interface TransactionResultResponse {
  transactionRef: string;
  transactionType: string;
  cardBrand: string;
  verdict: string;
  passedCount: number;
  failedCount: number;
  totalValidated: number;
  fieldResults: FieldResultResponse[];
}

export interface FieldResultResponse {
  field: string;
  manualName?: string;
  displayName?: string;
  rule: string;
  found: boolean;
  value: string | undefined;
  verdict: 'PASS' | 'FAIL';
  source: string;
  /** Validation layer: SERVLET | THREEDS | CYBERSOURCE | AGREGADOR | EMV | AN5822 | TOKENIZACION */
  layer?: string;
  /**
   * Razón categórica de la falla (ej. `missing`, `invalid_format`,
   * `invalid_value`, `forbidden_chars`, `cross_field`, `prohibited`).
   * Renderizada como pill en el panel expandible de RuleLine.
   */
  failReason?: string;
  /**
   * Mensaje libre compuesto por el dominio describiendo la falla
   * específica. Se muestra inline (truncado, con tooltip nativo en el
   * `title`) y completo en el panel expandible al hacer click.
   */
  failDetail?: string;
}
