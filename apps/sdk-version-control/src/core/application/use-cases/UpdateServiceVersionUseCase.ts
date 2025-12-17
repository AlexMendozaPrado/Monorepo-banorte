import { IServiceRepository } from '../../domain/ports/repositories/IServiceRepository';
import { SemanticVersion } from '../../domain/value-objects/SemanticVersion';
import { PlatformType } from '../../domain/value-objects/PlatformType';
import { ServiceNotFoundException, ValidationException } from '../../domain/exceptions/DomainException';
import { ServiceDTO, toServiceDTO } from '../dtos/ServiceDTO';
import { ResponseDTO, ResponseDTOBuilder } from '../dtos/ResponseDTO';

/**
 * Input para actualizar versión de un servicio
 */
export interface UpdateServiceVersionInput {
  serviceId: string;
  platform: PlatformType;
  newVersion: string;
}

/**
 * Caso de uso: Actualizar versión de un servicio
 *
 * Actualiza la versión actual de un servicio en una plataforma específica.
 * Se usa cuando el equipo ha actualizado un SDK en su proyecto.
 */
export class UpdateServiceVersionUseCase {
  constructor(private readonly serviceRepository: IServiceRepository) {}

  async execute(input: UpdateServiceVersionInput): Promise<ResponseDTO<ServiceDTO>> {
    try {
      // Validar versión
      let newVersion: SemanticVersion;
      try {
        newVersion = SemanticVersion.fromString(input.newVersion);
      } catch (error) {
        return ResponseDTOBuilder.error(
          `Formato de versión inválido: ${input.newVersion}`,
          'INVALID_VERSION'
        );
      }

      // Obtener servicio
      const service = await this.serviceRepository.findById(input.serviceId);

      if (!service) {
        throw new ServiceNotFoundException(input.serviceId);
      }

      // Verificar que la plataforma existe
      const currentPlatformVersion = service.versions[input.platform];
      if (!currentPlatformVersion) {
        return ResponseDTOBuilder.error(
          `El servicio ${service.name} no tiene configuración para la plataforma ${input.platform}`,
          'PLATFORM_NOT_CONFIGURED'
        );
      }

      // Actualizar versión
      const updatedVersions = {
        ...service.versions,
        [input.platform]: currentPlatformVersion.withCurrentVersion(newVersion),
      };

      const updated = await this.serviceRepository.update(input.serviceId, {
        versions: updatedVersions,
      });

      return ResponseDTOBuilder.success(toServiceDTO(updated));
    } catch (error) {
      console.error('[UpdateServiceVersionUseCase] Error:', error);

      if (error instanceof ServiceNotFoundException) {
        return ResponseDTOBuilder.error(error.message, 'NOT_FOUND');
      }

      if (error instanceof ValidationException) {
        return ResponseDTOBuilder.error(error.message, 'VALIDATION_ERROR');
      }

      return ResponseDTOBuilder.fromException(
        error instanceof Error ? error : new Error('Update failed'),
        'UPDATE_ERROR'
      );
    }
  }
}
