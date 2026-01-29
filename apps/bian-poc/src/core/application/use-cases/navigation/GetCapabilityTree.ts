import { CapabilityGroupRepository } from '../../../domain/ports/CapabilityGroupRepository';
import { CapabilityGroup } from '../../../domain/entities/CapabilityGroup';

/**
 * Caso de uso para obtener el árbol de capacidades con nueva estructura de 6 niveles (v2.0)
 * Group → Capability → SubCapability → BaseFunction → Functionality
 */
export class GetCapabilityTree {
  constructor(private readonly capabilityGroupRepository: CapabilityGroupRepository) {}

  /**
   * Ejecuta la obtención del árbol de capacidades con estructura de 6 niveles
   */
  async execute(request: GetCapabilityTreeRequest = {}): Promise<GetCapabilityTreeResponse> {
    try {
      const startTime = Date.now();

      // Obtener todos los grupos de capacidades
      const capabilityGroups = await this.capabilityGroupRepository.findAll();

      // Filtrar grupos si es necesario
      const filteredGroups = this.filterCapabilityGroups(capabilityGroups, request);

      // Construir árbol de 6 niveles
      const tree = this.buildCapabilityTree(filteredGroups);

      // Calcular estadísticas
      const stats = this.calculateTreeStats(tree);

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      return {
        success: true,
        tree,
        stats,
        executionTime,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        tree: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        executionTime: 0,
        timestamp: new Date()
      };
    }
  }

  /**
   * Filtra los grupos de capacidades según los criterios de la solicitud
   */
  private filterCapabilityGroups(groups: CapabilityGroup[], request: GetCapabilityTreeRequest): CapabilityGroup[] {
    let filtered = groups;

    // Filtrar por estado activo
    if (request.activeOnly) {
      filtered = filtered.filter(group => group.isActive);
    }

    // Filtrar por estilos específicos
    if (request.styles && request.styles.length > 0) {
      filtered = filtered.filter(group =>
        request.styles!.some(style => group.style.getValue() === style)
      );
    }

    // Filtrar por grupos que tengan capacidades
    if (request.withCapabilitiesOnly) {
      filtered = filtered.filter(group => group.hasCapabilities());
    }

    // Filtrar por grupos que tengan funcionalidades
    if (request.withFunctionalitiesOnly) {
      filtered = filtered.filter(group =>
        group.capabilities.some(cap => cap.getTotalFunctionalities() > 0)
      );
    }

    return filtered;
  }

  /**
   * Construye el árbol de capacidades con estructura de 6 niveles (v2.0)
   */
  private buildCapabilityTree(groups: CapabilityGroup[]): CapabilityTreeNode[] {
    // Crear nodos del árbol para cada grupo
    const treeNodes: CapabilityTreeNode[] = [];

    groups.forEach(group => {
      const groupNode: CapabilityTreeNode = {
        id: group.id,
        name: group.name,
        type: 'group',
        children: group.capabilities.map(capability => this.buildCapabilityNode(capability)),
        isExpanded: false,
        metadata: {
          style: group.style.getValue(),
          styleColor: group.style.getColor(),
          totalCapabilities: group.capabilities.length,
          totalSubCapabilities: group.capabilities.reduce((sum, cap) => sum + cap.getTotalSubCapabilities(), 0),
          totalBaseFunctions: group.capabilities.reduce((sum, cap) => sum + cap.getTotalBaseFunctions(), 0),
          totalFunctionalities: group.capabilities.reduce((sum, cap) => sum + cap.getTotalFunctionalities(), 0),
          isActive: group.isActive
        }
      };

      treeNodes.push(groupNode);
    });

    return treeNodes;
  }

  /**
   * Construye un nodo para una capacidad específica con nueva estructura de 6 niveles (v2.0)
   */
  private buildCapabilityNode(capability: any): CapabilityTreeNode {
    const subCapabilityNodes = capability.subCapabilities.map((subCap: any) => ({
      id: subCap.id,
      name: subCap.name,
      type: 'subcapability' as const,
      children: subCap.baseFunctions.map((baseFunc: any) => ({
        id: baseFunc.id,
        name: baseFunc.name,
        type: 'baseFunction' as const,
        children: baseFunc.functionalities.map((func: any) => ({
          id: func.id,
          name: func.name,
          type: 'functionality' as const,
          children: [],
          isExpanded: false,
          metadata: {
            description: func.description,
            level: func.level,
            systemApplication: func.systemApplication,
            commonComponentId: func.commonComponentId,
            commonComponentName: func.commonComponentName,
            isActive: func.isActive,
            isCompletelyDefined: func.isCompletelyDefined(),
            canBeActivated: func.canBeActivated()
          }
        })),
        isExpanded: false,
        metadata: {
          description: baseFunc.description,
          totalFunctionalities: baseFunc.functionalities.length,
          isActive: baseFunc.isActive,
          canBeActivated: baseFunc.canBeActivated()
        }
      })),
      isExpanded: false,
      metadata: {
        description: subCap.description,
        totalBaseFunctions: subCap.baseFunctions.length,
        totalFunctionalities: subCap.getTotalFunctionalities(),
        isActive: subCap.isActive,
        canBeActivated: subCap.canBeActivated()
      }
    }));

    return {
      id: capability.id.getValue(),
      name: capability.name,
      type: 'capability',
      children: subCapabilityNodes,
      isExpanded: false,
      metadata: {
        groupId: capability.groupId,
        totalSubCapabilities: capability.getTotalSubCapabilities(),
        totalBaseFunctions: capability.getTotalBaseFunctions(),
        totalFunctionalities: capability.getTotalFunctionalities(),
        isActive: capability.isActive,
        canBeActivated: capability.canBeActivated()
      }
    };
  }

  /**
   * Calcula estadísticas del árbol con nueva estructura de 6 niveles (v2.0)
   */
  private calculateTreeStats(tree: CapabilityTreeNode[]): TreeStats {
    let totalGroups = 0;
    let totalCapabilities = 0;
    let totalSubCapabilities = 0;
    let totalBaseFunctions = 0;
    let totalFunctionalities = 0;

    tree.forEach(groupNode => {
      totalGroups++;

      groupNode.children.forEach(capabilityNode => {
        totalCapabilities++;

        capabilityNode.children.forEach(subCapabilityNode => {
          totalSubCapabilities++;

          subCapabilityNode.children.forEach(baseFunctionNode => {
            totalBaseFunctions++;
            totalFunctionalities += baseFunctionNode.children.length;
          });
        });
      });
    });

    return {
      totalGroups,
      totalCapabilities,
      totalSubCapabilities,
      totalBaseFunctions,
      totalFunctionalities
    };
  }
}

/**
 * Solicitud para obtener el árbol de capacidades (v2.0)
 */
export interface GetCapabilityTreeRequest {
  activeOnly?: boolean;
  styles?: string[];
  withCapabilitiesOnly?: boolean;
  withFunctionalitiesOnly?: boolean;
}

/**
 * Respuesta con el árbol de capacidades (v2.0)
 */
export interface GetCapabilityTreeResponse {
  success: boolean;
  tree: CapabilityTreeNode[];
  stats?: TreeStats;
  error?: string;
  executionTime: number;
  timestamp: Date;
}

/**
 * Nodo del árbol de capacidades (6 niveles v2.0)
 */
export interface CapabilityTreeNode {
  id: string;
  name: string;
  type: 'group' | 'capability' | 'subcapability' | 'baseFunction' | 'functionality';
  children: CapabilityTreeNode[];
  isExpanded: boolean;
  metadata?: Record<string, any>;
}

/**
 * Estadísticas del árbol (v2.0)
 */
export interface TreeStats {
  totalGroups: number;
  totalCapabilities: number;
  totalSubCapabilities: number;
  totalBaseFunctions: number;
  totalFunctionalities: number;
}
