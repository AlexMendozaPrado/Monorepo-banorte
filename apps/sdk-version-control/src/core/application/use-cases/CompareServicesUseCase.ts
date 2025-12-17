import { IServiceRepository } from '../../domain/ports/repositories/IServiceRepository';
import { ServiceDTO, toServiceDTO } from '../dtos/ServiceDTO';
import {
  ComparisonDTO,
  buildComparisonMatrix,
  generateComparisonInsights,
} from '../dtos/ComparisonDTO';
import { ResponseDTO, ResponseDTOBuilder } from '../dtos/ResponseDTO';
import { PlatformType, ALL_PLATFORMS } from '../../domain/value-objects/PlatformType';

/**
 * Input para comparar servicios
 */
export interface CompareServicesInput {
  /**
   * IDs de servicios a comparar (mínimo 2, máximo 4)
   */
  serviceIds: string[];

  /**
   * Plataformas a incluir en la comparación
   */
  platforms?: PlatformType[];
}

/**
 * Output de comparación
 */
export interface CompareServicesOutput {
  comparison: ComparisonDTO;
}

/**
 * Caso de uso: Comparar servicios lado a lado
 *
 * Genera una matriz de comparación para visualizar
 * diferencias entre versiones de múltiples servicios.
 */
export class CompareServicesUseCase {
  constructor(private readonly serviceRepository: IServiceRepository) {}

  async execute(input: CompareServicesInput): Promise<ResponseDTO<CompareServicesOutput>> {
    try {
      // Validar input
      if (!input.serviceIds || input.serviceIds.length < 2) {
        return ResponseDTOBuilder.error(
          'Se requieren al menos 2 servicios para comparar',
          'INVALID_INPUT'
        );
      }

      if (input.serviceIds.length > 4) {
        return ResponseDTOBuilder.error(
          'Máximo 4 servicios pueden ser comparados',
          'INVALID_INPUT'
        );
      }

      // Obtener servicios
      const services = await Promise.all(
        input.serviceIds.map(id => this.serviceRepository.findById(id))
      );

      const validServices = services.filter((s): s is NonNullable<typeof s> => s !== null);

      if (validServices.length < 2) {
        return ResponseDTOBuilder.error(
          'No se encontraron suficientes servicios válidos para comparar',
          'NOT_FOUND'
        );
      }

      // Convertir a DTOs
      const serviceDTOs = validServices.map(toServiceDTO);

      // Determinar plataformas a comparar
      const platforms = input.platforms || ALL_PLATFORMS;

      // Construir matriz de comparación
      const matrix = buildComparisonMatrix(serviceDTOs, platforms);

      // Generar insights
      const insights = generateComparisonInsights(serviceDTOs, matrix);

      const comparison: ComparisonDTO = {
        services: serviceDTOs,
        platforms,
        matrix,
        insights,
        generatedAt: new Date().toISOString(),
      };

      return ResponseDTOBuilder.success({ comparison });
    } catch (error) {
      console.error('[CompareServicesUseCase] Error:', error);
      return ResponseDTOBuilder.fromException(
        error instanceof Error ? error : new Error('Comparison failed'),
        'COMPARISON_ERROR'
      );
    }
  }
}
