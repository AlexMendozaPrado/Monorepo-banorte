import {
  IProactiveInsightsPort,
  BudgetInsightContext,
  SavingsInsightContext,
  DebtInsightContext,
  FullInsightContext,
} from '@/core/domain/ports/ai-services/IProactiveInsightsPort';
import { IBudgetRepository } from '@/core/domain/ports/repositories/IBudgetRepository';
import { ITransactionRepository } from '@/core/domain/ports/repositories/ITransactionRepository';
import { ISavingsGoalRepository } from '@/core/domain/ports/repositories/ISavingsGoalRepository';
import { ISavingsRuleRepository } from '@/core/domain/ports/repositories/ISavingsRuleRepository';
import { IDebtRepository } from '@/core/domain/ports/repositories/IDebtRepository';
import {
  InsightDomain,
  ProactiveAnalysisResult,
} from '@/core/domain/entities/advisor/ProactiveInsight';
import { DateRange } from '@/core/domain/value-objects/common/DateRange';

/**
 * DTO de entrada para generación de insights
 */
export interface GenerateInsightsInputDTO {
  userId: string;
  domains?: InsightDomain[];
  monthlyIncome?: number;
  monthlyExpenses?: number;
  maxInsightsPerDomain?: number;
}

/**
 * DTO de salida con insights por dominio
 */
export interface GenerateInsightsOutputDTO {
  budget: InsightDTO[];
  savings: InsightDTO[];
  debt: InsightDTO[];
  generatedAt: string;
  meta: {
    totalInsights: number;
    urgentCount: number;
    processingTimeMs: number;
  };
}

/**
 * DTO individual de insight
 */
export interface InsightDTO {
  id: string;
  domain: string;
  type: string;
  priority: string;
  title: string;
  message: string;
  impact?: {
    amount: number;
    currency: string;
    timeframe: string;
    description?: string;
  };
  actions: Array<{
    label: string;
    type: string;
    payload: Record<string, unknown>;
  }>;
  relatedEntityId?: string;
  relatedEntityType?: string;
  expiresAt?: string;
  createdAt: string;
  isUrgent: boolean;
}

/**
 * Use Case para generar insights proactivos
 *
 * Orquesta la obtención de datos de los repositorios y delega
 * la generación de insights al servicio de IA.
 */
export class GenerateProactiveInsightsUseCase {
  constructor(
    private readonly insightsEngine: IProactiveInsightsPort,
    private readonly budgetRepository: IBudgetRepository,
    private readonly transactionRepository: ITransactionRepository,
    private readonly savingsGoalRepository: ISavingsGoalRepository,
    private readonly savingsRuleRepository: ISavingsRuleRepository,
    private readonly debtRepository: IDebtRepository
  ) {}

  async execute(input: GenerateInsightsInputDTO): Promise<GenerateInsightsOutputDTO> {
    const {
      userId,
      domains = [InsightDomain.BUDGET, InsightDomain.SAVINGS, InsightDomain.DEBT],
      monthlyIncome = 30000, // Default para demo
      monthlyExpenses = 18000, // Default para demo
      maxInsightsPerDomain = 5,
    } = input;

    // Construir contextos en paralelo
    const contextPromises: Promise<void>[] = [];
    const fullContext: FullInsightContext = { userId };

    if (domains.includes(InsightDomain.BUDGET)) {
      contextPromises.push(
        this.buildBudgetContext(userId).then((ctx) => {
          fullContext.budget = ctx;
        })
      );
    }

    if (domains.includes(InsightDomain.SAVINGS)) {
      contextPromises.push(
        this.buildSavingsContext(userId, monthlyIncome, monthlyExpenses).then(
          (ctx) => {
            fullContext.savings = ctx;
          }
        )
      );
    }

    if (domains.includes(InsightDomain.DEBT)) {
      contextPromises.push(
        this.buildDebtContext(userId, monthlyIncome, monthlyExpenses).then(
          (ctx) => {
            fullContext.debt = ctx;
          }
        )
      );
    }

    await Promise.all(contextPromises);

    // Generar insights
    const result = await this.insightsEngine.generateAllInsights(fullContext, {
      domains,
      maxInsightsPerDomain,
    });

    // Transformar a DTOs
    return this.toOutputDTO(result, maxInsightsPerDomain);
  }

  /**
   * Genera insights solo para un dominio específico
   */
  async executeForDomain(
    userId: string,
    domain: InsightDomain,
    monthlyIncome?: number,
    monthlyExpenses?: number
  ): Promise<InsightDTO[]> {
    const income = monthlyIncome || 30000;
    const expenses = monthlyExpenses || 18000;

    let result;

    switch (domain) {
      case InsightDomain.BUDGET: {
        const context = await this.buildBudgetContext(userId);
        result = await this.insightsEngine.generateBudgetInsights(context);
        break;
      }
      case InsightDomain.SAVINGS: {
        const context = await this.buildSavingsContext(userId, income, expenses);
        result = await this.insightsEngine.generateSavingsInsights(context);
        break;
      }
      case InsightDomain.DEBT: {
        const context = await this.buildDebtContext(userId, income, expenses);
        result = await this.insightsEngine.generateDebtInsights(context);
        break;
      }
      default:
        return [];
    }

    return result.insights.map((insight) => this.insightToDTO(insight));
  }

  // ============ Builders de contexto ============

  private async buildBudgetContext(userId: string): Promise<BudgetInsightContext> {
    const currentMonth = new Date();
    const dateRange = DateRange.fromDays(30);

    const [budget, transactions] = await Promise.all([
      this.budgetRepository.findByUserAndMonth(userId, currentMonth),
      this.transactionRepository.findByUserAndDateRange(userId, dateRange),
    ]);

    return {
      userId,
      budget,
      transactions: transactions.slice(0, 100), // Limitar para performance
      timeframe: 'current_month',
    };
  }

  private async buildSavingsContext(
    userId: string,
    monthlyIncome: number,
    monthlyExpenses: number
  ): Promise<SavingsInsightContext> {
    const [goals, rules] = await Promise.all([
      this.savingsGoalRepository.findByUser(userId),
      this.savingsRuleRepository.findByUser(userId),
    ]);

    // Calcular progreso del fondo de emergencia
    const emergencyGoal = goals.find(
      (g) => g.name.toLowerCase().includes('emergencia') && g.status === 'ACTIVE'
    );

    const emergencyFundProgress = emergencyGoal
      ? emergencyGoal.getProgress().value
      : undefined;

    return {
      userId,
      goals,
      rules,
      monthlyIncome,
      monthlyExpenses,
      emergencyFundProgress,
    };
  }

  private async buildDebtContext(
    userId: string,
    monthlyIncome: number,
    monthlyExpenses: number
  ): Promise<DebtInsightContext> {
    const debts = await this.debtRepository.findByUser(userId);

    const availableForDebt = Math.max(0, monthlyIncome - monthlyExpenses);

    return {
      userId,
      debts,
      monthlyIncome,
      monthlyExpenses,
      availableForDebtPayment: availableForDebt,
    };
  }

  // ============ Transformadores ============

  private toOutputDTO(
    result: ProactiveAnalysisResult,
    maxPerDomain: number
  ): GenerateInsightsOutputDTO {
    const budgetInsights =
      result.results[InsightDomain.BUDGET]?.insights || [];
    const savingsInsights =
      result.results[InsightDomain.SAVINGS]?.insights || [];
    const debtInsights = result.results[InsightDomain.DEBT]?.insights || [];

    return {
      budget: budgetInsights.slice(0, maxPerDomain).map((i) => this.insightToDTO(i)),
      savings: savingsInsights.slice(0, maxPerDomain).map((i) => this.insightToDTO(i)),
      debt: debtInsights.slice(0, maxPerDomain).map((i) => this.insightToDTO(i)),
      generatedAt: result.generatedAt.toISOString(),
      meta: {
        totalInsights: result.totalInsights,
        urgentCount: result.urgentCount,
        processingTimeMs: result.processingTimeMs,
      },
    };
  }

  private insightToDTO(
    insight: ReturnType<IProactiveInsightsPort['prioritizeInsights']>[number]
  ): InsightDTO {
    const json = insight.toJSON();

    return {
      id: json.id as string,
      domain: json.domain as string,
      type: json.type as string,
      priority: json.priority as string,
      title: json.title as string,
      message: json.message as string,
      impact: json.impact as InsightDTO['impact'],
      actions: json.actions as InsightDTO['actions'],
      relatedEntityId: json.relatedEntityId as string | undefined,
      relatedEntityType: json.relatedEntityType as string | undefined,
      expiresAt: json.expiresAt as string | undefined,
      createdAt: json.createdAt as string,
      isUrgent: json.isUrgent as boolean,
    };
  }
}
