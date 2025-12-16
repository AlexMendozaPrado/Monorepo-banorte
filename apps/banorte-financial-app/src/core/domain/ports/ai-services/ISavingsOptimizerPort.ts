import { SavingsGoal } from '../../entities/savings/SavingsGoal';
import { SavingsRule } from '../../entities/savings/SavingsRule';
import { Money } from '../../value-objects/financial/Money';

export interface SavingsStrategy {
  goalId: string;
  goalName: string;
  recommendedMonthlyContribution: Money;
  estimatedCompletionDate: Date;
  alternativeStrategies: {
    name: string;
    monthlyContribution: Money;
    completionDate: Date;
    tradeoffs: string;
  }[];
  reasoning: string;
}

export interface SavingsOptimization {
  totalMonthlySavings: Money;
  strategies: SavingsStrategy[];
  suggestedRules: {
    type: string;
    name: string;
    description: string;
    estimatedMonthlySavings: Money;
  }[];
  overallRecommendation: string;
}

export interface ISavingsOptimizerPort {
  optimizeSavingsStrategy(
    goals: SavingsGoal[],
    currentRules: SavingsRule[],
    monthlyIncome: Money,
    monthlyExpenses: Money
  ): Promise<SavingsOptimization>;

  simulateSavingsImpact(
    goal: SavingsGoal,
    monthlyContribution: Money,
    months: number
  ): Promise<{
    finalAmount: Money;
    completionDate: Date;
    monthsToCompletion: number;
    successProbability: number;
  }>;

  suggestSavingsGoals(
    userProfile: {
      age: number;
      monthlyIncome: Money;
      monthlyExpenses: Money;
      currentSavings: Money;
      hasEmergencyFund: boolean;
    }
  ): Promise<{
    suggestions: {
      name: string;
      targetAmount: Money;
      priority: 'HIGH' | 'MEDIUM' | 'LOW';
      reasoning: string;
      recommendedDeadline: Date;
    }[];
  }>;
}
