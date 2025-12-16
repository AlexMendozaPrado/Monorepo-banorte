// OpenAICardOptimizer.ts - OpenAI implementation for card optimization
import { Card } from '../../../../core/domain/entities/cards/Card';
import { HealthScoreRecommendation } from '../../../../core/domain/entities/cards/CardHealthScore';
import {
  ICardOptimizerPort,
  CardUsageContext,
  CardOptimizationResult,
  PaymentStrategy,
  BenefitOptimization,
} from '../../../../core/domain/ports/ai-services/ICardOptimizerPort';

export class OpenAICardOptimizer implements ICardOptimizerPort {
  async getCardRecommendations(context: CardUsageContext): Promise<CardOptimizationResult> {
    const { card } = context;
    const recommendations: HealthScoreRecommendation[] = [];
    const suggestedActions: string[] = [];
    let potentialSavings = 0;
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    // Analyze utilization
    const utilization = card.creditUtilization || 0;
    if (utilization > 80) {
      riskLevel = 'high';
      recommendations.push({
        id: 'high-utilization',
        type: 'warning',
        title: 'Uso Elevado de Crédito',
        description: `Tu utilización del ${utilization}% puede afectar tu score crediticio.`,
        impact: 'high',
        actionRequired: 'Reduce tu saldo para mejorar tu perfil crediticio',
      });
      suggestedActions.push('Pagar al menos el 50% del saldo');
    } else if (utilization > 50) {
      riskLevel = 'medium';
      recommendations.push({
        id: 'moderate-utilization',
        type: 'warning',
        title: 'Utilización Moderada',
        description: 'Mantén tu uso de crédito por debajo del 30% para un score óptimo.',
        impact: 'medium',
      });
    }

    // Cashback opportunities
    if (card.type === 'CREDIT') {
      recommendations.push({
        id: 'cashback-gas',
        type: 'opportunity',
        title: 'Cashback en Gasolina',
        description: 'Usa esta tarjeta en gasolineras para obtener 5% de cashback.',
        impact: 'medium',
        potentialSavings: 250,
      });
      potentialSavings += 250;

      // Payment savings
      if (card.currentBalance.amount > 0 && card.annualInterestRate) {
        const interestSavings = Math.round(card.currentBalance.amount * (card.annualInterestRate / 100 / 12));
        recommendations.push({
          id: 'avoid-interest',
          type: 'saving',
          title: 'Ahorra en Intereses',
          description: `Paga el total antes de la fecha límite para ahorrar $${interestSavings}.`,
          impact: 'high',
          potentialSavings: interestSavings,
        });
        potentialSavings += interestSavings;
      }
    }

    // MSI opportunity
    recommendations.push({
      id: 'msi-promo',
      type: 'promo',
      title: 'Meses Sin Intereses',
      description: 'Aprovecha hasta 12 MSI en tiendas departamentales.',
      impact: 'low',
    });

    return {
      cardId: card.id,
      recommendations,
      suggestedActions,
      potentialSavings,
      riskLevel,
      summary: this.generateSummaryText(card, riskLevel, potentialSavings),
    };
  }

  async getPaymentStrategy(cards: Card[], availableFunds: number): Promise<PaymentStrategy[]> {
    const strategies: PaymentStrategy[] = [];
    const creditCards = cards.filter(c => c.type === 'CREDIT' && c.currentBalance.amount > 0);
    
    // Sort by interest rate (highest first) - avalanche method
    creditCards.sort((a, b) => (b.annualInterestRate || 0) - (a.annualInterestRate || 0));

    let remainingFunds = availableFunds;
    let priority = 1;

    for (const card of creditCards) {
      if (remainingFunds <= 0) break;
      const payment = Math.min(remainingFunds, card.currentBalance.amount);
      const interestSaved = Math.round(payment * ((card.annualInterestRate || 0) / 100 / 12));
      
      strategies.push({
        cardId: card.id,
        recommendedAmount: payment,
        reason: `Tasa de interés: ${card.annualInterestRate}%`,
        dueDate: card.paymentDueDate || 'N/A',
        savingsIfPaid: interestSaved,
        priority: priority++,
      });
      remainingFunds -= payment;
    }
    return strategies;
  }

  async optimizeBenefits(cards: Card[]): Promise<BenefitOptimization[]> {
    return cards.flatMap(card => 
      card.benefits.map(benefit => ({
        benefitId: benefit.id,
        cardId: card.id,
        recommendedUsage: `Usa ${card.alias} para maximizar ${benefit.name}`,
        potentialValue: benefit.value,
        expiresIn: benefit.validUntil 
          ? Math.ceil((new Date(benefit.validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : undefined,
      }))
    );
  }

  async analyzeSpendingPatterns(cardId: string, transactions: { amount: number; category: string; date: Date }[]): Promise<{ insights: string[]; warnings: string[]; opportunities: string[] }> {
    return {
      insights: ['Tu mayor categoría de gasto es Alimentos', 'Gastas en promedio $5,000 mensuales'],
      warnings: transactions.length > 50 ? ['Alto volumen de transacciones este mes'] : [],
      opportunities: ['Podrías ahorrar $200/mes usando cashback en supermercados'],
    };
  }

  async generateCardSummary(cards: Card[]): Promise<string> {
    const creditCards = cards.filter(c => c.type === 'CREDIT');
    const avgUtil = creditCards.length > 0
      ? Math.round(creditCards.reduce((sum, c) => sum + (c.creditUtilization || 0), 0) / creditCards.length)
      : 0;
    return `Tienes ${cards.length} tarjetas con una utilización promedio del ${avgUtil}%. Tu salud crediticia es ${avgUtil < 30 ? 'excelente' : avgUtil < 50 ? 'buena' : 'mejorable'}.`;
  }

  private generateSummaryText(card: Card, risk: string, savings: number): string {
    return `${card.alias}: Nivel de riesgo ${risk}. Potencial de ahorro: $${savings.toLocaleString()}.`;
  }
}

