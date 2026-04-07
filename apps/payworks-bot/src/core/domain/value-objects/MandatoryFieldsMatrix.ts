import { IntegrationType } from './IntegrationType';
import { FieldRule } from './FieldRequirement';

export type TransactionKey =
  | 'VENTA_VISA' | 'VENTA_MC'
  | 'CANCELACION_VISA' | 'CANCELACION_MC'
  | 'DEVOLUCION_VISA' | 'DEVOLUCION_MC'
  | 'PREAUTH_VISA' | 'PREAUTH_MC'
  | 'POSTAUTH_VISA' | 'POSTAUTH_MC'
  | 'VERIFY_VISA' | 'VERIFY_MC';

export interface MandatoryFieldsMatrix {
  integrationType: IntegrationType;
  servlet: Record<string, Record<TransactionKey, FieldRule>>;
  threeds?: Record<string, Record<string, FieldRule>>;
  cybersource?: Record<string, Record<TransactionKey, FieldRule>>;
  agregador?: Record<string, Record<TransactionKey, FieldRule>>;
}
