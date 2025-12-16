import {
  IExpenseAnalyzerPort,
  AntExpenseDetection,
  AnalysisContext,
  CategorySuggestion,
  SpendingPattern
} from '@/core/domain/ports/external-services/IExpenseAnalyzerPort';
import { Transaction } from '@/core/domain/entities/financial/Transaction';
import { BudgetCategory } from '@/core/domain/entities/financial/BudgetCategory';
import { Budget } from '@/core/domain/entities/financial/Budget';
import { Money } from '@/core/domain/value-objects/financial/Money';
import { TimeFrame } from '@/core/domain/value-objects/common/TimeFrame';
import { BaseOpenAIService } from './BaseOpenAIService';
import { EXPENSE_ANALYZER_SYSTEM_PROMPT } from '../../prompts';

export class OpenAIExpenseAnalyzer extends BaseOpenAIService implements IExpenseAnalyzerPort {
  async detectAntExpenses(
    transactions: Transaction[],
    context: AnalysisContext
  ): Promise<AntExpenseDetection[]> {
    const expenseTransactions = transactions
      .filter(t => t.isExpense())
      .slice(0, 100);

    const transactionsData = expenseTransactions.map(t => ({
      description: t.description,
      amount: t.amount.amount,
      merchant: t.merchant || 'Desconocido',
      date: t.date.toISOString().split('T')[0],
    }));

    const userPrompt = `Analiza estas ${transactionsData.length} transacciones de los últimos ${context.timeFrame.value} ${context.timeFrame.unit.toLowerCase()}.

Transacciones:
${JSON.stringify(transactionsData, null, 2)}

Responde en JSON con este formato:
{
  "detections": [
    {
      "category": "nombre categoría",
      "description": "descripción del patrón",
      "frequency": número_de_ocurrencias,
      "averageAmount": monto_promedio,
      "monthlyImpact": impacto_mensual,
      "annualImpact": impacto_anual,
      "confidence": 0.0-1.0,
      "examples": [
        {"merchant": "nombre", "amount": monto, "date": "YYYY-MM-DD"}
      ],
      "recommendation": "recomendación específica con ahorro estimado"
    }
  ]
}`;

    const result = await this.callOpenAI<{ detections: any[] }>({
      systemPrompt: EXPENSE_ANALYZER_SYSTEM_PROMPT,
      userPrompt,
      temperature: 0.2,
      responseFormat: 'json_object',
    });

    return this.parseAntExpensesResponse(result.data, transactions);
  }

  async categorizeTransaction(
    transaction: Transaction,
    availableCategories: BudgetCategory[]
  ): Promise<CategorySuggestion> {
    if (availableCategories.length === 0) {
      return {
        categoryId: 'default',
        categoryName: 'Otros',
        confidence: 0.5,
        reasoning: 'Sin categorías disponibles',
      };
    }

    const userPrompt = `Categoriza esta transacción: "${transaction.description}" (${transaction.merchant || 'sin comercio'})

Categorías disponibles:
${availableCategories.map(c => `- ${c.name}`).join('\n')}

Responde en JSON:
{
  "categoryName": "nombre exacto de la categoría",
  "confidence": 0.0-1.0,
  "reasoning": "por qué esta categoría"
}`;

    const result = await this.callOpenAI<{
      categoryName: string;
      confidence: number;
      reasoning: string;
    }>({
      systemPrompt: 'Eres un experto en categorización de gastos financieros.',
      userPrompt,
      temperature: 0.2,
      maxTokens: 200,
      responseFormat: 'json_object',
    });

    const category = availableCategories.find(c => c.name === result.data.categoryName) || availableCategories[0];

    return {
      categoryId: category.id,
      categoryName: category.name,
      confidence: result.data.confidence || 0.5,
      reasoning: result.data.reasoning || 'Categorización automática',
    };
  }

  async analyzeSpendingPatterns(
    transactions: Transaction[],
    context: AnalysisContext
  ): Promise<SpendingPattern[]> {
    const groupedByCategory = this.groupTransactionsByCategory(transactions);

    const categoryData = Object.entries(groupedByCategory).map(([category, txs]) => ({
      category,
      count: txs.length,
      total: txs.reduce((sum, t) => sum + t.amount.amount, 0),
      average: txs.reduce((sum, t) => sum + t.amount.amount, 0) / txs.length,
    }));

    const userPrompt = `Analiza patrones de gasto por categoría en los últimos ${context.timeFrame.value} ${context.timeFrame.unit}.

Datos por categoría:
${JSON.stringify(categoryData, null, 2)}

Para cada categoría, determina:
- Tendencia (INCREASING si está creciendo, DECREASING si disminuye, STABLE si es constante)
- Cambio porcentual estimado
- Predicción para el próximo período

Responde en JSON:
{
  "patterns": [
    {
      "category": "nombre",
      "trend": "INCREASING" | "DECREASING" | "STABLE",
      "percentageChange": número,
      "averageMonthly": monto_promedio_mensual,
      "prediction": predicción_próximo_mes,
      "confidence": 0.0-1.0
    }
  ]
}`;

    const result = await this.callOpenAI<{ patterns: any[] }>({
      systemPrompt: EXPENSE_ANALYZER_SYSTEM_PROMPT,
      userPrompt,
      temperature: 0.2,
      responseFormat: 'json_object',
    });

    return result.data.patterns.map((p: any) => ({
      category: p.category,
      trend: p.trend,
      percentageChange: p.percentageChange,
      averageMonthly: Money.fromAmount(p.averageMonthly),
      prediction: Money.fromAmount(p.prediction),
      confidence: p.confidence,
    }));
  }

  async predictFutureExpenses(
    historicalTransactions: Transaction[],
    timeFrame: TimeFrame
  ): Promise<{
    predicted: Money;
    confidence: number;
    breakdown: { category: string; amount: Money }[];
  }> {
    const groupedByCategory = this.groupTransactionsByCategory(historicalTransactions);

    const historicalData = Object.entries(groupedByCategory).map(([category, txs]) => ({
      category,
      monthlyAverage: txs.reduce((sum, t) => sum + t.amount.amount, 0) / timeFrame.value,
      transactionCount: txs.length,
    }));

    const userPrompt = `Predice gastos futuros para los próximos ${timeFrame.value} ${timeFrame.unit}.

Datos históricos:
${JSON.stringify(historicalData, null, 2)}

Genera predicción considerando:
- Patrones históricos
- Estacionalidad potencial
- Variabilidad de cada categoría

Responde en JSON:
{
  "predicted": total_predicho,
  "confidence": 0.0-1.0,
  "breakdown": [
    {"category": "nombre", "amount": monto_predicho}
  ]
}`;

    const result = await this.callOpenAI<{
      predicted: number;
      confidence: number;
      breakdown: Array<{ category: string; amount: number }>;
    }>({
      systemPrompt: EXPENSE_ANALYZER_SYSTEM_PROMPT,
      userPrompt,
      temperature: 0.2,
      responseFormat: 'json_object',
    });

    return {
      predicted: Money.fromAmount(result.data.predicted),
      confidence: result.data.confidence,
      breakdown: result.data.breakdown.map(b => ({
        category: b.category,
        amount: Money.fromAmount(b.amount),
      })),
    };
  }

  async generateBudgetOptimizations(
    budget: Budget,
    transactions: Transaction[],
    context: AnalysisContext
  ): Promise<{
    potentialSavings: Money;
    recommendations: {
      category: string;
      currentSpend: Money;
      suggestedLimit: Money;
      reasoning: string;
      priority: 'HIGH' | 'MEDIUM' | 'LOW';
    }[];
  }> {
    const spendingByCategory = this.calculateSpendingByCategory(transactions, budget);

    const userPrompt = `Analiza el presupuesto actual y genera optimizaciones.

Ingreso total: $${budget.totalIncome.amount}

Gasto actual por categoría:
${JSON.stringify(spendingByCategory, null, 2)}

Identifica categorías donde el usuario puede reducir gastos y sugiere límites realistas.

Responde en JSON:
{
  "potentialSavings": ahorro_total_estimado,
  "recommendations": [
    {
      "category": "nombre",
      "currentSpend": gasto_actual,
      "suggestedLimit": límite_sugerido,
      "reasoning": "por qué esta reducción es factible",
      "priority": "HIGH" | "MEDIUM" | "LOW"
    }
  ]
}`;

    const result = await this.callOpenAI<{
      potentialSavings: number;
      recommendations: Array<{
        category: string;
        currentSpend: number;
        suggestedLimit: number;
        reasoning: string;
        priority: 'HIGH' | 'MEDIUM' | 'LOW';
      }>;
    }>({
      systemPrompt: EXPENSE_ANALYZER_SYSTEM_PROMPT,
      userPrompt,
      temperature: 0.3,
      responseFormat: 'json_object',
    });

    return {
      potentialSavings: Money.fromAmount(result.data.potentialSavings),
      recommendations: result.data.recommendations.map(r => ({
        category: r.category,
        currentSpend: Money.fromAmount(r.currentSpend),
        suggestedLimit: Money.fromAmount(r.suggestedLimit),
        reasoning: r.reasoning,
        priority: r.priority,
      })),
    };
  }

  // Helper methods
  private groupTransactionsByCategory(transactions: Transaction[]): Record<string, Transaction[]> {
    return transactions.reduce((acc, t) => {
      const category = t.category || 'Sin categoría';
      if (!acc[category]) acc[category] = [];
      acc[category].push(t);
      return acc;
    }, {} as Record<string, Transaction[]>);
  }

  private calculateSpendingByCategory(transactions: Transaction[], budget: Budget): any[] {
    const grouped = this.groupTransactionsByCategory(transactions);
    return Object.entries(grouped).map(([category, txs]) => ({
      category,
      spent: txs.reduce((sum, t) => sum + t.amount.amount, 0),
      budgeted: budget.categories.find(c => c.name === category)?.allocatedAmount.amount || 0,
    }));
  }

  private parseAntExpensesResponse(parsed: any, transactions: Transaction[]): AntExpenseDetection[] {
    if (!parsed.detections || !Array.isArray(parsed.detections)) {
      console.warn('Invalid response format from OpenAI');
      return [];
    }

    return parsed.detections.map((d: any) => ({
      category: d.category || 'Sin categoría',
      description: d.description || 'Sin descripción',
      frequency: d.frequency || 0,
      averageAmount: Money.fromAmount(d.averageAmount || 0),
      monthlyImpact: Money.fromAmount(d.monthlyImpact || 0),
      annualImpact: Money.fromAmount(d.annualImpact || 0),
      confidence: d.confidence || 0.5,
      examples: (d.examples || []).slice(0, 3).map((ex: any) => ({
        merchant: ex.merchant || 'Desconocido',
        amount: Money.fromAmount(ex.amount || 0),
        date: new Date(ex.date || new Date()),
      })),
      recommendation: d.recommendation || 'Considera reducir este tipo de gastos',
    }));
  }
}
