// CardHealthScore.ts - Health Score Calculator Entity
export interface HealthScoreFactors {
  utilizationScore: number;      // 0-30 points
  paymentHistoryScore: number;   // 0-30 points
  accountAgeScore: number;       // 0-15 points
  creditMixScore: number;        // 0-10 points
  recentActivityScore: number;   // 0-15 points
}

export interface HealthScoreRecommendation {
  id: string;
  type: 'opportunity' | 'warning' | 'saving' | 'promo';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  potentialSavings?: number;
  actionRequired?: string;
}

export interface CardHealthScoreData {
  cardId: string;
  userId: string;
  overallScore: number;
  factors: HealthScoreFactors;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  recommendations: HealthScoreRecommendation[];
  lastCalculatedAt: Date;
}

export class CardHealthScore implements CardHealthScoreData {
  cardId: string;
  userId: string;
  overallScore: number;
  factors: HealthScoreFactors;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  recommendations: HealthScoreRecommendation[];
  lastCalculatedAt: Date;

  constructor(data: CardHealthScoreData) {
    this.cardId = data.cardId;
    this.userId = data.userId;
    this.overallScore = data.overallScore;
    this.factors = data.factors;
    this.trend = data.trend;
    this.trendValue = data.trendValue;
    this.recommendations = data.recommendations;
    this.lastCalculatedAt = data.lastCalculatedAt;
  }

  static calculateFromCard(
    cardId: string,
    userId: string,
    utilization: number,
    paymentHistory: number, // 0-100 on-time payments
    accountAgeMonths: number,
    hasMultipleCardTypes: boolean,
    recentTransactions: number
  ): CardHealthScore {
    const factors: HealthScoreFactors = {
      utilizationScore: CardHealthScore.calcUtilizationScore(utilization),
      paymentHistoryScore: CardHealthScore.calcPaymentHistoryScore(paymentHistory),
      accountAgeScore: CardHealthScore.calcAccountAgeScore(accountAgeMonths),
      creditMixScore: hasMultipleCardTypes ? 10 : 5,
      recentActivityScore: CardHealthScore.calcActivityScore(recentTransactions),
    };

    const overallScore = Object.values(factors).reduce((a, b) => a + b, 0);
    const recommendations = CardHealthScore.generateRecommendations(factors, utilization);

    return new CardHealthScore({
      cardId,
      userId,
      overallScore,
      factors,
      trend: 'stable',
      trendValue: 0,
      recommendations,
      lastCalculatedAt: new Date(),
    });
  }

  private static calcUtilizationScore(utilization: number): number {
    if (utilization <= 10) return 30;
    if (utilization <= 30) return 25;
    if (utilization <= 50) return 20;
    if (utilization <= 70) return 10;
    if (utilization <= 90) return 5;
    return 0;
  }

  private static calcPaymentHistoryScore(onTimePercentage: number): number {
    return Math.round((onTimePercentage / 100) * 30);
  }

  private static calcAccountAgeScore(months: number): number {
    if (months >= 60) return 15;
    if (months >= 36) return 12;
    if (months >= 24) return 10;
    if (months >= 12) return 7;
    return 3;
  }

  private static calcActivityScore(transactions: number): number {
    if (transactions >= 10) return 15;
    if (transactions >= 5) return 10;
    if (transactions >= 1) return 5;
    return 0;
  }

  private static generateRecommendations(
    factors: HealthScoreFactors,
    utilization: number
  ): HealthScoreRecommendation[] {
    const recs: HealthScoreRecommendation[] = [];

    if (utilization > 30) {
      recs.push({
        id: 'lower-utilization',
        type: 'warning',
        title: 'Reduce tu utilización',
        description: `Tu utilización de ${utilization}% es alta. Intenta mantenerla por debajo del 30%.`,
        impact: 'high',
        actionRequired: 'Paga parte de tu saldo para mejorar tu score',
      });
    }

    if (factors.paymentHistoryScore < 25) {
      recs.push({
        id: 'payment-reminder',
        type: 'warning',
        title: 'Mejora tu historial de pagos',
        description: 'Paga siempre a tiempo para mejorar tu puntuación.',
        impact: 'high',
        actionRequired: 'Configura pagos automáticos',
      });
    }

    return recs;
  }

  getScoreLevel(): 'excellent' | 'good' | 'fair' | 'poor' {
    if (this.overallScore >= 80) return 'excellent';
    if (this.overallScore >= 60) return 'good';
    if (this.overallScore >= 40) return 'fair';
    return 'poor';
  }

  getScoreColor(): string {
    const level = this.getScoreLevel();
    const colors = {
      excellent: '#6CC04A',
      good: '#FFA400',
      fair: '#FF671B',
      poor: '#EB0029',
    };
    return colors[level];
  }
}

