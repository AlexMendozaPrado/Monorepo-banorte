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
  /** Validation layer: SERVLET | THREEDS | CYBERSOURCE | AGREGADOR | EMV | AN5822 */
  layer?: string;
  /** Razón categórica de la falla (ej. 'missing', 'invalid_format', 'invalid_value'). */
  failReason?: string;
  /** Mensaje legible compuesto por el dominio describiendo la falla específica. */
  failDetail?: string;
}
