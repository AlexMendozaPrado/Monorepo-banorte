import { CapabilityId } from '../value-objects/CapabilityId';
import { SubCapability } from './SubCapability';
import { BaseFunction } from './BaseFunction';
import { Functionality } from './Functionality';

/**
 * Entidad que representa una Capacidad Empresarial (segundo nivel en la jerarquia)
 * Ahora contiene SubCapacidades directamente (se elimino BusinessCapability)
 */
export class Capability {
  constructor(
    public readonly id: CapabilityId,
    public readonly name: string,
    public readonly groupId: string,
    public readonly subCapabilities: SubCapability[] = [],
    public readonly isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  /**
   * Verifica si la capacidad tiene subcapacidades
   */
  hasSubCapabilities(): boolean {
    return this.subCapabilities.length > 0;
  }

  /**
   * Verifica si la capacidad puede ser activada
   */
  canBeActivated(): boolean {
    return this.hasSubCapabilities() && this.isActive;
  }

  /**
   * Verifica si esta completamente configurada
   */
  isCompletelyConfigured(): boolean {
    return this.hasSubCapabilities() && this.subCapabilities.every(sc => sc.isActive);
  }

  /**
   * Obtiene el total de subcapacidades
   */
  getTotalSubCapabilities(): number {
    return this.subCapabilities.length;
  }

  /**
   * Obtiene el total de funcionalidades base
   */
  getTotalBaseFunctions(): number {
    return this.subCapabilities.reduce((total, sc) => total + sc.baseFunctions.length, 0);
  }

  /**
   * Obtiene el total de funcionalidades
   */
  getTotalFunctionalities(): number {
    return this.subCapabilities.reduce((total, sc) => {
      return total + sc.baseFunctions.reduce((subTotal, bf) => {
        return subTotal + bf.functionalities.length;
      }, 0);
    }, 0);
  }

  /**
   * Obtiene todas las funcionalidades base
   */
  getAllBaseFunctions(): BaseFunction[] {
    return this.subCapabilities.flatMap(sc => sc.baseFunctions);
  }

  /**
   * Obtiene todas las funcionalidades
   */
  getAllFunctionalities(): Functionality[] {
    return this.subCapabilities.flatMap(sc =>
      sc.baseFunctions.flatMap(bf => bf.functionalities)
    );
  }

  /**
   * Crea una copia de la capacidad con nuevos valores
   */
  update(updates: Partial<Pick<Capability, 'name' | 'subCapabilities' | 'isActive'>>): Capability {
    return new Capability(
      this.id,
      updates.name ?? this.name,
      this.groupId,
      updates.subCapabilities ?? this.subCapabilities,
      updates.isActive ?? this.isActive,
      this.createdAt,
      new Date()
    );
  }
}
