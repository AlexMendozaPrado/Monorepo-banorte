import { SentimentType } from '../value-objects/SentimentType';
import { SessionMetrics } from '../entities/SessionMetrics';

/**
 * Request para análisis de métricas de sesión mediante IA
 */
export interface SessionMetricsAnalysisRequest {
  /** Transcripción completa de la sesión */
  transcript: string;

  /** Sentimiento general detectado previamente */
  overallSentiment: SentimentType;

  /** Nivel de confianza del análisis de sentimiento (0-1) */
  confidence: number;

  /** Nombre del cliente */
  clientName: string;

  /** Nombre del documento/sesión */
  documentName: string;

  /** Metadatos adicionales opcionales */
  metadata?: {
    channel?: string;
    wordCount?: number;
    [key: string]: any;
  };
}

/**
 * Respuesta del análisis de métricas mediante IA
 * Esta estructura mapea directamente a SessionMetrics entity
 */
export interface SessionMetricsAnalysisResponse {
  /** Participantes identificados en la sesión */
  participants: string[];

  /** Duración estimada en minutos */
  durationMinutes: number;

  /** Análisis de temas discutidos */
  topics: Array<{
    category: 'problem' | 'achievement' | 'coordination';
    topic: string;
    timePercentage: number; // 0-100
    sentiment: number; // 1-7
    mentions: number;
  }>;

  /** Distribución de tiempo por categoría */
  timeDistribution: {
    problemsPercentage: number; // 0-100
    achievementsPercentage: number; // 0-100
    coordinationPercentage: number; // 0-100
  };

  /** Blockers identificados */
  blockers: Array<{
    description: string;
    priority: 'high' | 'medium' | 'low';
    context: string;
    status: 'active' | 'resolved' | 'pending';
    mentions: number;
  }>;

  /** Logros identificados */
  achievements: Array<{
    description: string;
    impact: 'high' | 'medium' | 'low';
    sentiment: number; // 1-7
    metric?: string;
    value?: number;
  }>;

  /** Items de acción identificados */
  actionItems: Array<{
    description: string;
    assignee?: string;
    priority: 'high' | 'medium' | 'low';
    deadline?: string; // ISO date string
  }>;

  /** Palabras clave más relevantes */
  keywords: Array<{
    word: string;
    frequency: number;
    sentiment: number;
    category: string;
  }>;

  /** Scores calculados por IA (0-100) */
  scores: {
    productivity: number;
    effectiveness: number;
    engagement: number;
    resolutionRate: number; // Porcentaje de problemas resueltos
  };

  /** Timeline emocional de la sesión */
  emotionalTimeline: Array<{
    timestamp: number; // Minutos desde inicio
    sentiment: number; // 1-7
    event: string;
    context: string;
    participants?: string[];
  }>;

  /** Reasoning del análisis (para debugging/transparency) */
  reasoning?: string;
}

/**
 * Request para análisis de conclusión de sesión mediante IA
 */
export interface SessionConclusionAnalysisRequest {
  /** Transcripción completa de la sesión */
  transcript: string;

  /** Sentimiento general detectado */
  overallSentiment: SentimentType;

  /** Nivel de confianza del análisis de sentimiento */
  confidence: number;

  /** Métricas calculadas de la sesión */
  metrics: SessionMetrics;

  /** Nombre del cliente */
  clientName: string;

  /** Nombre del documento/sesión */
  documentName: string;

  /** Contexto adicional opcional */
  context?: {
    previousSessions?: number;
    clientHistory?: string;
    [key: string]: any;
  };
}

/**
 * Respuesta del análisis de conclusión mediante IA
 * Esta estructura mapea a SessionConclusion entity
 */
export interface SessionConclusionAnalysisResponse {
  /** Resumen ejecutivo de la sesión */
  executiveSummary: string;

  /** Score de satisfacción general (0-100) */
  satisfactionScore: number;

  /** Riesgos identificados */
  risks: Array<{
    level: 'high' | 'medium' | 'low';
    description: string;
    impact: string;
    recommendation: string;
  }>;

  /** Oportunidades identificadas */
  opportunities: Array<{
    description: string;
    potentialValue: string;
    priority: 'high' | 'medium' | 'low';
    effort: 'low' | 'medium' | 'high';
  }>;

  /** Plan de acción estructurado */
  actionPlan: {
    immediate: Array<{
      description: string;
      priority: 'high' | 'medium' | 'low';
    }>;
    shortTerm: Array<{
      description: string;
      priority: 'high' | 'medium' | 'low';
    }>;
    continuous: Array<{
      description: string;
      priority: 'high' | 'medium' | 'low';
    }>;
  };

  /** Insights segmentados por audiencia */
  insights: {
    forAccountManager: string[];
    forTechnicalTeam: string[];
    forManagement: string[];
  };

  /** Evaluación del clima del equipo */
  teamClimate: {
    moral: number; // 0-100
    collaboration: number; // 0-100
    proactivity: number; // 0-100
  };

  /** Recomendaciones generales */
  recommendations: string[];

  /** Próximos pasos sugeridos */
  nextSteps: string[];

  /** Reasoning del análisis */
  reasoning?: string;
}

/**
 * Port para análisis de sesiones mediante IA (LLM)
 *
 * Este port define el contrato para analizar transcripciones de sesiones
 * de trabajo (reuniones, células, scrums) y extraer métricas estructuradas,
 * conclusiones, y recomendaciones mediante modelos de lenguaje.
 *
 * Implementaciones típicas:
 * - OpenAISessionAnalyzer (GPT-4, GPT-4o)
 * - OllamaSessionAnalyzer (Llama, Mistral)
 * - AnthropicSessionAnalyzer (Claude)
 *
 * @example
 * ```typescript
 * const analyzer: SessionAnalysisPort = new OpenAISessionAnalyzer(apiKey);
 *
 * const metricsResponse = await analyzer.analyzeMetrics({
 *   transcript: transcriptionText,
 *   overallSentiment: SentimentType.POSITIVE,
 *   confidence: 0.85,
 *   clientName: "Banorte",
 *   documentName: "CelulaMiercoles.pdf"
 * });
 * ```
 */
export interface SessionAnalysisPort {
  /**
   * Analiza una transcripción de sesión y extrae métricas estructuradas
   *
   * Utiliza IA para identificar:
   * - Participantes
   * - Temas discutidos (problems, achievements, coordination)
   * - Blockers con contexto y prioridad
   * - Logros con impacto
   * - Items de acción
   * - Keywords relevantes
   * - Scores de productividad, efectividad, engagement
   * - Timeline emocional
   *
   * @param request Request con transcripción y contexto
   * @returns Promise con métricas extraídas
   * @throws Error si el análisis falla o el formato es inválido
   */
  analyzeMetrics(
    request: SessionMetricsAnalysisRequest
  ): Promise<SessionMetricsAnalysisResponse>;

  /**
   * Genera conclusiones ejecutivas y recomendaciones estratégicas
   *
   * Utiliza IA para:
   * - Generar resumen ejecutivo
   * - Identificar riesgos con impacto y recomendaciones
   * - Detectar oportunidades de negocio
   * - Crear plan de acción (inmediato, corto plazo, continuo)
   * - Generar insights segmentados por audiencia
   * - Evaluar clima del equipo
   * - Proporcionar recomendaciones y próximos pasos
   *
   * @param request Request con transcripción, métricas y contexto
   * @returns Promise con conclusión estructurada
   * @throws Error si el análisis falla o el formato es inválido
   */
  analyzeConclusion(
    request: SessionConclusionAnalysisRequest
  ): Promise<SessionConclusionAnalysisResponse>;

  /**
   * Verifica si el analizador está disponible y listo para usar
   *
   * Útil para:
   * - Health checks
   * - Validación de configuración
   * - Determinar si usar AI o fallback a reglas
   *
   * @returns Promise<boolean> true si el analizador está disponible
   */
  isReady(): Promise<boolean>;

  /**
   * Obtiene información sobre el modelo y capacidades del analizador
   *
   * @returns Información del modelo (nombre, proveedor, capacidades)
   */
  getModelInfo(): {
    name: string;
    provider: string; // 'openai' | 'ollama' | 'anthropic' | etc
    version?: string;
    maxTokens?: number;
    capabilities: string[]; // ['metrics', 'conclusions', 'structured-output', etc]
  };
}
