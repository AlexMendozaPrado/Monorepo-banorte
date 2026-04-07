export interface ProsaLog {
  timestamp: Date;
  type: 'REQUEST' | 'RESPONSE';
  messageType: string;
  autorizadorAddress: string;
  campos: Map<number, string>;
}

export class ProsaLogEntity implements ProsaLog {
  constructor(
    public readonly timestamp: Date,
    public readonly type: 'REQUEST' | 'RESPONSE',
    public readonly messageType: string,
    public readonly autorizadorAddress: string,
    public readonly campos: Map<number, string>,
  ) {}

  getCampo(n: number): string | undefined {
    return this.campos.get(n);
  }

  getReferencia(): string | undefined {
    return this.campos.get(37);
  }

  getAuthCode(): string | undefined {
    return this.campos.get(38);
  }

  getResultCode(): string | undefined {
    return this.campos.get(39);
  }

  getMonto(): string | undefined {
    return this.campos.get(4);
  }

  getTerminalId(): string | undefined {
    return this.campos.get(41);
  }

  getCampoCount(): number {
    return this.campos.size;
  }
}
