import { NextRequest, NextResponse } from 'next/server';
import { getDIContainer } from '@/infrastructure/di/initialize';
import { CompareServicesUseCase } from '@/core/application/use-cases/CompareServicesUseCase';
import { PlatformType, isValidPlatform } from '@/core/domain/value-objects/PlatformType';

export const dynamic = 'force-dynamic';

/**
 * GET /api/services/compare
 *
 * Compara múltiples servicios lado a lado
 *
 * Query params:
 * - ids: IDs de servicios separados por coma (mínimo 2, máximo 4)
 * - platforms: Plataformas a comparar separadas por coma (opcional)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const idsParam = searchParams.get('ids');
    const platformsParam = searchParams.get('platforms');

    // Validar ids
    if (!idsParam) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'ids parameter is required',
          },
        },
        { status: 400 }
      );
    }

    const serviceIds = idsParam.split(',').map(id => id.trim()).filter(Boolean);

    if (serviceIds.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'At least 2 service IDs are required',
          },
        },
        { status: 400 }
      );
    }

    if (serviceIds.length > 4) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Maximum 4 services can be compared',
          },
        },
        { status: 400 }
      );
    }

    // Validar platforms si se proporcionan
    let platforms: PlatformType[] | undefined;
    if (platformsParam) {
      const platformsList = platformsParam.split(',').map(p => p.trim()).filter(Boolean);
      const invalidPlatforms = platformsList.filter(p => !isValidPlatform(p));

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

      platforms = platformsList as PlatformType[];
    }

    const container = getDIContainer();
    const useCase = container.resolve<CompareServicesUseCase>('CompareServicesUseCase');

    const result = await useCase.execute({
      serviceIds,
      platforms,
    });

    if (!result.success) {
      const status = result.error?.code === 'NOT_FOUND' ? 404 : 500;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API /services/compare] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'COMPARISON_ERROR',
          message: error instanceof Error ? error.message : 'Failed to compare services',
        },
      },
      { status: 500 }
    );
  }
}
