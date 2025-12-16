import { NextRequest, NextResponse } from 'next/server';
import { getDIContainer } from '@/infrastructure/di/initialize';
import { CalculatePaymentStrategyUseCase } from '@/core/application/use-cases/debt/CalculatePaymentStrategyUseCase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const container = getDIContainer();
    const useCase = container.resolve<CalculatePaymentStrategyUseCase>('CalculatePaymentStrategyUseCase');
    const result = await useCase.execute(body);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error calculating strategy:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const strategyType = searchParams.get('strategyType') || 'AVALANCHE';
    const availableMonthly = parseFloat(searchParams.get('availableMonthly') || '3000');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const container = getDIContainer();
    const useCase = container.resolve<CalculatePaymentStrategyUseCase>('CalculatePaymentStrategyUseCase');
    const result = await useCase.execute({
      userId,
      strategyType: strategyType as 'AVALANCHE' | 'SNOWBALL' | 'BALANCED',
      availableMonthly,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error calculating strategy:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

