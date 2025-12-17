import { NextRequest, NextResponse } from 'next/server';
import { getDIContainer } from '@/infrastructure/di/initialize';
import { GetAllServicesUseCase } from '@/core/application/use-cases/GetAllServicesUseCase';
import { ServiceCategory } from '@/core/domain/entities/Service';
import { PlatformType } from '@/core/domain/value-objects/PlatformType';
import { VersionStatus } from '@/core/domain/value-objects/VersionStatus';

export const dynamic = 'force-dynamic';

/**
 * GET /api/services
 *
 * Obtiene todos los servicios con filtros opcionales
 *
 * Query params:
 * - category: Filtrar por categoría
 * - platform: Filtrar por plataforma
 * - status: Filtrar por estado
 * - search: Búsqueda por texto
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters = {
      category: searchParams.get('category') as ServiceCategory | undefined,
      platform: searchParams.get('platform') as PlatformType | undefined,
      status: searchParams.get('status') as VersionStatus | undefined,
      search: searchParams.get('search') || undefined,
    };

    // Limpiar undefined
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof typeof filters] === undefined ||
          filters[key as keyof typeof filters] === null ||
          filters[key as keyof typeof filters] === '') {
        delete filters[key as keyof typeof filters];
      }
    });

    const container = getDIContainer();
    const useCase = container.resolve<GetAllServicesUseCase>('GetAllServicesUseCase');

    const result = await useCase.execute({ filters });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API /services] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch services',
        },
      },
      { status: 500 }
    );
  }
}
