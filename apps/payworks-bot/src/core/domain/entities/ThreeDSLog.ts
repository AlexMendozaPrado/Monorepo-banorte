export interface ThreeDSLog {
  timestamp: Date;
  /** Folio / Reference3D identifying the 3DS transaction. */
  folio: string;
  /** Flattened key/value pairs extracted from the 3DS block. */
  fields: Map<string, string>;
}

/**
 * Entity representing one 3D Secure 2 transaction logged by the
 * Payworks 3DS service (v1.4).
 *
 * Unlike the servlet flow (request/response split), the 3DS log groups
 * the pre-3DS inputs and the post-3DS outputs in a single block keyed
 * by `FOLIO DE TRANSACCION` (a.k.a. `Reference3D`).
 */
export class ThreeDSLogEntity implements ThreeDSLog {
  constructor(
    public readonly timestamp: Date,
    public readonly folio: string,
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
