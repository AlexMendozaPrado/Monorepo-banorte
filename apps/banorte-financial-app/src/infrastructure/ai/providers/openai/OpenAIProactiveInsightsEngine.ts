import {
  IProactiveInsightsPort,
  BudgetInsightContext,
  SavingsInsightContext,
  DebtInsightContext,
  FullInsightContext,
  InsightGenerationOptions,
} from '@/core/domain/ports/ai-services/IProactiveInsightsPort';
import { IExpenseAnalyzerPort } from '@/core/domain/ports/external-services/IExpenseAnalyzerPort';
import { ISavingsOptimizerPort } from '@/core/domain/ports/ai-services/ISavingsOptimizerPort';
import { IDebtStrategyPort } from '@/core/domain/ports/ai-services/IDebtStrategyPort';
import {
  ProactiveInsight,
  InsightDomain,
  ProactiveInsightType,
  ProactiveInsightPriority,
  DomainInsightResult,
  ProactiveAnalysisResult,
} from '@/core/domain/entities/advisor/ProactiveInsight';
import { Money } from '@/core/domain/value-objects/financial/Money';
import { TimeFrame } from '@/core/domain/value-objects/common/TimeFrame';

/**
 * Engine de insights proactivos que orquesta los servicios de IA existentes
 *
 * Este servicio no extiende BaseOpenAIService porque actúa como orquestador
 * de otros servicios que ya hacen las llamadas a OpenAI.
 */
export class OpenAIProactiveInsightsEngine implements IProactiveInsightsPort {
  constructor(
    private readonly expenseAnalyzer: IExpenseAnalyzerPort,
    private readonly savingsOptimizer: ISavingsOptimizerPort,
    private readonly debtStrategy: IDebtStrategyPort
  ) {}

  async generateBudgetInsights(
    context: BudgetInsightContext
  ): Promise<DomainInsightResult> {
    const startTime = Date.now();
    const insights: ProactiveInsight[] = [];

    try {
      const analysisContext = {
        userId: context.userId,
        timeFrame: TimeFrame.create(1, 'MONTHS'),
        budget: context.budget
          ? {
              totalIncome: context.budget.totalIncome,
              categories: [...context.budget.categories],
            }
          : undefined,
      };

      // Ejecutar análisis en paralelo
      const [antExpensesResult, patternsResult, optimizationsResult] =
        await Promise.allSettled([
          this.expenseAnalyzer.detectAntExpenses(
            context.transactions,
            analysisContext
          ),
          this.expenseAnalyzer.analyzeSpendingPatterns(
            context.transactions,
            analysisContext
          ),
          context.budget
            ? this.expenseAnalyzer.generateBudgetOptimizations(
                context.budget,
                context.transactions,
                analysisContext
              )
            : Promise.resolve(null),
        ]);

      // Transformar gastos hormiga a insights
      if (antExpensesResult.status === 'fulfilled' && antExpensesResult.value) {
        insights.push(
          ...this.transformAntExpensesToInsights(
            context.userId,
            antExpensesResult.value
          )
        );
      }

      // Transformar patrones a insights
      if (patternsResult.status === 'fulfilled' && patternsResult.value) {
        insights.push(
          ...this.transformPatternsToInsights(
            context.userId,
            patternsResult.value
          )
        );
      }

      // Transformar optimizaciones a insights
      if (
        optimizationsResult.status === 'fulfilled' &&
        optimizationsResult.value
      ) {
        insights.push(
          ...this.transformOptimizationsToInsights(
            context.userId,
            optimizationsResult.value
          )
        );
      }

      // Verificar presupuesto excedido
      if (context.budget) {
        const overspendInsight = this.checkBudgetOverspend(
          context.userId,
          context.budget
        );
        if (overspendInsight) {
          insights.push(overspendInsight);
        }
      }

      return {
        domain: InsightDomain.BUDGET,
        insights: this.prioritizeInsights(insights, 5),
        processingTimeMs: Date.now() - startTime,
        confidence: 0.85,
      };
    } catch (error) {
      console.error('[ProactiveInsightsEngine] Budget analysis error:', error);
      return {
        domain: InsightDomain.BUDGET,
        insights: [],
        processingTimeMs: Date.now() - startTime,
        confidence: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async generateSavingsInsights(
    context: SavingsInsightContext
  ): Promise<DomainInsightResult> {
    const startTime = Date.now();
    const insights: ProactiveInsight[] = [];

    try {
      // Optimización de estrategia de ahorro
      const optimization = await this.savingsOptimizer.optimizeSavingsStrategy(
        context.goals,
        context.rules,
        Money.fromAmount(context.monthlyIncome),
        Money.fromAmount(context.monthlyExpenses)
      );

      // Evaluar cada meta
      for (const goal of context.goals) {
        // Simular impacto
        const simulation = await this.savingsOptimizer.simulateSavingsImpact(
          goal,
          goal.currentAmount,
          12
        );

        // Meta en riesgo
        if (simulation.successProbability < 0.7) {
          insights.push(
            this.createGoalAtRiskInsight(context.userId, goal, simulation)
          );
        }
        // Meta cerca de completarse - celebración
        else if (goal.getProgress().value >= 90 && !goal.isCompleted()) {
          insights.push(this.createGoalCelebrationInsight(context.userId, goal));
        }
        // Meta completada - celebración
        else if (goal.isCompleted()) {
          insights.push(
            this.createGoalCompletedInsight(context.userId, goal)
          );
        }
      }

      // Sugerencias de reglas de ahorro
      if (optimization.suggestedRules.length > 0) {
        insights.push(
          ...this.transformSuggestedRulesToInsights(
            context.userId,
            optimization.suggestedRules
          )
        );
      }

      // Fondo de emergencia bajo
      if (
        context.emergencyFundProgress !== undefined &&
        context.emergencyFundProgress < 50
      ) {
        insights.push(
          this.createEmergencyFundInsight(
            context.userId,
            context.emergencyFundProgress,
            context.monthlyExpenses
          )
        );
      }

      return {
        domain: InsightDomain.SAVINGS,
        insights: this.prioritizeInsights(insights, 5),
        processingTimeMs: Date.now() - startTime,
        confidence: 0.82,
      };
    } catch (error) {
      console.error('[ProactiveInsightsEngine] Savings analysis error:', error);
      return {
        domain: InsightDomain.SAVINGS,
        insights: [],
        processingTimeMs: Date.now() - startTime,
        confidence: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async generateDebtInsights(
    context: DebtInsightContext
  ): Promise<DomainInsightResult> {
    const startTime = Date.now();
    const insights: ProactiveInsight[] = [];

    try {
      // Análisis del portafolio de deudas
      const portfolio = await this.debtStrategy.analyzeDebtPortfolio(
        context.debts,
        context.monthlyIncome,
        context.monthlyExpenses
      );

      // Alertas por nivel de riesgo
      if (portfolio.riskLevel === 'CRITICAL' || portfolio.riskLevel === 'HIGH') {
        insights.push(
          this.createDebtRiskInsight(context.userId, portfolio)
        );
      }

      // Pagos próximos a vencer
      insights.push(
        ...this.createPaymentDueInsights(context.userId, context.debts)
      );

      // Deudas con tasas altas
      insights.push(
        ...this.createHighInterestInsights(context.userId, context.debts)
      );

      // Oportunidad de consolidación
      if (context.debts.length >= 3) {
        const consolidation = await this.debtStrategy.suggestConsolidation(
          context.debts
        );
        if (consolidation.recommended) {
          insights.push(
            this.createConsolidationInsight(context.userId, consolidation)
          );
        }
      }

      // Optimización de pagos extra
      if (context.availableForDebtPayment > 0) {
        const extraPayments = await this.debtStrategy.optimizeExtraPayments(
          context.debts,
          context.availableForDebtPayment
        );
        if (extraPayments.totalInterestSaved > 100) {
          insights.push(
            this.createExtraPaymentInsight(
              context.userId,
              extraPayments,
              context.availableForDebtPayment
            )
          );
        }
      }

      // Hitos de deuda (cerca de pagar)
      insights.push(
        ...this.createDebtMilestoneInsights(context.userId, context.debts)
      );

      return {
        domain: InsightDomain.DEBT,
        insights: this.prioritizeInsights(insights, 5),
        processingTimeMs: Date.now() - startTime,
        confidence: 0.88,
      };
    } catch (error) {
      console.error('[ProactiveInsightsEngine] Debt analysis error:', error);
      return {
        domain: InsightDomain.DEBT,
        insights: [],
        processingTimeMs: Date.now() - startTime,
        confidence: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async generateAllInsights(
    context: FullInsightContext,
    options?: InsightGenerationOptions
  ): Promise<ProactiveAnalysisResult> {
    const startTime = Date.now();
    const domains = options?.domains || [
      InsightDomain.BUDGET,
      InsightDomain.SAVINGS,
      InsightDomain.DEBT,
    ];

    const results: Record<InsightDomain, DomainInsightResult> = {} as Record<
      InsightDomain,
      DomainInsightResult
    >;

    const promises: Promise<void>[] = [];

    if (domains.includes(InsightDomain.BUDGET) && context.budget) {
      promises.push(
        this.generateBudgetInsights(context.budget).then((r) => {
          results[InsightDomain.BUDGET] = r;
        })
      );
    }

    if (domains.includes(InsightDomain.SAVINGS) && context.savings) {
      promises.push(
        this.generateSavingsInsights(context.savings).then((r) => {
          results[InsightDomain.SAVINGS] = r;
        })
      );
    }

    if (domains.includes(InsightDomain.DEBT) && context.debt) {
      promises.push(
        this.generateDebtInsights(context.debt).then((r) => {
          results[InsightDomain.DEBT] = r;
        })
      );
    }

    await Promise.all(promises);

    // Calcular totales
    let totalInsights = 0;
    let urgentCount = 0;

    Object.values(results).forEach((result) => {
      totalInsights += result.insights.length;
      urgentCount += result.insights.filter((i) => i.isUrgent()).length;
    });

    return {
      userId: context.userId,
      generatedAt: new Date(),
      results,
      totalInsights,
      urgentCount,
      processingTimeMs: Date.now() - startTime,
    };
  }

  prioritizeInsights(
    insights: ProactiveInsight[],
    maxPerDomain?: number
  ): ProactiveInsight[] {
    const priorityOrder: Record<ProactiveInsightPriority, number> = {
      [ProactiveInsightPriority.CRITICAL]: 0,
      [ProactiveInsightPriority.HIGH]: 1,
      [ProactiveInsightPriority.MEDIUM]: 2,
      [ProactiveInsightPriority.LOW]: 3,
    };

    const sorted = [...insights].sort((a, b) => {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    if (maxPerDomain) {
      return sorted.slice(0, maxPerDomain);
    }

    return sorted;
  }

  async invalidateStaleInsights(
    userId: string,
    domain?: InsightDomain
  ): Promise<number> {
    // En una implementación real, esto invalidaría insights en cache/DB
    console.log(
      `[ProactiveInsightsEngine] Invalidating insights for user ${userId}, domain: ${domain || 'all'}`
    );
    return 0;
  }

  // ============ Métodos de transformación privados ============

  private transformAntExpensesToInsights(
    userId: string,
    antExpenses: Awaited<ReturnType<IExpenseAnalyzerPort['detectAntExpenses']>>
  ): ProactiveInsight[] {
    return antExpenses.slice(0, 3).map((exp) =>
      ProactiveInsight.create({
        userId,
        domain: InsightDomain.BUDGET,
        type: ProactiveInsightType.ANT_EXPENSE_PATTERN,
        priority:
          exp.monthlyImpact.amount > 500
            ? ProactiveInsightPriority.HIGH
            : ProactiveInsightPriority.MEDIUM,
        title: `Patrón detectado: ${exp.category}`,
        message: exp.recommendation,
        impact: {
          amount: exp.annualImpact.amount,
          currency: 'MXN',
          timeframe: 'annual',
          description: `Gastas $${exp.monthlyImpact.amount.toLocaleString('es-MX')}/mes en ${exp.category}`,
        },
        actions: [
          {
            label: 'Crear regla de ahorro',
            type: 'modal',
            payload: {
              modal: 'SavingRuleWizard',
              prefill: { category: exp.category, amount: exp.monthlyImpact.amount },
            },
          },
          {
            label: 'Ver detalles',
            type: 'navigate',
            payload: { path: '/presupuestos', highlight: exp.category },
          },
        ],
        metadata: {
          frequency: exp.frequency,
          confidence: exp.confidence,
          examples: exp.examples,
        },
      })
    );
  }

  private transformPatternsToInsights(
    userId: string,
    patterns: Awaited<ReturnType<IExpenseAnalyzerPort['analyzeSpendingPatterns']>>
  ): ProactiveInsight[] {
    return patterns
      .filter((p) => p.trend === 'INCREASING' && p.percentageChange > 20)
      .slice(0, 2)
      .map((pattern) =>
        ProactiveInsight.create({
          userId,
          domain: InsightDomain.BUDGET,
          type: ProactiveInsightType.SPENDING_TREND,
          priority:
            pattern.percentageChange > 50
              ? ProactiveInsightPriority.HIGH
              : ProactiveInsightPriority.MEDIUM,
          title: `${pattern.category}: Gasto en aumento`,
          message: `Tu gasto en ${pattern.category} aumentó ${pattern.percentageChange.toFixed(0)}% respecto al mes anterior.`,
          impact: {
            amount: pattern.prediction.amount - pattern.averageMonthly.amount,
            currency: 'MXN',
            timeframe: 'monthly',
          },
          actions: [
            {
              label: 'Establecer límite',
              type: 'modal',
              payload: { modal: 'CategoryLimit', category: pattern.category },
            },
          ],
          metadata: { trend: pattern.trend, confidence: pattern.confidence },
        })
      );
  }

  private transformOptimizationsToInsights(
    userId: string,
    optimizations: Awaited<
      ReturnType<IExpenseAnalyzerPort['generateBudgetOptimizations']>
    >
  ): ProactiveInsight[] {
    return optimizations.recommendations
      .filter((r) => r.priority === 'HIGH')
      .slice(0, 2)
      .map((rec) =>
        ProactiveInsight.create({
          userId,
          domain: InsightDomain.BUDGET,
          type: ProactiveInsightType.CATEGORY_OPTIMIZATION,
          priority: ProactiveInsightPriority.MEDIUM,
          title: `Optimiza: ${rec.category}`,
          message: rec.reasoning,
          impact: {
            amount: rec.currentSpend.amount - rec.suggestedLimit.amount,
            currency: 'MXN',
            timeframe: 'monthly',
          },
          actions: [
            {
              label: 'Ajustar presupuesto',
              type: 'modal',
              payload: {
                modal: 'CategoryEdit',
                category: rec.category,
                suggestedLimit: rec.suggestedLimit.amount,
              },
            },
          ],
        })
      );
  }

  private checkBudgetOverspend(
    userId: string,
    budget: NonNullable<BudgetInsightContext['budget']>
  ): ProactiveInsight | null {
    const totalSpent = budget.categories.reduce(
      (sum, cat) => sum + cat.spent.amount,
      0
    );
    const percentUsed = (totalSpent / budget.totalIncome.amount) * 100;

    if (percentUsed >= 100) {
      return ProactiveInsight.create({
        userId,
        domain: InsightDomain.BUDGET,
        type: ProactiveInsightType.BUDGET_OVERSPEND_WARNING,
        priority: ProactiveInsightPriority.CRITICAL,
        title: 'Presupuesto excedido',
        message: `Has gastado $${totalSpent.toLocaleString('es-MX')} de $${budget.totalIncome.amount.toLocaleString('es-MX')} (${percentUsed.toFixed(0)}%).`,
        impact: {
          amount: totalSpent - budget.totalIncome.amount,
          currency: 'MXN',
          timeframe: 'monthly',
        },
        actions: [
          {
            label: 'Ver gastos',
            type: 'navigate',
            payload: { path: '/presupuestos' },
          },
        ],
      });
    } else if (percentUsed >= 90) {
      return ProactiveInsight.create({
        userId,
        domain: InsightDomain.BUDGET,
        type: ProactiveInsightType.BUDGET_OVERSPEND_WARNING,
        priority: ProactiveInsightPriority.HIGH,
        title: 'Presupuesto casi agotado',
        message: `Has usado ${percentUsed.toFixed(0)}% de tu presupuesto. Te quedan $${(budget.totalIncome.amount - totalSpent).toLocaleString('es-MX')}.`,
        actions: [
          {
            label: 'Ver gastos',
            type: 'navigate',
            payload: { path: '/presupuestos' },
          },
        ],
      });
    }

    return null;
  }

  private createGoalAtRiskInsight(
    userId: string,
    goal: Parameters<ISavingsOptimizerPort['simulateSavingsImpact']>[0],
    simulation: Awaited<ReturnType<ISavingsOptimizerPort['simulateSavingsImpact']>>
  ): ProactiveInsight {
    const remaining = goal.targetAmount.amount - goal.currentAmount.amount;
    const monthlyNeeded = goal.getMonthlyContributionNeeded();

    return ProactiveInsight.create({
      userId,
      domain: InsightDomain.SAVINGS,
      type: ProactiveInsightType.GOAL_AT_RISK,
      priority: ProactiveInsightPriority.HIGH,
      title: `Meta en riesgo: ${goal.name}`,
      message: `A tu ritmo actual, hay ${(simulation.successProbability * 100).toFixed(0)}% de probabilidad de alcanzar esta meta.${monthlyNeeded ? ` Necesitas $${monthlyNeeded.amount.toLocaleString('es-MX')}/mes.` : ''}`,
      impact: {
        amount: remaining,
        currency: 'MXN',
        timeframe: 'total',
        description: `Faltan $${remaining.toLocaleString('es-MX')} para tu meta`,
      },
      actions: [
        {
          label: 'Ajustar contribución',
          type: 'modal',
          payload: { modal: 'GoalEdit', goalId: goal.id },
        },
        {
          label: 'Ver simulación',
          type: 'modal',
          payload: { modal: 'GoalSimulation', goalId: goal.id },
        },
      ],
      relatedEntityId: goal.id,
      relatedEntityType: 'SavingsGoal',
    });
  }

  private createGoalCelebrationInsight(
    userId: string,
    goal: Parameters<ISavingsOptimizerPort['simulateSavingsImpact']>[0]
  ): ProactiveInsight {
    const progress = goal.getProgress().value;
    const remaining = goal.getRemaining().amount;

    return ProactiveInsight.create({
      userId,
      domain: InsightDomain.SAVINGS,
      type: ProactiveInsightType.GOAL_CELEBRATION,
      priority: ProactiveInsightPriority.LOW,
      title: `¡Casi lo logras! ${goal.name}`,
      message: `Llevas ${progress.toFixed(0)}% de tu meta. Solo faltan $${remaining.toLocaleString('es-MX')} para completarla.`,
      impact: {
        amount: remaining,
        currency: 'MXN',
        timeframe: 'total',
      },
      actions: [
        {
          label: 'Ver meta',
          type: 'navigate',
          payload: { path: '/ahorros', highlight: goal.id },
        },
      ],
      relatedEntityId: goal.id,
      relatedEntityType: 'SavingsGoal',
      metadata: { progress, icon: goal.icon, color: goal.color },
    });
  }

  private createGoalCompletedInsight(
    userId: string,
    goal: Parameters<ISavingsOptimizerPort['simulateSavingsImpact']>[0]
  ): ProactiveInsight {
    return ProactiveInsight.create({
      userId,
      domain: InsightDomain.SAVINGS,
      type: ProactiveInsightType.GOAL_CELEBRATION,
      priority: ProactiveInsightPriority.LOW,
      title: `🎉 ¡Meta completada: ${goal.name}!`,
      message: `Felicidades, lograste ahorrar $${goal.targetAmount.amount.toLocaleString('es-MX')}. ¿Listo para tu próximo objetivo?`,
      actions: [
        {
          label: 'Crear nueva meta',
          type: 'modal',
          payload: { modal: 'GoalCreate' },
        },
      ],
      relatedEntityId: goal.id,
      relatedEntityType: 'SavingsGoal',
    });
  }

  private transformSuggestedRulesToInsights(
    userId: string,
    suggestedRules: Awaited<
      ReturnType<ISavingsOptimizerPort['optimizeSavingsStrategy']>
    >['suggestedRules']
  ): ProactiveInsight[] {
    return suggestedRules.slice(0, 2).map((rule) =>
      ProactiveInsight.create({
        userId,
        domain: InsightDomain.SAVINGS,
        type: ProactiveInsightType.RULE_OPTIMIZATION,
        priority: ProactiveInsightPriority.MEDIUM,
        title: `Sugerencia: ${rule.name}`,
        message: rule.description,
        impact: {
          amount: rule.estimatedMonthlySavings.amount,
          currency: 'MXN',
          timeframe: 'monthly',
        },
        actions: [
          {
            label: 'Activar regla',
            type: 'modal',
            payload: { modal: 'SavingRuleWizard', prefill: { type: rule.type } },
          },
        ],
      })
    );
  }

  private createEmergencyFundInsight(
    userId: string,
    progress: number,
    monthlyExpenses: number
  ): ProactiveInsight {
    const targetMonths = 3;
    const target = monthlyExpenses * targetMonths;
    const current = (progress / 100) * target;
    const needed = target - current;

    return ProactiveInsight.create({
      userId,
      domain: InsightDomain.SAVINGS,
      type: ProactiveInsightType.EMERGENCY_FUND_LOW,
      priority:
        progress < 25
          ? ProactiveInsightPriority.HIGH
          : ProactiveInsightPriority.MEDIUM,
      title: 'Fondo de emergencia bajo',
      message: `Tu fondo de emergencia está al ${progress.toFixed(0)}%. Lo ideal es tener ${targetMonths} meses de gastos ($${target.toLocaleString('es-MX')}).`,
      impact: {
        amount: needed,
        currency: 'MXN',
        timeframe: 'total',
        description: `Necesitas $${needed.toLocaleString('es-MX')} más`,
      },
      actions: [
        {
          label: 'Aumentar ahorro',
          type: 'navigate',
          payload: { path: '/ahorros' },
        },
      ],
    });
  }

  private createDebtRiskInsight(
    userId: string,
    portfolio: Awaited<ReturnType<IDebtStrategyPort['analyzeDebtPortfolio']>>
  ): ProactiveInsight {
    return ProactiveInsight.create({
      userId,
      domain: InsightDomain.DEBT,
      type: ProactiveInsightType.HIGH_INTEREST_WARNING,
      priority:
        portfolio.riskLevel === 'CRITICAL'
          ? ProactiveInsightPriority.CRITICAL
          : ProactiveInsightPriority.HIGH,
      title:
        portfolio.riskLevel === 'CRITICAL'
          ? 'Nivel de deuda crítico'
          : 'Alto nivel de endeudamiento',
      message: `Tu ratio deuda/ingreso es ${(portfolio.debtToIncomeRatio * 100).toFixed(0)}%. ${portfolio.riskLevel === 'CRITICAL' ? 'Requiere atención inmediata.' : 'Considera un plan de pago.'}`,
      impact: {
        amount: portfolio.totalDebt,
        currency: 'MXN',
        timeframe: 'total',
      },
      actions: [
        {
          label: 'Ver estrategia',
          type: 'navigate',
          payload: { path: '/deudas' },
        },
      ],
    });
  }

  private createPaymentDueInsights(
    userId: string,
    debts: DebtInsightContext['debts']
  ): ProactiveInsight[] {
    const now = new Date();
    const insights: ProactiveInsight[] = [];

    for (const debt of debts) {
      if (!debt.dueDate) continue;

      const daysUntilDue = Math.ceil(
        (debt.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilDue <= 0) {
        // Vencido
        insights.push(
          ProactiveInsight.create({
            userId,
            domain: InsightDomain.DEBT,
            type: ProactiveInsightType.PAYMENT_DUE,
            priority: ProactiveInsightPriority.CRITICAL,
            title: `⚠️ Pago vencido: ${debt.name}`,
            message: `El pago de ${debt.name} venció hace ${Math.abs(daysUntilDue)} días. Pago mínimo: $${debt.minimumPayment.toLocaleString('es-MX')}.`,
            impact: {
              amount: debt.minimumPayment,
              currency: 'MXN',
              timeframe: 'one-time',
            },
            actions: [
              {
                label: 'Pagar ahora',
                type: 'modal',
                payload: { modal: 'PaymentModal', debtId: debt.id },
              },
            ],
            relatedEntityId: debt.id,
            relatedEntityType: 'Debt',
            expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Expira en 24h
          })
        );
      } else if (daysUntilDue <= 3) {
        insights.push(
          ProactiveInsight.create({
            userId,
            domain: InsightDomain.DEBT,
            type: ProactiveInsightType.PAYMENT_DUE,
            priority: ProactiveInsightPriority.CRITICAL,
            title: `Pago urgente: ${debt.name}`,
            message: `Vence en ${daysUntilDue} día${daysUntilDue > 1 ? 's' : ''}. Pago mínimo: $${debt.minimumPayment.toLocaleString('es-MX')}.`,
            impact: {
              amount: debt.minimumPayment,
              currency: 'MXN',
              timeframe: 'one-time',
            },
            actions: [
              {
                label: 'Programar pago',
                type: 'modal',
                payload: { modal: 'PaymentModal', debtId: debt.id },
              },
            ],
            relatedEntityId: debt.id,
            relatedEntityType: 'Debt',
          })
        );
      } else if (daysUntilDue <= 7) {
        insights.push(
          ProactiveInsight.create({
            userId,
            domain: InsightDomain.DEBT,
            type: ProactiveInsightType.PAYMENT_DUE,
            priority: ProactiveInsightPriority.HIGH,
            title: `Pago próximo: ${debt.name}`,
            message: `Vence en ${daysUntilDue} días. Pago mínimo: $${debt.minimumPayment.toLocaleString('es-MX')}.`,
            actions: [
              {
                label: 'Ver detalles',
                type: 'navigate',
                payload: { path: '/deudas', highlight: debt.id },
              },
            ],
            relatedEntityId: debt.id,
            relatedEntityType: 'Debt',
          })
        );
      }
    }

    return insights.slice(0, 3);
  }

  private createHighInterestInsights(
    userId: string,
    debts: DebtInsightContext['debts']
  ): ProactiveInsight[] {
    return debts
      .filter((d) => d.interestRate > 30)
      .slice(0, 2)
      .map((debt) =>
        ProactiveInsight.create({
          userId,
          domain: InsightDomain.DEBT,
          type: ProactiveInsightType.HIGH_INTEREST_WARNING,
          priority: ProactiveInsightPriority.HIGH,
          title: `Tasa alta: ${debt.name}`,
          message: `Esta deuda tiene una tasa del ${debt.interestRate.toFixed(0)}% anual. Considera priorizar su pago o refinanciar.`,
          impact: {
            amount: debt.currentBalance * (debt.interestRate / 100),
            currency: 'MXN',
            timeframe: 'annual',
            description: 'Interés anual estimado',
          },
          actions: [
            {
              label: 'Ver opciones',
              type: 'navigate',
              payload: { path: '/deudas', highlight: debt.id },
            },
          ],
          relatedEntityId: debt.id,
          relatedEntityType: 'Debt',
        })
      );
  }

  private createConsolidationInsight(
    userId: string,
    consolidation: Awaited<ReturnType<IDebtStrategyPort['suggestConsolidation']>>
  ): ProactiveInsight {
    return ProactiveInsight.create({
      userId,
      domain: InsightDomain.DEBT,
      type: ProactiveInsightType.CONSOLIDATION_OPPORTUNITY,
      priority: ProactiveInsightPriority.MEDIUM,
      title: 'Oportunidad de consolidación',
      message: consolidation.reasoning,
      impact: {
        amount: consolidation.totalSavings,
        currency: 'MXN',
        timeframe: 'total',
        description: `Ahorro en intereses: $${consolidation.totalSavings.toLocaleString('es-MX')}`,
      },
      actions: [
        {
          label: 'Ver simulación',
          type: 'modal',
          payload: {
            modal: 'ConsolidationSimulator',
            newLoan: consolidation.potentialNewLoan,
          },
        },
      ],
      metadata: {
        monthlySavings: consolidation.monthlySavings,
        newLoan: consolidation.potentialNewLoan,
      },
    });
  }

  private createExtraPaymentInsight(
    userId: string,
    extraPayments: Awaited<ReturnType<IDebtStrategyPort['optimizeExtraPayments']>>,
    availableAmount: number
  ): ProactiveInsight {
    const topAllocation = extraPayments.allocations[0];

    return ProactiveInsight.create({
      userId,
      domain: InsightDomain.DEBT,
      type: ProactiveInsightType.INTEREST_SAVINGS,
      priority: ProactiveInsightPriority.MEDIUM,
      title: 'Optimiza tus pagos extra',
      message: `Con $${availableAmount.toLocaleString('es-MX')} extra, podrías ahorrar $${extraPayments.totalInterestSaved.toLocaleString('es-MX')} en intereses.`,
      impact: {
        amount: extraPayments.totalInterestSaved,
        currency: 'MXN',
        timeframe: 'total',
      },
      actions: [
        {
          label: 'Aplicar estrategia',
          type: 'modal',
          payload: { modal: 'ExtraPaymentWizard', allocations: extraPayments.allocations },
        },
      ],
      metadata: {
        topRecommendation: topAllocation,
        totalAllocations: extraPayments.allocations.length,
      },
    });
  }

  private createDebtMilestoneInsights(
    userId: string,
    debts: DebtInsightContext['debts']
  ): ProactiveInsight[] {
    return debts
      .filter((d) => {
        const progress = d.getProgress ? d.getProgress() : 0;
        return progress >= 90 && progress < 100;
      })
      .slice(0, 2)
      .map((debt) =>
        ProactiveInsight.create({
          userId,
          domain: InsightDomain.DEBT,
          type: ProactiveInsightType.DEBT_FREE_MILESTONE,
          priority: ProactiveInsightPriority.LOW,
          title: `¡Casi libre de ${debt.name}!`,
          message: `Solo te falta $${debt.currentBalance.toLocaleString('es-MX')} para liquidar esta deuda.`,
          impact: {
            amount: debt.currentBalance,
            currency: 'MXN',
            timeframe: 'one-time',
          },
          actions: [
            {
              label: 'Liquidar ahora',
              type: 'modal',
              payload: { modal: 'PaymentModal', debtId: debt.id, amount: debt.currentBalance },
            },
          ],
          relatedEntityId: debt.id,
          relatedEntityType: 'Debt',
        })
      );
  }
}
