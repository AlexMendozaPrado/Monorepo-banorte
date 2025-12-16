import { NextRequest, NextResponse } from 'next/server';
import { getDIContainer } from '@/infrastructure/di/initialize';
import { EvaluateInsuranceNeedsUseCase } from '@/core/application/use-cases/insurance/EvaluateInsuranceNeedsUseCase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const container = getDIContainer();
    const useCase = container.resolve<EvaluateInsuranceNeedsUseCase>('EvaluateInsuranceNeedsUseCase');
    const result = await useCase.execute(body);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error evaluating insurance needs:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

