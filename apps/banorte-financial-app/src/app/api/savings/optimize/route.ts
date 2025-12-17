import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di';
import { OptimizeSavingsStrategyUseCase, OptimizeSavingsDTO } from '@/core/application/use-cases/savings/OptimizeSavingsStrategyUseCase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.userId || !body.monthlyIncome || !body.monthlyExpenses) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: userId, monthlyIncome, monthlyExpenses' },
        { status: 400 }
      );
    }

    const dto: OptimizeSavingsDTO = {
      userId: body.userId,
      monthlyIncome: body.monthlyIncome,
      monthlyExpenses: body.monthlyExpenses,
      currency: body.currency || 'MXN',
    };

    const useCase = container.resolve<OptimizeSavingsStrategyUseCase>('OptimizeSavingsStrategyUseCase');
    const result = await useCase.execute(dto);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error optimizing savings strategy:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const monthlyIncome = parseFloat(searchParams.get('monthlyIncome') || '30000');
    const monthlyExpenses = parseFloat(searchParams.get('monthlyExpenses') || '18000');
    const currency = searchParams.get('currency') || 'MXN';

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const dto: OptimizeSavingsDTO = {
      userId,
      monthlyIncome,
      monthlyExpenses,
      currency,
    };

    const useCase = container.resolve<OptimizeSavingsStrategyUseCase>('OptimizeSavingsStrategyUseCase');
    const result = await useCase.execute(dto);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error optimizing savings strategy:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}
