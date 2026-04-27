import { NextRequest, NextResponse } from 'next/server';
import { DIContainer } from '@/infrastructure/di/DIContainer';
import { ApiResponse, CertificationResponse } from '@/shared/types/api';
import { toCertificationResponse } from '@/shared/mappers/certificationResponseMapper';

export async function GET(
  _request: NextRequest,
  context: { params: { id: string } },
): Promise<NextResponse<ApiResponse<CertificationResponse>>> {
  try {
    const { id } = context.params;

    if (!id || id.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'El ID de la certificacion es requerido' },
        { status: 400 },
      );
    }

    const container = DIContainer.getInstance({ operationMode: 'semi' });
    const session = await container.getCertificationHistoryUseCase.findById(id);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Certificacion no encontrada' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: toCertificationResponse(session),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 },
    );
  }
}
