import { ValidationException } from '../../exceptions';

export type TimeFrameUnit = 'DAYS' | 'MONTHS' | 'YEARS';

export class TimeFrame {
  private constructor(
    public readonly value: number,
    public readonly unit: TimeFrameUnit
  ) {
    this.validate();
  }

  static create(value: number, unit: TimeFrameUnit): TimeFrame {
    return new TimeFrame(value, unit);
  }

  static fromDays(days: number): TimeFrame {
    return new TimeFrame(days, 'DAYS');
  }

  static fromMonths(months: number): TimeFrame {
    return new TimeFrame(months, 'MONTHS');
  }

  static fromYears(years: number): TimeFrame {
    return new TimeFrame(years, 'YEARS');
  }

  toDays(): number {
    switch (this.unit) {
      case 'DAYS':
        return this.value;
      case 'MONTHS':
        return this.value * 30;
      case 'YEARS':
        return this.value * 365;
    }
  }

  toMonths(): number {
    switch (this.unit) {
      case 'DAYS':
        return this.value / 30;
      case 'MONTHS':
        return this.value;
      case 'YEARS':
        return this.value * 12;
    }
  }

  toYears(): number {
    switch (this.unit) {
      case 'DAYS':
        return this.value / 365;
      case 'MONTHS':
        return this.value / 12;
      case 'YEARS':
        return this.value;
    }
  }

  toJSON() {
    return {
      value: this.value,
      unit: this.unit,
    };
  }

  toString(): string {
    return `${this.value} ${this.unit.toLowerCase()}`;
  }

  private validate(): void {
    if (typeof this.value !== 'number' || isNaN(this.value)) {
      throw new ValidationException('TimeFrame value must be a valid number');
    }
    if (this.value <= 0) {
      throw new ValidationException('TimeFrame value must be greater than 0');
    }
  }
}
