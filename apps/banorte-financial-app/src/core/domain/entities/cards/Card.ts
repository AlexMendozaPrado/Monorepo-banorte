// Card.ts - Card Entity
export type CardType = 'CREDIT' | 'DEBIT';
export type CardNetwork = 'VISA' | 'MASTERCARD' | 'AMEX';
export type CardStatus = 'ACTIVE' | 'BLOCKED' | 'EXPIRED' | 'CANCELLED';

export interface CardBenefit {
  id: string;
  name: string;
  description: string;
  type: 'cashback' | 'points' | 'discount' | 'insurance' | 'access';
  value: number;
  category?: string;
  validUntil?: Date;
}

export interface Money {
  amount: number;
  currency: string;
}

export interface Card {
  id: string;
  userId: string;
  type: CardType;
  network: CardNetwork;
  lastFourDigits: string;
  alias: string;
  status: CardStatus;
  
  // Credit card specific
  creditLimit?: Money;
  currentBalance: Money;
  availableCredit?: Money;
  creditUtilization?: number;
  paymentDueDate?: string;
  cutOffDate?: string;
  minimumPayment?: Money;
  noInterestPayment?: Money;
  annualInterestRate?: number;
  
  // Benefits
  benefits: CardBenefit[];
  rewardPoints?: number;
  cashbackBalance?: Money;
  
  // Metadata
  issuedAt: Date;
  expiresAt: Date;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class CardEntity implements Card {
  id: string;
  userId: string;
  type: CardType;
  network: CardNetwork;
  lastFourDigits: string;
  alias: string;
  status: CardStatus;
  creditLimit?: Money;
  currentBalance: Money;
  availableCredit?: Money;
  creditUtilization?: number;
  paymentDueDate?: string;
  cutOffDate?: string;
  minimumPayment?: Money;
  noInterestPayment?: Money;
  annualInterestRate?: number;
  benefits: CardBenefit[];
  rewardPoints?: number;
  cashbackBalance?: Money;
  issuedAt: Date;
  expiresAt: Date;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Card) {
    Object.assign(this, data);
    this.id = data.id;
    this.userId = data.userId;
    this.type = data.type;
    this.network = data.network;
    this.lastFourDigits = data.lastFourDigits;
    this.alias = data.alias;
    this.status = data.status;
    this.currentBalance = data.currentBalance;
    this.benefits = data.benefits || [];
    this.issuedAt = data.issuedAt;
    this.expiresAt = data.expiresAt;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    
    // Calculate credit utilization for credit cards
    if (this.type === 'CREDIT' && this.creditLimit) {
      this.creditUtilization = this.calculateUtilization();
      this.availableCredit = this.calculateAvailableCredit();
    }
  }

  private calculateUtilization(): number {
    if (!this.creditLimit || this.creditLimit.amount === 0) return 0;
    return Math.round((this.currentBalance.amount / this.creditLimit.amount) * 100);
  }

  private calculateAvailableCredit(): Money {
    if (!this.creditLimit) return { amount: 0, currency: 'MXN' };
    return {
      amount: this.creditLimit.amount - this.currentBalance.amount,
      currency: this.creditLimit.currency,
    };
  }

  isOverUtilized(): boolean {
    return (this.creditUtilization || 0) > 80;
  }

  isNearPaymentDue(): boolean {
    if (!this.paymentDueDate) return false;
    const dueDate = new Date(this.paymentDueDate);
    const today = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 5 && diffDays >= 0;
  }

  getUtilizationStatus(): 'healthy' | 'warning' | 'danger' {
    const utilization = this.creditUtilization || 0;
    if (utilization < 30) return 'healthy';
    if (utilization < 70) return 'warning';
    return 'danger';
  }
}

