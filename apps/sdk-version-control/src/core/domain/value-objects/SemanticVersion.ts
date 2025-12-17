import { InvalidVersionException } from '../exceptions/DomainException';

/**
 * Value Object para manejo de versiones semánticas (SemVer)
 * Formato: MAJOR.MINOR.PATCH[-prerelease][+build]
 */
export class SemanticVersion {
  readonly major: number;
  readonly minor: number;
  readonly patch: number;
  readonly prerelease?: string;
  readonly build?: string;

  private constructor(
    major: number,
    minor: number,
    patch: number,
    prerelease?: string,
    build?: string
  ) {
    this.major = major;
    this.minor = minor;
    this.patch = patch;
    this.prerelease = prerelease;
    this.build = build;
  }

  /**
   * Crea una instancia de SemanticVersion desde un string
   * @param version String de versión (ej: "1.2.3", "v1.2.3-beta+build123")
   */
  static fromString(version: string): SemanticVersion {
    const cleanVersion = version.trim().replace(/^v/, '');

    // Regex para semantic versioning: X.Y.Z[-prerelease][+build]
    const regex = /^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9.-]+))?(?:\+([a-zA-Z0-9.-]+))?$/;
    const match = cleanVersion.match(regex);

    if (!match) {
      throw new InvalidVersionException(`Invalid version format: ${version}`);
    }

    // Non-null assertions are safe here because the regex requires these groups
    return new SemanticVersion(
      parseInt(match[1]!, 10),
      parseInt(match[2]!, 10),
      parseInt(match[3]!, 10),
      match[4],
      match[5]
    );
  }

  /**
   * Crea una instancia de SemanticVersion desde componentes numéricos
   */
  static create(major: number, minor: number, patch: number): SemanticVersion {
    if (major < 0 || minor < 0 || patch < 0) {
      throw new InvalidVersionException('Version numbers cannot be negative');
    }
    return new SemanticVersion(major, minor, patch);
  }

  /**
   * Intenta parsear un string a SemanticVersion, retorna null si falla
   */
  static tryParse(version: string): SemanticVersion | null {
    try {
      return SemanticVersion.fromString(version);
    } catch {
      return null;
    }
  }

  /**
   * Compara si esta versión es menor que otra
   */
  isLessThan(other: SemanticVersion): boolean {
    if (this.major !== other.major) return this.major < other.major;
    if (this.minor !== other.minor) return this.minor < other.minor;
    return this.patch < other.patch;
  }

  /**
   * Compara si esta versión es mayor que otra
   */
  isGreaterThan(other: SemanticVersion): boolean {
    return other.isLessThan(this);
  }

  /**
   * Compara si esta versión es igual a otra
   */
  equals(other: SemanticVersion): boolean {
    return (
      this.major === other.major &&
      this.minor === other.minor &&
      this.patch === other.patch
    );
  }

  /**
   * Compara si esta versión es mayor o igual a otra
   */
  isGreaterThanOrEqual(other: SemanticVersion): boolean {
    return this.equals(other) || this.isGreaterThan(other);
  }

  /**
   * Compara si esta versión es menor o igual a otra
   */
  isLessThanOrEqual(other: SemanticVersion): boolean {
    return this.equals(other) || this.isLessThan(other);
  }

  /**
   * Calcula la diferencia de versiones mayores
   */
  getMajorDifference(other: SemanticVersion): number {
    return Math.abs(this.major - other.major);
  }

  /**
   * Calcula la diferencia de versiones menores (solo si major es igual)
   */
  getMinorDifference(other: SemanticVersion): number {
    if (this.major !== other.major) {
      return other.minor; // Si major difiere, retorna el minor completo
    }
    return Math.abs(this.minor - other.minor);
  }

  /**
   * Convierte a string en formato estándar
   */
  toString(): string {
    let version = `${this.major}.${this.minor}.${this.patch}`;
    if (this.prerelease) version += `-${this.prerelease}`;
    if (this.build) version += `+${this.build}`;
    return version;
  }

  /**
   * Convierte a string con prefijo 'v'
   */
  toTagString(): string {
    return `v${this.toString()}`;
  }

  /**
   * Serializa a JSON
   */
  toJSON() {
    return {
      major: this.major,
      minor: this.minor,
      patch: this.patch,
      prerelease: this.prerelease,
      build: this.build,
      full: this.toString(),
    };
  }
}
