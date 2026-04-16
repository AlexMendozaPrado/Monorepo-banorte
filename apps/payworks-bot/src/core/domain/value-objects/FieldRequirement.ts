export type FieldRule = 'R' | 'O' | 'N/A' | 'OI';

const FORBIDDEN_CHARS_REGEX = /[<>|\\{}[\]"*;:#$%&()=éúóü?+'\/]/;

export interface EvaluationResult {
  passes: boolean;
  reason?: 'missing' | 'empty' | 'forbidden_chars';
  forbiddenChars?: string;
}

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
    return this.evaluateDetailed(fieldFound, fieldValue).passes;
  }

  evaluateDetailed(fieldFound: boolean, fieldValue?: string): EvaluationResult {
    if (this.value === 'N/A') return { passes: true };

    if (this.value === 'R') {
      if (!fieldFound) return { passes: false, reason: 'missing' };
      if (fieldValue === undefined || fieldValue.trim() === '') return { passes: false, reason: 'empty' };
    }

    if (fieldFound && fieldValue && FORBIDDEN_CHARS_REGEX.test(fieldValue)) {
      const found = fieldValue.match(new RegExp(FORBIDDEN_CHARS_REGEX.source, 'g'));
      return { passes: false, reason: 'forbidden_chars', forbiddenChars: [...new Set(found)].join('') };
    }

    if (this.value === 'O' || this.value === 'OI') return { passes: true };

    return { passes: true };
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

  static hasForbiddenChars(value: string): boolean {
    return FORBIDDEN_CHARS_REGEX.test(value);
  }

  static getForbiddenCharsPattern(): RegExp {
    return FORBIDDEN_CHARS_REGEX;
  }
}
