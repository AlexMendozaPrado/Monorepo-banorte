import { Debt } from '../../entities/debt/Debt';

export interface DebtRecommendation {
  type: 'CONSOLIDATION' | 'REFINANCE' | 'EXTRA_PAYMENT' | 'PRIORITY_CHANGE';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  potentialSavings: number;
  actionItems: string[];
  estimatedTimeframe: string;
}

export interface IDebtStrategyPort {
  analyzeDebtPortfolio(
    debts: Debt[],
    monthlyIncome: number,
    monthlyExpenses: number
  ): Promise<{
    totalDebt: number;
    debtToIncomeRatio: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    recommendations: DebtRecommendation[];
  }>;

  suggestConsolidation(
    debts: Debt[]
  ): Promise<{
    recommended: boolean;
    potentialNewLoan: {
      amount: number;
      rate: number;
      term: number;
    };
    monthlySavings: number;
    totalSavings: number;
    reasoning: string;
  }>;

  optimizeExtraPayments(
    debts: Debt[],
    extraAmount: number
  ): Promise<{
    allocations: {
      debtId: string;
      amount: number;
      reasoning: string;
      interestSaved: number;
    }[];
    totalInterestSaved: number;
  }>;
}

