/**
 * Entidad que representa un Servicio
 * Los servicios estan asociados a componentes comunes
 */
export class Service {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly commonComponentIds: string[] = [],
    public readonly isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  /**
   * Verifica si tiene componentes comunes asociados
   */
  hasCommonComponents(): boolean {
    return this.commonComponentIds.length > 0;
  }

  /**
   * Obtiene el total de componentes comunes
   */
  getTotalCommonComponents(): number {
    return this.commonComponentIds.length;
  }

  /**
   * Verifica si esta asociado a un componente comun especifico
   */
  isAssociatedTo(commonComponentId: string): boolean {
    return this.commonComponentIds.includes(commonComponentId);
  }

  /**
   * Crea una copia con nuevos valores (patron inmutable)
   */
  update(updates: Partial<Pick<Service, 'name' | 'commonComponentIds' | 'isActive'>>): Service {
    return new Service(
      this.id,
      updates.name ?? this.name,
      updates.commonComponentIds ?? this.commonComponentIds,
      updates.isActive ?? this.isActive,
      this.createdAt,
      new Date()
    );
  }
}
