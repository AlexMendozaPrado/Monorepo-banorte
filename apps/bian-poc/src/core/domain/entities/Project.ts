import { Capability } from './Capability';
import { Functionality } from './Functionality';

/**
 * Entidad que representa un Proyecto de usuario con capacidades seleccionadas
 */
export class Project {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly selectedCapabilities: Capability[] = [],
    public readonly selectedFunctionalities: Functionality[] = [],
    public readonly status: 'Draft' | 'Active' | 'Completed' | 'Archived' = 'Draft',
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  /**
   * Agrega una capacidad al proyecto
   */
  addCapability(capability: Capability): Project {
    if (this.hasCapability(capability.id.value)) {
      return this;
    }

    return new Project(
      this.id,
      this.name,
      this.description,
      [...this.selectedCapabilities, capability],
      this.selectedFunctionalities,
      this.status,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Remueve una capacidad del proyecto
   */
  removeCapability(capabilityId: string): Project {
    return new Project(
      this.id,
      this.name,
      this.description,
      this.selectedCapabilities.filter(cap => cap.id.value !== capabilityId),
      this.selectedFunctionalities.filter(func => func.baseFunctionId !== capabilityId),
      this.status,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Agrega una funcionalidad al proyecto
   */
  addFunctionality(functionality: Functionality): Project {
    if (this.hasFunctionality(functionality.id)) {
      return this;
    }

    return new Project(
      this.id,
      this.name,
      this.description,
      this.selectedCapabilities,
      [...this.selectedFunctionalities, functionality],
      this.status,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Remueve una funcionalidad del proyecto
   */
  removeFunctionality(functionalityId: string): Project {
    return new Project(
      this.id,
      this.name,
      this.description,
      this.selectedCapabilities,
      this.selectedFunctionalities.filter(func => func.id !== functionalityId),
      this.status,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Verifica si el proyecto tiene una capacidad específica
   */
  hasCapability(capabilityId: string): boolean {
    return this.selectedCapabilities.some(cap => cap.id.value === capabilityId);
  }

  /**
   * Verifica si el proyecto tiene una funcionalidad específica
   */
  hasFunctionality(functionalityId: string): boolean {
    return this.selectedFunctionalities.some(func => func.id === functionalityId);
  }

  /**
   * Obtiene el esfuerzo total estimado del proyecto
   */
  getTotalEstimatedEffort(): number {
    // Por ahora retornamos 0 ya que Functionality no tiene estimatedEffort
    return this.selectedFunctionalities.length;
  }

  /**
   * Obtiene el número total de elementos seleccionados
   */
  getTotalItems(): number {
    return this.selectedCapabilities.length + this.selectedFunctionalities.length;
  }

  /**
   * Actualiza el estado del proyecto
   */
  updateStatus(status: Project['status']): Project {
    return new Project(
      this.id,
      this.name,
      this.description,
      this.selectedCapabilities,
      this.selectedFunctionalities,
      status,
      this.createdAt,
      new Date()
    );
  }
}
