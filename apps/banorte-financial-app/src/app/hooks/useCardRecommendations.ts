'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export interface CardRecommendation {
  id: string;
  type: 'opportunity' | 'warning' | 'saving' | 'promo' | 'alert';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category?: string;
  potentialSavings?: number;
}

export interface CardRecommendationsData {
  recommendations: CardRecommendation[];
  cardRecommendations?: Record<string, CardRecommendation[]>;
  summary?: string;
  totalPotentialSavings?: number;
}

interface UseCardRecommendationsReturn {
  recommendations: CardRecommendation[];
  loading: boolean;
  error: string | null;
  summary: string | null;
  totalPotentialSavings: number;
  refetch: () => Promise<void>;
}

export function useCardRecommendations(
  userId: string,
  cardId?: string
): UseCardRecommendationsReturn {
  const [data, setData] = useState<CardRecommendationsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({ userId });
      if (cardId) {
        params.append('cardId', cardId);
      }

      const response = await axios.get(`/api/cards/recommendations?${params}`);

      if (response.data.success) {
        setData(response.data.data);
      } else {
        setError(response.data.error || 'Error fetching recommendations');
      }
    } catch (err: any) {
      console.error('Error fetching card recommendations:', err);
      setError(err.response?.data?.error || err.message || 'Error fetching recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [userId, cardId]); // Re-fetch when cardId changes

  // Get recommendations for specific card or general recommendations
  let recommendations: CardRecommendation[] = [];

  if (cardId && data?.cardRecommendations?.[cardId]) {
    // If specific card recommendations exist, extract the recommendations array
    const cardRec = data.cardRecommendations[cardId];
    console.log('useCardRecommendations - cardRec for cardId', cardId, ':', cardRec);

    // CardOptimizationResult has a 'recommendations' property
    if (cardRec && typeof cardRec === 'object' && 'recommendations' in cardRec) {
      recommendations = Array.isArray(cardRec.recommendations) ? cardRec.recommendations : [];
    }
  } else if (data?.recommendations) {
    // Use general recommendations
    recommendations = Array.isArray(data.recommendations) ? data.recommendations : [];
  }

  console.log('useCardRecommendations - final recommendations:', recommendations, 'isArray:', Array.isArray(recommendations));

  return {
    recommendations,
    loading,
    error,
    summary: data?.summary || null,
    totalPotentialSavings: data?.totalPotentialSavings || 0,
    refetch: fetchRecommendations,
  };
}
