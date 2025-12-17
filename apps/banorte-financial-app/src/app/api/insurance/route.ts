import { NextRequest, NextResponse } from 'next/server';
import { getDIContainer } from '@/infrastructure/di/initialize';
import { CreateInsuranceUseCase } from '@/core/application/use-cases/insurance/CreateInsuranceUseCase';
import { IInsuranceRepository } from '@/core/domain/ports/repositories/IInsuranceRepository';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const container = getDIContainer();
    const useCase = container.resolve<CreateInsuranceUseCase>('CreateInsuranceUseCase');
    const result = await useCase.execute(body);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error creating insurance:', error);
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

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const container = getDIContainer();
    const repository = container.resolve<IInsuranceRepository>('IInsuranceRepository');
    const insurances = await repository.findByUser(userId);

    return NextResponse.json({
      success: true,
      data: insurances.map(i => i.toJSON()),
    });
  } catch (error: any) {
    console.error('Error fetching insurance:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

