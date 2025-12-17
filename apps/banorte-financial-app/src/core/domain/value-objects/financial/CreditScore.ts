import { ValidationException } from '../../exceptions';

export type CreditScoreRange = 'POOR' | 'FAIR' | 'GOOD' | 'VERY_GOOD' | 'EXCELLENT';

export class CreditScore {
  private static readonly MIN_SCORE = 300;
  private static readonly MAX_SCORE = 850;

  private constructor(public readonly value: number) {
    this.validate();
  }

  static fromValue(value: number): CreditScore {
    return new CreditScore(value);
  }

  getRange(): CreditScoreRange {
    if (this.value < 580) return 'POOR';
    if (this.value < 670) return 'FAIR';
    if (this.value < 740) return 'GOOD';
    if (this.value < 800) return 'VERY_GOOD';
    return 'EXCELLENT';
  }

  getRangeDescription(): string {
    switch (this.getRange()) {
      case 'POOR':
        return 'Malo';
      case 'FAIR':
        return 'Regular';
      case 'GOOD':
        return 'Bueno';
      case 'VERY_GOOD':
        return 'Muy Bueno';
      case 'EXCELLENT':
        return 'Excelente';
    }
  }

  isAbove(value: number): boolean {
    return this.value > value;
  }

  isBelow(value: number): boolean {
    return this.value < value;
  }

  toJSON() {
    return {
      value: this.value,
      range: this.getRange(),
      description: this.getRangeDescription(),
    };
  }

  toString(): string {
    return `${this.value} (${this.getRangeDescription()})`;
  }

  private validate(): void {
    if (typeof this.value !== 'number' || isNaN(this.value)) {
      throw new ValidationException('Credit score must be a valid number');
    }
    if (this.value < CreditScore.MIN_SCORE || this.value > CreditScore.MAX_SCORE) {
      throw new ValidationException(
        `Credit score must be between ${CreditScore.MIN_SCORE} and ${CreditScore.MAX_SCORE}`
      );
    }
  }
}
