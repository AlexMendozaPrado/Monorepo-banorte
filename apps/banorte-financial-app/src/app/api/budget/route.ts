import { NextRequest, NextResponse } from 'next/server';
import { getDIContainer } from '@/infrastructure/di';
import { CreateBudgetUseCase } from '@/core/application/use-cases/budget/CreateBudgetUseCase';
import { CreateBudgetDTO } from '@/core/application/dtos/budget/CreateBudgetDTO';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.userId || !body.month || !body.totalIncome) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: userId, month, totalIncome' 
        }, 
        { status: 400 }
      );
    }

    // Validate categories
    if (!body.categories || !Array.isArray(body.categories) || body.categories.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'At least one category is required' 
        }, 
        { status: 400 }
      );
    }

    // Build DTO
    const dto: CreateBudgetDTO = {
      userId: body.userId,
      month: new Date(body.month),
      totalIncome: body.totalIncome,
      currency: body.currency || 'MXN',
      categories: body.categories,
    };

    // Resolve use case from DI container
    const container = getDIContainer();
    const useCase = container.resolve<CreateBudgetUseCase>('CreateBudgetUseCase');
    
    // Execute use case
    const result = await useCase.execute(dto);
    
    return NextResponse.json({ 
      success: true, 
      data: result 
    });
  } catch (error: any) {
    console.error('Error creating budget:', error);
    
    // Handle business rule exceptions
    if (error.name === 'BusinessRuleException') {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message,
          code: error.code 
        }, 
        { status: 409 } // Conflict
      );
    }

    // Handle validation exceptions
    if (error.name === 'ValidationException') {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message 
        }, 
        { status: 400 }
      );
    }

    // Generic error
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      }, 
      { status: 500 }
    );
  }
}

