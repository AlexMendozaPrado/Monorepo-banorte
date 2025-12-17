'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export interface MoneyDTO {
  amount: number;
  currency: string;
}

export interface AntExpenseExample {
  merchant: string;
  amount: MoneyDTO;
  date: string;
}

export interface AntExpenseDTO {
  category: string;
  description: string;
  frequency: number;
  averageAmount: MoneyDTO;
  monthlyImpact: MoneyDTO;
  annualImpact: MoneyDTO;
  confidence: number;
  examples: AntExpenseExample[];
  recommendation: string;
}

export interface AntExpensesAnalysisDTO {
  totalMonthlyImpact: MoneyDTO;
  totalAnnualImpact: MoneyDTO;
  detections: AntExpenseDTO[];
  overallRecommendation: string;
  potentialMonthlySavings: MoneyDTO;
}

export function useAntExpenses(userId: string, timeFrameMonths: number = 1) {
  const [analysis, setAnalysis] = useState<AntExpensesAnalysisDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({ 
        userId,
        timeFrameMonths: timeFrameMonths.toString()
      });
      
      const response = await axios.get(`/api/budget/ant-expenses?${params}`);
      
      if (response.data.success) {
        setAnalysis(response.data.data);
        
        // Check if there's a warning (AI service unavailable but fallback used)
        if (response.data.warning) {
          console.warn('AI Service Warning:', response.data.warning);
        }
      } else {
        setError(response.data.error);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Error analyzing ant expenses');
    } finally {
      setLoading(false);
    }
  }, [userId, timeFrameMonths]);

  useEffect(() => {
    analyze();
  }, [analyze]);

  return { 
    analysis, 
    loading, 
    error, 
    refetch: analyze 
  };
}

