import { ITransactionRepository } from '@/core/domain/ports/repositories/ITransactionRepository';
import { IExpenseAnalyzerPort } from '@/core/domain/ports/external-services/IExpenseAnalyzerPort';
import { IBudgetRepository } from '@/core/domain/ports/repositories/IBudgetRepository';
import { TimeFrame } from '@/core/domain/value-objects/common/TimeFrame';
import { DateRange } from '@/core/domain/value-objects/common/DateRange';
import { Money } from '@/core/domain/value-objects/financial/Money';
import { AntExpensesAnalysisDTO, AntExpenseDTO } from '../../dtos/budget/AntExpenseDTO';
import { AntExpenseDetection } from '@/core/domain/ports/external-services/IExpenseAnalyzerPort';

export class DetectAntExpensesUseCase {
  constructor(
    private readonly transactionRepository: ITransactionRepository,
    private readonly expenseAnalyzer: IExpenseAnalyzerPort,
    private readonly budgetRepository: IBudgetRepository
  ) {}

  async execute(
    userId: string,
    timeFrameMonths: number = 1
  ): Promise<AntExpensesAnalysisDTO> {
    // Get date range for analysis
    const timeFrame = TimeFrame.fromMonths(timeFrameMonths);
    const dateRange = this.getDateRangeForTimeFrame(timeFrame);
    
    // Get transactions for the period
    const transactions = await this.transactionRepository.findByUserAndDateRange(
      userId,
      dateRange
    );

    // Get current budget if exists
    const currentMonth = new Date();
    const budget = await this.budgetRepository.findByUserAndMonth(
      userId,
      currentMonth
    );

    // Detect ant expenses using AI
    const detections = await this.expenseAnalyzer.detectAntExpenses(
      transactions,
      {
        userId,
        timeFrame,
        budget: budget ? {
          totalIncome: budget.totalIncome,
          categories: budget.categories as any,
        } : undefined,
      }
    );

    // Calculate totals
    const totalMonthlyImpact = detections.reduce(
      (sum, d) => sum.add(d.monthlyImpact),
      Money.zero()
    );

    const totalAnnualImpact = detections.reduce(
      (sum, d) => sum.add(d.annualImpact),
      Money.zero()
    );

    // Estimate potential savings (70% of total impact)
    const potentialSavings = totalMonthlyImpact.multiply(0.7);

    // Generate overall recommendation
    const overallRecommendation = this.generateOverallRecommendation(
      detections,
      totalMonthlyImpact
    );

    return {
      totalMonthlyImpact: totalMonthlyImpact.toJSON(),
      totalAnnualImpact: totalAnnualImpact.toJSON(),
      detections: detections.map(d => this.toDTO(d)),
      overallRecommendation,
      potentialMonthlySavings: potentialSavings.toJSON(),
    };
  }

  private getDateRangeForTimeFrame(timeFrame: TimeFrame): DateRange {
    const days = timeFrame.toDays();
    return DateRange.fromDays(days);
  }

  private generateOverallRecommendation(
    detections: AntExpenseDetection[],
    totalImpact: Money
  ): string {
    if (detections.length === 0) {
      return 'No se detectaron gastos hormiga significativos. ¡Excelente control de gastos!';
    }

    const topCategory = detections.reduce((max, d) =>
      d.monthlyImpact.amount > max.monthlyImpact.amount ? d : max
    );

    return `Se detectaron ${detections.length} tipos de gastos hormiga con un impacto mensual de $${totalImpact.amount.toFixed(2)}. La categoría con mayor impacto es "${topCategory.category}" con $${topCategory.monthlyImpact.amount.toFixed(2)}/mes. Considera establecer límites semanales y usar métodos de pago que te ayuden a controlar estos gastos.`;
  }

  private toDTO(detection: AntExpenseDetection): AntExpenseDTO {
    return {
      category: detection.category,
      description: detection.description,
      frequency: detection.frequency,
      averageAmount: detection.averageAmount.toJSON(),
      monthlyImpact: detection.monthlyImpact.toJSON(),
      annualImpact: detection.annualImpact.toJSON(),
      confidence: detection.confidence,
      examples: detection.examples.map(ex => ({
        merchant: ex.merchant,
        amount: ex.amount.toJSON(),
        date: ex.date.toISOString(),
      })),
      recommendation: detection.recommendation,
    };
  }
}

