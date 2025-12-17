'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export interface SavingsStrategy {
  goalId: string;
  goalName: string;
  recommendedMonthlyContribution: { amount: number; currency: string };
  estimatedCompletionDate: string;
  reasoning: string;
  alternativeStrategies?: Array<{
    name: string;
    monthlyContribution: { amount: number; currency: string };
    completionMonths: number;
  }>;
}

export interface SuggestedRule {
  type: string;
  name: string;
  description: string;
  estimatedMonthlySavings: { amount: number; currency: string };
}

export interface SavingsOptimizationData {
  totalMonthlySavings: { amount: number; currency: string };
  strategies: SavingsStrategy[];
  suggestedRules: SuggestedRule[];
  overallRecommendation: string;
}

interface UseSavingsOptimizationReturn {
  optimization: SavingsOptimizationData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSavingsOptimization(
  userId: string,
  monthlyIncome: number = 30000,
  monthlyExpenses: number = 18000
): UseSavingsOptimizationReturn {
  const [optimization, setOptimization] = useState<SavingsOptimizationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOptimization = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        userId,
        monthlyIncome: monthlyIncome.toString(),
        monthlyExpenses: monthlyExpenses.toString(),
      });

      const response = await axios.get(`/api/savings/optimize?${params}`);

      if (response.data.success) {
        setOptimization(response.data.data);
      } else {
        setError(response.data.error || 'Error fetching optimization');
      }
    } catch (err: any) {
      console.error('Error fetching savings optimization:', err);
      setError(err.response?.data?.error || err.message || 'Error fetching optimization');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptimization();
  }, [userId, monthlyIncome, monthlyExpenses]);

  return {
    optimization,
    loading,
    error,
    refetch: fetchOptimization,
  };
}
