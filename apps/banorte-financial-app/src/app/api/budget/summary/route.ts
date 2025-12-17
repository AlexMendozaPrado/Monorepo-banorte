import { NextRequest, NextResponse } from 'next/server';
import { getDIContainer } from '@/infrastructure/di';
import { GetBudgetSummaryUseCase } from '@/core/application/use-cases/budget/GetBudgetSummaryUseCase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const monthStr = searchParams.get('month');

    // Validate required parameters
    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'userId is required' 
        }, 
        { status: 400 }
      );
    }

    // Parse optional month parameter
    const month = monthStr ? new Date(monthStr) : undefined;

    // Resolve use case from DI container
    const container = getDIContainer();
    const useCase = container.resolve<GetBudgetSummaryUseCase>('GetBudgetSummaryUseCase');
    
    // Execute use case
    const result = await useCase.execute(userId, month);
    
    return NextResponse.json({ 
      success: true, 
      data: result 
    });
  } catch (error: any) {
    console.error('Error getting budget summary:', error);
    
    // Handle not found exception
    if (error.name === 'NotFoundException') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Budget not found for the specified month' 
        }, 
        { status: 404 }
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

