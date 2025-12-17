import { Message } from '../../entities/advisor/Message';
import { FinancialInsight } from '../../entities/advisor/FinancialInsight';

export interface FinancialContext {
  userId: string;
  monthlyIncome?: number;
  monthlyExpenses?: number;
  totalDebt?: number;
  totalSavings?: number;
  activeBudgets?: any[];
  activeGoals?: any[];
  recentTransactions?: any[];
}

export interface IFinancialAdvisorPort {
  generateResponse(
    userMessage: string,
    conversationHistory: Message[],
    context: FinancialContext
  ): Promise<{
    response: string;
    suggestedQuestions: string[];
    relatedInsights?: string[];
  }>;

  generateFinancialInsights(
    context: FinancialContext
  ): Promise<FinancialInsight[]>;

  analyzeSpendingPattern(
    transactions: any[],
    budget: any
  ): Promise<{
    patterns: {
      category: string;
      trend: 'INCREASING' | 'DECREASING' | 'STABLE';
      recommendation: string;
    }[];
    overallHealth: 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL';
  }>;

  generatePersonalizedAdvice(
    question: string,
    context: FinancialContext
  ): Promise<{
    advice: string;
    reasoning: string;
    nextSteps: string[];
  }>;
}

