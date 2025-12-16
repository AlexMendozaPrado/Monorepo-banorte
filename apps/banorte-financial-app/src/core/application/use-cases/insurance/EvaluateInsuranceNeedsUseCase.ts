import { IInsuranceRepository } from '@/core/domain/ports/repositories/IInsuranceRepository';
import { IInsuranceRecommenderPort } from '@/core/domain/ports/ai-services/IInsuranceRecommenderPort';
import { Money } from '@/core/domain/value-objects/financial/Money';

export interface EvaluateNeedsDTO {
  userId: string;
  age: number;
  annualIncome: number;
  dependents: number;
  maritalStatus: string;
  occupation: string;
  outstandingDebts: number;
  hasHome: boolean;
  hasVehicle: boolean;
  currency?: string;
}

export class EvaluateInsuranceNeedsUseCase {
  constructor(
    private readonly insuranceRepository: IInsuranceRepository,
    private readonly insuranceRecommender: IInsuranceRecommenderPort
  ) {}

  async execute(dto: EvaluateNeedsDTO) {
    const currency = dto.currency || 'MXN';
    const existingInsurance = await this.insuranceRepository.findByUser(dto.userId);

    const evaluation = await this.insuranceRecommender.evaluateInsuranceNeeds(
      {
        age: dto.age,
        annualIncome: Money.fromAmount(dto.annualIncome, currency as any),
        dependents: dto.dependents,
        maritalStatus: dto.maritalStatus,
        occupation: dto.occupation,
        outstandingDebts: Money.fromAmount(dto.outstandingDebts, currency as any),
        hasHome: dto.hasHome,
        hasVehicle: dto.hasVehicle,
      },
      existingInsurance
    );

    return {
      ...evaluation,
      existingPoliciesCount: existingInsurance.length,
    };
  }
}

