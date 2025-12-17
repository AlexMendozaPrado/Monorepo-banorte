// /api/cards/health route - GET health score for cards
import { NextRequest, NextResponse } from 'next/server';
import { getGetCardHealthScoreUseCase } from '../../../../infrastructure/di/cardsModule';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'user-demo';
    const cardId = searchParams.get('cardId') || undefined;

    const useCase = getGetCardHealthScoreUseCase();
    const result = await useCase.execute({ userId, cardId });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: cardId ? result.healthScore : result.aggregatedScore,
    });
  } catch (error) {
    console.error('Error fetching health score:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch health score' },
      { status: 500 }
    );
  }
}

