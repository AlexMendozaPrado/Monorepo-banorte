import { v4 as uuidv4 } from 'uuid';

/**
 * Dominio del insight - indica a qué área financiera pertenece
 */
export enum InsightDomain {
  BUDGET = 'BUDGET',
  SAVINGS = 'SAVINGS',
  DEBT = 'DEBT',
  CARDS = 'CARDS',
  INSURANCE = 'INSURANCE',
  GENERAL = 'GENERAL',
}

/**
 * Tipos específicos de insights proactivos por dominio
 */
export enum ProactiveInsightType {
  // Budget-specific
  BUDGET_OVERSPEND_WARNING = 'BUDGET_OVERSPEND_WARNING',
  ANT_EXPENSE_PATTERN = 'ANT_EXPENSE_PATTERN',
  CATEGORY_OPTIMIZATION = 'CATEGORY_OPTIMIZATION',
  SPENDING_TREND = 'SPENDING_TREND',

  // Savings-specific
  GOAL_AT_RISK = 'GOAL_AT_RISK',
  GOAL_CELEBRATION = 'GOAL_CELEBRATION',
  RULE_OPTIMIZATION = 'RULE_OPTIMIZATION',
  SAVINGS_OPPORTUNITY = 'SAVINGS_OPPORTUNITY',
  EMERGENCY_FUND_LOW = 'EMERGENCY_FUND_LOW',

  // Debt-specific
  PAYMENT_DUE = 'PAYMENT_DUE',
  CONSOLIDATION_OPPORTUNITY = 'CONSOLIDATION_OPPORTUNITY',
  INTEREST_SAVINGS = 'INTEREST_SAVINGS',
  DEBT_FREE_MILESTONE = 'DEBT_FREE_MILESTONE',
  HIGH_INTEREST_WARNING = 'HIGH_INTEREST_WARNING',

  // Cards-specific (futuro)
  CARD_UTILIZATION_HIGH = 'CARD_UTILIZATION_HIGH',
  BENEFIT_EXPIRING = 'BENEFIT_EXPIRING',

  // General
  GENERAL_TIP = 'GENERAL_TIP',
  FINANCIAL_HEALTH_UPDATE = 'FINANCIAL_HEALTH_UPDATE',
}

/**
 * Prioridad del insight - determina urgencia visual y orden
 */
export enum ProactiveInsightPriority {
  CRITICAL = 'CRITICAL', // Requiere acción en 24-48 horas (rojo)
  HIGH = 'HIGH', // Requiere acción en 7 días (naranja)
  MEDIUM = 'MEDIUM', // Debería atenderse este mes (azul)
  LOW = 'LOW', // Mejora opcional (verde)
}

/**
 * Tipo de acción que puede ejecutar el usuario
 */
export type InsightActionType = 'navigate' | 'api-call' | 'modal' | 'external' | 'dismiss';

/**
 * Acción ejecutable desde el insight
 */
export interface ProactiveInsightAction {
  label: string;
  type: InsightActionType;
  payload: Record<string, unknown>;
}

/**
 * Impacto potencial del insight (cuantificado)
 */
export interface ProactiveInsightImpact {
  amount: number;
  currency: string;
  timeframe: 'monthly' | 'annual' | 'one-time' | 'total';
  description?: string;
}

/**
 * Datos necesarios para crear un ProactiveInsight
 */
export interface CreateProactiveInsightData {
  userId: string;
  domain: InsightDomain;
  type: ProactiveInsightType;
  priority: ProactiveInsightPriority;
  title: string;
  message: string;
  impact?: ProactiveInsightImpact;
  actions?: ProactiveInsightAction[];
  relatedEntityId?: string;
  relatedEntityType?: string;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Entity que representa un insight proactivo generado por IA
 *
 * Los insights proactivos son análisis automáticos que la IA genera
 * al detectar patrones, oportunidades o alertas en los datos financieros
 * del usuario, sin que éste tenga que preguntar.
 */
export class ProactiveInsight {
  private readonly createdAt: Date;
  private _dismissed: boolean = false;
  private _dismissedAt: Date | null = null;
  private _interactedAt: Date | null = null;

  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly domain: InsightDomain,
    public readonly type: ProactiveInsightType,
    public readonly priority: ProactiveInsightPriority,
    public readonly title: string,
    public readonly message: string,
    public readonly impact: ProactiveInsightImpact | undefined,
    public readonly actions: ProactiveInsightAction[],
    public readonly relatedEntityId: string | undefined,
    public readonly relatedEntityType: string | undefined,
    public readonly expiresAt: Date | undefined,
    public readonly metadata: Record<string, unknown>,
    createdAtOverride?: Date
  ) {
    this.createdAt = createdAtOverride ?? new Date();
  }

  /**
   * Factory method para crear un nuevo ProactiveInsight
   */
  static create(data: CreateProactiveInsightData): ProactiveInsight {
    return new ProactiveInsight(
      uuidv4(),
      data.userId,
      data.domain,
      data.type,
      data.priority,
      data.title,
      data.message,
      data.impact,
      data.actions || [],
      data.relatedEntityId,
      data.relatedEntityType,
      data.expiresAt,
      data.metadata || {}
    );
  }

  /**
   * Reconstituir un insight desde datos persistidos
   */
  static reconstitute(
    id: string,
    userId: string,
    domain: InsightDomain,
    type: ProactiveInsightType,
    priority: ProactiveInsightPriority,
    title: string,
    message: string,
    impact: ProactiveInsightImpact | undefined,
    actions: ProactiveInsightAction[],
    relatedEntityId: string | undefined,
    relatedEntityType: string | undefined,
    expiresAt: Date | undefined,
    metadata: Record<string, unknown>,
    createdAt: Date,
    dismissed: boolean,
    dismissedAt: Date | null,
    interactedAt: Date | null
  ): ProactiveInsight {
    const insight = new ProactiveInsight(
      id,
      userId,
      domain,
      type,
      priority,
      title,
      message,
      impact,
      actions,
      relatedEntityId,
      relatedEntityType,
      expiresAt,
      metadata,
      createdAt
    );
    insight._dismissed = dismissed;
    insight._dismissedAt = dismissedAt;
    insight._interactedAt = interactedAt;
    return insight;
  }

  /**
   * Marca el insight como descartado por el usuario
   */
  dismiss(): void {
    this._dismissed = true;
    this._dismissedAt = new Date();
  }

  /**
   * Registra que el usuario interactuó con el insight
   */
  markInteracted(): void {
    this._interactedAt = new Date();
  }

  /**
   * Verifica si el insight ha expirado
   */
  isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }

  /**
   * Verifica si el insight sigue siendo válido (no expirado ni descartado)
   */
  isValid(): boolean {
    return !this._dismissed && !this.isExpired();
  }

  /**
   * Verifica si es un insight urgente (CRITICAL o HIGH)
   */
  isUrgent(): boolean {
    return (
      this.priority === ProactiveInsightPriority.CRITICAL ||
      this.priority === ProactiveInsightPriority.HIGH
    );
  }

  /**
   * Obtiene el tiempo restante hasta expiración en milisegundos
   */
  getTimeToExpiration(): number | null {
    if (!this.expiresAt) return null;
    return Math.max(0, this.expiresAt.getTime() - Date.now());
  }

  /**
   * Obtiene la acción principal (primera acción no-dismiss)
   */
  getPrimaryAction(): ProactiveInsightAction | undefined {
    return this.actions.find((a) => a.type !== 'dismiss');
  }

  get dismissed(): boolean {
    return this._dismissed;
  }

  get dismissedAt(): Date | null {
    return this._dismissedAt;
  }

  get interactedAt(): Date | null {
    return this._interactedAt;
  }

  get wasInteracted(): boolean {
    return this._interactedAt !== null;
  }

  get created(): Date {
    return this.createdAt;
  }

  /**
   * Serializa el insight a JSON para API responses
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      userId: this.userId,
      domain: this.domain,
      type: this.type,
      priority: this.priority,
      title: this.title,
      message: this.message,
      impact: this.impact,
      actions: this.actions,
      relatedEntityId: this.relatedEntityId,
      relatedEntityType: this.relatedEntityType,
      expiresAt: this.expiresAt?.toISOString(),
      metadata: this.metadata,
      createdAt: this.createdAt.toISOString(),
      dismissed: this._dismissed,
      dismissedAt: this._dismissedAt?.toISOString(),
      interactedAt: this._interactedAt?.toISOString(),
      isExpired: this.isExpired(),
      isValid: this.isValid(),
      isUrgent: this.isUrgent(),
    };
  }
}

/**
 * Resultado del análisis proactivo para un dominio
 */
export interface DomainInsightResult {
  domain: InsightDomain;
  insights: ProactiveInsight[];
  processingTimeMs: number;
  confidence: number;
  error?: string;
}

/**
 * Resultado completo del análisis proactivo
 */
export interface ProactiveAnalysisResult {
  userId: string;
  generatedAt: Date;
  results: Record<InsightDomain, DomainInsightResult>;
  totalInsights: number;
  urgentCount: number;
  processingTimeMs: number;
}
