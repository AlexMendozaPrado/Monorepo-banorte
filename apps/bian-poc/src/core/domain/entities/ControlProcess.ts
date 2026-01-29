/**
 * Entidad que representa un Proceso de Control y Gobierno
 * Los procesos de control estan asociados a capacidades y subcapacidades
 */
export class ControlProcess {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly capabilityName: string,
    public readonly subCapabilityName: string,
    public readonly isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  /**
   * Verifica si tiene capacidad asociada
   */
  hasCapability(): boolean {
    return this.capabilityName.length > 0;
  }

  /**
   * Verifica si tiene subcapacidad asociada
   */
  hasSubCapability(): boolean {
    return this.subCapabilityName.length > 0;
  }

  /**
   * Verifica si esta completamente configurado
   */
  isCompletelyConfigured(): boolean {
    return this.name.length > 0 && this.hasCapability() && this.hasSubCapability();
  }

  /**
   * Crea una copia con nuevos valores (patron inmutable)
   */
  update(updates: Partial<Pick<ControlProcess, 'name' | 'capabilityName' | 'subCapabilityName' | 'isActive'>>): ControlProcess {
    return new ControlProcess(
      this.id,
      updates.name ?? this.name,
      updates.capabilityName ?? this.capabilityName,
      updates.subCapabilityName ?? this.subCapabilityName,
      updates.isActive ?? this.isActive,
      this.createdAt,
      new Date()
    );
  }
}
