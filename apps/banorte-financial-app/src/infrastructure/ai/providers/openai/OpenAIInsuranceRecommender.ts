import { IInsuranceRecommenderPort, InsuranceRecommendation, InsuranceGapAnalysis } from '@/core/domain/ports/ai-services/IInsuranceRecommenderPort';
import { Insurance, InsuranceType } from '@/core/domain/entities/insurance/Insurance';
import { Money } from '@/core/domain/value-objects/financial/Money';
import { BaseOpenAIService } from './BaseOpenAIService';
import { INSURANCE_RECOMMENDER_SYSTEM_PROMPT } from '../../prompts';

interface EvaluateInsuranceNeedsOutput {
  recommendations: Array<{
    type: 'LIFE' | 'HEALTH' | 'AUTO' | 'HOME' | 'DISABILITY';
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    recommendedCoverage: number;
    estimatedPremium: number;
    reasoning: string;
    keyBenefits: string[];
    considerations: string[];
  }>;
  gapAnalysis: Array<{
    type: 'LIFE' | 'HEALTH' | 'AUTO' | 'HOME' | 'DISABILITY';
    currentCoverage: number;
    recommendedCoverage: number;
    gap: number;
    adequacyPercentage: number;
    status: 'ADEQUATE' | 'PARTIAL' | 'CRITICAL' | 'NONE';
  }>;
  priorityActions: string[];
}

interface OptimalCoverageOutput {
  recommendedAmount: number;
  minAmount: number;
  maxAmount: number;
  reasoning: string;
  monthlyPremiumEstimate: number;
  factors: string[];
}

export class OpenAIInsuranceRecommender extends BaseOpenAIService implements IInsuranceRecommenderPort {
  async evaluateInsuranceNeeds(
    userProfile: any,
    existingInsurance: Insurance[]
  ) {
    const profileData = {
      age: userProfile.age || 30,
      dependents: userProfile.dependents || 0,
      annualIncome: userProfile.annualIncome?.amount || 0,
      monthlyExpenses: userProfile.monthlyExpenses?.amount || 0,
      outstandingDebts: userProfile.outstandingDebts?.amount || 0,
      hasHome: userProfile.hasHome || false,
      homeValue: userProfile.homeValue?.amount || 0,
      hasCar: userProfile.hasCar || false,
      carValue: userProfile.carValue?.amount || 0,
      isSoleProvider: userProfile.isSoleProvider || false,
    };

    const existingCoverage = existingInsurance.map(i => ({
      type: i.type,
      coverageAmount: i.coverageAmount.amount,
      monthlyPremium: i.monthlyPremium.amount,
    }));

    const userPrompt = `Evalúa las necesidades de seguro para este perfil.

Perfil del usuario:
${JSON.stringify(profileData, null, 2)}

Seguros existentes:
${JSON.stringify(existingCoverage, null, 2)}

Evalúa cada tipo de seguro (LIFE, HEALTH, AUTO, HOME, DISABILITY) y genera:
1. Recomendaciones con prioridad (CRITICAL/HIGH/MEDIUM/LOW)
2. Cobertura recomendada vs actual
3. Gap (brecha) de cobertura
4. Acciones prioritarias

Usa estas fórmulas como guía:
- Vida: 10x ingreso anual + deudas (si tiene dependientes)
- Salud: Mínimo $5,000,000 MXN (costos hospitalarios en México)
- Auto: Valor del vehículo (si tiene auto >$200k)
- Hogar: Valor de reposición (si tiene casa propia)
- Incapacidad: 60-70% ingreso anual (si es único sostén)

Responde en JSON:
{
  "recommendations": [
    {
      "type": "LIFE" | "HEALTH" | "AUTO" | "HOME" | "DISABILITY",
      "priority": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "recommendedCoverage": monto_cobertura,
      "estimatedPremium": prima_mensual_estimada,
      "reasoning": "por qué esta cobertura",
      "keyBenefits": ["beneficio 1", "beneficio 2"],
      "considerations": ["consideración 1", "consideración 2"]
    }
  ],
  "gapAnalysis": [
    {
      "type": "LIFE" | "HEALTH" | etc,
      "currentCoverage": cobertura_actual,
      "recommendedCoverage": cobertura_recomendada,
      "gap": brecha,
      "adequacyPercentage": porcentaje_adecuación,
      "status": "ADEQUATE" | "PARTIAL" | "CRITICAL" | "NONE"
    }
  ],
  "priorityActions": ["acción 1", "acción 2"]
}`;

    const result = await this.callOpenAI<EvaluateInsuranceNeedsOutput>({
      systemPrompt: INSURANCE_RECOMMENDER_SYSTEM_PROMPT,
      userPrompt,
      temperature: 0.2, // Muy analítico para evaluación de riesgos
      responseFormat: 'json_object',
    });

    const recommendations: InsuranceRecommendation[] = result.data.recommendations.map(r => ({
      type: InsuranceType[r.type],
      priority: r.priority,
      recommendedCoverage: Money.fromAmount(r.recommendedCoverage),
      estimatedPremium: Money.fromAmount(r.estimatedPremium),
      reasoning: r.reasoning,
      keyBenefits: r.keyBenefits,
      considerations: r.considerations,
    }));

    const gapAnalysis: InsuranceGapAnalysis[] = result.data.gapAnalysis.map(g => ({
      type: InsuranceType[g.type],
      currentCoverage: Money.fromAmount(g.currentCoverage),
      recommendedCoverage: Money.fromAmount(g.recommendedCoverage),
      gap: Money.fromAmount(g.gap),
      adequacyPercentage: g.adequacyPercentage,
      status: g.status,
    }));

    return {
      recommendations,
      gapAnalysis,
      priorityActions: result.data.priorityActions,
    };
  }

  async calculateOptimalCoverage(insuranceType: InsuranceType, userProfile: any) {
    const profileData = {
      age: userProfile.age || 30,
      annualIncome: userProfile.annualIncome?.amount || 0,
      dependents: userProfile.dependents || 0,
      outstandingDebts: userProfile.outstandingDebts?.amount || 0,
      monthlyExpenses: userProfile.monthlyExpenses?.amount || 0,
      homeValue: userProfile.homeValue?.amount || 0,
      carValue: userProfile.carValue?.amount || 0,
    };

    const insuranceTypeNames = {
      [InsuranceType.LIFE]: 'VIDA',
      [InsuranceType.HEALTH]: 'SALUD',
      [InsuranceType.AUTO]: 'AUTO',
      [InsuranceType.HOME]: 'HOGAR',
      [InsuranceType.DISABILITY]: 'INCAPACIDAD',
    };

    const userPrompt = `Calcula la cobertura óptima de seguro de ${insuranceTypeNames[insuranceType]} para este perfil.

Perfil:
${JSON.stringify(profileData, null, 2)}

Fórmulas de referencia:
- VIDA: 10x ingreso anual + deudas
- SALUD: Mínimo $5M MXN (hospitales privados en México)
- AUTO: Valor del vehículo
- HOGAR: Valor de reposición del inmueble
- INCAPACIDAD: 60-70% del ingreso anual

Calcula:
1. Monto recomendado (cantidad óptima)
2. Rango (mínimo y máximo)
3. Razonamiento (por qué esta cantidad)
4. Prima mensual estimada (~1% anual para vida, variable para otros)
5. Factores considerados

Responde en JSON:
{
  "recommendedAmount": monto_recomendado,
  "minAmount": monto_mínimo,
  "maxAmount": monto_máximo,
  "reasoning": "explicación detallada",
  "monthlyPremiumEstimate": prima_mensual_estimada,
  "factors": ["factor 1", "factor 2"]
}`;

    const result = await this.callOpenAI<OptimalCoverageOutput>({
      systemPrompt: INSURANCE_RECOMMENDER_SYSTEM_PROMPT,
      userPrompt,
      temperature: 0.2,
      responseFormat: 'json_object',
    });

    return {
      recommendedAmount: Money.fromAmount(result.data.recommendedAmount),
      minAmount: Money.fromAmount(result.data.minAmount),
      maxAmount: Money.fromAmount(result.data.maxAmount),
      reasoning: result.data.reasoning,
      monthlyPremiumEstimate: Money.fromAmount(result.data.monthlyPremiumEstimate),
    };
  }
}
