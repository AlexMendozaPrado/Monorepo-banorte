import { NextRequest, NextResponse } from 'next/server';
import { getDIContainer } from '@/infrastructure/di/initialize';
import { GetAllServicesUseCase } from '@/core/application/use-cases/GetAllServicesUseCase';
import { CreateServiceUseCase, CreateServiceInput } from '@/core/application/use-cases/CreateServiceUseCase';
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

/**
 * POST /api/services
 *
 * Crea un nuevo servicio
 *
 * Body:
 * - name: Nombre del servicio (requerido)
 * - category: Categoría (requerido)
 * - description: Descripción (requerido)
 * - documentationUrl: URL de documentación (requerido)
 * - logoUrl: URL del logo (opcional)
 * - versions: Versiones por plataforma (al menos una requerida)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const container = getDIContainer();
    const useCase = container.resolve<CreateServiceUseCase>('CreateServiceUseCase');

    const input: CreateServiceInput = {
      name: body.name,
      category: body.category,
      description: body.description,
      documentationUrl: body.documentationUrl,
      logoUrl: body.logoUrl,
      versions: body.versions || {},
    };

    const result = await useCase.execute(input);

    if (!result.success) {
      const status =
        result.error?.code === 'SERVICE_ALREADY_EXISTS' ? 409 :
        result.error?.code === 'VALIDATION_ERROR' ? 400 :
        500;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('[API /services POST] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create service',
        },
      },
      { status: 500 }
    );
  }
}
