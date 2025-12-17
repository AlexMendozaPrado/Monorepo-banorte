'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export interface MoneyDTO {
  amount: number;
  currency: string;
}

export interface CategoryDTO {
  id: string;
  name: string;
  budgeted: MoneyDTO;
  spent: MoneyDTO;
  available: MoneyDTO;
  percentageUsed: number;
  isOverBudget: boolean;
  isNearLimit: boolean;
  icon?: string;
  color?: string;
  transactionCount: number;
}

export interface BudgetDTO {
  id: string;
  userId: string;
  month: string;
  totalIncome: MoneyDTO;
  totalSpent: MoneyDTO;
  available: MoneyDTO;
  percentageUsed: number;
  isOverBudget: boolean;
  categories: CategoryDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface BudgetSummaryDTO extends BudgetDTO {
  recentTransactions: any[];
  comparison?: {
    previousMonth: {
      totalSpent: MoneyDTO;
      percentageChange: number;
    };
  };
  alerts: {
    type: 'OVER_BUDGET' | 'NEAR_LIMIT';
    categoryId: string;
    categoryName: string;
    message: string;
  }[];
}

export interface CreateBudgetInput {
  month: Date;
  totalIncome: number;
  currency?: string;
  categories: {
    name: string;
    budgeted: number;
    icon?: string;
    color?: string;
  }[];
}

export function useBudget(userId: string, month?: Date) {
  const [budget, setBudget] = useState<BudgetSummaryDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBudget = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({ userId });
      if (month) {
        params.append('month', month.toISOString());
      }
      
      const response = await axios.get(`/api/budget/summary?${params}`);
      
      if (response.data.success) {
        setBudget(response.data.data);
      } else {
        setError(response.data.error);
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        // Budget not found is not an error, just no budget yet
        setBudget(null);
        setError(null);
      } else {
        setError(err.response?.data?.error || err.message || 'Error fetching budget');
      }
    } finally {
      setLoading(false);
    }
  }, [userId, month]);

  useEffect(() => {
    fetchBudget();
  }, [fetchBudget]);

  const createBudget = async (data: CreateBudgetInput): Promise<BudgetDTO> => {
    try {
      setError(null);
      
      const response = await axios.post('/api/budget', {
        userId,
        month: data.month.toISOString(),
        totalIncome: data.totalIncome,
        currency: data.currency || 'MXN',
        categories: data.categories,
      });
      
      if (response.data.success) {
        // Refresh the budget after creation
        await fetchBudget();
        return response.data.data;
      } else {
        throw new Error(response.data.error);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Error creating budget';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return { 
    budget, 
    loading, 
    error, 
    refetch: fetchBudget, 
    createBudget 
  };
}

