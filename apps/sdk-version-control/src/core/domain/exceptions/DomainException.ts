/**
 * Excepción base para errores de dominio
 */
export abstract class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

/**
 * Excepción para errores de validación
 */
export class ValidationException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Excepción para versiones inválidas
 */
export class InvalidVersionException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Excepción cuando no se encuentra un servicio
 */
export class ServiceNotFoundException extends DomainException {
  constructor(serviceId: string) {
    super(`Service not found: ${serviceId}`);
  }
}

/**
 * Excepción cuando ya existe un servicio con el mismo nombre
 */
export class ServiceAlreadyExistsException extends DomainException {
  constructor(serviceName: string) {
    super(`Service already exists with name: ${serviceName}`);
  }
}

/**
 * Excepción para errores de scraping
 */
export class ScrapingException extends DomainException {
  readonly url?: string;
  readonly statusCode?: number;

  constructor(message: string, url?: string, statusCode?: number) {
    super(message);
    this.url = url;
    this.statusCode = statusCode;
  }
}

/**
 * Excepción para errores de configuración
 */
export class ConfigurationException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Excepción para reglas de negocio violadas
 */
export class BusinessRuleException extends DomainException {
  readonly code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.code = code;
  }
}
