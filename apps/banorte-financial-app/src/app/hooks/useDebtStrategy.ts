'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export interface PaymentPlan {
  debtId: string;
  debtName: string;
  monthlyPayment: number;
  monthsToPayoff: number;
  totalInterest: number;
  priority: number;
}

export interface StrategyData {
  type: 'AVALANCHE' | 'SNOWBALL' | 'BALANCED';
  totalMonthlyPayment: number;
  plans: PaymentPlan[];
  totalMonthsToPayoff: number;
  totalInterestSaved: number;
  reasoning: string;
}

export interface StrategyComparison {
  avalanche: StrategyData | null;
  snowball: StrategyData | null;
  savingsDifference: number;
  monthsDifference: number;
  recommendedStrategy: 'AVALANCHE' | 'SNOWBALL';
}

export interface UseDebtStrategyReturn {
  comparison: StrategyComparison | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDebtStrategy(
  userId: string,
  availableMonthly: number = 3000
): UseDebtStrategyReturn {
  const [comparison, setComparison] = useState<StrategyComparison | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStrategies = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch both strategies in parallel
      const [avalancheResponse, snowballResponse] = await Promise.all([
        axios.get(`/api/debt/strategy`, {
          params: {
            userId,
            strategyType: 'AVALANCHE',
            availableMonthly,
          },
        }),
        axios.get(`/api/debt/strategy`, {
          params: {
            userId,
            strategyType: 'SNOWBALL',
            availableMonthly,
          },
        }),
      ]);

      if (avalancheResponse.data.success && snowballResponse.data.success) {
        const avalancheStrategy = avalancheResponse.data.data.strategy;
        const snowballStrategy = snowballResponse.data.data.strategy;

        if (!avalancheStrategy || !snowballStrategy) {
          setComparison(null);
          setLoading(false);
          return;
        }

        // Calculate differences
        const savingsDifference = Math.abs(
          avalancheStrategy.totalInterestSaved - snowballStrategy.totalInterestSaved
        );
        const monthsDifference = Math.abs(
          avalancheStrategy.totalMonthsToPayoff - snowballStrategy.totalMonthsToPayoff
        );

        // Recommend strategy (Avalanche typically saves more money)
        const recommendedStrategy =
          avalancheStrategy.totalInterestSaved >= snowballStrategy.totalInterestSaved
            ? 'AVALANCHE'
            : 'SNOWBALL';

        setComparison({
          avalanche: avalancheStrategy,
          snowball: snowballStrategy,
          savingsDifference,
          monthsDifference,
          recommendedStrategy,
        });
      } else {
        setError('Error fetching strategies');
      }
    } catch (err: any) {
      console.error('Error fetching debt strategies:', err);
      setError(err.response?.data?.error || err.message || 'Error fetching strategies');
    } finally {
      setLoading(false);
    }
  }, [userId, availableMonthly]);

  useEffect(() => {
    fetchStrategies();
  }, [fetchStrategies]);

  return {
    comparison,
    loading,
    error,
    refetch: fetchStrategies,
  };
}
