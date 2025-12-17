import { IInsuranceRepository } from '@/core/domain/ports/repositories/IInsuranceRepository';
import { Insurance, InsuranceType, PaymentFrequency } from '@/core/domain/entities/insurance/Insurance';
import { Money } from '@/core/domain/value-objects/financial/Money';

export interface CreateInsuranceDTO {
  userId: string;
  type: string;
  provider: string;
  policyNumber: string;
  coverageAmount: number;
  premium: number;
  paymentFrequency: string;
  startDate: string;
  endDate: string;
  beneficiaries?: string[];
  currency?: string;
}

export class CreateInsuranceUseCase {
  constructor(
    private readonly insuranceRepository: IInsuranceRepository
  ) {}

  async execute(dto: CreateInsuranceDTO) {
    const currency = dto.currency || 'MXN';

    const insurance = Insurance.create({
      userId: dto.userId,
      type: dto.type as InsuranceType,
      provider: dto.provider,
      policyNumber: dto.policyNumber,
      coverageAmount: Money.fromAmount(dto.coverageAmount, currency as any),
      premium: Money.fromAmount(dto.premium, currency as any),
      paymentFrequency: dto.paymentFrequency as PaymentFrequency,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      beneficiaries: dto.beneficiaries,
    });

    await this.insuranceRepository.save(insurance);

    return insurance.toJSON();
  }
}

