import { BaseFunction } from './BaseFunction';
import { Functionality } from './Functionality';

/**
 * Entidad que representa una SubCapacidad dentro de una Capacidad BIAN
 * Ahora contiene BaseFunctions en lugar de Functionalities directamente
 */
export class SubCapability {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly capabilityId: string,
    public readonly baseFunctions: BaseFunction[] = [],
    public readonly isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  /**
   * Verifica si la subcapacidad puede ser activada
   */
  canBeActivated(): boolean {
    return this.hasBaseFunctions() && this.isActive;
  }

  /**
   * Verifica si esta lista para implementacion
   */
  isReadyForImplementation(): boolean {
    return this.isActive && this.hasBaseFunctions() && this.description.length > 5;
  }

  /**
   * Verifica si tiene funcionalidades base
   */
  hasBaseFunctions(): boolean {
    return this.baseFunctions.length > 0;
  }

  /**
   * Obtiene el total de funcionalidades base
   */
  getTotalBaseFunctions(): number {
    return this.baseFunctions.length;
  }

  /**
   * Obtiene todas las funcionalidades de todas las funcionalidades base
   */
  getAllFunctionalities(): Functionality[] {
    return this.baseFunctions.flatMap(bf => bf.functionalities);
  }

  /**
   * Obtiene el total de funcionalidades
   */
  getTotalFunctionalities(): number {
    return this.baseFunctions.reduce((total, bf) => total + bf.functionalities.length, 0);
  }

  /**
   * Crea una copia de la subcapacidad con nuevos valores
   */
  update(updates: Partial<Pick<SubCapability, 'name' | 'description' | 'baseFunctions' | 'isActive'>>): SubCapability {
    return new SubCapability(
      this.id,
      updates.name ?? this.name,
      updates.description ?? this.description,
      this.capabilityId,
      updates.baseFunctions ?? this.baseFunctions,
      updates.isActive ?? this.isActive,
      this.createdAt,
      new Date()
    );
  }
}
