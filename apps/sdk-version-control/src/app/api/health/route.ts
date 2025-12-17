import { NextResponse } from 'next/server';
import { getDIContainer, isDIInitialized } from '@/infrastructure/di/initialize';
import { IVersionCheckerPort } from '@/core/domain/ports/external-services/IVersionCheckerPort';

/**
 * GET /api/health
 *
 * Verifica el estado de salud de la aplicación y los scrapers
 */
export async function GET() {
  try {
    const health = {
      status: 'healthy' as 'healthy' | 'degraded' | 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        diContainer: false,
        repository: false,
        scrapers: {} as Record<string, boolean>,
      },
      version: '1.0.0',
    };

    // Verificar DI Container
    health.services.diContainer = isDIInitialized();

    if (!health.services.diContainer) {
      // Intentar inicializar
      try {
        getDIContainer();
        health.services.diContainer = true;
      } catch {
        health.status = 'unhealthy';
      }
    }

    if (health.services.diContainer) {
      const container = getDIContainer();

      // Verificar Repository
      try {
        const repo = container.resolve('IServiceRepository');
        health.services.repository = repo !== null;
      } catch {
        health.services.repository = false;
        health.status = 'degraded';
      }

      // Verificar Scrapers
      try {
        const versionChecker = container.resolve<IVersionCheckerPort>('IVersionCheckerPort');
        const scraperIds = versionChecker.getAvailableScraperIds();

        for (const id of scraperIds) {
          health.services.scrapers[id] = versionChecker.hasScraperFor(id);
        }
      } catch {
        health.status = 'degraded';
      }
    }

    // Determinar estado final
    if (!health.services.diContainer || !health.services.repository) {
      health.status = 'unhealthy';
    } else if (Object.values(health.services.scrapers).some(v => !v)) {
      health.status = 'degraded';
    }

    const statusCode = health.status === 'unhealthy' ? 503 : 200;

    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    console.error('[API /health] Error:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Health check failed',
      },
      { status: 503 }
    );
  }
}
