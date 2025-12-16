import OpenAI from 'openai';
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
import { AIServiceException } from '@/core/domain/exceptions';
import { OpenAIConfig } from './OpenAIConfig';

export class OpenAIExpenseAnalyzer implements IExpenseAnalyzerPort {
  private openai: OpenAI | null = null;
  private config: ReturnType<OpenAIConfig['getConfig']>;

  constructor() {
    const configInstance = OpenAIConfig.getInstance();
    this.config = configInstance.getConfig();
    
    if (this.config.apiKey) {
      this.openai = new OpenAI({ apiKey: this.config.apiKey });
    }
  }

  async detectAntExpenses(
    transactions: Transaction[],
    context: AnalysisContext
  ): Promise<AntExpenseDetection[]> {
    if (!this.openai) {
      console.warn('OpenAI not configured, returning mock data');
      return this.getMockAntExpenses();
    }

    try {
      const prompt = this.buildAntExpensesPrompt(transactions, context);
      const response = await this.openai.chat.completions.create({
        model: this.config.model,
        messages: [
          { role: 'system', content: this.getSystemPrompt() },
          { role: 'user', content: prompt },
        ],
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new AIServiceException('Empty response from OpenAI', 'OpenAI');
      }
      
      const parsed = JSON.parse(content);
      return this.parseAntExpensesResponse(parsed, transactions);
    } catch (error) {
      console.error('Error detecting ant expenses:', error);
      // Fallback to mock data on error
      return this.getMockAntExpenses();
    }
  }

  async categorizeTransaction(
    transaction: Transaction,
    availableCategories: BudgetCategory[]
  ): Promise<CategorySuggestion> {
    if (!this.openai || availableCategories.length === 0) {
      return {
        categoryId: availableCategories[0]?.id || 'default',
        categoryName: availableCategories[0]?.name || 'Otros',
        confidence: 0.5,
        reasoning: 'OpenAI no configurado o sin categorías disponibles',
      };
    }

    try {
      const prompt = `Categoriza esta transacción: "${transaction.description}" (${transaction.merchant || 'sin comercio'}) en una de estas categorías: ${availableCategories.map(c => c.name).join(', ')}. Responde en JSON con formato: {"categoryName": "...", "confidence": 0.0-1.0, "reasoning": "..."}`;
      
      const response = await this.openai.chat.completions.create({
        model: this.config.model,
        messages: [
          { role: 'system', content: 'Eres un experto en categorización de gastos financieros.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 200,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new AIServiceException('Empty response from OpenAI', 'OpenAI');
      }

      const parsed = JSON.parse(content);
      const category = availableCategories.find(c => c.name === parsed.categoryName) || availableCategories[0];

      return {
        categoryId: category.id,
        categoryName: category.name,
        confidence: parsed.confidence || 0.5,
        reasoning: parsed.reasoning || 'Categorización automática',
      };
    } catch (error) {
      console.error('Error categorizing transaction:', error);
      return {
        categoryId: availableCategories[0].id,
        categoryName: availableCategories[0].name,
        confidence: 0.3,
        reasoning: 'Error en categorización automática',
      };
    }
  }

  async analyzeSpendingPatterns(
    transactions: Transaction[],
    context: AnalysisContext
  ): Promise<SpendingPattern[]> {
    // Simplified implementation - can be expanded
    return [];
  }

  async predictFutureExpenses(
    historicalTransactions: Transaction[],
    timeFrame: TimeFrame
  ): Promise<{
    predicted: Money;
    confidence: number;
    breakdown: { category: string; amount: Money }[];
  }> {
    // Simplified implementation - can be expanded
    return {
      predicted: Money.zero(),
      confidence: 0,
      breakdown: [],
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
    // Simplified implementation - can be expanded
    return {
      potentialSavings: Money.zero(),
      recommendations: [],
    };
  }

  private getSystemPrompt(): string {
    return `Eres un analista financiero experto especializado en detectar "gastos hormiga" (pequeños gastos recurrentes que impactan el presupuesto).

Analiza las transacciones considerando:
- Frecuencia de compras similares
- Montos pequeños pero recurrentes (típicamente < $100 MXN)
- Categorías como cafeterías, snacks, apps de delivery, suscripciones pequeñas
- Patrones de gasto que pueden optimizarse

Responde SIEMPRE en formato JSON válido.`;
  }

  private buildAntExpensesPrompt(transactions: Transaction[], context: AnalysisContext): string {
    const expenseTransactions = transactions
      .filter(t => t.isExpense())
      .slice(0, 100); // Limit to avoid token limits

    const transactionsData = expenseTransactions.map(t => ({
      description: t.description,
      amount: t.amount.amount,
      merchant: t.merchant || 'Desconocido',
      date: t.date.toISOString().split('T')[0],
    }));

    const prompt = `Analiza estas ${transactionsData.length} transacciones de los últimos ${context.timeFrame.value} ${context.timeFrame.unit.toLowerCase()} y detecta gastos hormiga.

Transacciones:
${JSON.stringify(transactionsData, null, 2)}

Responde en JSON con este formato exacto:
{
  "detections": [
    {
      "category": "nombre de categoría",
      "description": "descripción del patrón detectado",
      "frequency": número de ocurrencias,
      "averageAmount": monto promedio,
      "monthlyImpact": impacto mensual estimado,
      "annualImpact": impacto anual estimado,
      "confidence": 0.0-1.0,
      "examples": [
        {
          "merchant": "nombre del comercio",
          "amount": monto,
          "date": "YYYY-MM-DD"
        }
      ],
      "recommendation": "recomendación específica en español"
    }
  ]
}`;

    return prompt;
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

  private getMockAntExpenses(): AntExpenseDetection[] {
    return [
      {
        category: 'Cafeterías',
        description: 'Compras frecuentes en cafeterías y coffee shops',
        frequency: 12,
        averageAmount: Money.fromAmount(45),
        monthlyImpact: Money.fromAmount(540),
        annualImpact: Money.fromAmount(6480),
        confidence: 0.85,
        examples: [
          {
            merchant: 'Starbucks',
            amount: Money.fromAmount(50),
            date: new Date()
          },
          {
            merchant: 'Café Punta del Cielo',
            amount: Money.fromAmount(42),
            date: new Date(Date.now() - 86400000 * 2)
          },
        ],
        recommendation: 'Considera preparar café en casa 3 días a la semana. Ahorro potencial: $360/mes',
      },
      {
        category: 'Apps de Delivery',
        description: 'Pedidos frecuentes de comida a domicilio',
        frequency: 8,
        averageAmount: Money.fromAmount(180),
        monthlyImpact: Money.fromAmount(1440),
        annualImpact: Money.fromAmount(17280),
        confidence: 0.78,
        examples: [
          {
            merchant: 'Uber Eats',
            amount: Money.fromAmount(195),
            date: new Date()
          },
        ],
        recommendation: 'Limita los pedidos a domicilio a 2 veces por semana. Ahorro potencial: $720/mes',
      },
    ];
  }
}

