export enum CardBrand {
  VISA = 'VISA',
  MASTERCARD = 'MC',
  AMEX = 'AMEX',
}

export class CardBrandValueObject {
  constructor(private readonly value: CardBrand) {
    this.validate();
  }

  private validate(): void {
    if (!Object.values(CardBrand).includes(this.value)) {
      throw new Error(`Marca de tarjeta invalida: ${this.value}`);
    }
  }

  getValue(): CardBrand {
    return this.value;
  }

  getDisplayName(): string {
    if (this.value === CardBrand.VISA) return 'VISA';
    if (this.value === CardBrand.MASTERCARD) return 'MasterCard';
    return 'American Express';
  }

  static fromString(brand: string): CardBrandValueObject {
    const normalized = brand.toUpperCase().trim();
    if (normalized === 'VISA') return new CardBrandValueObject(CardBrand.VISA);
    if (['MC', 'MASTERCARD', 'MASTER'].includes(normalized)) {
      return new CardBrandValueObject(CardBrand.MASTERCARD);
    }
    if (['AMEX', 'AMERICAN EXPRESS', 'AMERICANEXPRESS'].includes(normalized)) {
      return new CardBrandValueObject(CardBrand.AMEX);
    }
    throw new Error(`Marca de tarjeta no reconocida: ${brand}`);
  }
}
