export enum TransactionType {
  AUTH = 'AUTH',
  VOID = 'VOID',
  REFUND = 'REFUND',
  PREAUTH = 'PREAUTH',
  POSTAUTH = 'POSTAUTH',
  VERIFY = 'VERIFY',
  REVERSAL = 'REVERSAL',
  CASHBACK = 'CASHBACK',
  REAUTH = 'REAUTH',
}

export interface ProsaMessagePair {
  request: string;
  response: string;
}

export class TransactionTypeValueObject {
  constructor(private readonly value: TransactionType) {
    this.validate();
  }

  private validate(): void {
    if (!Object.values(TransactionType).includes(this.value)) {
      throw new Error(`Tipo de transaccion invalido: ${this.value}`);
    }
  }

  getValue(): TransactionType {
    return this.value;
  }

  getDisplayName(): string {
    const names: Record<TransactionType, string> = {
      [TransactionType.AUTH]: 'Venta',
      [TransactionType.VOID]: 'Cancelacion',
      [TransactionType.REFUND]: 'Devolucion',
      [TransactionType.PREAUTH]: 'Preautorizacion',
      [TransactionType.POSTAUTH]: 'Postautorizacion',
      [TransactionType.VERIFY]: 'Verificacion',
      [TransactionType.REVERSAL]: 'Reversa',
      [TransactionType.CASHBACK]: 'Cashback',
      [TransactionType.REAUTH]: 'Reautorizacion',
    };
    return names[this.value];
  }

  getCmdTrans(): string {
    const cmds: Record<TransactionType, string> = {
      [TransactionType.AUTH]: 'VTA',
      [TransactionType.VOID]: 'CAN',
      [TransactionType.REFUND]: 'DEV',
      [TransactionType.PREAUTH]: 'PRE',
      [TransactionType.POSTAUTH]: 'POS',
      [TransactionType.VERIFY]: 'VER',
      [TransactionType.REVERSAL]: 'REV',
      [TransactionType.CASHBACK]: 'CSH',
      [TransactionType.REAUTH]: 'REA',
    };
    return cmds[this.value];
  }

  getProsaMessagePair(): ProsaMessagePair {
    switch (this.value) {
      case TransactionType.AUTH:
      case TransactionType.PREAUTH:
      case TransactionType.VERIFY:
      case TransactionType.REAUTH:
      case TransactionType.CASHBACK:
        return { request: '0200', response: '0210' };
      case TransactionType.POSTAUTH:
      case TransactionType.VOID:
      case TransactionType.REFUND:
      case TransactionType.REVERSAL:
        return { request: '0220', response: '0230' };
    }
  }

  isTarjetaPresenteOnly(): boolean {
    return this.value === TransactionType.CASHBACK || this.value === TransactionType.REAUTH;
  }

  static fromCmdTrans(cmd: string): TransactionTypeValueObject {
    const map: Record<string, TransactionType> = {
      VTA: TransactionType.AUTH,
      VENTA: TransactionType.AUTH,
      AUTH: TransactionType.AUTH,
      CAN: TransactionType.VOID,
      CANCELACION: TransactionType.VOID,
      VOID: TransactionType.VOID,
      DEV: TransactionType.REFUND,
      DEVOLUCION: TransactionType.REFUND,
      REFUND: TransactionType.REFUND,
      PRE: TransactionType.PREAUTH,
      PREAUTORIZACION: TransactionType.PREAUTH,
      PREAUTH: TransactionType.PREAUTH,
      POS: TransactionType.POSTAUTH,
      POSTAUTORIZACION: TransactionType.POSTAUTH,
      POSTAUTH: TransactionType.POSTAUTH,
      VER: TransactionType.VERIFY,
      VERIFICACION: TransactionType.VERIFY,
      VERIFY: TransactionType.VERIFY,
      REV: TransactionType.REVERSAL,
      REVERSA: TransactionType.REVERSAL,
      REVERSAL: TransactionType.REVERSAL,
      CSH: TransactionType.CASHBACK,
      CASHBACK: TransactionType.CASHBACK,
      REA: TransactionType.REAUTH,
      REAUTORIZACION: TransactionType.REAUTH,
      REAUTH: TransactionType.REAUTH,
    };
    const type = map[cmd.toUpperCase()];
    if (!type) throw new Error(`CMD_TRANS desconocido: ${cmd}`);
    return new TransactionTypeValueObject(type);
  }
}
