import { SemanticVersion } from '../value-objects/SemanticVersion';
import { PlatformType } from '../value-objects/PlatformType';
import { VersionStatus, calculateVersionStatus } from '../value-objects/VersionStatus';

/**
 * Interfaz para datos de versión de SDK
 */
export interface SDKVersionData {
  platform: PlatformType;
  currentVersion: string;
  latestVersion?: string;
  status?: VersionStatus;
  releaseDate?: Date;
  changelog?: string;
  breakingChanges?: string[];
  lastCheckedAt?: Date;
}

/**
 * Entidad que representa la versión de un SDK en una plataforma específica
 */
export class SDKVersion {
  readonly platform: PlatformType;
  readonly currentVersion: SemanticVersion;
  readonly latestVersion?: SemanticVersion;
  readonly status: VersionStatus;
  readonly releaseDate?: Date;
  readonly changelog?: string;
  readonly breakingChanges?: string[];
  readonly lastCheckedAt?: Date;

  private constructor(data: {
    platform: PlatformType;
    currentVersion: SemanticVersion;
    latestVersion?: SemanticVersion;
    status: VersionStatus;
    releaseDate?: Date;
    changelog?: string;
    breakingChanges?: string[];
    lastCheckedAt?: Date;
  }) {
    this.platform = data.platform;
    this.currentVersion = data.currentVersion;
    this.latestVersion = data.latestVersion;
    this.status = data.status;
    this.releaseDate = data.releaseDate;
    this.changelog = data.changelog;
    this.breakingChanges = data.breakingChanges;
    this.lastCheckedAt = data.lastCheckedAt;
  }

  /**
   * Crea una instancia desde datos raw
   */
  static create(data: SDKVersionData): SDKVersion {
    const currentVersion = SemanticVersion.fromString(data.currentVersion);
    const latestVersion = data.latestVersion
      ? SemanticVersion.fromString(data.latestVersion)
      : undefined;

    const status = data.status ?? (latestVersion
      ? calculateVersionStatus(currentVersion, latestVersion)
      : 'unknown');

    return new SDKVersion({
      platform: data.platform,
      currentVersion,
      latestVersion,
      status,
      releaseDate: data.releaseDate,
      changelog: data.changelog,
      breakingChanges: data.breakingChanges,
      lastCheckedAt: data.lastCheckedAt,
    });
  }

  /**
   * Verifica si la versión está desactualizada
   */
  isOutdated(): boolean {
    return this.status === 'outdated' || this.status === 'critical';
  }

  /**
   * Verifica si hay una actualización disponible
   */
  hasUpdate(): boolean {
    return this.status !== 'current' && this.status !== 'unknown';
  }

  /**
   * Calcula cuántas versiones major está detrás
   */
  getMajorVersionsBehind(): number {
    if (!this.latestVersion) return 0;
    return this.latestVersion.major - this.currentVersion.major;
  }

  /**
   * Calcula cuántas versiones minor está detrás (solo si mismo major)
   */
  getMinorVersionsBehind(): number {
    if (!this.latestVersion) return 0;
    if (this.latestVersion.major !== this.currentVersion.major) {
      return this.latestVersion.minor;
    }
    return Math.max(0, this.latestVersion.minor - this.currentVersion.minor);
  }

  /**
   * Crea una copia con la última versión actualizada
   */
  withLatestVersion(latest: SemanticVersion, changelog?: string, breakingChanges?: string[]): SDKVersion {
    return new SDKVersion({
      platform: this.platform,
      currentVersion: this.currentVersion,
      latestVersion: latest,
      status: calculateVersionStatus(this.currentVersion, latest),
      releaseDate: this.releaseDate,
      changelog: changelog ?? this.changelog,
      breakingChanges: breakingChanges ?? this.breakingChanges,
      lastCheckedAt: new Date(),
    });
  }

  /**
   * Crea una copia con la versión actual actualizada (después de upgrade)
   */
  withCurrentVersion(newVersion: SemanticVersion): SDKVersion {
    return new SDKVersion({
      platform: this.platform,
      currentVersion: newVersion,
      latestVersion: this.latestVersion,
      status: this.latestVersion
        ? calculateVersionStatus(newVersion, this.latestVersion)
        : 'unknown',
      releaseDate: this.releaseDate,
      changelog: this.changelog,
      breakingChanges: this.breakingChanges,
      lastCheckedAt: this.lastCheckedAt,
    });
  }

  /**
   * Serializa a JSON
   */
  toJSON() {
    return {
      platform: this.platform,
      currentVersion: this.currentVersion.toString(),
      latestVersion: this.latestVersion?.toString(),
      status: this.status,
      releaseDate: this.releaseDate?.toISOString(),
      changelog: this.changelog,
      breakingChanges: this.breakingChanges,
      lastCheckedAt: this.lastCheckedAt?.toISOString(),
    };
  }
}
