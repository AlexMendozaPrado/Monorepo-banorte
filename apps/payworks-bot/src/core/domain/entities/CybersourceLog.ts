export interface CybersourceLog {
  timestamp: Date;
  type: 'REQUEST' | 'RESPONSE';
  /** Raw key/value pairs found inside a single Cybersource log block. */
  fields: Map<string, string>;
}

/**
 * Entity representing one side (request or response) of a Cybersource
 * interaction logged by Payworks.
 *
 * Cybersource logs use `[INFO]`/`[WARN]` prefixes with `name: value`
 * lines (no brackets around the value) and are grouped under a
 * `VARIABLES EN ENVÍO` or `VARIABLES DE RETORNO` header. Each block is
 * identified by `OrderId` (a.k.a. `MerchantReferenceCode`).
 */
export class CybersourceLogEntity implements CybersourceLog {
  constructor(
    public readonly timestamp: Date,
    public readonly type: 'REQUEST' | 'RESPONSE',
    public readonly fields: Map<string, string>,
  ) {}

  getField(name: string): string | undefined {
    return this.fields.get(name);
  }

  hasField(name: string): boolean {
    const v = this.fields.get(name);
    return v !== undefined && v.trim() !== '';
  }

  getAllFieldNames(): string[] {
    return Array.from(this.fields.keys());
  }

  getFieldCount(): number {
    return this.fields.size;
  }
}
