export enum SentimentType {
  POSITIVE = 'positive',
  NEUTRAL = 'neutral',
  NEGATIVE = 'negative',
}

export class SentimentTypeValueObject {
  constructor(private readonly value: SentimentType) {
    this.validateSentiment();
  }

  private validateSentiment(): void {
    if (!Object.values(SentimentType).includes(this.value)) {
      throw new Error(`Invalid sentiment type: ${this.value}`);
    }
  }

  public getValue(): SentimentType {
    return this.value;
  }

  public isPositive(): boolean {
    return this.value === SentimentType.POSITIVE;
  }

  public isNeutral(): boolean {
    return this.value === SentimentType.NEUTRAL;
  }

  public isNegative(): boolean {
    return this.value === SentimentType.NEGATIVE;
  }

  public getDisplayName(): string {
    switch (this.value) {
      case SentimentType.POSITIVE:
        return 'Positivo';
      case SentimentType.NEUTRAL:
        return 'Neutral';
      case SentimentType.NEGATIVE:
        return 'Negativo';
      default:
        return 'Desconocido';
    }
  }

  public getColor(): string {
    switch (this.value) {
      case SentimentType.POSITIVE:
        return '#4caf50'; // Green
      case SentimentType.NEUTRAL:
        return '#ff9800'; // Orange
      case SentimentType.NEGATIVE:
        return '#f44336'; // Red
      default:
        return '#9e9e9e'; // Gray
    }
  }

  public getIcon(): string {
    switch (this.value) {
      case SentimentType.POSITIVE:
        return '😊';
      case SentimentType.NEUTRAL:
        return '😐';
      case SentimentType.NEGATIVE:
        return '😞';
      default:
        return '❓';
    }
  }

  public toString(): string {
    return this.value;
  }

  public toJSON(): string {
    return this.value;
  }

  public static fromString(value: string): SentimentTypeValueObject {
    const sentimentType = value.toLowerCase() as SentimentType;
    return new SentimentTypeValueObject(sentimentType);
  }

  public static fromScore(score: number): SentimentTypeValueObject {
    if (score > 0.1) {
      return new SentimentTypeValueObject(SentimentType.POSITIVE);
    } else if (score < -0.1) {
      return new SentimentTypeValueObject(SentimentType.NEGATIVE);
    } else {
      return new SentimentTypeValueObject(SentimentType.NEUTRAL);
    }
  }

  public equals(other: SentimentTypeValueObject): boolean {
    return this.value === other.value;
  }
}
