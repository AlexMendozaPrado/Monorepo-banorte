import { Card } from '../../../../core/domain/entities/cards/Card';
import { HealthScoreRecommendation } from '../../../../core/domain/entities/cards/CardHealthScore';
import {
  ICardOptimizerPort,
  CardUsageContext,
  CardOptimizationResult,
  PaymentStrategy,
  BenefitOptimization,
} from '../../../../core/domain/ports/ai-services/ICardOptimizerPort';
import { BaseOpenAIService } from './BaseOpenAIService';
import { CARD_OPTIMIZER_SYSTEM_PROMPT } from '../../prompts';

interface CardRecommendationsOutput {
  recommendations: Array<{
    id: string;
    type: 'warning' | 'opportunity' | 'saving' | 'promo';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    actionRequired?: string;
    potentialSavings?: number;
  }>;
  suggestedActions: string[];
  potentialSavings: number;
  riskLevel: 'low' | 'medium' | 'high';
  summary: string;
}

interface PaymentStrategyOutput {
  strategies: Array<{
    cardId: string;
    recommendedAmount: number;
    reason: string;
    savingsIfPaid: number;
    priority: number;
  }>;
  totalInterestSaved: number;
  strategy: 'AVALANCHE' | 'SNOWBALL';
}

interface BenefitOptimizationOutput {
  optimizations: Array<{
    benefitId: string;
    cardId: string;
    recommendedUsage: string;
    potentialValue: number;
    expiresInDays?: number;
  }>;
  overallRecommendation: string;
}

interface SpendingPatternsOutput {
  insights: string[];
  warnings: string[];
  opportunities: string[];
  topCategories: Array<{ category: string; amount: number; percentage: number }>;
}

export class OpenAICardOptimizer extends BaseOpenAIService implements ICardOptimizerPort {
  async getCardRecommendations(context: CardUsageContext): Promise<CardOptimizationResult> {
    const { card, recentTransactions, monthlyIncome } = context;

    const cardData = {
      id: card.id,
      alias: card.alias,
      type: card.type,
      currentBalance: card.currentBalance.amount,
      creditLimit: card.creditLimit?.amount,
      creditUtilization: card.creditUtilization,
      annualInterestRate: card.annualInterestRate,
      paymentDueDate: card.paymentDueDate,
      benefits: card.benefits.map(b => ({ id: b.id, name: b.name, value: b.value })),
    };

    const transactionsData = (recentTransactions || []).slice(0, 50).map(t => ({
      amount: t.amount,
      category: t.category,
      merchant: t.merchant,
    }));

    const userPrompt = `Analiza esta tarjeta y genera recomendaciones personalizadas.

Tarjeta:
${JSON.stringify(cardData, null, 2)}

Transacciones recientes (últimas 50):
${JSON.stringify(transactionsData, null, 2)}

Ingreso mensual: $${monthlyIncome?.amount || 'N/A'}

Genera:
1. Recomendaciones (warnings para riesgos, opportunities para oportunidades de cashback, savings para ahorro en intereses, promos para MSI)
2. Acciones sugeridas
3. Ahorro potencial total
4. Nivel de riesgo (low/medium/high) basado en utilización y pagos
5. Resumen ejecutivo

Responde en JSON:
{
  "recommendations": [
    {
      "id": "unique-id",
      "type": "warning" | "opportunity" | "saving" | "promo",
      "title": "título corto",
      "description": "descripción detallada",
      "impact": "high" | "medium" | "low",
      "actionRequired": "acción específica",
      "potentialSavings": ahorro_estimado
    }
  ],
  "suggestedActions": ["acción 1", "acción 2"],
  "potentialSavings": ahorro_total,
  "riskLevel": "low" | "medium" | "high",
  "summary": "resumen ejecutivo"
}`;

    const result = await this.callOpenAI<CardRecommendationsOutput>({
      systemPrompt: CARD_OPTIMIZER_SYSTEM_PROMPT,
      userPrompt,
      temperature: 0.3,
      responseFormat: 'json_object',
    });

    return {
      cardId: card.id,
      recommendations: result.data.recommendations,
      suggestedActions: result.data.suggestedActions,
      potentialSavings: result.data.potentialSavings,
      riskLevel: result.data.riskLevel,
      summary: result.data.summary,
    };
  }

  async getPaymentStrategy(cards: Card[], availableFunds: number): Promise<PaymentStrategy[]> {
    const cardsData = cards
      .filter(c => c.type === 'CREDIT' && c.currentBalance.amount > 0)
      .map(c => ({
        id: c.id,
        alias: c.alias,
        currentBalance: c.currentBalance.amount,
        annualInterestRate: c.annualInterestRate || 0,
        minimumPayment: c.minimumPayment?.amount || 0,
        paymentDueDate: c.paymentDueDate,
      }));

    if (cardsData.length === 0) {
      return [];
    }

    const userPrompt = `Optimiza la distribución de $${availableFunds.toLocaleString('es-MX')} entre estas tarjetas de crédito.

Tarjetas:
${JSON.stringify(cardsData, null, 2)}

Usa la estrategia AVALANCHA (priorizar mayor tasa de interés primero) para maximizar ahorro en intereses.

Para cada tarjeta, determina:
1. Monto recomendado a pagar
2. Razón (enfatizar tasa de interés)
3. Ahorro en intereses si se paga ese monto
4. Prioridad (1 = más importante)

Responde en JSON:
{
  "strategies": [
    {
      "cardId": "id",
      "recommendedAmount": monto_a_pagar,
      "reason": "razón específica",
      "savingsIfPaid": ahorro_en_intereses,
      "priority": número_prioridad
    }
  ],
  "totalInterestSaved": suma_total_ahorrada,
  "strategy": "AVALANCHE"
}`;

    const result = await this.callOpenAI<PaymentStrategyOutput>({
      systemPrompt: CARD_OPTIMIZER_SYSTEM_PROMPT,
      userPrompt,
      temperature: 0.2, // Muy analítico para cálculos financieros
      responseFormat: 'json_object',
    });

    return result.data.strategies.map(s => ({
      cardId: s.cardId,
      recommendedAmount: s.recommendedAmount,
      reason: s.reason,
      dueDate: cards.find(c => c.id === s.cardId)?.paymentDueDate || 'N/A',
      savingsIfPaid: s.savingsIfPaid,
      priority: s.priority,
    }));
  }

  async optimizeBenefits(cards: Card[]): Promise<BenefitOptimization[]> {
    const cardsWithBenefits = cards.filter(c => c.benefits.length > 0);

    if (cardsWithBenefits.length === 0) {
      return [];
    }

    const cardsData = cardsWithBenefits.map(c => ({
      id: c.id,
      alias: c.alias,
      benefits: c.benefits.map(b => ({
        id: b.id,
        name: b.name,
        description: b.description,
        value: b.value,
        validUntil: b.validUntil?.toISOString().split('T')[0],
      })),
    }));

    const userPrompt = `Optimiza el uso de beneficios de estas tarjetas.

Tarjetas con beneficios:
${JSON.stringify(cardsData, null, 2)}

Para cada beneficio, genera:
1. Recomendación de uso específica
2. Valor potencial del beneficio
3. Días hasta expiración (si aplica)
4. Prioridad de uso

Responde en JSON:
{
  "optimizations": [
    {
      "benefitId": "id",
      "cardId": "id_tarjeta",
      "recommendedUsage": "cómo y dónde usar",
      "potentialValue": valor_estimado,
      "expiresInDays": días_hasta_expiración
    }
  ],
  "overallRecommendation": "recomendación general"
}`;

    const result = await this.callOpenAI<BenefitOptimizationOutput>({
      systemPrompt: CARD_OPTIMIZER_SYSTEM_PROMPT,
      userPrompt,
      temperature: 0.3,
      responseFormat: 'json_object',
    });

    return result.data.optimizations.map(opt => ({
      benefitId: opt.benefitId,
      cardId: opt.cardId,
      recommendedUsage: opt.recommendedUsage,
      potentialValue: opt.potentialValue,
      expiresIn: opt.expiresInDays,
    }));
  }

  async analyzeSpendingPatterns(
    cardId: string,
    transactions: { amount: number; category: string; date: Date }[]
  ): Promise<{ insights: string[]; warnings: string[]; opportunities: string[] }> {
    if (transactions.length === 0) {
      return {
        insights: ['No hay transacciones para analizar'],
        warnings: [],
        opportunities: [],
      };
    }

    const transactionsData = transactions.slice(0, 100).map(t => ({
      amount: t.amount,
      category: t.category,
      date: t.date.toISOString().split('T')[0],
    }));

    const userPrompt = `Analiza los patrones de gasto de esta tarjeta.

Transacciones (últimas 100):
${JSON.stringify(transactionsData, null, 2)}

Identifica:
1. Insights (patrones de gasto, categorías principales, tendencias)
2. Warnings (alto volumen, gastos inusuales, posibles sobregastos)
3. Opportunities (oportunidades de cashback, categorías donde optimizar)
4. Top 3 categorías de gasto

Responde en JSON:
{
  "insights": ["insight 1", "insight 2"],
  "warnings": ["warning 1"],
  "opportunities": ["oportunidad 1", "oportunidad 2"],
  "topCategories": [
    {"category": "nombre", "amount": monto_total, "percentage": porcentaje}
  ]
}`;

    const result = await this.callOpenAI<SpendingPatternsOutput>({
      systemPrompt: CARD_OPTIMIZER_SYSTEM_PROMPT,
      userPrompt,
      temperature: 0.3,
      responseFormat: 'json_object',
    });

    return {
      insights: result.data.insights,
      warnings: result.data.warnings,
      opportunities: result.data.opportunities,
    };
  }

  async generateCardSummary(cards: Card[]): Promise<string> {
    if (cards.length === 0) {
      return 'No tienes tarjetas registradas.';
    }

    const cardsData = cards.map(c => ({
      alias: c.alias,
      type: c.type,
      currentBalance: c.currentBalance.amount,
      creditUtilization: c.creditUtilization,
      creditLimit: c.creditLimit?.amount,
    }));

    const userPrompt = `Genera un resumen ejecutivo de estas tarjetas.

Tarjetas:
${JSON.stringify(cardsData, null, 2)}

El resumen debe:
- Mencionar número de tarjetas
- Indicar utilización promedio de crédito
- Evaluar salud crediticia general (excelente <30%, buena 30-50%, mejorable >50%)
- Ser conciso (2-3 oraciones)

Responde solo con el texto del resumen (no JSON).`;

    const result = await this.callOpenAI<string>({
      systemPrompt: CARD_OPTIMIZER_SYSTEM_PROMPT,
      userPrompt,
      temperature: 0.5,
      responseFormat: 'text',
    });

    return result.data as unknown as string;
  }
}
