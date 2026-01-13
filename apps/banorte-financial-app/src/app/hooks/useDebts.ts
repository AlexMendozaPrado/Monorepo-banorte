'use client';

import { useState, useEffect, useCallback } from 'react';

interface Debt {
  id: string;
  userId: string;
  type: string;
  name: string;
  originalAmount: number;
  currentBalance: number;
  interestRate: number;
  minimumPayment: number;
  dueDate?: string;
  status: string;
  progress: number;
  monthlyInterest: number;
  isPastDue: boolean;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

interface UseDebtsReturn {
  debts: Debt[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createDebt: (data: CreateDebtData) => Promise<Debt | null>;
}

interface CreateDebtData {
  type: string;
  name: string;
  originalAmount: number;
  currentBalance: number;
  interestRate: number;
  minimumPayment: number;
  dueDate?: string;
}

export function useDebts(userId: string = 'user-1'): UseDebtsReturn {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDebts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/debt?userId=${userId}`);
      const result = await response.json();

      if (result.success) {
        setDebts(result.data);
      } else {
        setError(result.error || 'Error fetching debts');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const createDebt = useCallback(
    async (data: CreateDebtData): Promise<Debt | null> => {
      try {
        const response = await fetch('/api/debt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, userId }),
        });
        const result = await response.json();

        if (result.success) {
          await fetchDebts();
          return result.data;
        } else {
          setError(result.error || 'Error creating debt');
          return null;
        }
      } catch (err: any) {
        setError(err.message || 'Network error');
        return null;
      }
    },
    [userId, fetchDebts]
  );

  useEffect(() => {
    fetchDebts();
  }, [fetchDebts]);

  return {
    debts,
    isLoading,
    error,
    refetch: fetchDebts,
    createDebt,
  };
}

