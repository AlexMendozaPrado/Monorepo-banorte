import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di';
import { CreateSavingsGoalUseCase } from '@/core/application/use-cases/savings/CreateSavingsGoalUseCase';
import { CreateSavingsGoalDTO } from '@/core/application/dtos/savings/SavingsGoalDTO';
import { ISavingsGoalRepository } from '@/core/domain/ports/repositories/ISavingsGoalRepository';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.userId || !body.name || !body.targetAmount) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const dto: CreateSavingsGoalDTO = {
      userId: body.userId,
      name: body.name,
      targetAmount: body.targetAmount,
      currentAmount: body.currentAmount,
      currency: body.currency || 'MXN',
      deadline: body.deadline,
      priority: body.priority || 'MEDIUM',
      icon: body.icon,
      color: body.color,
    };

    const useCase = container.resolve<CreateSavingsGoalUseCase>('CreateSavingsGoalUseCase');
    const result = await useCase.execute(dto);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error creating savings goal:', error);
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

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const repository = container.resolve<ISavingsGoalRepository>('ISavingsGoalRepository');
    const goals = await repository.findByUser(userId);

    return NextResponse.json({
      success: true,
      data: goals.map(g => g.toJSON()),
    });
  } catch (error: any) {
    console.error('Error fetching savings goals:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}
