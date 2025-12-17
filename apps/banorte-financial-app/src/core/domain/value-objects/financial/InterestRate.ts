import { ValidationException } from '../../exceptions';

export type RateType = 'FIXED' | 'VARIABLE';
export type RatePeriod = 'ANNUAL' | 'MONTHLY' | 'DAILY';

export class InterestRate {
  private constructor(
    public readonly value: number,
    public readonly type: RateType,
    public readonly period: RatePeriod
  ) {
    this.validate();
  }

  static create(value: number, type: RateType, period: RatePeriod): InterestRate {
    return new InterestRate(value, type, period);
  }

  toDecimal(): number {
    return this.value / 100;
  }

  toAnnual(): InterestRate {
    if (this.period === 'ANNUAL') return this;

    let annualValue: number;
    if (this.period === 'MONTHLY') {
      annualValue = this.value * 12;
    } else {
      annualValue = this.value * 365;
    }

    return new InterestRate(annualValue, this.type, 'ANNUAL');
  }

  toMonthly(): InterestRate {
    if (this.period === 'MONTHLY') return this;

    let monthlyValue: number;
    if (this.period === 'ANNUAL') {
      monthlyValue = this.value / 12;
    } else {
      monthlyValue = this.value * 30;
    }

    return new InterestRate(monthlyValue, this.type, 'MONTHLY');
  }

  toDaily(): InterestRate {
    if (this.period === 'DAILY') return this;

    let dailyValue: number;
    if (this.period === 'ANNUAL') {
      dailyValue = this.value / 365;
    } else {
      dailyValue = this.value / 30;
    }

    return new InterestRate(dailyValue, this.type, 'DAILY');
  }

  toJSON() {
    return {
      value: this.value,
      type: this.type,
      period: this.period,
    };
  }

  toString(): string {
    return `${this.value.toFixed(2)}% ${this.type} (${this.period})`;
  }

  private validate(): void {
    if (typeof this.value !== 'number' || isNaN(this.value)) {
      throw new ValidationException('Interest rate value must be a valid number');
    }
    if (this.value < 0) {
      throw new ValidationException('Interest rate cannot be negative');
    }
  }
}
