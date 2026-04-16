import { FieldSpec } from './MandatoryFieldsMatrix';

export type FieldRule = 'R' | 'O' | 'N/A' | 'OI';

const FORBIDDEN_CHARS_REGEX = /[<>|\\{}[\]"*;:#$%&()=éúóü?+'\/]/;

export type FailReason =
  | 'missing'
  | 'empty'
  | 'forbidden_chars'
  | 'invalid_format'
  | 'invalid_value'
  | 'fixed_value_mismatch'
  | 'exceeds_max_length'
  | 'not_masked'
  | 'should_be_omitted';

export interface EvaluationResult {
  passes: boolean;
  reason?: FailReason;
  detail?: string;
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

  evaluate(fieldFound: boolean, fieldValue?: string, spec?: FieldSpec): boolean {
    return this.evaluateDetailed(fieldFound, fieldValue, spec).passes;
  }

  evaluateDetailed(fieldFound: boolean, fieldValue?: string, spec?: FieldSpec): EvaluationResult {
    if (this.value === 'N/A') return { passes: true };

    if (this.value === 'R') {
      if (!fieldFound) return { passes: false, reason: 'missing' };
      if (fieldValue === undefined || fieldValue.trim() === '') return { passes: false, reason: 'empty' };
    }

    if (!fieldFound) return { passes: true };

    const trimmed = (fieldValue ?? '').trim();

    if (spec?.omitIfEmpty && fieldFound && trimmed === '') {
      return { passes: false, reason: 'should_be_omitted', detail: 'Campo no debe enviarse vacío' };
    }

    if (!fieldValue || trimmed === '') return { passes: true };

    if (!spec?.mustBeMasked && FORBIDDEN_CHARS_REGEX.test(trimmed)) {
      const found = trimmed.match(new RegExp(FORBIDDEN_CHARS_REGEX.source, 'g'));
      return { passes: false, reason: 'forbidden_chars', detail: [...new Set(found)].join('') };
    }

    if (spec?.fixedValue && trimmed !== spec.fixedValue) {
      return { passes: false, reason: 'fixed_value_mismatch', detail: `Esperado: "${spec.fixedValue}", recibido: "${trimmed}"` };
    }

    if (spec?.validValues && spec.validValues.length > 0 && !spec.validValues.includes(trimmed)) {
      return { passes: false, reason: 'invalid_value', detail: `Valor "${trimmed}" no está en [${spec.validValues.join(', ')}]` };
    }

    if (spec?.maxLength && trimmed.length > spec.maxLength) {
      return { passes: false, reason: 'exceeds_max_length', detail: `Longitud ${trimmed.length} excede máximo ${spec.maxLength}` };
    }

    if (spec?.format) {
      try {
        const regex = new RegExp(spec.format);
        if (!regex.test(trimmed)) {
          return { passes: false, reason: 'invalid_format', detail: `No coincide con formato esperado: ${spec.format}` };
        }
      } catch { /* regex inválido en config — no bloquear */ }
    }

    if (spec?.mustBeMasked && !trimmed.includes('*')) {
      return { passes: false, reason: 'not_masked', detail: 'Tarjeta debe estar enmascarada (contener ****)' };
    }

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
