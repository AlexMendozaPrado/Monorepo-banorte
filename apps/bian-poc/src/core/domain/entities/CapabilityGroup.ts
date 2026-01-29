import { StyleType } from '../value-objects/StyleType';
import { Capability } from './Capability';

/**
 * Entidad que representa un grupo de capacidades (nivel superior)
 * Ej: "Conocimiento del Cliente", "Seguridad del Cliente", etc.
 */
export class CapabilityGroup {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly style: StyleType,
    public readonly capabilities: Capability[] = [],
    public readonly isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  /**
   * Verifica si el grupo puede ser activado según reglas de negocio
   */
  canBeActivated(): boolean {
    return this.capabilities.length > 0 && this.capabilities.some(cap => cap.isActive);
  }

  /**
   * Verifica si el grupo tiene capacidades
   */
  hasCapabilities(): boolean {
    return this.capabilities.length > 0;
  }

  /**
   * Verifica si el grupo está completamente configurado
   */
  isCompletelyConfigured(): boolean {
    return this.hasCapabilities() && this.style !== undefined;
  }

  /**
   * Obtiene el color del estilo para uso en UI
   */
  getStyleColor(): string {
    return this.style.getColor();
  }

  /**
   * Crea una copia del grupo con nuevos valores
   */
  update(updates: Partial<Pick<CapabilityGroup, 'name' | 'style' | 'isActive'>>): CapabilityGroup {
    return new CapabilityGroup(
      this.id,
      updates.name ?? this.name,
      updates.style ?? this.style,
      this.capabilities,
      updates.isActive ?? this.isActive,
      this.createdAt,
      new Date()
    );
  }
}