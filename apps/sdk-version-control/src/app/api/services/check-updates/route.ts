import { NextRequest, NextResponse } from 'next/server';
import { getDIContainer } from '@/infrastructure/di/initialize';
import { CheckVersionUpdatesUseCase } from '@/core/application/use-cases/CheckVersionUpdatesUseCase';
import { PlatformType, isValidPlatform } from '@/core/domain/value-objects/PlatformType';

/**
 * POST /api/services/check-updates
 *
 * Ejecuta verificación de actualizaciones de versiones
 *
 * Body:
 * - serviceIds?: string[] - IDs de servicios a verificar (vacío = todos)
 * - platforms?: PlatformType[] - Plataformas a verificar
 * - forceRefresh?: boolean - Forzar re-scraping ignorando cache
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    // Validar platforms si se proporcionan
    if (body.platforms && Array.isArray(body.platforms)) {
      const invalidPlatforms = body.platforms.filter((p: string) => !isValidPlatform(p));
      if (invalidPlatforms.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_PLATFORMS',
              message: `Invalid platforms: ${invalidPlatforms.join(', ')}`,
            },
          },
          { status: 400 }
        );
      }
    }

    const container = getDIContainer();
    const useCase = container.resolve<CheckVersionUpdatesUseCase>('CheckVersionUpdatesUseCase');

    const result = await useCase.execute({
      serviceIds: body.serviceIds,
      options: {
        platforms: body.platforms as PlatformType[],
        forceRefresh: body.forceRefresh,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API /services/check-updates] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CHECK_ERROR',
          message: error instanceof Error ? error.message : 'Failed to check updates',
        },
      },
      { status: 500 }
    );
  }
}
