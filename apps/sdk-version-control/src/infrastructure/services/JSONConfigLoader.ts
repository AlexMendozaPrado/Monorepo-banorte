import { Service, ServiceCategory, CreateServiceData } from '@/core/domain/entities/Service';
import { SDKVersionData } from '@/core/domain/entities/SDKVersion';
import { PlatformType } from '@/core/domain/value-objects/PlatformType';
import { VersionStatus } from '@/core/domain/value-objects/VersionStatus';
import { ProjectStatus } from '@/core/domain/value-objects/ProjectStatus';
import { EntityType } from '@/core/domain/value-objects/EntityType';
import { ChannelVersion, ChannelType, ChannelStatus } from '@/core/domain/value-objects/Channel';
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
  // Canales de Banorte
  channels?: Array<{
    channel: string;
    version: string;
    status: string;
  }>;
  // Campos Banorte
  projectStatus?: ProjectStatus;
  entity?: EntityType;
  hasASM?: boolean;
  implementationDate?: string;
  dateConfirmed?: boolean;
  responsibleBusiness?: string;
  responsibleIT?: string;
  responsibleERN?: string;
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

      // Procesar canales
      const channels: ChannelVersion[] = (serviceJson.channels || []).map(ch => ({
        channel: ch.channel as ChannelType,
        version: ch.version,
        status: ch.status as ChannelStatus,
      }));

      return Service.create({
        id: serviceJson.id,
        name: serviceJson.name,
        category: serviceJson.category as ServiceCategory,
        description: serviceJson.description,
        documentationUrl: serviceJson.documentationUrl,
        logoUrl: serviceJson.logoUrl,
        versions,
        // Canales de Banorte
        channels,
        // Campos Banorte
        projectStatus: serviceJson.projectStatus,
        entity: serviceJson.entity,
        hasASM: serviceJson.hasASM,
        implementationDate: serviceJson.implementationDate,
        dateConfirmed: serviceJson.dateConfirmed,
        responsibleBusiness: serviceJson.responsibleBusiness,
        responsibleIT: serviceJson.responsibleIT,
        responsibleERN: serviceJson.responsibleERN,
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
