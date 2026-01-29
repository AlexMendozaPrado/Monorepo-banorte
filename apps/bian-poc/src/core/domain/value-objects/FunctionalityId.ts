/**
 * Value Object que representa un ID de Funcionalidad
 */
export class FunctionalityId {
  private readonly _value: string;

  constructor(value: string) {
    this.validateFormat(value);
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  /**
   * Valida el formato del ID de funcionalidad
   */
  private validateFormat(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new Error('FunctionalityId must be a non-empty string');
    }

    if (value.trim().length === 0) {
      throw new Error('FunctionalityId cannot be empty or whitespace');
    }

    // Debe tener al menos 3 caracteres y máximo 50
    if (value.length < 3 || value.length > 50) {
      throw new Error('FunctionalityId must be between 3 and 50 characters');
    }

    // Solo permite letras, números, guiones y guiones bajos
    const pattern = /^[a-zA-Z0-9_-]+$/;
    if (!pattern.test(value)) {
      throw new Error('FunctionalityId can only contain letters, numbers, hyphens, and underscores');
    }
  }

  /**
   * Verifica si dos FunctionalityId son iguales
   */
  equals(other: FunctionalityId): boolean {
    return this._value === other._value;
  }

  /**
   * Convierte a string
   */
  toString(): string {
    return this._value;
  }

  /**
   * Crea un FunctionalityId desde un string
   */
  static fromString(value: string): FunctionalityId {
    return new FunctionalityId(value);
  }

  /**
   * Verifica si un string es un formato válido de FunctionalityId
   */
  static isValid(value: string): boolean {
    try {
      new FunctionalityId(value);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Genera un ID único basado en timestamp y random
   */
  static generate(): FunctionalityId {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return new FunctionalityId(`func_${timestamp}_${random}`);
  }
}
