import { IServiceRepository } from '../../domain/ports/repositories/IServiceRepository';
import { Service, ServiceCategory } from '../../domain/entities/Service';
import { ServiceDTO, toServiceDTO } from '../dtos/ServiceDTO';
import { ResponseDTO, ResponseDTOBuilder } from '../dtos/ResponseDTO';
import {
  ValidationException,
  ServiceAlreadyExistsException
} from '../../domain/exceptions/DomainException';
import { ProjectStatus } from '../../domain/value-objects/ProjectStatus';
import { EntityType } from '../../domain/value-objects/EntityType';
import { ChannelVersion } from '../../domain/value-objects/Channel';

/**
 * Input para crear un servicio
 */
export interface CreateServiceInput {
  name: string;
  category: ServiceCategory;
  description: string;
  documentationUrl: string;
  logoUrl?: string;
  versions: {
    web?: { currentVersion: string };
    ios?: { currentVersion: string };
    android?: { currentVersion: string };
  };
  // Canales de Banorte
  channels?: ChannelVersion[];
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

/**
 * Regex para validar formato de versión semántica
 */
const VERSION_REGEX = /^\d+\.\d+\.\d+$/;

/**
 * Caso de uso: Crear un nuevo servicio
 *
 * Valida los datos de entrada y crea un nuevo servicio en el repositorio.
 * Verifica que no exista un servicio con el mismo nombre.
 */
export class CreateServiceUseCase {
  constructor(private readonly serviceRepository: IServiceRepository) {}

  async execute(input: CreateServiceInput): Promise<ResponseDTO<ServiceDTO>> {
    try {
      // Validaciones
      this.validateInput(input);

      // Verificar que no exista un servicio con el mismo nombre
      const existingService = await this.serviceRepository.findByName(input.name);
      if (existingService) {
        throw new ServiceAlreadyExistsException(input.name);
      }

      // Construir versiones
      const versions: {
        web?: { currentVersion: string; platform: 'web' };
        ios?: { currentVersion: string; platform: 'ios' };
        android?: { currentVersion: string; platform: 'android' };
      } = {};

      if (input.versions.web) {
        versions.web = {
          currentVersion: input.versions.web.currentVersion,
          platform: 'web'
        };
      }
      if (input.versions.ios) {
        versions.ios = {
          currentVersion: input.versions.ios.currentVersion,
          platform: 'ios'
        };
      }
      if (input.versions.android) {
        versions.android = {
          currentVersion: input.versions.android.currentVersion,
          platform: 'android'
        };
      }

      // Crear la entidad Service
      const service = Service.create({
        name: input.name,
        category: input.category,
        description: input.description,
        documentationUrl: input.documentationUrl,
        logoUrl: input.logoUrl,
        versions,
        // Canales de Banorte
        channels: input.channels || [],
        // Campos Banorte
        projectStatus: input.projectStatus,
        entity: input.entity,
        hasASM: input.hasASM,
        implementationDate: input.implementationDate,
        dateConfirmed: input.dateConfirmed,
        responsibleBusiness: input.responsibleBusiness,
        responsibleIT: input.responsibleIT,
        responsibleERN: input.responsibleERN,
      });

      // Persistir
      const savedService = await this.serviceRepository.save(service);

      return ResponseDTOBuilder.success(toServiceDTO(savedService));
    } catch (error) {
      console.error('[CreateServiceUseCase] Error:', error);

      if (error instanceof ServiceAlreadyExistsException) {
        return ResponseDTOBuilder.error(
          error.message,
          'SERVICE_ALREADY_EXISTS'
        );
      }

      if (error instanceof ValidationException) {
        return ResponseDTOBuilder.error(
          error.message,
          'VALIDATION_ERROR'
        );
      }

      return ResponseDTOBuilder.fromException(
        error instanceof Error ? error : new Error('Failed to create service'),
        'CREATE_ERROR'
      );
    }
  }

  private validateInput(input: CreateServiceInput): void {
    // Validar nombre
    if (!input.name || input.name.trim().length < 2) {
      throw new ValidationException('Service name must be at least 2 characters');
    }
    if (input.name.trim().length > 100) {
      throw new ValidationException('Service name must be at most 100 characters');
    }

    // Validar categoría
    const validCategories: ServiceCategory[] = [
      'Identity', 'Analytics', 'Attribution', 'Monitoring',
      'Payments', 'Engagement', 'CMS', 'Other'
    ];
    if (!validCategories.includes(input.category)) {
      throw new ValidationException(`Invalid category: ${input.category}`);
    }

    // Validar descripción
    if (!input.description || input.description.trim().length < 10) {
      throw new ValidationException('Description must be at least 10 characters');
    }

    // Validar URL de documentación
    if (!input.documentationUrl || !this.isValidUrl(input.documentationUrl)) {
      throw new ValidationException('Invalid documentation URL');
    }

    // Validar URL de logo (si se proporciona)
    if (input.logoUrl && !this.isValidUrl(input.logoUrl)) {
      throw new ValidationException('Invalid logo URL');
    }

    // Validar que haya al menos una plataforma o canal
    const hasPlatform = input.versions.web || input.versions.ios || input.versions.android;
    const hasChannel = input.channels && input.channels.length > 0;
    if (!hasPlatform && !hasChannel) {
      throw new ValidationException('At least one platform version or channel is required');
    }

    // Validar formato de versiones
    if (input.versions.web && !VERSION_REGEX.test(input.versions.web.currentVersion)) {
      throw new ValidationException('Invalid web version format. Use semantic versioning (e.g., 1.0.0)');
    }
    if (input.versions.ios && !VERSION_REGEX.test(input.versions.ios.currentVersion)) {
      throw new ValidationException('Invalid iOS version format. Use semantic versioning (e.g., 1.0.0)');
    }
    if (input.versions.android && !VERSION_REGEX.test(input.versions.android.currentVersion)) {
      throw new ValidationException('Invalid Android version format. Use semantic versioning (e.g., 1.0.0)');
    }
  }

  private isValidUrl(urlString: string): boolean {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  }
}
