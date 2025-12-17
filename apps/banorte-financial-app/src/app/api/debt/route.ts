import { NextRequest, NextResponse } from 'next/server';
import { getDIContainer } from '@/infrastructure/di/initialize';
import { CreateDebtUseCase } from '@/core/application/use-cases/debt/CreateDebtUseCase';
import { IDebtRepository } from '@/core/domain/ports/repositories/IDebtRepository';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const container = getDIContainer();
    const useCase = container.resolve<CreateDebtUseCase>('CreateDebtUseCase');
    const result = await useCase.execute(body);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error creating debt:', error);
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
    const repository = container.resolve<IDebtRepository>('IDebtRepository');
    const debts = await repository.findByUser(userId);

    return NextResponse.json({
      success: true,
      data: debts.map(d => d.toJSON()),
    });
  } catch (error: any) {
    console.error('Error fetching debts:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

