import { useState, useEffect } from 'react';
import axios from 'axios';

interface CardData {
  id: string;
  type: 'credit' | 'debit';
  name: string;
  number: string;
  network: 'visa' | 'mastercard';
  balance: number;
  limit?: number;
  available?: number;
  utilization?: number;
  paymentDue?: string;
  minPayment?: number;
  noInterestPayment?: number;
  cutDate?: string;
  color: string;
}

interface HealthScore {
  score: number;
  trend: 'up' | 'down' | 'stable';
  factors: { name: string; value: number; status: 'good' | 'warning' | 'bad' }[];
}

interface Recommendation {
  id: string;
  type: 'opportunity' | 'warning' | 'saving' | 'promo';
  title: string;
  description: string;
}

export function useCards() {
  const [cards, setCards] = useState<CardData[]>([]);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/cards?userId=user-demo');
        
        if (response.data.success) {
          const apiCards = response.data.data.map((card: any) => ({
            id: card.id,
            type: card.type.toLowerCase() as 'credit' | 'debit',
            name: card.alias,
            number: `•••• •••• •••• ${card.lastFourDigits}`,
            network: card.network.toLowerCase() as 'visa' | 'mastercard',
            balance: card.currentBalance?.amount || 0,
            limit: card.creditLimit?.amount,
            available: card.availableCredit?.amount,
            utilization: card.creditUtilization,
            paymentDue: card.paymentDueDate,
            minPayment: card.minimumPayment?.amount,
            noInterestPayment: card.noInterestPayment?.amount || card.currentBalance?.amount,
            cutDate: card.cutOffDate,
            color: card.type === 'CREDIT' 
              ? card.network === 'MASTERCARD' ? 'bg-gradient-to-br from-red-700 to-red-900' : 'bg-gradient-to-br from-blue-700 to-blue-900'
              : 'bg-gradient-to-br from-gray-600 to-gray-800',
          }));
          setCards(apiCards);
        }
      } catch (err) {
        console.error('Error fetching cards:', err);
        setError('Error al cargar las tarjetas');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCards();
  }, []);

  useEffect(() => {
    const fetchHealthScore = async () => {
      try {
        const response = await axios.get('/api/cards/health?userId=user-demo');
        if (response.data.success && response.data.data) {
          setHealthScore({
            score: response.data.data.score || 75,
            trend: response.data.data.trend || 'stable',
            factors: response.data.data.factors || [
              { name: 'Utilización de Crédito', value: 70, status: 'warning' },
              { name: 'Historial de Pagos', value: 95, status: 'good' },
              { name: 'Antigüedad', value: 80, status: 'good' },
              { name: 'Diversificación', value: 60, status: 'warning' },
            ],
          });
        }
      } catch (err) {
        console.error('Error fetching health score:', err);
        // Set default health score on error
        setHealthScore({
          score: 75,
          trend: 'stable',
          factors: [
            { name: 'Utilización de Crédito', value: 70, status: 'warning' },
            { name: 'Historial de Pagos', value: 95, status: 'good' },
            { name: 'Antigüedad', value: 80, status: 'good' },
            { name: 'Diversificación', value: 60, status: 'warning' },
          ],
        });
      }
    };

    const fetchRecommendations = async () => {
      try {
        const response = await axios.get('/api/cards/recommendations?userId=user-demo');
        if (response.data.success && response.data.data?.recommendations) {
          setRecommendations(response.data.data.recommendations);
        }
      } catch (err) {
        console.error('Error fetching recommendations:', err);
      }
    };

    if (cards.length > 0) {
      fetchHealthScore();
      fetchRecommendations();
    }
  }, [cards]);

  const activeCard = cards[activeCardIndex] || null;

  return {
    cards,
    activeCard,
    activeCardIndex,
    setActiveCardIndex,
    healthScore,
    recommendations,
    isLoading,
    error,
  };
}

