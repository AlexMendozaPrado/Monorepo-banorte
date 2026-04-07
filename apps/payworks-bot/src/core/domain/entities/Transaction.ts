import { TransactionType } from '../value-objects/TransactionType';
import { CardBrand } from '../value-objects/CardBrand';

export interface Transaction {
  numero: string;
  nombre: string;
  referencia: string;
  numeroControl: string;
  tipoTrans: TransactionType;
  modo: string;
  monto: number;
  codigoErrorPayw: string;
  codResultAut: string;
  textoAprobacion: string;
  paywEntrada: string;
  paywAutorizador: string;
  fechaRecepCte: Date;
  horaRecepCte: string;
  cardBrand: CardBrand;
}

export class TransactionEntity implements Transaction {
  constructor(
    public readonly numero: string,
    public readonly nombre: string,
    public readonly referencia: string,
    public readonly numeroControl: string,
    public readonly tipoTrans: TransactionType,
    public readonly modo: string,
    public readonly monto: number,
    public readonly codigoErrorPayw: string,
    public readonly codResultAut: string,
    public readonly textoAprobacion: string,
    public readonly paywEntrada: string,
    public readonly paywAutorizador: string,
    public readonly fechaRecepCte: Date,
    public readonly horaRecepCte: string,
    public readonly cardBrand: CardBrand,
  ) {
    this.validateEntity();
  }

  private validateEntity(): void {
    if (!this.referencia || this.referencia.trim() === '') {
      throw new Error('La referencia de la transaccion no puede estar vacia');
    }
    if (!this.numeroControl || this.numeroControl.trim() === '') {
      throw new Error('El numero de control no puede estar vacio');
    }
  }

  isApproved(): boolean {
    return this.codigoErrorPayw === '000' && this.codResultAut === '00';
  }

  getServletServer(): string {
    return this.paywEntrada;
  }

  getProsaServer(): string {
    return this.paywAutorizador;
  }

  getTransactionKey(): string {
    const typeMap: Record<string, string> = {
      [TransactionType.AUTH]: 'VENTA',
      [TransactionType.VOID]: 'CANCELACION',
      [TransactionType.REFUND]: 'DEVOLUCION',
      [TransactionType.PREAUTH]: 'PREAUTH',
      [TransactionType.POSTAUTH]: 'POSTAUTH',
      [TransactionType.VERIFY]: 'VERIFY',
    };
    const typeName = typeMap[this.tipoTrans] || this.tipoTrans;
    return `${typeName}_${this.cardBrand}`;
  }
}
