export enum CardBrand {
  VISA = 'VISA',
  MASTERCARD = 'MC',
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
    return this.value === CardBrand.VISA ? 'VISA' : 'MasterCard';
  }

  static fromString(brand: string): CardBrandValueObject {
    const normalized = brand.toUpperCase().trim();
    if (normalized === 'VISA') return new CardBrandValueObject(CardBrand.VISA);
    if (['MC', 'MASTERCARD', 'MASTER'].includes(normalized)) {
      return new CardBrandValueObject(CardBrand.MASTERCARD);
    }
    throw new Error(`Marca de tarjeta no reconocida: ${brand}`);
  }
}
