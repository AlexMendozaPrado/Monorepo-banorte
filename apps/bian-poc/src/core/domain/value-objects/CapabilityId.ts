/**
 * Value Object que representa un ID de Capacidad BIAN (ej: CE-01, PD-02)
 */
export class CapabilityId {
  private readonly _value: string;

  constructor(value: string) {
    this.validateFormat(value);
    this._value = value.toUpperCase();
  }

  get value(): string {
    return this._value;
  }

  /**
   * Valida el formato del ID de capacidad
   */
  private validateFormat(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new Error('CapabilityId must be a non-empty string');
    }

    // Formato esperado: XX-NN (ej: CE-01, PD-02)
    const pattern = /^[A-Z]{2}-\d{2}$/;
    if (!pattern.test(value.toUpperCase())) {
      throw new Error('CapabilityId must follow the format XX-NN (e.g., CE-01, PD-02)');
    }
  }

  /**
   * Obtiene la categoría del ID (las dos primeras letras)
   */
  getCategory(): string {
    return this._value.substring(0, 2);
  }

  /**
   * Obtiene el número del ID (los dos últimos dígitos)
   */
  getNumber(): string {
    return this._value.substring(3, 5);
  }

  /**
   * Verifica si dos CapabilityId son iguales
   */
  equals(other: CapabilityId): boolean {
    return this._value === other._value;
  }

  /**
   * Convierte a string
   */
  toString(): string {
    return this._value;
  }

  /**
   * Crea un CapabilityId desde un string
   */
  static fromString(value: string): CapabilityId {
    return new CapabilityId(value);
  }

  /**
   * Verifica si un string es un formato válido de CapabilityId
   */
  static isValid(value: string): boolean {
    try {
      new CapabilityId(value);
      return true;
    } catch {
      return false;
    }
  }
}
