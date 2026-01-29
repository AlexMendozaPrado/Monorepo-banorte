import { CapabilityRepository } from '../../../domain/ports/CapabilityRepository';
import { CapabilityGroupRepository } from '../../../domain/ports/CapabilityGroupRepository';
import { CapabilityId } from '../../../domain/value-objects/CapabilityId';
import { Capability } from '../../../domain/entities/Capability';
import { CapabilityGroup } from '../../../domain/entities/CapabilityGroup';

/**
 * Caso de uso para obtener detalles de una capacidad específica con nueva estructura de 6 niveles (v2.0)
 * Group → Capability → SubCapability → BaseFunction → Functionality
 */
export class GetCapabilityDetails {
  constructor(
    private readonly capabilityRepository: CapabilityRepository,
    private readonly capabilityGroupRepository: CapabilityGroupRepository
  ) {}

  /**
   * Ejecuta la obtención de detalles de capacidad
   */
  async execute(request: GetCapabilityDetailsRequest): Promise<GetCapabilityDetailsResponse> {
    try {
      // Validar entrada
      this.validateRequest(request);

      // Crear CapabilityId
      const capabilityId = CapabilityId.fromString(request.capabilityId);

      // Buscar capacidad
      const capability = await this.capabilityRepository.findById(capabilityId);

      if (!capability) {
        return {
          success: false,
          error: `Capability with ID ${request.capabilityId} not found`,
          timestamp: new Date()
        };
      }

      // Buscar el grupo al que pertenece la capacidad
      const group = await this.capabilityGroupRepository.findById(capability.groupId);

      if (!group) {
        return {
          success: false,
          error: `Group for capability ${request.capabilityId} not found`,
          timestamp: new Date()
        };
      }

      // Obtener información adicional con contexto de grupo
      const additionalInfo = await this.getAdditionalInfo(capability, group);

      return {
        success: true,
        capability,
        group,
        additionalInfo,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date()
      };
    }
  }

  /**
   * Valida la solicitud
   */
  private validateRequest(request: GetCapabilityDetailsRequest): void {
    if (!request.capabilityId || typeof request.capabilityId !== 'string') {
      throw new Error('Capability ID is required and must be a string');
    }

    if (!CapabilityId.isValid(request.capabilityId)) {
      throw new Error('Invalid capability ID format');
    }
  }

  /**
   * Obtiene información adicional sobre la capacidad con nueva estructura (v2.0)
   */
  private async getAdditionalInfo(capability: Capability, group: CapabilityGroup): Promise<CapabilityAdditionalInfo> {
    const totalFunctionalities = capability.getTotalFunctionalities();
    const totalSubCapabilities = capability.getTotalSubCapabilities();
    const totalBaseFunctions = capability.getTotalBaseFunctions();
    const activeBaseFunctions = capability.getAllBaseFunctions().filter(bf => bf.isActive);
    const activeFunctionalities = capability.getAllFunctionalities().filter(func => func.isActive);

    // Calcular estadísticas por subcapacidad
    const subCapabilityStats = this.calculateSubCapabilityStats(capability);

    return {
      totalFunctionalities,
      totalSubCapabilities,
      totalBaseFunctions,
      activeBaseFunctions: activeBaseFunctions.length,
      activeFunctionalities: activeFunctionalities.length,
      subCapabilityStats,
      lastUpdated: capability.updatedAt,
      groupInfo: {
        id: group.id,
        name: group.name,
        style: group.style.getValue(),
        styleColor: group.style.getColor()
      },
      hierarchyPath: this.buildHierarchyPath(capability, group),
      hasDocumentation: capability.subCapabilities.some(sc => sc.description.length > 10)
    };
  }

  /**
   * Calcula estadísticas por subcapacidad (v2.0)
   */
  private calculateSubCapabilityStats(capability: Capability): SubCapabilityStats[] {
    return capability.subCapabilities.map(subCap => ({
      id: subCap.id,
      name: subCap.name,
      description: subCap.description,
      baseFunctionCount: subCap.baseFunctions.length,
      functionalityCount: subCap.getTotalFunctionalities(),
      activeFunctionalityCount: subCap.getAllFunctionalities().filter(f => f.isActive).length,
      isComplete: subCap.canBeActivated()
    }));
  }

  /**
   * Construye el path jerárquico de la capacidad (v2.0)
   */
  private buildHierarchyPath(capability: Capability, group: CapabilityGroup): HierarchyPath {
    return {
      group: {
        id: group.id,
        name: group.name,
        level: 1
      },
      capability: {
        id: capability.id.value,
        name: capability.name,
        level: 2
      },
      subCapabilities: capability.subCapabilities.map(sc => ({
        id: sc.id,
        name: sc.name,
        level: 3,
        baseFunctions: sc.baseFunctions.map(bf => ({
          id: bf.id,
          name: bf.name,
          level: 4,
          functionalities: bf.functionalities.map(func => ({
            id: func.id,
            name: func.name,
            level: 5,
            isActive: func.isActive,
            systemApplication: func.systemApplication,
            commonComponentName: func.commonComponentName
          }))
        }))
      }))
    };
  }
}

/**
 * Solicitud para obtener detalles de capacidad
 */
export interface GetCapabilityDetailsRequest {
  capabilityId: string;
}

/**
 * Respuesta con detalles de capacidad (v2.0)
 */
export interface GetCapabilityDetailsResponse {
  success: boolean;
  capability?: Capability;
  group?: CapabilityGroup;
  additionalInfo?: CapabilityAdditionalInfo;
  error?: string;
  timestamp: Date;
}

/**
 * Información adicional sobre la capacidad (v2.0)
 */
export interface CapabilityAdditionalInfo {
  totalFunctionalities: number;
  totalSubCapabilities: number;
  totalBaseFunctions: number;
  activeBaseFunctions: number;
  activeFunctionalities: number;
  subCapabilityStats: SubCapabilityStats[];
  lastUpdated: Date;
  groupInfo: GroupInfo;
  hierarchyPath: HierarchyPath;
  hasDocumentation: boolean;
}

/**
 * Estadísticas de subcapacidad (v2.0)
 */
export interface SubCapabilityStats {
  id: string;
  name: string;
  description: string;
  baseFunctionCount: number;
  functionalityCount: number;
  activeFunctionalityCount: number;
  isComplete: boolean;
}

/**
 * Información del grupo
 */
export interface GroupInfo {
  id: string;
  name: string;
  style: string;
  styleColor: string;
}

/**
 * Path jerárquico completo (v2.0)
 */
export interface HierarchyPath {
  group: {
    id: string;
    name: string;
    level: number;
  };
  capability: {
    id: string;
    name: string;
    level: number;
  };
  subCapabilities: {
    id: string;
    name: string;
    level: number;
    baseFunctions: {
      id: string;
      name: string;
      level: number;
      functionalities: {
        id: string;
        name: string;
        level: number;
        isActive: boolean;
        systemApplication?: string;
        commonComponentName?: string;
      }[];
    }[];
  }[];
}
