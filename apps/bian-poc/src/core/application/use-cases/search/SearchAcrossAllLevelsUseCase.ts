import { CapabilityGroupRepository } from '../../../domain/ports/CapabilityGroupRepository';
import { CapabilityGroup } from '../../../domain/entities/CapabilityGroup';

/**
 * DTO para resultados de búsqueda con información de nivel (v2.0)
 */
export interface SearchResultDto {
  level: 'group' | 'capability' | 'subcapability' | 'baseFunction' | 'functionality';
  id: string;
  name: string;
  description: string;
  matchedText: string;
  path: {
    groupId: string;
    groupName: string;
    capabilityId?: string;
    capabilityName?: string;
    subCapabilityId?: string;
    subCapabilityName?: string;
    baseFunctionId?: string;
    baseFunctionName?: string;
  };
  style: {
    name: string;
    color: string;
  };
  additionalInfo?: {
    level?: number;
    systemApplication?: string;
    commonComponentId?: string;
    commonComponentName?: string;
  };
}

/**
 * Caso de uso para búsqueda avanzada en todos los niveles de la jerarquía (v2.0)
 * Group → Capability → SubCapability → BaseFunction → Functionality
 */
export class SearchAcrossAllLevelsUseCase {
  constructor(private capabilityGroupRepository: CapabilityGroupRepository) {}

  /**
   * Busca en todos los niveles de la jerarquía
   */
  async execute(query: string): Promise<SearchResultDto[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      const searchTerm = query.toLowerCase().trim();
      const groups = await this.capabilityGroupRepository.findAll();
      const results: SearchResultDto[] = [];

      for (const group of groups) {
        // Buscar en nivel de grupo
        if (this.matchesSearchTerm(group.name, searchTerm)) {
          results.push(this.createGroupResult(group, group.name, searchTerm));
        }

        // Buscar en capacidades
        for (const capability of group.capabilities) {
          if (this.matchesSearchTerm(capability.name, searchTerm)) {
            results.push(this.createCapabilityResult(group, capability, capability.name, searchTerm));
          }

          // Buscar en subcapacidades
          for (const subCap of capability.subCapabilities) {
            if (this.matchesSearchTerm(subCap.name, searchTerm) ||
                this.matchesSearchTerm(subCap.description, searchTerm)) {
              results.push(this.createSubCapabilityResult(
                group, capability, subCap,
                this.getMatchedText([subCap.name, subCap.description], searchTerm),
                searchTerm
              ));
            }

            // Buscar en funcionalidades base
            for (const baseFunc of subCap.baseFunctions) {
              if (this.matchesSearchTerm(baseFunc.name, searchTerm) ||
                  this.matchesSearchTerm(baseFunc.description, searchTerm)) {
                results.push(this.createBaseFunctionResult(
                  group, capability, subCap, baseFunc,
                  this.getMatchedText([baseFunc.name, baseFunc.description], searchTerm),
                  searchTerm
                ));
              }

              // Buscar en funcionalidades
              for (const func of baseFunc.functionalities) {
                if (this.matchesSearchTerm(func.name, searchTerm) ||
                    this.matchesSearchTerm(func.description, searchTerm) ||
                    this.matchesSearchTerm(func.commonComponentName || '', searchTerm) ||
                    this.matchesSearchTerm(func.systemApplication || '', searchTerm)) {
                  results.push(this.createFunctionalityResult(
                    group, capability, subCap, baseFunc, func,
                    this.getMatchedText([func.name, func.description, func.commonComponentName || ''], searchTerm),
                    searchTerm
                  ));
                }
              }
            }
          }
        }
      }

      return this.sortResultsByRelevance(results, searchTerm);
    } catch (error) {
      throw new Error(`Search failed: ${error}`);
    }
  }

  /**
   * Verifica si un texto contiene el término de búsqueda
   */
  private matchesSearchTerm(text: string, searchTerm: string): boolean {
    return text.toLowerCase().includes(searchTerm);
  }

  /**
   * Obtiene el texto que coincide con la búsqueda
   */
  private getMatchedText(texts: string[], searchTerm: string): string {
    for (const text of texts) {
      if (this.matchesSearchTerm(text, searchTerm)) {
        return text;
      }
    }
    return texts[0] || '';
  }

  /**
   * Crea resultado para nivel de grupo
   */
  private createGroupResult(group: CapabilityGroup, matchedText: string, searchTerm: string): SearchResultDto {
    return {
      level: 'group',
      id: group.id,
      name: group.name,
      description: `Grupo de capacidades con estilo ${group.style.getValue()}`,
      matchedText: this.highlightSearchTerm(matchedText, searchTerm),
      path: {
        groupId: group.id,
        groupName: group.name,
      },
      style: {
        name: group.style.getValue(),
        color: group.style.getColor(),
      },
    };
  }

  /**
   * Crea resultado para nivel de capacidad
   */
  private createCapabilityResult(group: any, capability: any, matchedText: string, searchTerm: string): SearchResultDto {
    return {
      level: 'capability',
      id: capability.id.getValue(),
      name: capability.name,
      description: `Capacidad dentro de ${group.name}`,
      matchedText: this.highlightSearchTerm(matchedText, searchTerm),
      path: {
        groupId: group.id,
        groupName: group.name,
        capabilityId: capability.id.getValue(),
        capabilityName: capability.name,
      },
      style: {
        name: group.style.getValue(),
        color: group.style.getColor(),
      },
    };
  }

  /**
   * Crea resultado para nivel de subcapacidad
   */
  private createSubCapabilityResult(group: any, capability: any, subCap: any, matchedText: string, searchTerm: string): SearchResultDto {
    return {
      level: 'subcapability',
      id: subCap.id,
      name: subCap.name,
      description: subCap.description,
      matchedText: this.highlightSearchTerm(matchedText, searchTerm),
      path: {
        groupId: group.id,
        groupName: group.name,
        capabilityId: capability.id.getValue(),
        capabilityName: capability.name,
        subCapabilityId: subCap.id,
        subCapabilityName: subCap.name,
      },
      style: {
        name: group.style.getValue(),
        color: group.style.getColor(),
      },
    };
  }

  /**
   * Crea resultado para nivel de funcionalidad base
   */
  private createBaseFunctionResult(group: any, capability: any, subCap: any, baseFunc: any, matchedText: string, searchTerm: string): SearchResultDto {
    return {
      level: 'baseFunction',
      id: baseFunc.id,
      name: baseFunc.name,
      description: baseFunc.description,
      matchedText: this.highlightSearchTerm(matchedText, searchTerm),
      path: {
        groupId: group.id,
        groupName: group.name,
        capabilityId: capability.id.getValue(),
        capabilityName: capability.name,
        subCapabilityId: subCap.id,
        subCapabilityName: subCap.name,
        baseFunctionId: baseFunc.id,
        baseFunctionName: baseFunc.name,
      },
      style: {
        name: group.style.getValue(),
        color: group.style.getColor(),
      },
    };
  }

  /**
   * Crea resultado para nivel de funcionalidad
   */
  private createFunctionalityResult(group: any, capability: any, subCap: any, baseFunc: any, func: any, matchedText: string, searchTerm: string): SearchResultDto {
    return {
      level: 'functionality',
      id: func.id,
      name: func.name,
      description: func.description,
      matchedText: this.highlightSearchTerm(matchedText, searchTerm),
      path: {
        groupId: group.id,
        groupName: group.name,
        capabilityId: capability.id.getValue(),
        capabilityName: capability.name,
        subCapabilityId: subCap.id,
        subCapabilityName: subCap.name,
        baseFunctionId: baseFunc.id,
        baseFunctionName: baseFunc.name,
      },
      style: {
        name: group.style.getValue(),
        color: group.style.getColor(),
      },
      additionalInfo: {
        level: func.level,
        systemApplication: func.systemApplication,
        commonComponentId: func.commonComponentId,
        commonComponentName: func.commonComponentName,
      },
    };
  }

  /**
   * Resalta el término de búsqueda en el texto
   */
  private highlightSearchTerm(text: string, searchTerm: string): string {
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  /**
   * Ordena los resultados por relevancia
   */
  private sortResultsByRelevance(results: SearchResultDto[], searchTerm: string): SearchResultDto[] {
    return results.sort((a, b) => {
      // Priorizar coincidencias exactas en el nombre
      const aExactName = a.name.toLowerCase() === searchTerm.toLowerCase();
      const bExactName = b.name.toLowerCase() === searchTerm.toLowerCase();

      if (aExactName && !bExactName) return -1;
      if (!aExactName && bExactName) return 1;

      // Priorizar coincidencias al inicio del nombre
      const aStartsWithName = a.name.toLowerCase().startsWith(searchTerm.toLowerCase());
      const bStartsWithName = b.name.toLowerCase().startsWith(searchTerm.toLowerCase());

      if (aStartsWithName && !bStartsWithName) return -1;
      if (!aStartsWithName && bStartsWithName) return 1;

      // Ordenar por jerarquía (grupos primero, funcionalidades al final)
      const levelOrder = { group: 1, capability: 2, subcapability: 3, baseFunction: 4, functionality: 5 };
      return levelOrder[a.level] - levelOrder[b.level];
    });
  }
}
