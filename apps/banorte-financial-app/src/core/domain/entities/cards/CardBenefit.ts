// CardBenefit.ts - Card Benefits Entity
export type BenefitType = 'cashback' | 'points' | 'discount' | 'insurance' | 'access' | 'promo';
export type BenefitStatus = 'active' | 'inactive' | 'expired' | 'pending';

export interface BenefitCondition {
  minPurchase?: number;
  maxBenefit?: number;
  validDays?: string[];
  validCategories?: string[];
  excludedMerchants?: string[];
}

export interface CardBenefitEntity {
  id: string;
  cardId: string;
  name: string;
  description: string;
  type: BenefitType;
  value: number;
  valueType: 'percentage' | 'fixed' | 'points';
  status: BenefitStatus;
  category?: string;
  merchant?: string;
  conditions?: BenefitCondition;
  usageCount: number;
  totalSaved: number;
  validFrom: Date;
  validUntil: Date;
  createdAt: Date;
}

export class CardBenefit implements CardBenefitEntity {
  id: string;
  cardId: string;
  name: string;
  description: string;
  type: BenefitType;
  value: number;
  valueType: 'percentage' | 'fixed' | 'points';
  status: BenefitStatus;
  category?: string;
  merchant?: string;
  conditions?: BenefitCondition;
  usageCount: number;
  totalSaved: number;
  validFrom: Date;
  validUntil: Date;
  createdAt: Date;

  constructor(data: CardBenefitEntity) {
    this.id = data.id;
    this.cardId = data.cardId;
    this.name = data.name;
    this.description = data.description;
    this.type = data.type;
    this.value = data.value;
    this.valueType = data.valueType;
    this.status = data.status;
    this.category = data.category;
    this.merchant = data.merchant;
    this.conditions = data.conditions;
    this.usageCount = data.usageCount;
    this.totalSaved = data.totalSaved;
    this.validFrom = data.validFrom;
    this.validUntil = data.validUntil;
    this.createdAt = data.createdAt;
  }

  isActive(): boolean {
    const now = new Date();
    return (
      this.status === 'active' &&
      now >= this.validFrom &&
      now <= this.validUntil
    );
  }

  isExpiringSoon(daysThreshold: number = 7): boolean {
    const now = new Date();
    const daysUntilExpiry = Math.ceil(
      (this.validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= daysThreshold && daysUntilExpiry > 0;
  }

  calculateSavings(purchaseAmount: number): number {
    if (!this.isActive()) return 0;
    
    if (this.conditions?.minPurchase && purchaseAmount < this.conditions.minPurchase) {
      return 0;
    }

    let savings = 0;
    switch (this.valueType) {
      case 'percentage':
        savings = purchaseAmount * (this.value / 100);
        break;
      case 'fixed':
        savings = this.value;
        break;
      case 'points':
        savings = this.value; // Points value
        break;
    }

    if (this.conditions?.maxBenefit) {
      savings = Math.min(savings, this.conditions.maxBenefit);
    }

    return savings;
  }

  getDisplayValue(): string {
    switch (this.valueType) {
      case 'percentage':
        return `${this.value}%`;
      case 'fixed':
        return `$${this.value.toLocaleString()}`;
      case 'points':
        return `${this.value} pts`;
    }
  }
}

