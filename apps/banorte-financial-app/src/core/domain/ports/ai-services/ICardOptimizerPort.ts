// ICardOptimizerPort.ts - AI Card Optimizer Port
import { Card } from '../../entities/cards/Card';
import { HealthScoreRecommendation } from '../../entities/cards/CardHealthScore';

export interface CardUsageContext {
  card: Card;
  recentTransactions: number;
  averageMonthlySpending: number;
  paymentHistory: number; // percentage of on-time payments
  accountAgeMonths: number;
}

export interface CardOptimizationResult {
  cardId: string;
  recommendations: HealthScoreRecommendation[];
  suggestedActions: string[];
  potentialSavings: number;
  riskLevel: 'low' | 'medium' | 'high';
  summary: string;
}

export interface PaymentStrategy {
  cardId: string;
  recommendedAmount: number;
  reason: string;
  dueDate: string;
  savingsIfPaid: number;
  priority: number;
}

export interface BenefitOptimization {
  benefitId: string;
  cardId: string;
  recommendedUsage: string;
  potentialValue: number;
  expiresIn?: number; // days
}

export interface ICardOptimizerPort {
  // Get personalized recommendations for a card
  getCardRecommendations(context: CardUsageContext): Promise<CardOptimizationResult>;
  
  // Get optimal payment strategy across all cards
  getPaymentStrategy(cards: Card[], availableFunds: number): Promise<PaymentStrategy[]>;
  
  // Optimize benefit usage
  optimizeBenefits(cards: Card[]): Promise<BenefitOptimization[]>;
  
  // Analyze spending patterns
  analyzeSpendingPatterns(
    cardId: string,
    transactions: { amount: number; category: string; date: Date }[]
  ): Promise<{
    insights: string[];
    warnings: string[];
    opportunities: string[];
  }>;
  
  // Generate AI summary for user
  generateCardSummary(cards: Card[]): Promise<string>;
}

