import { Service, ServiceCategory, CreateServiceData } from '@/core/domain/entities/Service';
import { SDKVersionData } from '@/core/domain/entities/SDKVersion';
import { PlatformType } from '@/core/domain/value-objects/PlatformType';
import { VersionStatus } from '@/core/domain/value-objects/VersionStatus';
import servicesConfig from '../config/services.config.json';

/**
 * Estructura del JSON de configuración
 */
interface ServiceConfigJSON {
  id: string;
  name: string;
  category: string;
  description: string;
  documentationUrl: string;
  logoUrl?: string;
  versions: {
    [key: string]: {
      currentVersion: string;
      status?: string;
    };
  };
}

interface ConfigJSON {
  version: string;
  lastUpdated: string;
  services: ServiceConfigJSON[];
}

/**
 * Carga y parsea la configuración de servicios desde JSON
 */
export class JSONConfigLoader {
  private config: ConfigJSON;

  constructor() {
    this.config = servicesConfig as ConfigJSON;
  }

  /**
   * Carga todos los servicios desde el JSON de configuración
   */
  loadServices(): Service[] {
    return this.config.services.map(serviceJson => {
      const versions: CreateServiceData['versions'] = {};

      // Procesar cada plataforma
      for (const [platform, versionData] of Object.entries(serviceJson.versions)) {
        if (this.isValidPlatform(platform)) {
          const sdkVersionData: SDKVersionData = {
            platform: platform as PlatformType,
            currentVersion: versionData.currentVersion,
            status: (versionData.status as VersionStatus) || 'unknown',
          };
          versions[platform as PlatformType] = sdkVersionData;
        }
      }

      return Service.create({
        id: serviceJson.id,
        name: serviceJson.name,
        category: serviceJson.category as ServiceCategory,
        description: serviceJson.description,
        documentationUrl: serviceJson.documentationUrl,
        logoUrl: serviceJson.logoUrl,
        versions,
      });
    });
  }

  /**
   * Obtiene la versión de la configuración
   */
  getConfigVersion(): string {
    return this.config.version;
  }

  /**
   * Obtiene la última fecha de actualización
   */
  getLastUpdated(): Date {
    return new Date(this.config.lastUpdated);
  }

  /**
   * Verifica si una plataforma es válida
   */
  private isValidPlatform(platform: string): platform is PlatformType {
    return ['web', 'ios', 'android'].includes(platform);
  }
}
