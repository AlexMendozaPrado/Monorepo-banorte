import { v4 as uuidv4 } from 'uuid';
import { Money } from '../../value-objects/financial/Money';
import { Percentage } from '../../value-objects/financial/Percentage';
import { ValidationException } from '../../exceptions';

export enum FundStatus {
  CRITICAL = 'CRITICAL',     // < 1 month
  LOW = 'LOW',              // 1-3 months
  MODERATE = 'MODERATE',     // 3-6 months
  GOOD = 'GOOD',            // 6-9 months
  EXCELLENT = 'EXCELLENT',   // 9+ months
}

export interface CreateEmergencyFundData {
  userId: string;
  monthlyExpenses: Money;
  currentAmount: Money;
  targetMonths: number;
}

export class EmergencyFund {
  private readonly createdAt: Date;
  private updatedAt: Date;

  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly monthlyExpenses: Money,
    public readonly currentAmount: Money,
    public readonly targetMonths: number
  ) {
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.validate();
  }

  static create(data: CreateEmergencyFundData): EmergencyFund {
    return new EmergencyFund(
      uuidv4(),
      data.userId,
      data.monthlyExpenses,
      data.currentAmount,
      data.targetMonths
    );
  }

  getTargetAmount(): Money {
    return this.monthlyExpenses.multiply(this.targetMonths);
  }

  getMonthsCovered(): number {
    if (this.monthlyExpenses.isZero()) return 0;
    return this.currentAmount.amount / this.monthlyExpenses.amount;
  }

  getProgress(): Percentage {
    const target = this.getTargetAmount();
    if (target.isZero()) return Percentage.fromValue(0);
    const progress = (this.currentAmount.amount / target.amount) * 100;
    return Percentage.fromValue(Math.min(progress, 100));
  }

  getRemaining(): Money {
    return this.getTargetAmount().subtract(this.currentAmount);
  }

  getStatus(): FundStatus {
    const monthsCovered = this.getMonthsCovered();

    if (monthsCovered < 1) return FundStatus.CRITICAL;
    if (monthsCovered < 3) return FundStatus.LOW;
    if (monthsCovered < 6) return FundStatus.MODERATE;
    if (monthsCovered < 9) return FundStatus.GOOD;
    return FundStatus.EXCELLENT;
  }

  isFullyFunded(): boolean {
    return this.currentAmount.isGreaterThan(this.getTargetAmount()) ||
           this.currentAmount.equals(this.getTargetAmount());
  }

  private validate(): void {
    if (this.monthlyExpenses.isNegative()) {
      throw new ValidationException('Monthly expenses cannot be negative');
    }
    if (this.currentAmount.isNegative()) {
      throw new ValidationException('Current amount cannot be negative');
    }
    if (this.targetMonths < 1 || this.targetMonths > 24) {
      throw new ValidationException('Target months must be between 1 and 24');
    }
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      monthlyExpenses: this.monthlyExpenses.toJSON(),
      currentAmount: this.currentAmount.toJSON(),
      targetAmount: this.getTargetAmount().toJSON(),
      remaining: this.getRemaining().toJSON(),
      targetMonths: this.targetMonths,
      monthsCovered: this.getMonthsCovered(),
      progress: this.getProgress().value,
      status: this.getStatus(),
      isFullyFunded: this.isFullyFunded(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
