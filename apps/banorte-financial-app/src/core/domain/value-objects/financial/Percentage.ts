import { ValidationException } from '../../exceptions';

export class Percentage {
  private constructor(public readonly value: number) {
    this.validate();
  }

  static fromValue(value: number): Percentage {
    return new Percentage(value);
  }

  static fromDecimal(decimal: number): Percentage {
    return new Percentage(decimal * 100);
  }

  static zero(): Percentage {
    return new Percentage(0);
  }

  toDecimal(): number {
    return this.value / 100;
  }

  add(other: Percentage): Percentage {
    return new Percentage(this.value + other.value);
  }

  subtract(other: Percentage): Percentage {
    return new Percentage(this.value - other.value);
  }

  multiply(factor: number): Percentage {
    return new Percentage(this.value * factor);
  }

  isGreaterThan(other: Percentage): boolean {
    return this.value > other.value;
  }

  isLessThan(other: Percentage): boolean {
    return this.value < other.value;
  }

  equals(other: Percentage): boolean {
    return this.value === other.value;
  }

  toJSON() {
    return {
      value: this.value,
    };
  }

  toString(): string {
    return `${this.value.toFixed(2)}%`;
  }

  private validate(): void {
    if (typeof this.value !== 'number' || isNaN(this.value)) {
      throw new ValidationException('Percentage value must be a valid number');
    }
    if (this.value < 0 || this.value > 100) {
      throw new ValidationException('Percentage must be between 0 and 100');
    }
  }
}
