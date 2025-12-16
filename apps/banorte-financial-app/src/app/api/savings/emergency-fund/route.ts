import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di';
import { CalculateEmergencyFundUseCase } from '@/core/application/use-cases/savings/CalculateEmergencyFundUseCase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.userId || !body.monthlyExpenses || body.currentSavings === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const dto = {
      userId: body.userId,
      monthlyExpenses: body.monthlyExpenses,
      currentSavings: body.currentSavings,
      currency: body.currency || 'MXN',
      targetMonths: body.targetMonths || 6,
    };

    const useCase = container.resolve<CalculateEmergencyFundUseCase>('CalculateEmergencyFundUseCase');
    const result = await useCase.execute(dto);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error calculating emergency fund:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}
