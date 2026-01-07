import { Budget } from '../../entities/financial/Budget';
import { Transaction } from '../../entities/financial/Transaction';
import { SavingsGoal } from '../../entities/savings/SavingsGoal';
import { SavingsRule } from '../../entities/savings/SavingsRule';
import { Debt } from '../../entities/debt/Debt';
import {
  ProactiveInsight,
  InsightDomain,
  DomainInsightResult,
  ProactiveAnalysisResult,
} from '../../entities/advisor/ProactiveInsight';

/**
 * Contexto para generar insights de presupuesto
 */
export interface BudgetInsightContext {
  userId: string;
  budget: Budget | null;
  transactions: Transaction[];
  antExpenseDetections?: Array<{
    category: string;
    monthlyImpact: number;
    annualImpact: number;
    recommendation: string;
    confidence: number;
  }>;
  timeframe: 'current_month' | 'last_30_days' | 'last_90_days';
}

/**
 * Contexto para generar insights de ahorro
 */
export interface SavingsInsightContext {
  userId: string;
  goals: SavingsGoal[];
  rules: SavingsRule[];
  monthlyIncome: number;
  monthlyExpenses: number;
  emergencyFundProgress?: number; // 0-100
}

/**
 * Contexto para generar insights de deuda
 */
export interface DebtInsightContext {
  userId: string;
  debts: Debt[];
  monthlyIncome: number;
  monthlyExpenses: number;
  availableForDebtPayment: number;
}

/**
 * Contexto completo para análisis multi-dominio
 */
export interface FullInsightContext {
  userId: string;
  budget?: BudgetInsightContext;
  savings?: SavingsInsightContext;
  debt?: DebtInsightContext;
}

/**
 * Opciones para la generación de insights
 */
export interface InsightGenerationOptions {
  domains?: InsightDomain[];
  maxInsightsPerDomain?: number;
  includeExpired?: boolean;
  priorityThreshold?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

/**
 * Puerto para el servicio de generación de insights proactivos
 *
 * Este puerto define el contrato para un servicio que analiza
 * los datos financieros del usuario y genera insights automáticos
 * priorizados por urgencia y potencial impacto.
 *
 * La implementación debe orquestar los servicios de IA existentes:
 * - IExpenseAnalyzerPort para insights de presupuesto
 * - ISavingsOptimizerPort para insights de ahorro
 * - IDebtStrategyPort para insights de deuda
 */
export interface IProactiveInsightsPort {
  /**
   * Genera insights para el dominio de presupuesto
   *
   * Analiza:
   * - Gastos vs presupuesto por categoría
   * - Patrones de micro-gastos (gastos hormiga)
   * - Tendencias de gasto
   * - Oportunidades de optimización
   */
  generateBudgetInsights(
    context: BudgetInsightContext
  ): Promise<DomainInsightResult>;

  /**
   * Genera insights para el dominio de ahorro
   *
   * Analiza:
   * - Metas en riesgo de no cumplirse
   * - Metas cerca de completarse (celebraciones)
   * - Reglas de ahorro subóptimas
   * - Oportunidades de ahorro no aprovechadas
   * - Estado del fondo de emergencia
   */
  generateSavingsInsights(
    context: SavingsInsightContext
  ): Promise<DomainInsightResult>;

  /**
   * Genera insights para el dominio de deuda
   *
   * Analiza:
   * - Pagos próximos a vencer
   * - Oportunidades de consolidación
   * - Optimización de pagos extra
   * - Hitos de deuda (cerca de liquidar)
   * - Alertas de tasas altas
   */
  generateDebtInsights(context: DebtInsightContext): Promise<DomainInsightResult>;

  /**
   * Genera insights para todos los dominios especificados
   *
   * Ejecuta análisis en paralelo para optimizar latencia.
   * Retorna resultados parciales si algún dominio falla.
   */
  generateAllInsights(
    context: FullInsightContext,
    options?: InsightGenerationOptions
  ): Promise<ProactiveAnalysisResult>;

  /**
   * Prioriza y filtra una lista de insights
   *
   * Ordena por prioridad (CRITICAL > HIGH > MEDIUM > LOW)
   * y opcionalmente limita la cantidad por dominio.
   */
  prioritizeInsights(
    insights: ProactiveInsight[],
    maxPerDomain?: number
  ): ProactiveInsight[];

  /**
   * Invalida insights expirados o que ya no aplican
   *
   * Útil cuando los datos financieros cambian (ej: se realizó un pago)
   */
  invalidateStaleInsights(
    userId: string,
    domain?: InsightDomain
  ): Promise<number>;
}
