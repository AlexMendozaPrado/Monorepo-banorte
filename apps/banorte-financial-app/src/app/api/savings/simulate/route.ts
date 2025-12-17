import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di';
import { SimulateSavingsImpactUseCase } from '@/core/application/use-cases/savings/SimulateSavingsImpactUseCase';
import { SimulateSavingsDTO } from '@/core/application/dtos/savings/SavingsSimulationDTO';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.goalId || !body.monthlyContribution || !body.months) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const dto: SimulateSavingsDTO = {
      goalId: body.goalId,
      monthlyContribution: body.monthlyContribution,
      months: body.months,
    };

    const useCase = container.resolve<SimulateSavingsImpactUseCase>('SimulateSavingsImpactUseCase');
    const result = await useCase.execute(dto);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error simulating savings:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}
