import { useState, useEffect } from 'react';
import axios from 'axios';

export interface SavingsRule {
  id: string;
  goalId: string;
  name: string;
  type: string;
  frequency: string;
  amount?: { amount: number; currency: string };
  percentage?: number;
  active: boolean;
  executionCount: number;
  totalSaved: { amount: number; currency: string };
}

export function useSavingsRules(userId: string, goalId?: string) {
  const [rules, setRules] = useState<SavingsRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchRules();
    }
  }, [userId, goalId]);

  const fetchRules = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({ userId });
      if (goalId) {
        params.append('goalId', goalId);
      }

      const response = await axios.get(`/api/savings/rules?${params}`);

      if (response.data.success) {
        setRules(response.data.data);
      } else {
        setError(response.data.error);
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching savings rules');
    } finally {
      setLoading(false);
    }
  };

  const createRule = async (data: {
    goalId: string;
    name: string;
    type: string;
    frequency: string;
    amount?: number;
    percentage?: number;
  }) => {
    try {
      const response = await axios.post('/api/savings/rules', {
        userId,
        ...data,
      });

      if (response.data.success) {
        await fetchRules();
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
    rules,
    loading,
    error,
    refetch: fetchRules,
    createRule,
  };
}
