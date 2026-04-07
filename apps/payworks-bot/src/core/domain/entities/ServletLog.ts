export interface ServletLog {
  timestamp: Date;
  type: 'REQUEST' | 'RESPONSE';
  ipAddress: string;
  fields: Map<string, string>;
}

export class ServletLogEntity implements ServletLog {
  constructor(
    public readonly timestamp: Date,
    public readonly type: 'REQUEST' | 'RESPONSE',
    public readonly ipAddress: string,
    public readonly fields: Map<string, string>,
  ) {}

  getField(name: string): string | undefined {
    return this.fields.get(name);
  }

  hasField(name: string): boolean {
    return this.fields.has(name) && this.fields.get(name)!.trim() !== '';
  }

  getAllFieldNames(): string[] {
    return Array.from(this.fields.keys());
  }

  getFieldCount(): number {
    return this.fields.size;
  }
}
