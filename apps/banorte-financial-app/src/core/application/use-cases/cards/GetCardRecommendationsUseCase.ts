// GetCardRecommendationsUseCase.ts - Get AI-powered card recommendations
import { ICardRepository } from '../../../domain/ports/repositories/ICardRepository';
import { ICardOptimizerPort, CardOptimizationResult } from '../../../domain/ports/ai-services/ICardOptimizerPort';
import { HealthScoreRecommendation } from '../../../domain/entities/cards/CardHealthScore';

export interface GetRecommendationsInput {
  userId: string;
  cardId?: string;
}

export interface GetRecommendationsOutput {
  success: boolean;
  recommendations?: HealthScoreRecommendation[];
  cardRecommendations?: Map<string, CardOptimizationResult>;
  summary?: string;
  totalPotentialSavings?: number;
  error?: string;
}

export class GetCardRecommendationsUseCase {
  constructor(
    private cardRepository: ICardRepository,
    private cardOptimizer: ICardOptimizerPort
  ) {}

  async execute(input: GetRecommendationsInput): Promise<GetRecommendationsOutput> {
    try {
      // Get user's cards
      const cards = input.cardId
        ? [await this.cardRepository.findById(input.cardId)].filter(Boolean)
        : await this.cardRepository.findByUserId(input.userId);

      if (cards.length === 0) {
        return { success: false, error: 'No cards found' };
      }

      const allRecommendations: HealthScoreRecommendation[] = [];
      const cardRecommendations = new Map<string, CardOptimizationResult>();
      let totalSavings = 0;

      for (const card of cards) {
        if (!card) continue;

        // Get optimization for each card
        const context = {
          card,
          recentTransactions: 10, // Mock
          averageMonthlySpending: 15000, // Mock
          paymentHistory: 95, // Mock
          accountAgeMonths: 24, // Mock
        };

        const optimization = await this.cardOptimizer.getCardRecommendations(context);
        cardRecommendations.set(card.id, optimization);
        allRecommendations.push(...optimization.recommendations);
        totalSavings += optimization.potentialSavings;
      }

      // Generate summary
      const summary = await this.cardOptimizer.generateCardSummary(cards.filter(Boolean) as any[]);

      // Deduplicate and prioritize recommendations
      const uniqueRecs = this.deduplicateRecommendations(allRecommendations);

      return {
        success: true,
        recommendations: uniqueRecs,
        cardRecommendations,
        summary,
        totalPotentialSavings: totalSavings,
      };
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private deduplicateRecommendations(
    recs: HealthScoreRecommendation[]
  ): HealthScoreRecommendation[] {
    const seen = new Set<string>();
    const unique: HealthScoreRecommendation[] = [];

    // Sort by impact (high first)
    const sorted = [...recs].sort((a, b) => {
      const impactOrder = { high: 0, medium: 1, low: 2 };
      return impactOrder[a.impact] - impactOrder[b.impact];
    });

    for (const rec of sorted) {
      if (!seen.has(rec.id)) {
        seen.add(rec.id);
        unique.push(rec);
      }
    }

    return unique.slice(0, 10); // Return top 10 recommendations
  }
}

