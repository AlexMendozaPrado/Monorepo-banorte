import { IServiceRepository } from '../../domain/ports/repositories/IServiceRepository';
import { ServiceCategory, ServiceVersions } from '../../domain/entities/Service';
import { SDKVersion } from '../../domain/entities/SDKVersion';
import { ServiceDTO, toServiceDTO } from '../dtos/ServiceDTO';
import { ResponseDTO, ResponseDTOBuilder } from '../dtos/ResponseDTO';
import {
  ValidationException,
  ServiceNotFoundException,
  ServiceAlreadyExistsException
} from '../../domain/exceptions/DomainException';
import { ProjectStatus } from '../../domain/value-objects/ProjectStatus';
import { EntityType } from '../../domain/value-objects/EntityType';

/**
 * Input para actualizar un servicio
 */
export interface UpdateServiceInput {
  serviceId: string;
  name?: string;
  category?: ServiceCategory;
  description?: string;
  documentationUrl?: string;
  logoUrl?: string;
  versions?: {
    web?: { currentVersion: string } | null;
    ios?: { currentVersion: string } | null;
    android?: { currentVersion: string } | null;
  };
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
 * Caso de uso: Actualizar un servicio existente
 *
 * Actualiza los campos proporcionados de un servicio existente.
 * Verifica que el servicio exista y que el nuevo nombre no esté en uso.
 */
export class UpdateServiceUseCase {
  constructor(private readonly serviceRepository: IServiceRepository) {}

  async execute(input: UpdateServiceInput): Promise<ResponseDTO<ServiceDTO>> {
    try {
      // Validaciones
      this.validateInput(input);

      // Verificar que el servicio existe
      const existingService = await this.serviceRepository.findById(input.serviceId);
      if (!existingService) {
        throw new ServiceNotFoundException(input.serviceId);
      }

      // Si se cambia el nombre, verificar que no exista otro servicio con ese nombre
      if (input.name && input.name !== existingService.name) {
        const serviceWithSameName = await this.serviceRepository.findByName(input.name);
        if (serviceWithSameName) {
          throw new ServiceAlreadyExistsException(input.name);
        }
      }

      // Construir datos de actualización
      const updateData: Partial<{
        name: string;
        category: ServiceCategory;
        description: string;
        documentationUrl: string;
        logoUrl: string;
        versions: ServiceVersions;
        projectStatus: ProjectStatus;
        entity: EntityType;
        hasASM: boolean;
        implementationDate: string;
        dateConfirmed: boolean;
        responsibleBusiness: string;
        responsibleIT: string;
        responsibleERN: string;
      }> = {};

      if (input.name !== undefined) {
        updateData.name = input.name;
      }
      if (input.category !== undefined) {
        updateData.category = input.category;
      }
      if (input.description !== undefined) {
        updateData.description = input.description;
      }
      if (input.documentationUrl !== undefined) {
        updateData.documentationUrl = input.documentationUrl;
      }
      if (input.logoUrl !== undefined) {
        updateData.logoUrl = input.logoUrl;
      }
      // Campos Banorte
      if (input.projectStatus !== undefined) {
        updateData.projectStatus = input.projectStatus;
      }
      if (input.entity !== undefined) {
        updateData.entity = input.entity;
      }
      if (input.hasASM !== undefined) {
        updateData.hasASM = input.hasASM;
      }
      if (input.implementationDate !== undefined) {
        updateData.implementationDate = input.implementationDate;
      }
      if (input.dateConfirmed !== undefined) {
        updateData.dateConfirmed = input.dateConfirmed;
      }
      if (input.responsibleBusiness !== undefined) {
        updateData.responsibleBusiness = input.responsibleBusiness;
      }
      if (input.responsibleIT !== undefined) {
        updateData.responsibleIT = input.responsibleIT;
      }
      if (input.responsibleERN !== undefined) {
        updateData.responsibleERN = input.responsibleERN;
      }

      // Manejar versiones
      if (input.versions !== undefined) {
        const newVersions: ServiceVersions = { ...existingService.versions };

        // Web
        if (input.versions.web === null) {
          delete newVersions.web;
        } else if (input.versions.web) {
          newVersions.web = SDKVersion.create({
            platform: 'web',
            currentVersion: input.versions.web.currentVersion,
          });
        }

        // iOS
        if (input.versions.ios === null) {
          delete newVersions.ios;
        } else if (input.versions.ios) {
          newVersions.ios = SDKVersion.create({
            platform: 'ios',
            currentVersion: input.versions.ios.currentVersion,
          });
        }

        // Android
        if (input.versions.android === null) {
          delete newVersions.android;
        } else if (input.versions.android) {
          newVersions.android = SDKVersion.create({
            platform: 'android',
            currentVersion: input.versions.android.currentVersion,
          });
        }

        // Validar que quede al menos una plataforma
        const hasPlatform = newVersions.web || newVersions.ios || newVersions.android;
        if (!hasPlatform) {
          throw new ValidationException('At least one platform version is required');
        }

        updateData.versions = newVersions;
      }

      // Actualizar
      const updatedService = await this.serviceRepository.update(input.serviceId, updateData);

      return ResponseDTOBuilder.success(toServiceDTO(updatedService));
    } catch (error) {
      console.error('[UpdateServiceUseCase] Error:', error);

      if (error instanceof ServiceNotFoundException) {
        return ResponseDTOBuilder.error(
          error.message,
          'SERVICE_NOT_FOUND'
        );
      }

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
        error instanceof Error ? error : new Error('Failed to update service'),
        'UPDATE_ERROR'
      );
    }
  }

  private validateInput(input: UpdateServiceInput): void {
    // Validar serviceId
    if (!input.serviceId || input.serviceId.trim().length === 0) {
      throw new ValidationException('Service ID is required');
    }

    // Validar nombre si se proporciona
    if (input.name !== undefined) {
      if (input.name.trim().length < 2) {
        throw new ValidationException('Service name must be at least 2 characters');
      }
      if (input.name.trim().length > 100) {
        throw new ValidationException('Service name must be at most 100 characters');
      }
    }

    // Validar categoría si se proporciona
    if (input.category !== undefined) {
      const validCategories: ServiceCategory[] = [
        'Identity', 'Analytics', 'Attribution', 'Monitoring',
        'Payments', 'Engagement', 'CMS', 'Other'
      ];
      if (!validCategories.includes(input.category)) {
        throw new ValidationException(`Invalid category: ${input.category}`);
      }
    }

    // Validar descripción si se proporciona
    if (input.description !== undefined && input.description.trim().length < 10) {
      throw new ValidationException('Description must be at least 10 characters');
    }

    // Validar URL de documentación si se proporciona
    if (input.documentationUrl !== undefined && !this.isValidUrl(input.documentationUrl)) {
      throw new ValidationException('Invalid documentation URL');
    }

    // Validar URL de logo si se proporciona
    if (input.logoUrl !== undefined && input.logoUrl !== '' && !this.isValidUrl(input.logoUrl)) {
      throw new ValidationException('Invalid logo URL');
    }

    // Validar formato de versiones si se proporcionan
    if (input.versions) {
      if (input.versions.web && input.versions.web !== null) {
        if (!VERSION_REGEX.test(input.versions.web.currentVersion)) {
          throw new ValidationException('Invalid web version format. Use semantic versioning (e.g., 1.0.0)');
        }
      }
      if (input.versions.ios && input.versions.ios !== null) {
        if (!VERSION_REGEX.test(input.versions.ios.currentVersion)) {
          throw new ValidationException('Invalid iOS version format. Use semantic versioning (e.g., 1.0.0)');
        }
      }
      if (input.versions.android && input.versions.android !== null) {
        if (!VERSION_REGEX.test(input.versions.android.currentVersion)) {
          throw new ValidationException('Invalid Android version format. Use semantic versioning (e.g., 1.0.0)');
        }
      }
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
