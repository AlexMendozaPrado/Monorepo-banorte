import { CapabilityGroupRepository } from '../../core/domain/ports/CapabilityGroupRepository';
import { CapabilityGroup } from '../../core/domain/entities/CapabilityGroup';
import { Capability } from '../../core/domain/entities/Capability';
import { SubCapability } from '../../core/domain/entities/SubCapability';
import { BaseFunction } from '../../core/domain/entities/BaseFunction';
import { Functionality } from '../../core/domain/entities/Functionality';
import { CapabilityId } from '../../core/domain/value-objects/CapabilityId';
import { StyleType } from '../../core/domain/value-objects/StyleType';
import bianData from '../data/bian-data.json';

/**
 * Implementacion del repositorio de grupos de capacidades usando datos JSON v2.0
 * Nueva estructura: grupos -> capacidades -> subcapacidades -> funcionalidadesBase -> funcionalidades
 */
export class JsonCapabilityGroupRepository implements CapabilityGroupRepository {
  private capabilityGroups: CapabilityGroup[] = [];

  constructor() {
    this.loadData();
  }

  /**
   * Carga los datos desde el archivo JSON con la nueva estructura v2.0
   */
  private loadData(): void {
    try {
      const data = bianData as any;

      // Soportar tanto estructura v2.0 (grupos) como v1.0 (CEfuncionalidades)
      const groups = data.grupos || data.CEfuncionalidades || [];

      this.capabilityGroups = groups.map((groupData: any) =>
        this.mapToCapabilityGroup(groupData)
      );
    } catch (error) {
      console.error('Error loading BIAN data:', error);
      this.capabilityGroups = [];
    }
  }

  /**
   * Mapea datos JSON a entidad CapabilityGroup
   */
  private mapToCapabilityGroup(data: any): CapabilityGroup {
    const style = new StyleType(data.estilo || 'info');

    const capabilities = data.capacidades?.map((capData: any) =>
      this.mapToCapability(capData, data.Nombre)
    ) || [];

    return new CapabilityGroup(
      this.generateGroupId(data.Nombre),
      data.Nombre,
      style,
      capabilities,
      true,
      new Date(),
      new Date()
    );
  }

  /**
   * Mapea datos JSON a entidad Capability
   */
  private mapToCapability(data: any, groupName: string): Capability {
    const capabilityId = new CapabilityId(data.Id);
    const groupId = this.generateGroupId(groupName);

    // Nueva estructura v2.0: subcapacidades directamente
    const subCapabilities = data.subcapacidades?.map((subData: any) =>
      this.mapToSubCapability(subData, data.Id)
    ) || [];

    return new Capability(
      capabilityId,
      data.Nombre,
      groupId,
      subCapabilities,
      true,
      new Date(),
      new Date()
    );
  }

  /**
   * Mapea datos JSON a entidad SubCapability
   */
  private mapToSubCapability(data: any, capabilityId: string): SubCapability {
    // Nueva estructura v2.0: funcionalidadesBase
    const baseFunctions = data.funcionalidadesBase?.map((bfData: any) =>
      this.mapToBaseFunction(bfData, data.Id)
    ) || [];

    return new SubCapability(
      data.Id,
      data.Nombre,
      data.Descripcion || '',
      capabilityId,
      baseFunctions,
      true,
      new Date(),
      new Date()
    );
  }

  /**
   * Mapea datos JSON a entidad BaseFunction
   */
  private mapToBaseFunction(data: any, subCapabilityId: string): BaseFunction {
    const functionalities = data.funcionalidades?.map((funcData: any) =>
      this.mapToFunctionality(funcData, data.Id)
    ) || [];

    return new BaseFunction(
      data.Id,
      data.Nombre,
      data.Descripcion || '',
      subCapabilityId,
      functionalities,
      true,
      new Date(),
      new Date()
    );
  }

  /**
   * Mapea datos JSON a entidad Functionality con nuevos campos
   */
  private mapToFunctionality(data: any, baseFunctionId: string): Functionality {
    return new Functionality(
      data.Id,
      data.Nombre,
      data.Descripcion || '',
      baseFunctionId,
      data.ComponenteComunId || undefined,
      data.ComponenteComunNombre || undefined,
      data.Nivel || undefined,
      data.Sistema || undefined,
      true,
      new Date(),
      new Date()
    );
  }

  /**
   * Genera un ID unico para el grupo basado en el nombre
   */
  private generateGroupId(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  /**
   * Obtiene todos los grupos de capacidades
   */
  async findAll(): Promise<CapabilityGroup[]> {
    return [...this.capabilityGroups];
  }

  /**
   * Busca un grupo por ID
   */
  async findById(id: string): Promise<CapabilityGroup | null> {
    const group = this.capabilityGroups.find(group => group.id === id);
    return group || null;
  }

  /**
   * Busca grupos por estilo
   */
  async findByStyle(style: StyleType): Promise<CapabilityGroup[]> {
    return this.capabilityGroups.filter(group => group.style.equals(style));
  }

  /**
   * Busca grupos activos
   */
  async findActive(): Promise<CapabilityGroup[]> {
    return this.capabilityGroups.filter(group => group.isActive);
  }

  /**
   * Busca grupos por nombre
   */
  async findByName(name: string): Promise<CapabilityGroup[]> {
    const searchTerm = name.toLowerCase();
    return this.capabilityGroups.filter(group =>
      group.name.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Busqueda textual profunda en todos los niveles (6 niveles)
   */
  async search(query: string): Promise<CapabilityGroup[]> {
    const searchTerm = query.toLowerCase();
    return this.capabilityGroups.filter(group =>
      group.name.toLowerCase().includes(searchTerm) ||
      group.capabilities.some(cap =>
        cap.name.toLowerCase().includes(searchTerm) ||
        cap.subCapabilities.some(subCap =>
          subCap.name.toLowerCase().includes(searchTerm) ||
          subCap.description.toLowerCase().includes(searchTerm) ||
          subCap.baseFunctions.some(baseFunc =>
            baseFunc.name.toLowerCase().includes(searchTerm) ||
            baseFunc.description.toLowerCase().includes(searchTerm) ||
            baseFunc.functionalities.some(func =>
              func.name.toLowerCase().includes(searchTerm) ||
              func.description.toLowerCase().includes(searchTerm) ||
              (func.commonComponentName?.toLowerCase().includes(searchTerm) ?? false) ||
              (func.systemApplication?.toLowerCase().includes(searchTerm) ?? false)
            )
          )
        )
      )
    );
  }

  /**
   * Guarda un grupo
   */
  async save(group: CapabilityGroup): Promise<void> {
    const index = this.capabilityGroups.findIndex(g => g.id === group.id);
    if (index >= 0) {
      this.capabilityGroups[index] = group;
    } else {
      this.capabilityGroups.push(group);
    }
  }

  /**
   * Elimina un grupo
   */
  async delete(id: string): Promise<void> {
    this.capabilityGroups = this.capabilityGroups.filter(group => group.id !== id);
  }

  /**
   * Verifica si existe un grupo
   */
  async exists(id: string): Promise<boolean> {
    return this.capabilityGroups.some(group => group.id === id);
  }

  /**
   * Obtiene el conteo total de grupos
   */
  async count(): Promise<number> {
    return this.capabilityGroups.length;
  }
}
