import { IInsuranceRecommenderPort } from '@/core/domain/ports/ai-services/IInsuranceRecommenderPort';
import { InsuranceType } from '@/core/domain/entities/insurance/Insurance';
import { Money } from '@/core/domain/value-objects/financial/Money';

export interface CalculateCoverageDTO {
  insuranceType: string;
  age: number;
  annualIncome: number;
  dependents: number;
  outstandingDebts: number;
  currency?: string;
}

export class CalculateCoverageUseCase {
  constructor(
    private readonly insuranceRecommender: IInsuranceRecommenderPort
  ) {}

  async execute(dto: CalculateCoverageDTO) {
    const currency = dto.currency || 'MXN';

    const result = await this.insuranceRecommender.calculateOptimalCoverage(
      dto.insuranceType as InsuranceType,
      {
        age: dto.age,
        annualIncome: Money.fromAmount(dto.annualIncome, currency as any),
        dependents: dto.dependents,
        outstandingDebts: Money.fromAmount(dto.outstandingDebts, currency as any),
      }
    );

    return {
      recommendedAmount: result.recommendedAmount.toJSON(),
      minAmount: result.minAmount.toJSON(),
      maxAmount: result.maxAmount.toJSON(),
      reasoning: result.reasoning,
      monthlyPremiumEstimate: result.monthlyPremiumEstimate.toJSON(),
    };
  }
}

