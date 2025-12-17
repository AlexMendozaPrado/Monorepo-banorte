import { IServiceRepository, ServiceFilters, ServiceStatistics } from '../../domain/ports/repositories/IServiceRepository';
import { ServiceDTO, toServiceDTO } from '../dtos/ServiceDTO';
import { ResponseDTO, ResponseDTOBuilder } from '../dtos/ResponseDTO';

/**
 * Input para obtener todos los servicios
 */
export interface GetAllServicesInput {
  filters?: ServiceFilters;
}

/**
 * Output con servicios y estadísticas
 */
export interface GetAllServicesOutput {
  services: ServiceDTO[];
  statistics: ServiceStatistics;
}

/**
 * Caso de uso: Obtener todos los servicios
 *
 * Retorna la lista de servicios configurados con sus versiones
 * y estadísticas generales.
 */
export class GetAllServicesUseCase {
  constructor(private readonly serviceRepository: IServiceRepository) {}

  async execute(input: GetAllServicesInput = {}): Promise<ResponseDTO<GetAllServicesOutput>> {
    try {
      const [services, statistics] = await Promise.all([
        this.serviceRepository.findAll(input.filters),
        this.serviceRepository.getStatistics(),
      ]);

      return ResponseDTOBuilder.success({
        services: services.map(toServiceDTO),
        statistics,
      });
    } catch (error) {
      console.error('[GetAllServicesUseCase] Error:', error);
      return ResponseDTOBuilder.fromException(
        error instanceof Error ? error : new Error('Failed to fetch services'),
        'FETCH_ERROR'
      );
    }
  }
}
