type Constructor<T> = new (...args: any[]) => T;
type Factory<T> = () => T;

export class DIContainer {
  private services: Map<string, any> = new Map();
  private singletons: Map<string, any> = new Map();

  register<T>(name: string, factoryOrConstructor: Factory<T> | Constructor<T>, singleton = true): void {
    this.services.set(name, { factoryOrConstructor, singleton });
  }

  resolve<T>(name: string): T {
    const service = this.services.get(name);

    if (!service) {
      throw new Error(`Service ${name} not registered in DI container`);
    }

    if (service.singleton && this.singletons.has(name)) {
      return this.singletons.get(name);
    }

    let instance: T;
    if (typeof service.factoryOrConstructor === 'function') {
      if (service.factoryOrConstructor.prototype === undefined) {
        instance = (service.factoryOrConstructor as Factory<T>)();
      } else {
        instance = new (service.factoryOrConstructor as Constructor<T>)();
      }
    } else {
      throw new Error(`Invalid service registration for ${name}`);
    }

    if (service.singleton) {
      this.singletons.set(name, instance);
    }

    return instance;
  }

  clear(): void {
    this.services.clear();
    this.singletons.clear();
  }
}

export const container = new DIContainer();
