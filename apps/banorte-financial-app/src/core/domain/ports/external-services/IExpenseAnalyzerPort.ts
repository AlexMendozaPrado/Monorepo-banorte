import { Transaction } from '../../entities/financial/Transaction';
import { BudgetCategory } from '../../entities/financial/BudgetCategory';
import { Budget } from '../../entities/financial/Budget';
import { Money } from '../../value-objects/financial/Money';
import { TimeFrame } from '../../value-objects/common/TimeFrame';

export interface AntExpenseDetection {
  category: string;
  description: string;
  frequency: number;
  averageAmount: Money;
  monthlyImpact: Money;
  annualImpact: Money;
  confidence: number;
  examples: {
    merchant: string;
    amount: Money;
    date: Date;
  }[];
  recommendation: string;
}

export interface SpendingPattern {
  category: string;
  trend: 'INCREASING' | 'DECREASING' | 'STABLE';
  percentageChange: number;
  averageMonthly: Money;
  prediction: Money;
  confidence: number;
}

export interface CategorySuggestion {
  categoryId: string;
  categoryName: string;
  confidence: number;
  reasoning: string;
}

export interface AnalysisContext {
  userId: string;
  timeFrame: TimeFrame;
  budget?: {
    totalIncome: Money;
    categories: BudgetCategory[];
  };
}

export interface IExpenseAnalyzerPort {
  detectAntExpenses(
    transactions: Transaction[],
    context: AnalysisContext
  ): Promise<AntExpenseDetection[]>;

  categorizeTransaction(
    transaction: Transaction,
    availableCategories: BudgetCategory[]
  ): Promise<CategorySuggestion>;

  analyzeSpendingPatterns(
    transactions: Transaction[],
    context: AnalysisContext
  ): Promise<SpendingPattern[]>;

  predictFutureExpenses(
    historicalTransactions: Transaction[],
    timeFrame: TimeFrame
  ): Promise<{
    predicted: Money;
    confidence: number;
    breakdown: {
      category: string;
      amount: Money;
    }[];
  }>;

  generateBudgetOptimizations(
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
  }>;
}

