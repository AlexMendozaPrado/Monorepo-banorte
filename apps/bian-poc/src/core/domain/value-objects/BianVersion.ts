/**
 * Value Object que representa la versión del framework BIAN
 */
export class BianVersion {
  private readonly _major: number;
  private readonly _minor: number;
  private readonly _patch: number;
  private readonly _value: string;

  constructor(version: string) {
    this.validateVersion(version);
    const parts = version.split('.');
    this._major = parseInt(parts[0], 10);
    this._minor = parseInt(parts[1], 10);
    this._patch = parseInt(parts[2], 10);
    this._value = version;
  }

  get value(): string {
    return this._value;
  }

  get major(): number {
    return this._major;
  }

  get minor(): number {
    return this._minor;
  }

  get patch(): number {
    return this._patch;
  }

  /**
   * Valida el formato de la versión
   */
  private validateVersion(version: string): void {
    if (!version || typeof version !== 'string') {
      throw new Error('BianVersion must be a non-empty string');
    }

    // Formato esperado: X.Y.Z (ej: 12.0.0, 11.1.2)
    const pattern = /^\d+\.\d+\.\d+$/;
    if (!pattern.test(version)) {
      throw new Error('BianVersion must follow the format X.Y.Z (e.g., 12.0.0)');
    }

    const parts = version.split('.');
    const major = parseInt(parts[0], 10);
    const minor = parseInt(parts[1], 10);
    const patch = parseInt(parts[2], 10);

    if (major < 0 || minor < 0 || patch < 0) {
      throw new Error('Version numbers must be non-negative');
    }

    if (major > 99 || minor > 99 || patch > 99) {
      throw new Error('Version numbers must be less than 100');
    }
  }

  /**
   * Compara con otra versión
   * @returns -1 si es menor, 0 si es igual, 1 si es mayor
   */
  compareTo(other: BianVersion): number {
    if (this._major !== other._major) {
      return this._major > other._major ? 1 : -1;
    }
    if (this._minor !== other._minor) {
      return this._minor > other._minor ? 1 : -1;
    }
    if (this._patch !== other._patch) {
      return this._patch > other._patch ? 1 : -1;
    }
    return 0;
  }

  /**
   * Verifica si es mayor que otra versión
   */
  isGreaterThan(other: BianVersion): boolean {
    return this.compareTo(other) > 0;
  }

  /**
   * Verifica si es menor que otra versión
   */
  isLessThan(other: BianVersion): boolean {
    return this.compareTo(other) < 0;
  }

  /**
   * Verifica si es igual a otra versión
   */
  equals(other: BianVersion): boolean {
    return this.compareTo(other) === 0;
  }

  /**
   * Verifica si es compatible con otra versión (mismo major)
   */
  isCompatibleWith(other: BianVersion): boolean {
    return this._major === other._major;
  }

  /**
   * Convierte a string
   */
  toString(): string {
    return this._value;
  }

  /**
   * Crea un BianVersion desde un string
   */
  static fromString(version: string): BianVersion {
    return new BianVersion(version);
  }

  /**
   * Verifica si un string es una versión válida
   */
  static isValid(version: string): boolean {
    try {
      new BianVersion(version);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Obtiene la versión actual del framework BIAN
   */
  static current(): BianVersion {
    return new BianVersion('12.0.0');
  }

  /**
   * Obtiene las versiones soportadas
   */
  static getSupportedVersions(): BianVersion[] {
    return [
      new BianVersion('12.0.0'),
      new BianVersion('11.1.0'),
      new BianVersion('11.0.0'),
      new BianVersion('10.0.0')
    ];
  }
}
