import { NextRequest, NextResponse } from 'next/server';
import { getDIContainer } from '@/infrastructure/di/initialize';
import { SendMessageUseCase } from '@/core/application/use-cases/advisor/SendMessageUseCase';

/**
 * @deprecated Use /api/advisor/stream instead for streaming responses
 *
 * This endpoint is kept for backward compatibility but will be removed
 * in a future version. The new streaming endpoint provides better UX
 * with real-time responses.
 *
 * Migration guide:
 * - Use useAdvisorChat hook instead of useAdvisor
 * - The new hook uses /api/advisor/stream internally
 */
export async function POST(request: NextRequest) {
  // Log deprecation warning
  console.warn(
    '[DEPRECATED] /api/advisor/chat is deprecated. Use /api/advisor/stream for streaming responses.'
  );

  try {
    const body = await request.json();

    if (!body.userId || !body.message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields (userId, message)' },
        { status: 400 }
      );
    }

    const container = getDIContainer();
    const useCase = container.resolve<SendMessageUseCase>('SendMessageUseCase');
    const result = await useCase.execute(body);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error in chat:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

