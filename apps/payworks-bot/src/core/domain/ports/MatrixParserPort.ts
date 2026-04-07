import { TransactionType } from '../value-objects/TransactionType';
import { CardBrand } from '../value-objects/CardBrand';

export interface MatrixTransaction {
  referencia: string;
  numeroControl: string;
  tipoTransaccion: TransactionType;
  cardBrand: CardBrand;
  monto: number;
  fecha: string;
  hora: string;
}

export interface MatrixParserPort {
  parse(buffer: Buffer): Promise<MatrixTransaction[]>;
}
