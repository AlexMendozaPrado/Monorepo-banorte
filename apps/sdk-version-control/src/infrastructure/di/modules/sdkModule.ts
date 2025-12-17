import { DIContainer } from '../container';
import { InMemoryServiceRepository } from '../../repositories/InMemoryServiceRepository';
import { BaseVersionScraper } from '../../scrapers/BaseVersionScraper';
import { WebScraperVersionChecker } from '../../scrapers/WebScraperVersionChecker';
import { scrapingConfigs } from '../../config/scraping.config';

// Use Cases
import { GetAllServicesUseCase } from '@/core/application/use-cases/GetAllServicesUseCase';
import { GetServiceByIdUseCase } from '@/core/application/use-cases/GetServiceByIdUseCase';
import { CheckVersionUpdatesUseCase } from '@/core/application/use-cases/CheckVersionUpdatesUseCase';
import { CompareServicesUseCase } from '@/core/application/use-cases/CompareServicesUseCase';
import { UpdateServiceVersionUseCase } from '@/core/application/use-cases/UpdateServiceVersionUseCase';

/**
 * Registra todos los servicios del módulo SDK en el contenedor
 */
export function registerSDKModule(container: DIContainer): void {
  console.log('[SDKModule] Registering services...');

  // Repositorios (Singletons)
  container.register('IServiceRepository', () => new InMemoryServiceRepository(), true);

  // Scrapers (Singleton - compartido entre requests)
  container.register('IVersionCheckerPort', () => {
    // Crear scrapers desde configuración
    const scrapers = scrapingConfigs.map(config => new BaseVersionScraper(config));
    return new WebScraperVersionChecker(scrapers);
  }, true);

  // Use Cases (Nueva instancia por request para estado limpio)
  container.register('GetAllServicesUseCase', () => {
    return new GetAllServicesUseCase(
      container.resolve('IServiceRepository')
    );
  }, false);

  container.register('GetServiceByIdUseCase', () => {
    return new GetServiceByIdUseCase(
      container.resolve('IServiceRepository')
    );
  }, false);

  container.register('CheckVersionUpdatesUseCase', () => {
    return new CheckVersionUpdatesUseCase(
      container.resolve('IServiceRepository'),
      container.resolve('IVersionCheckerPort')
    );
  }, false);

  container.register('CompareServicesUseCase', () => {
    return new CompareServicesUseCase(
      container.resolve('IServiceRepository')
    );
  }, false);

  container.register('UpdateServiceVersionUseCase', () => {
    return new UpdateServiceVersionUseCase(
      container.resolve('IServiceRepository')
    );
  }, false);

  console.log('[SDKModule] All services registered');
}

// Helper functions para acceso directo a use cases
export function getGetAllServicesUseCase(): GetAllServicesUseCase {
  const { getDIContainer } = require('../initialize');
  return getDIContainer().resolve('GetAllServicesUseCase');
}

export function getGetServiceByIdUseCase(): GetServiceByIdUseCase {
  const { getDIContainer } = require('../initialize');
  return getDIContainer().resolve('GetServiceByIdUseCase');
}

export function getCheckVersionUpdatesUseCase(): CheckVersionUpdatesUseCase {
  const { getDIContainer } = require('../initialize');
  return getDIContainer().resolve('CheckVersionUpdatesUseCase');
}

export function getCompareServicesUseCase(): CompareServicesUseCase {
  const { getDIContainer } = require('../initialize');
  return getDIContainer().resolve('CompareServicesUseCase');
}

export function getUpdateServiceVersionUseCase(): UpdateServiceVersionUseCase {
  const { getDIContainer } = require('../initialize');
  return getDIContainer().resolve('UpdateServiceVersionUseCase');
}
