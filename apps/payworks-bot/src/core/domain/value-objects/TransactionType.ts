export enum TransactionType {
  AUTH = 'AUTH',
  VOID = 'VOID',
  REFUND = 'REFUND',
  PREAUTH = 'PREAUTH',
  POSTAUTH = 'POSTAUTH',
  VERIFY = 'VERIFY',
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
    };
    return cmds[this.value];
  }

  getProsaMessagePair(): ProsaMessagePair {
    switch (this.value) {
      case TransactionType.AUTH:
      case TransactionType.PREAUTH:
        return { request: '0200', response: '0210' };
      case TransactionType.POSTAUTH:
      case TransactionType.VOID:
      case TransactionType.REFUND:
        return { request: '0220', response: '0230' };
      case TransactionType.VERIFY:
        return { request: '0200', response: '0210' };
    }
  }

  static fromCmdTrans(cmd: string): TransactionTypeValueObject {
    const map: Record<string, TransactionType> = {
      VTA: TransactionType.AUTH,
      AUTH: TransactionType.AUTH,
      CAN: TransactionType.VOID,
      VOID: TransactionType.VOID,
      DEV: TransactionType.REFUND,
      REFUND: TransactionType.REFUND,
      PRE: TransactionType.PREAUTH,
      PREAUTH: TransactionType.PREAUTH,
      POS: TransactionType.POSTAUTH,
      POSTAUTH: TransactionType.POSTAUTH,
      VER: TransactionType.VERIFY,
      VERIFY: TransactionType.VERIFY,
    };
    const type = map[cmd.toUpperCase()];
    if (!type) throw new Error(`CMD_TRANS desconocido: ${cmd}`);
    return new TransactionTypeValueObject(type);
  }
}
