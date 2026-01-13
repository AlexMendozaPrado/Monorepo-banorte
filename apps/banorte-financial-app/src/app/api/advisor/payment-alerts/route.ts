import { NextRequest, NextResponse } from 'next/server';
import { getDIContainer } from '@/infrastructure/di/initialize';
import { GetPaymentAlertsUseCase } from '@/core/application/use-cases/payment/GetPaymentAlertsUseCase';
import { AlertStatus } from '@/core/domain/entities/payment/PaymentAlert';

export const runtime = 'nodejs';

/**
 * GET /api/advisor/payment-alerts
 *
 * Obtiene alertas de pagos próximos para un usuario.
 *
 * Query params:
 * - userId: string (requerido) - ID del usuario
 * - days: number (opcional) - Días a futuro para buscar (default: 30)
 * - status: string (opcional) - Filtro por status: 'overdue' | 'urgent' | 'upcoming' | 'all'
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     alerts: PaymentAlertDTO[],
 *     summary: { total, overdue, urgent, upcoming, totalAmountDue },
 *     generatedAt: string
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);

    // Validar userId
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Parsear parámetros
    const days = searchParams.get('days')
      ? parseInt(searchParams.get('days')!, 10)
      : 30;

    const statusParam = searchParams.get('status');
    let status: AlertStatus | 'all' = 'all';
    if (statusParam && ['overdue', 'urgent', 'upcoming', 'all'].includes(statusParam)) {
      status = statusParam as AlertStatus | 'all';
    }

    // Obtener use case del container
    const container = getDIContainer();
    const useCase = container.resolve<GetPaymentAlertsUseCase>('GetPaymentAlertsUseCase');

    // Ejecutar
    const result = await useCase.execute({
      userId,
      days,
      status,
    });

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        requestTime: Date.now() - startTime,
      },
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Internal server error';

    console.error('[API /advisor/payment-alerts] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        meta: {
          requestTime: Date.now() - startTime,
        },
      },
      { status: 500 }
    );
  }
}
