import { NextRequest, NextResponse } from 'next/server';
import { getDIContainer } from '@/infrastructure/di';
import { DetectAntExpensesUseCase } from '@/core/application/use-cases/budget/DetectAntExpensesUseCase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const timeFrameMonthsStr = searchParams.get('timeFrameMonths');

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

    // Parse timeFrameMonths (default to 1 month)
    let timeFrameMonths = 1;
    if (timeFrameMonthsStr) {
      timeFrameMonths = parseInt(timeFrameMonthsStr, 10);
      if (isNaN(timeFrameMonths) || timeFrameMonths <= 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'timeFrameMonths must be a positive number' 
          }, 
          { status: 400 }
        );
      }
    }

    // Resolve use case from DI container
    const container = getDIContainer();
    const useCase = container.resolve<DetectAntExpensesUseCase>('DetectAntExpensesUseCase');
    
    // Execute use case
    const result = await useCase.execute(userId, timeFrameMonths);
    
    return NextResponse.json({ 
      success: true, 
      data: result 
    });
  } catch (error: any) {
    console.error('Error detecting ant expenses:', error);
    
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

    // Handle AI service exceptions
    if (error.name === 'AIServiceException') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'AI service temporarily unavailable, using fallback data',
          warning: error.message 
        }, 
        { status: 200 } // Still return 200 since we have fallback
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

