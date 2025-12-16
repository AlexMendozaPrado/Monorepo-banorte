import { IBudgetRepository } from '@/core/domain/ports/repositories/IBudgetRepository';
import { ITransactionRepository } from '@/core/domain/ports/repositories/ITransactionRepository';
import { NotFoundException } from '@/core/domain/exceptions';
import { DateRange } from '@/core/domain/value-objects/common/DateRange';
import { BudgetDTO } from '../../dtos/budget/CreateBudgetDTO';
import { Budget } from '@/core/domain/entities/financial/Budget';
import { BudgetCategory } from '@/core/domain/entities/financial/BudgetCategory';

export interface BudgetSummaryDTO extends BudgetDTO {
  recentTransactions: {
    id: string;
    description: string;
    amount: {
      amount: number;
      currency: string;
    };
    categoryId: string;
    date: string;
    merchant?: string;
  }[];
  comparison?: {
    previousMonth: {
      totalSpent: {
        amount: number;
        currency: string;
      };
      percentageChange: number;
    };
  };
  alerts: {
    type: 'OVER_BUDGET' | 'NEAR_LIMIT' | 'UNUSUAL_SPENDING';
    category?: string;
    message: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
  }[];
}

export class GetBudgetSummaryUseCase {
  constructor(
    private readonly budgetRepository: IBudgetRepository,
    private readonly transactionRepository: ITransactionRepository
  ) {}

  async execute(userId: string, month?: Date): Promise<BudgetSummaryDTO> {
    const targetMonth = month || new Date();

    // Find budget for the month
    const budget = await this.budgetRepository.findByUserAndMonth(
      userId,
      targetMonth
    );

    if (!budget) {
      throw new NotFoundException('Budget', `${userId}-${targetMonth.toISOString()}`);
    }

    // Get date range for the month
    const monthStart = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
    const monthEnd = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);
    const dateRange = DateRange.create(monthStart, monthEnd);

    // Get transactions for the month
    const transactions = await this.transactionRepository.findByUserAndDateRange(
      userId,
      dateRange
    );

    // Get recent transactions (last 10)
    const recentTransactions = transactions
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 10)
      .map(t => ({
        id: t.id,
        description: t.description,
        amount: t.amount.toJSON(),
        categoryId: t.categoryId || 'uncategorized',
        date: t.date.toISOString(),
        merchant: t.merchant,
      }));

    // Get previous month's budget for comparison
    const previousMonth = new Date(targetMonth);
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    const previousBudget = await this.budgetRepository.findByUserAndMonth(
      userId,
      previousMonth
    );

    let comparison;
    if (previousBudget) {
      const currentSpent = budget.getTotalSpent().amount;
      const previousSpent = previousBudget.getTotalSpent().amount;
      const percentageChange = previousSpent === 0
        ? 0
        : ((currentSpent - previousSpent) / previousSpent) * 100;

      comparison = {
        previousMonth: {
          totalSpent: previousBudget.getTotalSpent().toJSON(),
          percentageChange: Math.round(percentageChange * 100) / 100,
        },
      };
    }

    // Generate alerts
    const alerts = this.generateAlerts(budget);

    // Convert budget to DTO
    const budgetDTO = budget.toJSON() as BudgetDTO;

    return {
      ...budgetDTO,
      recentTransactions,
      comparison,
      alerts,
    };
  }

  private generateAlerts(budget: Budget): any[] {
    const alerts: any[] = [];

    // Check for over-budget categories
    const overBudget = budget.getCategoriesOverBudget();
    overBudget.forEach((category: BudgetCategory) => {
      alerts.push({
        type: 'OVER_BUDGET',
        category: category.name,
        message: `Has excedido tu presupuesto en ${category.name} por $${category.spent.subtract(category.budgeted).amount.toFixed(2)}`,
        severity: 'HIGH',
      });
    });

    // Check for categories near limit
    const nearLimit = budget.getCategoriesNearLimit();
    nearLimit.forEach((category: BudgetCategory) => {
      alerts.push({
        type: 'NEAR_LIMIT',
        category: category.name,
        message: `Estás cerca del límite en ${category.name} (${category.getPercentageUsed().value.toFixed(0)}% usado)`,
        severity: 'MEDIUM',
      });
    });

    // Check if overall budget is exceeded
    if (budget.isOverBudget()) {
      alerts.push({
        type: 'OVER_BUDGET',
        message: `Has excedido tu presupuesto total por $${budget.getTotalSpent().subtract(budget.totalIncome).amount.toFixed(2)}`,
        severity: 'HIGH',
      });
    }

    return alerts;
  }
}

