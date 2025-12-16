// InMemoryCardRepository.ts - In-memory implementation of card repository
import { Card, CardEntity } from '../../../core/domain/entities/cards/Card';
import { CardBenefitEntity } from '../../../core/domain/entities/cards/CardBenefit';
import { CardHealthScoreData } from '../../../core/domain/entities/cards/CardHealthScore';
import {
  ICardRepository,
  CreateCardDTO,
  UpdateCardDTO,
  CardFilters,
} from '../../../core/domain/ports/repositories/ICardRepository';

export class InMemoryCardRepository implements ICardRepository {
  private cards: Map<string, Card> = new Map();
  private benefits: Map<string, CardBenefitEntity[]> = new Map();
  private healthScores: Map<string, CardHealthScoreData> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData(): void {
    // Seed demo cards
    const demoCards: Card[] = [
      {
        id: 'card-1',
        userId: 'user-demo',
        type: 'CREDIT',
        network: 'MASTERCARD',
        lastFourDigits: '4582',
        alias: 'Banorte Oro',
        status: 'ACTIVE',
        creditLimit: { amount: 30000, currency: 'MXN' },
        currentBalance: { amount: 12450, currency: 'MXN' },
        availableCredit: { amount: 17550, currency: 'MXN' },
        creditUtilization: 42,
        paymentDueDate: '2024-11-15',
        cutOffDate: '2024-10-30',
        minimumPayment: { amount: 450, currency: 'MXN' },
        noInterestPayment: { amount: 12450, currency: 'MXN' },
        annualInterestRate: 36.5,
        benefits: [],
        rewardPoints: 12450,
        cashbackBalance: { amount: 845, currency: 'MXN' },
        issuedAt: new Date('2022-01-15'),
        expiresAt: new Date('2026-01-31'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'card-2',
        userId: 'user-demo',
        type: 'CREDIT',
        network: 'VISA',
        lastFourDigits: '7821',
        alias: 'Banorte Platinum',
        status: 'ACTIVE',
        creditLimit: { amount: 50000, currency: 'MXN' },
        currentBalance: { amount: 25500, currency: 'MXN' },
        availableCredit: { amount: 24500, currency: 'MXN' },
        creditUtilization: 51,
        paymentDueDate: '2024-11-20',
        cutOffDate: '2024-11-05',
        minimumPayment: { amount: 850, currency: 'MXN' },
        noInterestPayment: { amount: 25500, currency: 'MXN' },
        annualInterestRate: 28.5,
        benefits: [],
        rewardPoints: 28500,
        issuedAt: new Date('2021-06-01'),
        expiresAt: new Date('2025-06-30'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'card-3',
        userId: 'user-demo',
        type: 'DEBIT',
        network: 'VISA',
        lastFourDigits: '3194',
        alias: 'Banorte Débito',
        status: 'ACTIVE',
        currentBalance: { amount: 8450, currency: 'MXN' },
        benefits: [],
        issuedAt: new Date('2020-03-10'),
        expiresAt: new Date('2025-03-31'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    demoCards.forEach((card) => this.cards.set(card.id, card));
  }

  async findById(id: string): Promise<Card | null> {
    return this.cards.get(id) || null;
  }

  async findByUserId(userId: string, filters?: CardFilters): Promise<Card[]> {
    let cards = Array.from(this.cards.values()).filter((c) => c.userId === userId);

    if (filters?.type) {
      cards = cards.filter((c) => c.type === filters.type);
    }
    if (filters?.status) {
      cards = cards.filter((c) => c.status === filters.status);
    }
    if (filters?.network) {
      cards = cards.filter((c) => c.network === filters.network);
    }

    return cards;
  }

  async create(data: CreateCardDTO): Promise<Card> {
    const id = `card-${Date.now()}`;
    const now = new Date();

    const card: Card = {
      id,
      userId: data.userId,
      type: data.type,
      network: data.network,
      lastFourDigits: data.lastFourDigits,
      alias: data.alias,
      status: 'ACTIVE',
      creditLimit: data.creditLimit,
      currentBalance: data.currentBalance,
      paymentDueDate: data.paymentDueDate,
      cutOffDate: data.cutOffDate,
      minimumPayment: data.minimumPayment,
      annualInterestRate: data.annualInterestRate,
      benefits: [],
      issuedAt: now,
      expiresAt: data.expiresAt,
      createdAt: now,
      updatedAt: now,
    };

    // Calculate derived fields for credit cards
    if (card.type === 'CREDIT' && card.creditLimit) {
      card.creditUtilization = Math.round(
        (card.currentBalance.amount / card.creditLimit.amount) * 100
      );
      card.availableCredit = {
        amount: card.creditLimit.amount - card.currentBalance.amount,
        currency: card.creditLimit.currency,
      };
    }

    this.cards.set(id, card);
    return card;
  }

  async update(id: string, data: UpdateCardDTO): Promise<Card> {
    const card = this.cards.get(id);
    if (!card) throw new Error('Card not found');

    const updated = { ...card, ...data, updatedAt: new Date() };
    this.cards.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.cards.delete(id);
  }

  async findBenefitsByCardId(cardId: string): Promise<CardBenefitEntity[]> {
    return this.benefits.get(cardId) || [];
  }

  async findActiveBenefits(cardId: string): Promise<CardBenefitEntity[]> {
    const all = this.benefits.get(cardId) || [];
    const now = new Date();
    return all.filter((b) => b.status === 'active' && now <= b.validUntil);
  }

  async getHealthScore(cardId: string): Promise<CardHealthScoreData | null> {
    return this.healthScores.get(cardId) || null;
  }

  async saveHealthScore(data: CardHealthScoreData): Promise<void> {
    this.healthScores.set(data.cardId, data);
  }

  async getTotalCreditLimit(userId: string): Promise<number> {
    const cards = await this.findByUserId(userId, { type: 'CREDIT' });
    return cards.reduce((sum, c) => sum + (c.creditLimit?.amount || 0), 0);
  }

  async getTotalBalance(userId: string): Promise<number> {
    const cards = await this.findByUserId(userId);
    return cards.reduce((sum, c) => sum + c.currentBalance.amount, 0);
  }

  async getAverageUtilization(userId: string): Promise<number> {
    const cards = await this.findByUserId(userId, { type: 'CREDIT' });
    if (cards.length === 0) return 0;
    const total = cards.reduce((sum, c) => sum + (c.creditUtilization || 0), 0);
    return Math.round(total / cards.length);
  }
}

