'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { useBudget, BudgetSummaryDTO, CategoryDTO } from '@/app/hooks/useBudget';
import { useDebts } from '@/app/hooks/useDebts';
import { useSavings, SavingsGoal } from '@/app/hooks/useSavings';

// Global user ID for demo
export const DEMO_USER_ID = 'user-1';
export const DEMO_USER_NAME = 'María González';

interface DebtSummary {
  id: string;
  name: string;
  type: string;
  balance: number;
  interestRate: number;
  minimumPayment: number;
  dueDate?: string;
}

interface FinancialContextValue {
  // User info
  userId: string;
  userName: string;

  // Budget data
  budget: BudgetSummaryDTO | null;
  budgetLoading: boolean;
  monthlyIncome: number;
  monthlyExpenses: number;
  availableBudget: number;
  categories: CategoryDTO[];

  // Debt data
  debts: DebtSummary[];
  debtsLoading: boolean;
  totalDebt: number;
  monthlyDebtPayments: number;
  averageInterestRate: number;

  // Savings data
  savingsGoals: SavingsGoal[];
  savingsLoading: boolean;
  totalSavings: number;
  emergencyFund: {
    current: number;
    target: number;
    progress: number;
  };

  // Calculated metrics
  netWorth: number;
  availableForDebt: number;
  availableForSavings: number;
  financialHealthScore: number;
  debtToIncomeRatio: number;
  savingsRate: number;

  // Loading state
  isLoading: boolean;

  // Refetch functions
  refetchBudget: () => void;
  refetchDebts: () => Promise<void>;
  refetchSavings: () => void;
}

const FinancialContext = createContext<FinancialContextValue | undefined>(undefined);

interface FinancialProviderProps {
  children: React.ReactNode;
}

export function FinancialProvider({ children }: FinancialProviderProps) {
  const userId = DEMO_USER_ID;
  const userName = DEMO_USER_NAME;

  // Fetch all data
  const { budget, loading: budgetLoading, refetch: refetchBudget } = useBudget(userId);
  const { debts: rawDebts, isLoading: debtsLoading, refetch: refetchDebts } = useDebts(userId);
  const { goals: savingsGoals, loading: savingsLoading, refetch: refetchSavings } = useSavings(userId);

  // Process budget data
  const monthlyIncome = budget?.totalIncome?.amount ?? 30000; // Default for demo
  const monthlyExpenses = budget?.totalSpent?.amount ?? 18000;
  const availableBudget = budget?.available?.amount ?? (monthlyIncome - monthlyExpenses);
  const categories = budget?.categories ?? [];

  // Process debt data
  const debts: DebtSummary[] = useMemo(() =>
    rawDebts.map(d => ({
      id: d.id,
      name: d.name,
      type: d.type,
      balance: d.currentBalance,
      interestRate: d.interestRate,
      minimumPayment: d.minimumPayment,
      dueDate: d.dueDate,
    })),
    [rawDebts]
  );

  const totalDebt = useMemo(() =>
    debts.reduce((sum, d) => sum + d.balance, 0),
    [debts]
  );

  const monthlyDebtPayments = useMemo(() =>
    debts.reduce((sum, d) => sum + d.minimumPayment, 0),
    [debts]
  );

  const averageInterestRate = useMemo(() => {
    if (debts.length === 0) return 0;
    const weightedSum = debts.reduce((sum, d) => sum + (d.interestRate * d.balance), 0);
    return totalDebt > 0 ? weightedSum / totalDebt : 0;
  }, [debts, totalDebt]);

  // Process savings data
  const totalSavings = useMemo(() =>
    savingsGoals.reduce((sum, g) => sum + g.currentAmount.amount, 0),
    [savingsGoals]
  );

  const emergencyFund = useMemo(() => {
    const emergencyGoal = savingsGoals.find(g =>
      g.name.toLowerCase().includes('emergencia') || g.name.toLowerCase().includes('emergency')
    );
    if (emergencyGoal) {
      return {
        current: emergencyGoal.currentAmount.amount,
        target: emergencyGoal.targetAmount.amount,
        progress: emergencyGoal.progress,
      };
    }
    // Default emergency fund target: 6 months of expenses
    const target = monthlyExpenses * 6;
    return {
      current: totalSavings * 0.5, // Assume 50% of savings is emergency fund
      target,
      progress: Math.min(((totalSavings * 0.5) / target) * 100, 100),
    };
  }, [savingsGoals, totalSavings, monthlyExpenses]);

  // Calculated metrics
  const netWorth = totalSavings - totalDebt;

  const availableForDebt = useMemo(() => {
    const afterExpenses = monthlyIncome - monthlyExpenses;
    const afterMinPayments = afterExpenses - monthlyDebtPayments;
    return Math.max(afterMinPayments, 0);
  }, [monthlyIncome, monthlyExpenses, monthlyDebtPayments]);

  const availableForSavings = useMemo(() => {
    const afterExpenses = monthlyIncome - monthlyExpenses;
    return Math.max(afterExpenses * 0.2, 0); // 20% rule for savings
  }, [monthlyIncome, monthlyExpenses]);

  const debtToIncomeRatio = useMemo(() =>
    monthlyIncome > 0 ? (monthlyDebtPayments / monthlyIncome) * 100 : 0,
    [monthlyDebtPayments, monthlyIncome]
  );

  const savingsRate = useMemo(() =>
    monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0,
    [monthlyIncome, monthlyExpenses]
  );

  // Financial health score (0-100)
  const financialHealthScore = useMemo(() => {
    let score = 50; // Base score

    // Savings rate impact (+/- 15 points)
    if (savingsRate >= 20) score += 15;
    else if (savingsRate >= 10) score += 10;
    else if (savingsRate >= 5) score += 5;
    else if (savingsRate < 0) score -= 15;

    // Debt to income ratio impact (+/- 15 points)
    if (debtToIncomeRatio <= 10) score += 15;
    else if (debtToIncomeRatio <= 20) score += 10;
    else if (debtToIncomeRatio <= 35) score += 0;
    else if (debtToIncomeRatio <= 50) score -= 10;
    else score -= 15;

    // Emergency fund impact (+/- 10 points)
    if (emergencyFund.progress >= 100) score += 10;
    else if (emergencyFund.progress >= 50) score += 5;
    else if (emergencyFund.progress < 25) score -= 5;

    // Budget adherence impact (+/- 10 points)
    const budgetPercentUsed = budget?.percentageUsed ?? 60;
    if (budgetPercentUsed <= 80) score += 10;
    else if (budgetPercentUsed <= 100) score += 5;
    else score -= 10;

    return Math.min(Math.max(score, 0), 100);
  }, [savingsRate, debtToIncomeRatio, emergencyFund, budget]);

  const isLoading = budgetLoading || debtsLoading || savingsLoading;

  const value: FinancialContextValue = {
    userId,
    userName,
    budget,
    budgetLoading,
    monthlyIncome,
    monthlyExpenses,
    availableBudget,
    categories,
    debts,
    debtsLoading,
    totalDebt,
    monthlyDebtPayments,
    averageInterestRate,
    savingsGoals,
    savingsLoading,
    totalSavings,
    emergencyFund,
    netWorth,
    availableForDebt,
    availableForSavings,
    financialHealthScore,
    debtToIncomeRatio,
    savingsRate,
    isLoading,
    refetchBudget,
    refetchDebts,
    refetchSavings,
  };

  return (
    <FinancialContext.Provider value={value}>
      {children}
    </FinancialContext.Provider>
  );
}

export function useFinancialContext() {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancialContext must be used within a FinancialProvider');
  }
  return context;
}

// Helper hook for just the user info
export function useUser() {
  const { userId, userName } = useFinancialContext();
  return { userId, userName };
}
