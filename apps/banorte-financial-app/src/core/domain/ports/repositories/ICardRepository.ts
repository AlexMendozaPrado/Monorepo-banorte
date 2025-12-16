// ICardRepository.ts - Card Repository Port
import { Card, CardType, CardStatus } from '../../entities/cards/Card';
import { CardBenefitEntity } from '../../entities/cards/CardBenefit';
import { CardHealthScoreData } from '../../entities/cards/CardHealthScore';

export interface CreateCardDTO {
  userId: string;
  type: CardType;
  network: 'VISA' | 'MASTERCARD' | 'AMEX';
  lastFourDigits: string;
  alias: string;
  creditLimit?: { amount: number; currency: string };
  currentBalance: { amount: number; currency: string };
  paymentDueDate?: string;
  cutOffDate?: string;
  minimumPayment?: { amount: number; currency: string };
  annualInterestRate?: number;
  expiresAt: Date;
}

export interface UpdateCardDTO {
  alias?: string;
  status?: CardStatus;
  currentBalance?: { amount: number; currency: string };
  paymentDueDate?: string;
  minimumPayment?: { amount: number; currency: string };
}

export interface CardFilters {
  type?: CardType;
  status?: CardStatus;
  network?: string;
}

export interface ICardRepository {
  // Card CRUD
  findById(id: string): Promise<Card | null>;
  findByUserId(userId: string, filters?: CardFilters): Promise<Card[]>;
  create(data: CreateCardDTO): Promise<Card>;
  update(id: string, data: UpdateCardDTO): Promise<Card>;
  delete(id: string): Promise<void>;
  
  // Benefits
  findBenefitsByCardId(cardId: string): Promise<CardBenefitEntity[]>;
  findActiveBenefits(cardId: string): Promise<CardBenefitEntity[]>;
  
  // Health Score
  getHealthScore(cardId: string): Promise<CardHealthScoreData | null>;
  saveHealthScore(data: CardHealthScoreData): Promise<void>;
  
  // Statistics
  getTotalCreditLimit(userId: string): Promise<number>;
  getTotalBalance(userId: string): Promise<number>;
  getAverageUtilization(userId: string): Promise<number>;
}

