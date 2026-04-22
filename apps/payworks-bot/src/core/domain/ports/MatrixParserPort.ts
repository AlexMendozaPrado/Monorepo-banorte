import { TransactionType } from '../value-objects/TransactionType';
import { CardBrand } from '../value-objects/CardBrand';
import { An5822Flow } from '../value-objects/An5822Flow';

export interface MatrixTransaction {
  referencia: string;
  numeroControl: string;
  tipoTransaccion: TransactionType;
  cardBrand: CardBrand;
  monto: number;
  fecha: string;
  hora: string;
  /**
   * Flujo AN5822 declarado por el comercio en la columna `flujo_an5822`
   * de la matriz Excel. Semántica:
   *   - `undefined` → la matriz no trae la columna (retrocompatible).
   *     El motor recurrirá a la inferencia por `PAYMENT_INFO`.
   *   - `null` → la columna está presente pero el valor es vacío o `N/A`
   *     (el comercio declara explícitamente que la transacción no cae
   *     bajo AN5822; típico para VISA/AMEX o VOID/REVERSAL).
   *   - `An5822Flow` (firstCIT / subseqCIT / subseqMIT / NOT_APPLICABLE)
   *     → declaración explícita, se usa con prioridad sobre la
   *     inferencia (regla cruzada C10 detecta inconsistencias).
   */
  flujoAn5822?: An5822Flow | null;
}

export interface MatrixParserPort {
  parse(buffer: Buffer): Promise<MatrixTransaction[]>;
}
