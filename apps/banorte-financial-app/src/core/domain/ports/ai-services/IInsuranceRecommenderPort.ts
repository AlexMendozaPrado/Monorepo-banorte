import { Insurance, InsuranceType } from '../../entities/insurance/Insurance';
import { Money } from '../../value-objects/financial/Money';

export interface InsuranceRecommendation {
  type: InsuranceType;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  recommendedCoverage: Money;
  estimatedPremium: Money;
  reasoning: string;
  keyBenefits: string[];
  considerations: string[];
}

export interface InsuranceGapAnalysis {
  type: InsuranceType;
  currentCoverage: Money;
  recommendedCoverage: Money;
  gap: Money;
  adequacyPercentage: number;
  status: 'EXCELLENT' | 'ADEQUATE' | 'INSUFFICIENT' | 'CRITICAL';
}

export interface IInsuranceRecommenderPort {
  evaluateInsuranceNeeds(
    userProfile: {
      age: number;
      annualIncome: Money;
      dependents: number;
      maritalStatus: string;
      occupation: string;
      outstandingDebts: Money;
      hasHome: boolean;
      hasVehicle: boolean;
    },
    existingInsurance: Insurance[]
  ): Promise<{
    recommendations: InsuranceRecommendation[];
    gapAnalysis: InsuranceGapAnalysis[];
    priorityActions: string[];
  }>;

  calculateOptimalCoverage(
    insuranceType: InsuranceType,
    userProfile: {
      age: number;
      annualIncome: Money;
      dependents: number;
      outstandingDebts: Money;
    }
  ): Promise<{
    recommendedAmount: Money;
    minAmount: Money;
    maxAmount: Money;
    reasoning: string;
    monthlyPremiumEstimate: Money;
  }>;
}

