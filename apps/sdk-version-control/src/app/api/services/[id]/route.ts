import { NextRequest, NextResponse } from 'next/server';
import { getDIContainer } from '@/infrastructure/di/initialize';
import { GetServiceByIdUseCase } from '@/core/application/use-cases/GetServiceByIdUseCase';
import { UpdateServiceVersionUseCase } from '@/core/application/use-cases/UpdateServiceVersionUseCase';
import { UpdateServiceUseCase, UpdateServiceInput } from '@/core/application/use-cases/UpdateServiceUseCase';
import { DeleteServiceUseCase } from '@/core/application/use-cases/DeleteServiceUseCase';
import { PlatformType, isValidPlatform } from '@/core/domain/value-objects/PlatformType';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/services/[id]
 *
 * Obtiene un servicio por su ID
 */
export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = await context.params;

    const container = getDIContainer();
    const useCase = container.resolve<GetServiceByIdUseCase>('GetServiceByIdUseCase');

    const result = await useCase.execute({ serviceId: id });

    if (!result.success) {
      const status = result.error?.code === 'NOT_FOUND' ? 404 : 500;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API /services/[id]] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch service',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/services/[id]
 *
 * Actualiza la versión de un servicio en una plataforma
 *
 * Body:
 * - platform: 'web' | 'ios' | 'android'
 * - version: Nueva versión (ej: "5.2.1")
 */
export async function PATCH(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    // Validar input
    if (!body.platform || !body.version) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'platform and version are required',
          },
        },
        { status: 400 }
      );
    }

    if (!isValidPlatform(body.platform)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PLATFORM',
            message: 'platform must be web, ios, or android',
          },
        },
        { status: 400 }
      );
    }

    const container = getDIContainer();
    const useCase = container.resolve<UpdateServiceVersionUseCase>('UpdateServiceVersionUseCase');

    const result = await useCase.execute({
      serviceId: id,
      platform: body.platform as PlatformType,
      newVersion: body.version,
    });

    if (!result.success) {
      const status =
        result.error?.code === 'NOT_FOUND' ? 404 :
        result.error?.code === 'INVALID_VERSION' ? 400 :
        500;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API /services/[id] PATCH] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update service',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/services/[id]
 *
 * Actualiza todos los campos de un servicio
 *
 * Body:
 * - name: Nombre del servicio (opcional)
 * - category: Categoría (opcional)
 * - description: Descripción (opcional)
 * - documentationUrl: URL de documentación (opcional)
 * - logoUrl: URL del logo (opcional)
 * - versions: Versiones por plataforma (opcional, null para eliminar plataforma)
 */
export async function PUT(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const container = getDIContainer();
    const useCase = container.resolve<UpdateServiceUseCase>('UpdateServiceUseCase');

    const input: UpdateServiceInput = {
      serviceId: id,
      name: body.name,
      category: body.category,
      description: body.description,
      documentationUrl: body.documentationUrl,
      logoUrl: body.logoUrl,
      versions: body.versions,
      channels: body.channels,
      // Campos Banorte
      projectStatus: body.projectStatus,
      entity: body.entity,
      hasASM: body.hasASM,
      implementationDate: body.implementationDate,
      dateConfirmed: body.dateConfirmed,
      responsibleBusiness: body.responsibleBusiness,
      responsibleIT: body.responsibleIT,
      responsibleERN: body.responsibleERN,
    };

    const result = await useCase.execute(input);

    if (!result.success) {
      const status =
        result.error?.code === 'SERVICE_NOT_FOUND' ? 404 :
        result.error?.code === 'SERVICE_ALREADY_EXISTS' ? 409 :
        result.error?.code === 'VALIDATION_ERROR' ? 400 :
        500;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API /services/[id] PUT] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update service',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/services/[id]
 *
 * Elimina un servicio
 */
export async function DELETE(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = await context.params;

    const container = getDIContainer();
    const useCase = container.resolve<DeleteServiceUseCase>('DeleteServiceUseCase');

    const result = await useCase.execute({ serviceId: id });

    if (!result.success) {
      const status = result.error?.code === 'SERVICE_NOT_FOUND' ? 404 : 500;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API /services/[id] DELETE] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to delete service',
        },
      },
      { status: 500 }
    );
  }
}
