import { IInsuranceRecommenderPort, InsuranceRecommendation, InsuranceGapAnalysis } from '@/core/domain/ports/ai-services/IInsuranceRecommenderPort';
import { Insurance, InsuranceType } from '@/core/domain/entities/insurance/Insurance';
import { Money } from '@/core/domain/value-objects/financial/Money';
import { InsuranceNeed } from '@/core/domain/entities/insurance/InsuranceNeed';
import { OpenAIConfig } from './OpenAIConfig';

export class OpenAIInsuranceRecommender implements IInsuranceRecommenderPort {
  private config: ReturnType<OpenAIConfig['getConfig']>;

  constructor() {
    const configInstance = OpenAIConfig.getInstance();
    this.config = configInstance.getConfig();
  }

  async evaluateInsuranceNeeds(
    userProfile: any,
    existingInsurance: Insurance[]
  ) {
    const recommendations: InsuranceRecommendation[] = [];
    const gapAnalysis: InsuranceGapAnalysis[] = [];

    // Life Insurance evaluation
    const lifeInsurance = existingInsurance.find(i => i.type === InsuranceType.LIFE);
    const lifeEvaluation = InsuranceNeed.evaluateLifeInsurance({
      age: userProfile.age,
      dependents: userProfile.dependents,
      annualIncome: userProfile.annualIncome,
      outstandingDebts: userProfile.outstandingDebts,
      existingCoverage: lifeInsurance?.coverageAmount || Money.zero(),
      yearsOfIncomeNeeded: 10,
    });

    if (lifeEvaluation.currentGap.amount > 0) {
      recommendations.push({
        type: InsuranceType.LIFE,
        priority: lifeEvaluation.priority,
        recommendedCoverage: lifeEvaluation.recommendedCoverage,
        estimatedPremium: Money.fromAmount(userProfile.annualIncome.amount * 0.01),
        reasoning: lifeEvaluation.reasoning,
        keyBenefits: [
          'Protección financiera para dependientes',
          'Cobertura de deudas pendientes',
          'Gastos finales cubiertos',
        ],
        considerations: ['Revisar anualmente', 'Actualizar beneficiarios'],
      });
    }

    const adequacy = InsuranceNeed.calculateCoverageAdequacy(
      InsuranceType.LIFE,
      lifeInsurance?.coverageAmount || Money.zero(),
      lifeEvaluation.recommendedCoverage
    );

    gapAnalysis.push({
      type: InsuranceType.LIFE,
      currentCoverage: lifeInsurance?.coverageAmount || Money.zero(),
      recommendedCoverage: lifeEvaluation.recommendedCoverage,
      gap: lifeEvaluation.currentGap,
      adequacyPercentage: adequacy.adequacyPercentage,
      status: adequacy.status,
    });

    const priorityActions = recommendations
      .filter(r => r.priority === 'CRITICAL' || r.priority === 'HIGH')
      .map(r => `Obtener seguro de ${this.getInsuranceTypeName(r.type)}`);

    return { recommendations, gapAnalysis, priorityActions };
  }

  async calculateOptimalCoverage(insuranceType: InsuranceType, userProfile: any) {
    let recommendedAmount: Money;
    let reasoning: string;

    switch (insuranceType) {
      case InsuranceType.LIFE:
        const multiplier = 10;
        recommendedAmount = userProfile.annualIncome.multiply(multiplier).add(userProfile.outstandingDebts);
        reasoning = `${multiplier}x ingreso anual más deudas pendientes`;
        break;
      case InsuranceType.DISABILITY:
        recommendedAmount = userProfile.annualIncome.multiply(0.65);
        reasoning = '65% del ingreso anual';
        break;
      default:
        recommendedAmount = userProfile.annualIncome.multiply(5);
        reasoning = '5x ingreso anual (estándar)';
    }

    const minAmount = recommendedAmount.multiply(0.5);
    const maxAmount = recommendedAmount.multiply(1.5);
    const monthlyPremium = recommendedAmount.multiply(0.01).divide(12);

    return { recommendedAmount, minAmount, maxAmount, reasoning, monthlyPremiumEstimate: monthlyPremium };
  }

  private getInsuranceTypeName(type: InsuranceType): string {
    const names = {
      [InsuranceType.LIFE]: 'Vida',
      [InsuranceType.HEALTH]: 'Salud',
      [InsuranceType.AUTO]: 'Auto',
      [InsuranceType.HOME]: 'Hogar',
      [InsuranceType.DISABILITY]: 'Incapacidad',
    };
    return names[type];
  }
}

