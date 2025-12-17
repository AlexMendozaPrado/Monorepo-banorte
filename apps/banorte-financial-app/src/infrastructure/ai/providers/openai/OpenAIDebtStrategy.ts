import { IDebtStrategyPort, DebtRecommendation } from '@/core/domain/ports/ai-services/IDebtStrategyPort';
import { Debt } from '@/core/domain/entities/debt/Debt';
import { BaseOpenAIService } from './BaseOpenAIService';
import { DEBT_STRATEGY_SYSTEM_PROMPT } from '../../prompts';

interface DebtPortfolioOutput {
  totalDebt: number;
  debtToIncomeRatio: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendations: Array<{
    type: 'CONSOLIDATION' | 'REFINANCE' | 'EXTRA_PAYMENT' | 'PRIORITY_CHANGE';
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    title: string;
    description: string;
    potentialSavings: number;
    actionItems: string[];
    estimatedTimeframe: string;
  }>;
}

interface ConsolidationOutput {
  recommended: boolean;
  potentialNewLoan: {
    amount: number;
    rate: number;
    term: number;
  };
  monthlySavings: number;
  totalSavings: number;
  reasoning: string;
}

interface ExtraPaymentOutput {
  allocations: Array<{
    debtId: string;
    amount: number;
    reasoning: string;
    interestSaved: number;
  }>;
  totalInterestSaved: number;
}

export class OpenAIDebtStrategy extends BaseOpenAIService implements IDebtStrategyPort {
  async analyzeDebtPortfolio(
    debts: Debt[],
    monthlyIncome: number,
    monthlyExpenses: number
  ) {
    const debtsData = debts.map(d => ({
      id: d.id,
      name: d.name,
      type: d.type,
      currentBalance: d.currentBalance,
      interestRate: d.interestRate,
      minimumPayment: d.minimumPayment,
    }));

    const totalDebt = debts.reduce((sum, d) => sum + d.currentBalance, 0);

    const userPrompt = `Analiza este portafolio de deudas.

Contexto:
- Ingreso mensual: $${monthlyIncome.toLocaleString('es-MX')}
- Gastos mensuales: $${monthlyExpenses.toLocaleString('es-MX')}
- Disponible para deudas: $${(monthlyIncome - monthlyExpenses).toLocaleString('es-MX')}

Deudas:
${JSON.stringify(debtsData, null, 2)}

Calcula:
1. Deuda total
2. Ratio deuda-ingreso (deuda total / ingreso anual * 100)
3. Nivel de riesgo (LOW <36%, MEDIUM 36-50%, HIGH 50-80%, CRITICAL >80%)
4. Recomendaciones priorizadas

Responde en JSON:
{
  "totalDebt": suma_total,
  "debtToIncomeRatio": ratio_calculado,
  "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "recommendations": [
    {
      "type": "CONSOLIDATION" | "REFINANCE" | "EXTRA_PAYMENT" | "PRIORITY_CHANGE",
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "title": "título",
      "description": "descripción detallada",
      "potentialSavings": ahorro_estimado,
      "actionItems": ["acción 1", "acción 2"],
      "estimatedTimeframe": "tiempo estimado"
    }
  ]
}`;

    const result = await this.callOpenAI<DebtPortfolioOutput>({
      systemPrompt: DEBT_STRATEGY_SYSTEM_PROMPT,
      userPrompt,
      temperature: 0.2,
      responseFormat: 'json_object',
    });

    return result.data;
  }

  async suggestConsolidation(debts: Debt[]) {
    const debtsData = debts.map(d => ({
      name: d.name,
      balance: d.currentBalance,
      rate: d.interestRate,
      minimumPayment: d.minimumPayment,
    }));

    const userPrompt = `Evalúa si la consolidación es recomendable para estas deudas.

Deudas:
${JSON.stringify(debtsData, null, 2)}

Considera:
- ¿Hay 3+ deudas?
- ¿La tasa promedio es >25%?
- ¿La consolidación reduciría pagos mensuales?
- ¿El ahorro en intereses justifica la consolidación?

Si es recomendable, calcula:
- Monto total a consolidar
- Tasa nueva estimada (70-80% de tasa promedio actual)
- Plazo sugerido (60 meses típico)
- Ahorro mensual
- Ahorro total en intereses

Responde en JSON:
{
  "recommended": true/false,
  "potentialNewLoan": {
    "amount": monto_total,
    "rate": tasa_estimada,
    "term": plazo_meses
  },
  "monthlySavings": ahorro_mensual,
  "totalSavings": ahorro_total_intereses,
  "reasoning": "explicación detallada"
}`;

    const result = await this.callOpenAI<ConsolidationOutput>({
      systemPrompt: DEBT_STRATEGY_SYSTEM_PROMPT,
      userPrompt,
      temperature: 0.2,
      responseFormat: 'json_object',
    });

    return result.data;
  }

  async optimizeExtraPayments(debts: Debt[], extraAmount: number) {
    const debtsData = debts.map(d => ({
      id: d.id,
      name: d.name,
      balance: d.currentBalance,
      rate: d.interestRate,
      minimumPayment: d.minimumPayment,
    }));

    const userPrompt = `Optimiza la distribución de $${extraAmount.toLocaleString('es-MX')} extra mensual entre estas deudas.

Deudas:
${JSON.stringify(debtsData, null, 2)}

Usa estrategia Avalancha (prioriza mayor tasa de interés).

Para cada deuda, calcula:
- Cuánto del pago extra asignar
- Razonamiento (ej: "Mayor tasa = máximo ahorro")
- Interés ahorrado estimado

Responde en JSON:
{
  "allocations": [
    {
      "debtId": "id",
      "amount": cantidad_asignada,
      "reasoning": "por qué esta asignación",
      "interestSaved": interés_ahorrado_estimado
    }
  ],
  "totalInterestSaved": suma_total_ahorrada
}`;

    const result = await this.callOpenAI<ExtraPaymentOutput>({
      systemPrompt: DEBT_STRATEGY_SYSTEM_PROMPT,
      userPrompt,
      temperature: 0.1, // Muy bajo para cálculos precisos
      responseFormat: 'json_object',
    });

    return result.data;
  }
}
