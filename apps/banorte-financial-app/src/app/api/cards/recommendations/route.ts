// /api/cards/recommendations route - GET AI recommendations for cards
import { NextRequest, NextResponse } from 'next/server';
import { getGetCardRecommendationsUseCase } from '../../../../infrastructure/di/cardsModule';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'user-demo';
    const cardId = searchParams.get('cardId') || undefined;

    const useCase = getGetCardRecommendationsUseCase();
    const result = await useCase.execute({ userId, cardId });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    // Convert Map to plain object for JSON serialization
    const cardRecsObject: Record<string, any> = {};
    if (result.cardRecommendations) {
      result.cardRecommendations.forEach((value, key) => {
        cardRecsObject[key] = value;
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        recommendations: result.recommendations,
        cardRecommendations: cardRecsObject,
        summary: result.summary,
        totalPotentialSavings: result.totalPotentialSavings,
      },
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}

