import { Money } from '../../value-objects/financial/Money';
import { InsuranceType } from './Insurance';

export enum NeedPriority {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export interface LifeInsuranceFactors {
  age: number;
  dependents: number;
  annualIncome: Money;
  outstandingDebts: Money;
  existingCoverage: Money;
  yearsOfIncomeNeeded: number;
}

export class InsuranceNeed {
  static evaluateLifeInsurance(factors: LifeInsuranceFactors): {
    recommendedCoverage: Money;
    currentGap: Money;
    priority: NeedPriority;
    reasoning: string;
  } {
    const incomeReplacement = factors.annualIncome.multiply(factors.yearsOfIncomeNeeded);
    const totalNeeded = incomeReplacement.add(factors.outstandingDebts);
    const gap = totalNeeded.subtract(factors.existingCoverage);

    let priority: NeedPriority;
    if (factors.dependents > 0 && gap.amount > factors.annualIncome.amount * 5) {
      priority = NeedPriority.CRITICAL;
    } else if (factors.dependents > 0 && gap.amount > factors.annualIncome.amount * 2) {
      priority = NeedPriority.HIGH;
    } else if (gap.amount > factors.annualIncome.amount) {
      priority = NeedPriority.MEDIUM;
    } else {
      priority = NeedPriority.LOW;
    }

    const reasoning = this.generateLifeInsuranceReasoning(factors, gap, priority);

    return {
      recommendedCoverage: totalNeeded,
      currentGap: gap,
      priority,
      reasoning,
    };
  }

  static calculateCoverageAdequacy(
    insuranceType: InsuranceType,
    currentCoverage: Money,
    recommendedCoverage: Money
  ): {
    adequacyPercentage: number;
    status: 'EXCELLENT' | 'ADEQUATE' | 'INSUFFICIENT' | 'CRITICAL';
    message: string;
  } {
    if (recommendedCoverage.isZero()) {
      return {
        adequacyPercentage: 100,
        status: 'EXCELLENT',
        message: 'No se requiere cobertura adicional',
      };
    }

    const percentage = (currentCoverage.amount / recommendedCoverage.amount) * 100;

    let status: 'EXCELLENT' | 'ADEQUATE' | 'INSUFFICIENT' | 'CRITICAL';
    let message: string;

    if (percentage >= 100) {
      status = 'EXCELLENT';
      message = 'Tu cobertura es excelente';
    } else if (percentage >= 75) {
      status = 'ADEQUATE';
      message = 'Tu cobertura es adecuada pero podría mejorar';
    } else if (percentage >= 50) {
      status = 'INSUFFICIENT';
      message = 'Tu cobertura es insuficiente';
    } else {
      status = 'CRITICAL';
      message = 'Tu cobertura es críticamente baja';
    }

    return {
      adequacyPercentage: Math.round(percentage),
      status,
      message,
    };
  }

  private static generateLifeInsuranceReasoning(
    factors: LifeInsuranceFactors,
    gap: Money,
    priority: NeedPriority
  ): string {
    if (factors.dependents === 0) {
      return 'Sin dependientes, la cobertura puede ser menor. Considera cubrir deudas y gastos finales.';
    }

    if (priority === NeedPriority.CRITICAL) {
      return `Con ${factors.dependents} dependiente(s) y un déficit de cobertura de $${gap.amount.toFixed(0)}, es crítico aumentar tu seguro de vida.`;
    }

    return `Se recomienda ${factors.yearsOfIncomeNeeded} años de ingreso más deudas existentes para protección familiar adecuada.`;
  }
}

