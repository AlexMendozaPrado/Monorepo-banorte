import { NextRequest, NextResponse } from 'next/server';
import { getDIContainer } from '@/infrastructure/di/initialize';
import { SendMessageUseCase } from '@/core/application/use-cases/advisor/SendMessageUseCase';

export async function POST(request: NextRequest) {
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

