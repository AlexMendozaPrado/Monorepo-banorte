// GetCardHealthScoreUseCase.ts - Calculate and retrieve card health score
import { CardHealthScore, CardHealthScoreData } from '../../../domain/entities/cards/CardHealthScore';
import { ICardRepository } from '../../../domain/ports/repositories/ICardRepository';

export interface GetHealthScoreInput {
  cardId?: string;
  userId: string;
}

export interface GetHealthScoreOutput {
  success: boolean;
  healthScore?: CardHealthScoreData;
  aggregatedScore?: {
    overall: number;
    trend: 'up' | 'down' | 'stable';
    trendValue: number;
    cardScores: CardHealthScoreData[];
  };
  error?: string;
}

export class GetCardHealthScoreUseCase {
  constructor(private cardRepository: ICardRepository) {}

  async execute(input: GetHealthScoreInput): Promise<GetHealthScoreOutput> {
    try {
      // If cardId is provided, get score for specific card
      if (input.cardId) {
        const card = await this.cardRepository.findById(input.cardId);
        if (!card) {
          return { success: false, error: 'Card not found' };
        }

        // Check if we have a cached score
        let healthScore = await this.cardRepository.getHealthScore(input.cardId);

        // If no cached score or it's outdated, calculate new one
        if (!healthScore || this.isScoreOutdated(healthScore.lastCalculatedAt)) {
          healthScore = this.calculateHealthScore(card);
          await this.cardRepository.saveHealthScore(healthScore);
        }

        return {
          success: true,
          healthScore,
        };
      }

      // Get aggregated score for all user's cards
      const cards = await this.cardRepository.findByUserId(input.userId);
      
      if (cards.length === 0) {
        return { success: false, error: 'No cards found for user' };
      }

      const cardScores: CardHealthScoreData[] = [];
      let totalScore = 0;

      for (const card of cards) {
        let score = await this.cardRepository.getHealthScore(card.id);
        
        if (!score || this.isScoreOutdated(score.lastCalculatedAt)) {
          score = this.calculateHealthScore(card);
          await this.cardRepository.saveHealthScore(score);
        }

        cardScores.push(score);
        totalScore += score.overallScore;
      }

      const avgScore = Math.round(totalScore / cardScores.length);

      return {
        success: true,
        aggregatedScore: {
          overall: avgScore,
          trend: 'stable',
          trendValue: 0,
          cardScores,
        },
      };
    } catch (error) {
      console.error('Error getting health score:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private isScoreOutdated(lastCalculated: Date): boolean {
    const now = new Date();
    const diffHours = (now.getTime() - new Date(lastCalculated).getTime()) / (1000 * 60 * 60);
    return diffHours > 24; // Recalculate if older than 24 hours
  }

  private calculateHealthScore(card: any): CardHealthScoreData {
    // Mock calculation - in real app would use actual transaction data
    const utilization = card.creditUtilization || 0;
    const paymentHistory = 95; // Mock: 95% on-time payments
    const accountAgeMonths = 24; // Mock: 2 years
    const hasMultipleTypes = true;
    const recentTransactions = 8;

    return CardHealthScore.calculateFromCard(
      card.id,
      card.userId,
      utilization,
      paymentHistory,
      accountAgeMonths,
      hasMultipleTypes,
      recentTransactions
    );
  }
}

