import { ValidationException } from '../../exceptions';

export type Currency = 'MXN' | 'USD' | 'EUR';

export class Money {
  private constructor(
    public readonly amount: number,
    public readonly currency: Currency = 'MXN'
  ) {
    this.validate();
  }

  static fromAmount(amount: number, currency: Currency = 'MXN'): Money {
    return new Money(amount, currency);
  }

  static zero(currency: Currency = 'MXN'): Money {
    return new Money(0, currency);
  }

  add(other: Money): Money {
    this.validateSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    this.validateSameCurrency(other);
    return new Money(this.amount - other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }

  divide(divisor: number): Money {
    if (divisor === 0) {
      throw new ValidationException('Cannot divide by zero');
    }
    return new Money(this.amount / divisor, this.currency);
  }

  isGreaterThan(other: Money): boolean {
    this.validateSameCurrency(other);
    return this.amount > other.amount;
  }

  isLessThan(other: Money): boolean {
    this.validateSameCurrency(other);
    return this.amount < other.amount;
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  isPositive(): boolean {
    return this.amount > 0;
  }

  isNegative(): boolean {
    return this.amount < 0;
  }

  isZero(): boolean {
    return this.amount === 0;
  }

  toJSON() {
    return {
      amount: this.amount,
      currency: this.currency,
    };
  }

  toString(): string {
    return `${this.currency} ${this.amount.toFixed(2)}`;
  }

  private validate(): void {
    if (typeof this.amount !== 'number' || isNaN(this.amount)) {
      throw new ValidationException('Amount must be a valid number');
    }
  }

  private validateSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new ValidationException(
        `Cannot operate with different currencies: ${this.currency} and ${other.currency}`
      );
    }
  }
}
