import { ValidationException } from '../../exceptions';

export class DateRange {
  private constructor(
    public readonly startDate: Date,
    public readonly endDate: Date
  ) {
    this.validate();
  }

  static create(startDate: Date, endDate: Date): DateRange {
    return new DateRange(startDate, endDate);
  }

  static createFromDays(days: number): DateRange {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    return new DateRange(startDate, endDate);
  }

  static createFromMonths(months: number): DateRange {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    return new DateRange(startDate, endDate);
  }

  static fromDays(days: number): DateRange {
    return DateRange.createFromDays(days);
  }

  static thisMonth(): DateRange {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return new DateRange(startDate, endDate);
  }

  getDurationInDays(): number {
    const diffTime = Math.abs(this.endDate.getTime() - this.startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getDurationInMonths(): number {
    const months =
      (this.endDate.getFullYear() - this.startDate.getFullYear()) * 12 +
      (this.endDate.getMonth() - this.startDate.getMonth());
    return months;
  }

  contains(date: Date): boolean {
    return date >= this.startDate && date <= this.endDate;
  }

  overlaps(other: DateRange): boolean {
    return this.startDate <= other.endDate && this.endDate >= other.startDate;
  }

  toJSON() {
    return {
      startDate: this.startDate.toISOString(),
      endDate: this.endDate.toISOString(),
    };
  }

  toString(): string {
    return `${this.startDate.toLocaleDateString()} - ${this.endDate.toLocaleDateString()}`;
  }

  private validate(): void {
    if (!(this.startDate instanceof Date) || !(this.endDate instanceof Date)) {
      throw new ValidationException('Both dates must be valid Date objects');
    }
    if (this.startDate > this.endDate) {
      throw new ValidationException('Start date must be before or equal to end date');
    }
  }
}
