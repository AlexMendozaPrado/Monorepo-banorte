import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di';
import { CreateSavingsRuleUseCase } from '@/core/application/use-cases/savings/CreateSavingsRuleUseCase';
import { CreateSavingsRuleDTO } from '@/core/application/dtos/savings/SavingsRuleDTO';
import { ISavingsRuleRepository } from '@/core/domain/ports/repositories/ISavingsRuleRepository';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.userId || !body.goalId || !body.name || !body.type || !body.frequency) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const dto: CreateSavingsRuleDTO = {
      userId: body.userId,
      goalId: body.goalId,
      name: body.name,
      type: body.type,
      frequency: body.frequency,
      amount: body.amount,
      percentage: body.percentage,
      currency: body.currency || 'MXN',
      active: body.active !== false,
    };

    const useCase = container.resolve<CreateSavingsRuleUseCase>('CreateSavingsRuleUseCase');
    const result = await useCase.execute(dto);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error creating savings rule:', error);
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
    const goalId = searchParams.get('goalId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const repository = container.resolve<ISavingsRuleRepository>('ISavingsRuleRepository');
    const rules = goalId
      ? await repository.findByGoal(goalId)
      : await repository.findByUser(userId);

    return NextResponse.json({
      success: true,
      data: rules.map(r => r.toJSON()),
    });
  } catch (error: any) {
    console.error('Error fetching savings rules:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}
