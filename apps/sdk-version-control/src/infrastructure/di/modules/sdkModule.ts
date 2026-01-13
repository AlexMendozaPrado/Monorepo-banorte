import { DIContainer } from '../container';
import { InMemoryServiceRepository } from '../../repositories/InMemoryServiceRepository';
import { GitHubServiceRepository } from '../../repositories/GitHubServiceRepository';
import { GitHubApiClient } from '../../services/GitHubApiClient';
import { BaseVersionScraper } from '../../scrapers/BaseVersionScraper';
import { WebScraperVersionChecker } from '../../scrapers/WebScraperVersionChecker';
import { scrapingConfigs } from '../../config/scraping.config';
import { IServiceRepository } from '@/core/domain/ports/repositories/IServiceRepository';

// Use Cases
import { GetAllServicesUseCase } from '@/core/application/use-cases/GetAllServicesUseCase';
import { GetServiceByIdUseCase } from '@/core/application/use-cases/GetServiceByIdUseCase';
import { CheckVersionUpdatesUseCase } from '@/core/application/use-cases/CheckVersionUpdatesUseCase';
import { CompareServicesUseCase } from '@/core/application/use-cases/CompareServicesUseCase';
import { UpdateServiceVersionUseCase } from '@/core/application/use-cases/UpdateServiceVersionUseCase';
import { CreateServiceUseCase } from '@/core/application/use-cases/CreateServiceUseCase';
import { UpdateServiceUseCase } from '@/core/application/use-cases/UpdateServiceUseCase';
import { DeleteServiceUseCase } from '@/core/application/use-cases/DeleteServiceUseCase';

/**
 * Crea el repositorio de servicios según la configuración del entorno
 */
function createServiceRepository(): IServiceRepository {
  const repositoryType = process.env.REPOSITORY_TYPE || 'memory';

  if (repositoryType === 'github') {
    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || 'main';

    if (!token || !owner || !repo) {
      console.warn('[SDKModule] GitHub config incomplete, falling back to InMemory');
      return new InMemoryServiceRepository();
    }

    console.log(`[SDKModule] Using GitHubServiceRepository (${owner}/${repo}@${branch})`);

    const githubClient = new GitHubApiClient({ token, owner, repo, branch });
    return new GitHubServiceRepository(githubClient);
  }

  console.log('[SDKModule] Using InMemoryServiceRepository');
  return new InMemoryServiceRepository();
}

/**
 * Registra todos los servicios del módulo SDK en el contenedor
 */
export function registerSDKModule(container: DIContainer): void {
  console.log('[SDKModule] Registering services...');

  // Repositorios (Singletons) - Selección según entorno
  container.register('IServiceRepository', () => createServiceRepository(), true);

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

  container.register('CreateServiceUseCase', () => {
    return new CreateServiceUseCase(
      container.resolve('IServiceRepository')
    );
  }, false);

  container.register('UpdateServiceUseCase', () => {
    return new UpdateServiceUseCase(
      container.resolve('IServiceRepository')
    );
  }, false);

  container.register('DeleteServiceUseCase', () => {
    return new DeleteServiceUseCase(
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

export function getCreateServiceUseCase(): CreateServiceUseCase {
  const { getDIContainer } = require('../initialize');
  return getDIContainer().resolve('CreateServiceUseCase');
}

export function getUpdateServiceUseCase(): UpdateServiceUseCase {
  const { getDIContainer } = require('../initialize');
  return getDIContainer().resolve('UpdateServiceUseCase');
}

export function getDeleteServiceUseCase(): DeleteServiceUseCase {
  const { getDIContainer } = require('../initialize');
  return getDIContainer().resolve('DeleteServiceUseCase');
}
