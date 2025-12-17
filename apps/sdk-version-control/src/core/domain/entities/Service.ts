import { SDKVersion, SDKVersionData } from './SDKVersion';
import { PlatformType, ALL_PLATFORMS } from '../value-objects/PlatformType';
import { VersionStatus, getMostCriticalStatus } from '../value-objects/VersionStatus';
import { v4 as uuidv4 } from 'uuid';

/**
 * Categorías de servicios/SDKs
 */
export type ServiceCategory =
  | 'Identity'
  | 'Analytics'
  | 'Attribution'
  | 'Monitoring'
  | 'Payments'
  | 'Engagement'
  | 'CMS'
  | 'Other';

/**
 * Versiones por plataforma
 */
export interface ServiceVersions {
  web?: SDKVersion;
  ios?: SDKVersion;
  android?: SDKVersion;
}

/**
 * Datos para crear un servicio
 */
export interface CreateServiceData {
  id?: string;
  name: string;
  category: ServiceCategory;
  description: string;
  documentationUrl: string;
  logoUrl?: string;
  versions: {
    web?: SDKVersionData;
    ios?: SDKVersionData;
    android?: SDKVersionData;
  };
}

/**
 * Entidad que representa un servicio/SDK monitoreado
 */
export class Service {
  readonly id: string;
  readonly name: string;
  readonly category: ServiceCategory;
  readonly description: string;
  readonly documentationUrl: string;
  readonly logoUrl?: string;
  readonly versions: ServiceVersions;
  readonly lastCheckedAt?: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(data: {
    id: string;
    name: string;
    category: ServiceCategory;
    description: string;
    documentationUrl: string;
    logoUrl?: string;
    versions: ServiceVersions;
    lastCheckedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.category = data.category;
    this.description = data.description;
    this.documentationUrl = data.documentationUrl;
    this.logoUrl = data.logoUrl;
    this.versions = data.versions;
    this.lastCheckedAt = data.lastCheckedAt;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Crea un nuevo servicio
   */
  static create(data: CreateServiceData): Service {
    const now = new Date();
    const versions: ServiceVersions = {};

    if (data.versions.web) {
      versions.web = SDKVersion.create({ ...data.versions.web, platform: 'web' });
    }
    if (data.versions.ios) {
      versions.ios = SDKVersion.create({ ...data.versions.ios, platform: 'ios' });
    }
    if (data.versions.android) {
      versions.android = SDKVersion.create({ ...data.versions.android, platform: 'android' });
    }

    return new Service({
      id: data.id ?? uuidv4(),
      name: data.name,
      category: data.category,
      description: data.description,
      documentationUrl: data.documentationUrl,
      logoUrl: data.logoUrl,
      versions,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Reconstruye un servicio desde datos persistidos
   */
  static reconstitute(data: {
    id: string;
    name: string;
    category: ServiceCategory;
    description: string;
    documentationUrl: string;
    logoUrl?: string;
    versions: ServiceVersions;
    lastCheckedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  }): Service {
    return new Service(data);
  }

  /**
   * Verifica si hay actualizaciones disponibles en alguna plataforma
   */
  hasUpdatesAvailable(): boolean {
    return Object.values(this.versions).some(v => v && v.hasUpdate());
  }

  /**
   * Obtiene el estado general del servicio (el más crítico entre todas las plataformas)
   */
  getOverallStatus(): VersionStatus {
    const statuses = Object.values(this.versions)
      .filter((v): v is SDKVersion => v !== undefined)
      .map(v => v.status);

    if (statuses.length === 0) return 'unknown';
    return getMostCriticalStatus(statuses);
  }

  /**
   * Obtiene las plataformas configuradas
   */
  getConfiguredPlatforms(): PlatformType[] {
    return ALL_PLATFORMS.filter(p => this.versions[p] !== undefined);
  }

  /**
   * Obtiene el conteo de plataformas
   */
  getPlatformsCount(): number {
    return this.getConfiguredPlatforms().length;
  }

  /**
   * Obtiene las plataformas con actualizaciones pendientes
   */
  getPlatformsWithUpdates(): PlatformType[] {
    return this.getConfiguredPlatforms().filter(p => {
      const version = this.versions[p];
      return version && version.hasUpdate();
    });
  }

  /**
   * Obtiene la versión para una plataforma específica
   */
  getVersionForPlatform(platform: PlatformType): SDKVersion | undefined {
    return this.versions[platform];
  }

  /**
   * Crea una copia con las versiones actualizadas
   */
  withUpdatedVersions(newVersions: Partial<ServiceVersions>): Service {
    return new Service({
      ...this,
      versions: { ...this.versions, ...newVersions },
      updatedAt: new Date(),
    });
  }

  /**
   * Crea una copia marcando como verificado
   */
  withLastChecked(date: Date = new Date()): Service {
    return new Service({
      ...this,
      lastCheckedAt: date,
      updatedAt: new Date(),
    });
  }

  /**
   * Serializa a JSON
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      category: this.category,
      description: this.description,
      documentationUrl: this.documentationUrl,
      logoUrl: this.logoUrl,
      versions: {
        web: this.versions.web?.toJSON(),
        ios: this.versions.ios?.toJSON(),
        android: this.versions.android?.toJSON(),
      },
      overallStatus: this.getOverallStatus(),
      lastCheckedAt: this.lastCheckedAt?.toISOString(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
