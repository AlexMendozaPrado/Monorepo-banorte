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
   * Categoría tipada de la falla — propagada al UI para que el panel
   * expandible (Fase F.2) pueda mostrar la razón estructurada.
   * Ejemplos: `missing`, `forbidden_chars`, `invalid_value`,
   * `cross_field`, `prohibited`.
   */
  failReason?: string;
  /**
   * Mensaje libre con el detalle del fallo. Pareja del `failReason`,
   * destinado al panel expandible.
   */
  failDetail?: string;
}
