import { NextRequest, NextResponse } from 'next/server';
import { getDIContainer } from '@/infrastructure/di/initialize';
import { CalculateCoverageUseCase } from '@/core/application/use-cases/insurance/CalculateCoverageUseCase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const container = getDIContainer();
    const useCase = container.resolve<CalculateCoverageUseCase>('CalculateCoverageUseCase');
    const result = await useCase.execute(body);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error calculating coverage:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

