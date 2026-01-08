import { IServiceRepository } from '../../domain/ports/repositories/IServiceRepository';
import { ResponseDTO, ResponseDTOBuilder } from '../dtos/ResponseDTO';
import {
  ValidationException,
  ServiceNotFoundException
} from '../../domain/exceptions/DomainException';

/**
 * Input para eliminar un servicio
 */
export interface DeleteServiceInput {
  serviceId: string;
}

/**
 * Output de eliminación
 */
export interface DeleteServiceOutput {
  deleted: boolean;
  serviceId: string;
}

/**
 * Caso de uso: Eliminar un servicio
 *
 * Elimina un servicio existente del repositorio.
 */
export class DeleteServiceUseCase {
  constructor(private readonly serviceRepository: IServiceRepository) {}

  async execute(input: DeleteServiceInput): Promise<ResponseDTO<DeleteServiceOutput>> {
    try {
      // Validaciones
      this.validateInput(input);

      // Verificar que el servicio existe
      const existingService = await this.serviceRepository.findById(input.serviceId);
      if (!existingService) {
        throw new ServiceNotFoundException(input.serviceId);
      }

      // Eliminar
      await this.serviceRepository.delete(input.serviceId);

      return ResponseDTOBuilder.success({
        deleted: true,
        serviceId: input.serviceId,
      });
    } catch (error) {
      console.error('[DeleteServiceUseCase] Error:', error);

      if (error instanceof ServiceNotFoundException) {
        return ResponseDTOBuilder.error(
          error.message,
          'SERVICE_NOT_FOUND'
        );
      }

      if (error instanceof ValidationException) {
        return ResponseDTOBuilder.error(
          error.message,
          'VALIDATION_ERROR'
        );
      }

      return ResponseDTOBuilder.fromException(
        error instanceof Error ? error : new Error('Failed to delete service'),
        'DELETE_ERROR'
      );
    }
  }

  private validateInput(input: DeleteServiceInput): void {
    if (!input.serviceId || input.serviceId.trim().length === 0) {
      throw new ValidationException('Service ID is required');
    }
  }
}
