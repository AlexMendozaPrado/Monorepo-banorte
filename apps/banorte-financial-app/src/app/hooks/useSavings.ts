import { useState, useEffect } from 'react';
import axios from 'axios';

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: { amount: number; currency: string };
  currentAmount: { amount: number; currency: string };
  remaining: { amount: number; currency: string };
  progress: number;
  deadline?: string;
  priority: string;
  icon: string;
  color: string;
  status: string;
  isCompleted: boolean;
  monthlyContributionNeeded: { amount: number; currency: string } | null;
}

export function useSavings(userId: string) {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchGoals();
    }
  }, [userId]);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({ userId });
      const response = await axios.get(`/api/savings/goals?${params}`);

      if (response.data.success) {
        setGoals(response.data.data);
      } else {
        setError(response.data.error);
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching savings goals');
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async (data: {
    name: string;
    targetAmount: number;
    deadline?: string;
    priority: string;
    icon?: string;
    color?: string;
  }) => {
    try {
      const response = await axios.post('/api/savings/goals', {
        userId,
        ...data,
      });

      if (response.data.success) {
        await fetchGoals();
        return response.data.data;
      } else {
        throw new Error(response.data.error);
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    goals,
    loading,
    error,
    refetch: fetchGoals,
    createGoal,
  };
}
