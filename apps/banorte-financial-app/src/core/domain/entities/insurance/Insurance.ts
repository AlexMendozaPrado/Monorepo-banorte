import { v4 as uuidv4 } from 'uuid';
import { Money } from '../../value-objects/financial/Money';

export enum InsuranceType {
  LIFE = 'LIFE',
  HEALTH = 'HEALTH',
  AUTO = 'AUTO',
  HOME = 'HOME',
  DISABILITY = 'DISABILITY',
}

export enum InsuranceStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentFrequency {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  ANNUAL = 'ANNUAL',
}

export interface CreateInsuranceData {
  userId: string;
  type: InsuranceType;
  provider: string;
  policyNumber: string;
  coverageAmount: Money;
  premium: Money;
  paymentFrequency: PaymentFrequency;
  startDate: Date;
  endDate: Date;
  beneficiaries?: string[];
}

export class Insurance {
  private _status: InsuranceStatus;
  private _lastPaymentDate?: Date;
  private readonly createdAt: Date;
  private updatedAt: Date;

  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly type: InsuranceType,
    public readonly provider: string,
    public readonly policyNumber: string,
    public readonly coverageAmount: Money,
    public readonly premium: Money,
    public readonly paymentFrequency: PaymentFrequency,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly beneficiaries: string[],
    status: InsuranceStatus = InsuranceStatus.ACTIVE
  ) {
    this._status = status;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static create(data: CreateInsuranceData): Insurance {
    return new Insurance(
      uuidv4(),
      data.userId,
      data.type,
      data.provider,
      data.policyNumber,
      data.coverageAmount,
      data.premium,
      data.paymentFrequency,
      data.startDate,
      data.endDate,
      data.beneficiaries || [],
      InsuranceStatus.ACTIVE
    );
  }

  isExpired(): boolean {
    return new Date() > this.endDate;
  }

  isActive(): boolean {
    return this._status === InsuranceStatus.ACTIVE && !this.isExpired();
  }

  getDaysUntilExpiration(): number {
    const diff = this.endDate.getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  getAnnualPremium(): Money {
    switch (this.paymentFrequency) {
      case PaymentFrequency.MONTHLY:
        return this.premium.multiply(12);
      case PaymentFrequency.QUARTERLY:
        return this.premium.multiply(4);
      case PaymentFrequency.ANNUAL:
        return this.premium;
    }
  }

  get status(): InsuranceStatus {
    return this._status;
  }

  get lastPaymentDate(): Date | undefined {
    return this._lastPaymentDate;
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      type: this.type,
      provider: this.provider,
      policyNumber: this.policyNumber,
      coverageAmount: this.coverageAmount.toJSON(),
      premium: this.premium.toJSON(),
      paymentFrequency: this.paymentFrequency,
      annualPremium: this.getAnnualPremium().toJSON(),
      startDate: this.startDate.toISOString(),
      endDate: this.endDate.toISOString(),
      beneficiaries: this.beneficiaries,
      status: this._status,
      isActive: this.isActive(),
      isExpired: this.isExpired(),
      daysUntilExpiration: this.getDaysUntilExpiration(),
      lastPaymentDate: this._lastPaymentDate?.toISOString(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}

