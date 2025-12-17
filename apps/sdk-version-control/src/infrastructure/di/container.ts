type Factory<T> = () => T;
type Constructor<T> = new (...args: unknown[]) => T;

interface ServiceDefinition {
  factoryOrConstructor: Factory<unknown> | Constructor<unknown>;
  singleton: boolean;
}

/**
 * Contenedor de inyección de dependencias simple
 */
export class DIContainer {
  private services: Map<string, ServiceDefinition> = new Map();
  private singletons: Map<string, unknown> = new Map();

  /**
   * Registra un servicio en el contenedor
   *
   * @param name Nombre del servicio
   * @param factoryOrConstructor Factory function o constructor
   * @param singleton Si debe ser singleton (default: true)
   */
  register<T>(
    name: string,
    factoryOrConstructor: Factory<T> | Constructor<T>,
    singleton: boolean = true
  ): void {
    this.services.set(name, {
      factoryOrConstructor: factoryOrConstructor as Factory<unknown>,
      singleton,
    });
  }

  /**
   * Resuelve un servicio del contenedor
   *
   * @param name Nombre del servicio
   * @returns Instancia del servicio
   */
  resolve<T>(name: string): T {
    const service = this.services.get(name);

    if (!service) {
      throw new Error(`Service "${name}" not registered in DI container`);
    }

    // Si es singleton y ya existe, retornar instancia existente
    if (service.singleton && this.singletons.has(name)) {
      return this.singletons.get(name) as T;
    }

    // Crear nueva instancia
    let instance: T;

    if (typeof service.factoryOrConstructor === 'function') {
      // Verificar si es factory (no tiene prototype) o constructor
      if (service.factoryOrConstructor.prototype === undefined ||
          Object.getOwnPropertyNames(service.factoryOrConstructor.prototype).length <= 1) {
        // Es una factory function
        instance = (service.factoryOrConstructor as Factory<T>)();
      } else {
        // Es un constructor
        instance = new (service.factoryOrConstructor as Constructor<T>)();
      }
    } else {
      throw new Error(`Invalid service definition for "${name}"`);
    }

    // Si es singleton, guardar instancia
    if (service.singleton) {
      this.singletons.set(name, instance);
    }

    return instance;
  }

  /**
   * Verifica si un servicio está registrado
   */
  has(name: string): boolean {
    return this.services.has(name);
  }

  /**
   * Elimina un servicio del contenedor
   */
  remove(name: string): boolean {
    this.singletons.delete(name);
    return this.services.delete(name);
  }

  /**
   * Limpia el contenedor
   */
  clear(): void {
    this.services.clear();
    this.singletons.clear();
  }

  /**
   * Valida que todos los servicios requeridos estén registrados
   */
  validate(requiredServices: string[]): void {
    const missing = requiredServices.filter(s => !this.has(s));
    if (missing.length > 0) {
      throw new Error(`Missing required services: ${missing.join(', ')}`);
    }
    console.log('[DIContainer] All required services registered');
  }

  /**
   * Lista todos los servicios registrados
   */
  listServices(): string[] {
    return Array.from(this.services.keys());
  }
}

// Instancia global del contenedor
export const container = new DIContainer();
