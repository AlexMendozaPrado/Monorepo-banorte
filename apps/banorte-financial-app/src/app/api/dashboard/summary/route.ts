import { NextRequest, NextResponse } from 'next/server';
import { getDIContainer } from '@/infrastructure/di/initialize';
import { GetFinancialSummaryUseCase } from '@/core/application/use-cases/dashboard/GetFinancialSummaryUseCase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const container = getDIContainer();
    const useCase = container.resolve<GetFinancialSummaryUseCase>('GetFinancialSummaryUseCase');
    const result = await useCase.execute(userId);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error fetching dashboard summary:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

