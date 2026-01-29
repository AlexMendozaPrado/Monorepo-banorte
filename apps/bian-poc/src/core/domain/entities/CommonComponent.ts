import { Service } from './Service';

/**
 * Entidad que representa un Componente Comun (CC)
 * Los componentes comunes son elementos reutilizables que implementan funcionalidades
 */
export class CommonComponent {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string = '',
    public readonly ocpComponentId?: string,
    public readonly projectOrigin?: string,
    public readonly functionalityIds: string[] = [],
    public readonly services: Service[] = [],
    public readonly isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  /**
   * Verifica si tiene funcionalidades asociadas
   */
  hasFunctionalities(): boolean {
    return this.functionalityIds.length > 0;
  }

  /**
   * Verifica si tiene servicios asociados
   */
  hasServices(): boolean {
    return this.services.length > 0;
  }

  /**
   * Obtiene el total de funcionalidades
   */
  getTotalFunctionalities(): number {
    return this.functionalityIds.length;
  }

  /**
   * Verifica si tiene informacion OCP
   */
  hasOcpInfo(): boolean {
    return !!this.ocpComponentId;
  }

  /**
   * Verifica si tiene proyecto de origen
   */
  hasProjectOrigin(): boolean {
    return !!this.projectOrigin;
  }

  /**
   * Verifica si esta completamente configurado
   */
  isCompletelyConfigured(): boolean {
    return this.name.length > 0 && this.hasFunctionalities();
  }

  /**
   * Crea una copia con nuevos valores (patron inmutable)
   */
  update(updates: Partial<Pick<CommonComponent, 'name' | 'description' | 'ocpComponentId' | 'projectOrigin' | 'functionalityIds' | 'services' | 'isActive'>>): CommonComponent {
    return new CommonComponent(
      this.id,
      updates.name ?? this.name,
      updates.description ?? this.description,
      updates.ocpComponentId ?? this.ocpComponentId,
      updates.projectOrigin ?? this.projectOrigin,
      updates.functionalityIds ?? this.functionalityIds,
      updates.services ?? this.services,
      updates.isActive ?? this.isActive,
      this.createdAt,
      new Date()
    );
  }
}
