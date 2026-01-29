/**
 * Entidad que representa una Funcionalidad especifica
 * Ahora pertenece a una BaseFunction en lugar de SubCapability
 */
export class Functionality {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly baseFunctionId: string,
    public readonly commonComponentId?: string,
    public readonly commonComponentName?: string,
    public readonly level?: number,
    public readonly systemApplication?: string,
    public readonly isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  /**
   * Regla de negocio: Verifica si la funcionalidad puede ser activada
   */
  canBeActivated(): boolean {
    return this.name.trim().length > 0 && this.description.trim().length > 5;
  }

  /**
   * Regla de negocio: Verifica si esta completamente definida
   */
  isCompletelyDefined(): boolean {
    return this.name.trim().length > 0 && this.description.trim().length > 10;
  }

  /**
   * Regla de negocio: Verifica si esta lista para implementacion
   */
  isReadyForImplementation(): boolean {
    return this.isActive && this.isCompletelyDefined();
  }

  /**
   * Verifica si tiene componente comun asociado
   */
  hasCommonComponent(): boolean {
    return !!this.commonComponentId;
  }

  /**
   * Verifica si tiene nivel asignado
   */
  hasLevel(): boolean {
    return this.level !== undefined && this.level !== null;
  }

  /**
   * Verifica si tiene sistema/aplicacion asignado
   */
  hasSystemApplication(): boolean {
    return !!this.systemApplication;
  }

  /**
   * Comportamiento de dominio: Activa la funcionalidad
   */
  activate(): Functionality {
    if (!this.canBeActivated()) {
      throw new Error("Functionality cannot be activated: incomplete definition");
    }
    return this.update({ isActive: true });
  }

  /**
   * Comportamiento de dominio: Desactiva la funcionalidad
   */
  deactivate(): Functionality {
    return this.update({ isActive: false });
  }

  /**
   * Verifica si el nombre es valido segun reglas de negocio
   */
  hasValidName(): boolean {
    return this.name.trim().length >= 3 && this.name.trim().length <= 100;
  }

  /**
   * Verifica si la descripcion es valida segun reglas de negocio
   */
  hasValidDescription(): boolean {
    return this.description.trim().length >= 10 && this.description.trim().length <= 500;
  }

  /**
   * Crea una copia de la funcionalidad con nuevos valores (patron inmutable)
   */
  update(updates: Partial<Pick<Functionality, 'name' | 'description' | 'commonComponentId' | 'commonComponentName' | 'level' | 'systemApplication' | 'isActive'>>): Functionality {
    return new Functionality(
      this.id,
      updates.name ?? this.name,
      updates.description ?? this.description,
      this.baseFunctionId,
      updates.commonComponentId ?? this.commonComponentId,
      updates.commonComponentName ?? this.commonComponentName,
      updates.level ?? this.level,
      updates.systemApplication ?? this.systemApplication,
      updates.isActive ?? this.isActive,
      this.createdAt,
      new Date()
    );
  }
}
