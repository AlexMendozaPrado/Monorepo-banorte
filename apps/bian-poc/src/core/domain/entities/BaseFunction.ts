import { Functionality } from './Functionality';

/**
 * Entidad que representa una Funcionalidad Base (nivel intermedio)
 * Agrupa funcionalidades especificas bajo una categoria funcional
 */
export class BaseFunction {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly subCapabilityId: string,
    public readonly functionalities: Functionality[] = [],
    public readonly isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  /**
   * Verifica si tiene funcionalidades
   */
  hasFunctionalities(): boolean {
    return this.functionalities.length > 0;
  }

  /**
   * Verifica si puede ser activada
   */
  canBeActivated(): boolean {
    return this.functionalities.some(f => f.isActive);
  }

  /**
   * Obtiene el total de funcionalidades
   */
  getTotalFunctionalities(): number {
    return this.functionalities.length;
  }

  /**
   * Obtiene funcionalidades activas
   */
  getActiveFunctionalities(): Functionality[] {
    return this.functionalities.filter(f => f.isActive);
  }

  /**
   * Verifica si esta lista para implementacion
   */
  isReadyForImplementation(): boolean {
    return this.isActive && this.hasFunctionalities();
  }

  /**
   * Crea una copia con nuevos valores (patron inmutable)
   */
  update(updates: Partial<Pick<BaseFunction, 'name' | 'description' | 'functionalities' | 'isActive'>>): BaseFunction {
    return new BaseFunction(
      this.id,
      updates.name ?? this.name,
      updates.description ?? this.description,
      this.subCapabilityId,
      updates.functionalities ?? this.functionalities,
      updates.isActive ?? this.isActive,
      this.createdAt,
      new Date()
    );
  }
}
