export type FieldRule = 'R' | 'O' | 'N/A' | 'OI';

export class FieldRequirementValueObject {
  constructor(private readonly value: FieldRule) {
    this.validate();
  }

  private validate(): void {
    if (!['R', 'O', 'N/A', 'OI'].includes(this.value)) {
      throw new Error(`Regla de campo invalida: ${this.value}`);
    }
  }

  getValue(): FieldRule {
    return this.value;
  }

  isRequired(): boolean {
    return this.value === 'R';
  }

  isOptional(): boolean {
    return this.value === 'O' || this.value === 'OI';
  }

  isNotApplicable(): boolean {
    return this.value === 'N/A';
  }

  evaluate(fieldFound: boolean, fieldValue?: string): boolean {
    switch (this.value) {
      case 'R':
        return fieldFound && fieldValue !== undefined && fieldValue.trim() !== '';
      case 'O':
      case 'OI':
      case 'N/A':
        return true;
    }
  }

  getDisplayName(): string {
    const names: Record<FieldRule, string> = {
      'R': 'Requerido',
      'O': 'Opcional',
      'N/A': 'No Aplica',
      'OI': 'Opcional (si aplica)',
    };
    return names[this.value];
  }
}
