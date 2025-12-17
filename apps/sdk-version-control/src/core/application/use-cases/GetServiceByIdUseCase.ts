import { IServiceRepository } from '../../domain/ports/repositories/IServiceRepository';
import { ServiceNotFoundException } from '../../domain/exceptions/DomainException';
import { ServiceDTO, toServiceDTO } from '../dtos/ServiceDTO';
import { ResponseDTO, ResponseDTOBuilder } from '../dtos/ResponseDTO';

/**
 * Input para obtener un servicio por ID
 */
export interface GetServiceByIdInput {
  serviceId: string;
}

/**
 * Caso de uso: Obtener servicio por ID
 */
export class GetServiceByIdUseCase {
  constructor(private readonly serviceRepository: IServiceRepository) {}

  async execute(input: GetServiceByIdInput): Promise<ResponseDTO<ServiceDTO>> {
    try {
      const service = await this.serviceRepository.findById(input.serviceId);

      if (!service) {
        throw new ServiceNotFoundException(input.serviceId);
      }

      return ResponseDTOBuilder.success(toServiceDTO(service));
    } catch (error) {
      console.error('[GetServiceByIdUseCase] Error:', error);

      if (error instanceof ServiceNotFoundException) {
        return ResponseDTOBuilder.error(error.message, 'NOT_FOUND');
      }

      return ResponseDTOBuilder.fromException(
        error instanceof Error ? error : new Error('Failed to fetch service'),
        'FETCH_ERROR'
      );
    }
  }
}
