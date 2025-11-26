import OpenAI from 'openai';
import {
  SessionAnalysisPort,
  SessionMetricsAnalysisRequest,
  SessionMetricsAnalysisResponse,
  SessionConclusionAnalysisRequest,
  SessionConclusionAnalysisResponse,
} from '../../core/domain/ports/SessionAnalysisPort';
import { SentimentType } from '../../core/domain/value-objects/SentimentType';

/**
 * Implementación de SessionAnalysisPort usando OpenAI API
 *
 * Utiliza:
 * - GPT-4o / GPT-4 Turbo para análisis profundo
 * - Structured Outputs (JSON Schema) para garantizar formato
 * - Prompts especializados para transcripciones de sesiones
 */
export class OpenAISessionAnalyzer implements SessionAnalysisPort {
  private openai: OpenAI;
  private model: string;
  private maxTokens: number;
  private temperature: number;

  constructor(
    apiKey: string,
    model: string = 'gpt-4o',
    maxTokens: number = 16000,
    temperature: number = 0.3
  ) {
    this.openai = new OpenAI({ apiKey });
    this.model = model;
    this.maxTokens = maxTokens;
    this.temperature = temperature;
  }

  async analyzeMetrics(
    request: SessionMetricsAnalysisRequest
  ): Promise<SessionMetricsAnalysisResponse> {
    try {
      const prompt = this.buildMetricsPrompt(request);
      const schema = this.getMetricsSchema();

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: this.getMetricsSystemPrompt(),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'session_metrics_analysis',
            strict: false,  // Cambiar a false para permitir campos opcionales
            schema: schema,
          },
        },
      });

      const responseContent = completion.choices[0]?.message?.content;
      if (!responseContent) {
        throw new Error('No response received from OpenAI');
      }

      return this.parseMetricsResponse(responseContent);
    } catch (error) {
      console.error('Error in OpenAI session metrics analysis:', error);
      throw new Error(
        `Session metrics analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async analyzeConclusion(
    request: SessionConclusionAnalysisRequest
  ): Promise<SessionConclusionAnalysisResponse> {
    try {
      const prompt = this.buildConclusionPrompt(request);
      const schema = this.getConclusionSchema();

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: this.getConclusionSystemPrompt(),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'session_conclusion_analysis',
            strict: false,  // Allow optional fields like 'reasoning'
            schema: schema,
          },
        },
      });

      const responseContent = completion.choices[0]?.message?.content;
      if (!responseContent) {
        throw new Error('No response received from OpenAI');
      }

      return this.parseConclusionResponse(responseContent);
    } catch (error) {
      console.error('Error in OpenAI session conclusion analysis:', error);
      throw new Error(
        `Session conclusion analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async isReady(): Promise<boolean> {
    try {
      const testCompletion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: 'Test' }],
        max_tokens: 10,
      });

      return !!testCompletion.choices[0]?.message?.content;
    } catch (error) {
      console.error('OpenAI session analyzer readiness check failed:', error);
      return false;
    }
  }

  getModelInfo(): {
    name: string;
    provider: string;
    version?: string;
    maxTokens?: number;
    capabilities: string[];
  } {
    return {
      name: this.model,
      provider: 'openai',
      version: '1.0',
      maxTokens: this.maxTokens,
      capabilities: [
        'metrics-extraction',
        'conclusion-generation',
        'structured-output',
        'context-aware-analysis',
        'sentiment-integration',
      ],
    };
  }

  // ==================== METRICS ANALYSIS ====================

  private getMetricsSystemPrompt(): string {
    return `Eres un analista experto en análisis de reuniones de trabajo del sector tecnológico y bancario.

Tu especialidad es analizar transcripciones de sesiones (células, scrums, daily standups, reuniones de proyecto) y extraer métricas estructuradas.

CAPACIDADES CLAVE:
1. Identificación de participantes a partir de nombres en timestamps
2. Detección contextual de blockers (no solo keywords)
3. Extracción de logros con impacto cuantificado
4. Análisis de sentimiento y engagement por segmento
5. Generación de scores basados en análisis holístico

IMPORTANTE:
- Usa el CONTEXTO completo, no solo palabras clave
- Considera la gravedad real de blockers (high = bloquea progreso actual)
- Identifica logros implícitos (métricas positivas, hitos alcanzados)
- Analiza la participación y dinámica del equipo
- Genera scores realistas basados en evidencia del contenido

FORMATO DE SALIDA:
JSON estructurado según el schema proporcionado.`;
  }

  private buildMetricsPrompt(request: SessionMetricsAnalysisRequest): string {
    const sentimentText = this.getSentimentText(request.overallSentiment);
    const confidenceText = (request.confidence * 100).toFixed(0);

    return `Analiza la siguiente transcripción de sesión de trabajo y extrae métricas estructuradas.

CONTEXTO:
- Cliente: ${request.clientName}
- Documento: ${request.documentName}
- Sentimiento general detectado: ${sentimentText}
- Confianza del análisis: ${confidenceText}%
${request.metadata?.channel ? `- Canal: ${request.metadata.channel}` : ''}

TRANSCRIPCIÓN:
"""
${request.transcript}
"""

INSTRUCCIONES DE ANÁLISIS:

1. PARTICIPANTES:
   - Extrae nombres únicos de las personas que hablan
   - Usa los timestamps como guía (ejemplo: "MAURICIO MARTINEZ YAÑEZ 1 minuto 29 segundos")

2. DURACIÓN:
   - Estima la duración en minutos basándote en timestamps o contenido

3. TEMAS DISCUTIDOS:
   - Identifica temas principales y clasifícalos:
     * "problem": Problemas, errores, blockers, impedimentos
     * "achievement": Logros, éxitos, métricas positivas (ej: "NPS sobrepasa 90")
     * "coordination": Asignación de tareas, seguimiento, coordinación
   - Estima porcentaje de tiempo por tema
   - Asigna sentiment (1-7, donde 1=muy negativo, 4=neutral, 7=muy positivo)

4. BLOCKERS:
   - Identifica impedimentos reales que afectan el progreso
   - Ejemplos: "falta de permisos", "no tenemos componentes habilitados"
   - Prioridad basada en impacto:
     * high: Bloquea trabajo actual o futuro inmediato
     * medium: Ralentiza pero no bloquea
     * low: Inconveniente menor
   - Incluye contexto explicativo

5. LOGROS:
   - Busca menciones de éxitos, hitos, métricas positivas
   - Ejemplos: "NPS sobrepasa 90 puntos", "disminución considerable de errores"
   - Evalúa impacto (high/medium/low)
   - Extrae métricas cuantitativas si están disponibles

6. ACTION ITEMS:
   - Identifica tareas asignadas o pendientes
   - Extrae asignee si se menciona
   - Determina prioridad basada en contexto

7. KEYWORDS:
   - Palabras clave más relevantes con frecuencia
   - Filtra stopwords comunes
   - Categoriza por tema

8. SCORES (0-100):
   - Productivity: Alto si hay logros concretos, bajo si solo problemas
   - Effectiveness: Basado en balance de temas y resolución
   - Engagement: Número de participantes, cantidad de discusión
   - ResolutionRate: Porcentaje estimado de problemas que se resolvieron o tienen plan

9. TIMELINE EMOCIONAL:
   - Identifica 3-5 puntos clave en la sesión
   - Marca cambios de sentimiento o eventos importantes
   - Estima timestamp en minutos desde inicio

Proporciona un análisis completo y basado en evidencia del contenido.`;
  }

  private getMetricsSchema(): any {
    return {
      type: 'object',
      properties: {
        participants: {
          type: 'array',
          items: { type: 'string' },
          description: 'Lista de participantes identificados',
        },
        durationMinutes: {
          type: 'number',
          description: 'Duración estimada en minutos',
        },
        topics: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              category: {
                type: 'string',
                enum: ['problem', 'achievement', 'coordination'],
              },
              topic: { type: 'string' },
              timePercentage: { type: 'number' },
              sentiment: { type: 'number' },
              mentions: { type: 'number' },
            },
            required: ['category', 'topic', 'timePercentage', 'sentiment', 'mentions'],
            additionalProperties: false,
          },
        },
        timeDistribution: {
          type: 'object',
          properties: {
            problemsPercentage: { type: 'number' },
            achievementsPercentage: { type: 'number' },
            coordinationPercentage: { type: 'number' },
          },
          required: ['problemsPercentage', 'achievementsPercentage', 'coordinationPercentage'],
          additionalProperties: false,
        },
        blockers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              description: { type: 'string' },
              priority: {
                type: 'string',
                enum: ['high', 'medium', 'low'],
              },
              context: { type: 'string' },
              status: {
                type: 'string',
                enum: ['active', 'resolved', 'pending'],
              },
              mentions: { type: 'number' },
            },
            required: ['description', 'priority', 'context', 'status', 'mentions'],
            additionalProperties: false,
          },
        },
        achievements: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              description: { type: 'string' },
              impact: {
                type: 'string',
                enum: ['high', 'medium', 'low'],
              },
              sentiment: { type: 'number' },
              metric: { type: 'string' },
              value: { type: 'number' },
            },
            required: ['description', 'impact', 'sentiment'],
            additionalProperties: false,
          },
        },
        actionItems: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              description: { type: 'string' },
              assignee: { type: 'string' },
              priority: {
                type: 'string',
                enum: ['high', 'medium', 'low'],
              },
              deadline: { type: 'string' },
            },
            required: ['description', 'priority'],
            additionalProperties: false,
          },
        },
        keywords: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              word: { type: 'string' },
              frequency: { type: 'number' },
              sentiment: { type: 'number' },
              category: { type: 'string' },
            },
            required: ['word', 'frequency', 'sentiment', 'category'],
            additionalProperties: false,
          },
        },
        scores: {
          type: 'object',
          properties: {
            productivity: { type: 'number' },
            effectiveness: { type: 'number' },
            engagement: { type: 'number' },
            resolutionRate: { type: 'number' },
          },
          required: ['productivity', 'effectiveness', 'engagement', 'resolutionRate'],
          additionalProperties: false,
        },
        emotionalTimeline: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              timestamp: { type: 'number' },
              sentiment: { type: 'number' },
              event: { type: 'string' },
              context: { type: 'string' },
              participants: {
                type: 'array',
                items: { type: 'string' },
              },
            },
            required: ['timestamp', 'sentiment', 'event', 'context'],
            additionalProperties: false,
          },
        },
        reasoning: { type: 'string' },
      },
      required: [
        'participants',
        'durationMinutes',
        'topics',
        'timeDistribution',
        'blockers',
        'achievements',
        'actionItems',
        'keywords',
        'scores',
        'emotionalTimeline',
      ],
      additionalProperties: false,
    };
  }

  private parseMetricsResponse(responseContent: string): SessionMetricsAnalysisResponse {
    try {
      const parsed = JSON.parse(responseContent);

      // Validaciones básicas
      this.validateMetricsResponse(parsed);

      return parsed as SessionMetricsAnalysisResponse;
    } catch (error) {
      console.error('Error parsing metrics response:', error);
      console.error('Response content:', responseContent);
      throw new Error('Failed to parse metrics response from OpenAI');
    }
  }

  private validateMetricsResponse(response: any): void {
    if (!Array.isArray(response.participants)) {
      throw new Error('Invalid metrics response: participants must be an array');
    }

    if (typeof response.durationMinutes !== 'number' || response.durationMinutes < 0) {
      throw new Error('Invalid metrics response: invalid duration');
    }

    if (!response.scores || typeof response.scores !== 'object') {
      throw new Error('Invalid metrics response: scores missing or invalid');
    }

    const { productivity, effectiveness, engagement, resolutionRate } = response.scores;

    if (
      [productivity, effectiveness, engagement, resolutionRate].some(
        (score) => typeof score !== 'number' || score < 0 || score > 100
      )
    ) {
      throw new Error('Invalid metrics response: scores must be between 0-100');
    }
  }

  // ==================== CONCLUSION ANALYSIS ====================

  private getConclusionSystemPrompt(): string {
    return `Eres un consultor estratégico senior especializado en análisis de reuniones de trabajo y generación de insights ejecutivos.

Tu expertise incluye:
1. Síntesis ejecutiva de sesiones complejas
2. Identificación de riesgos de negocio y técnicos
3. Detección de oportunidades comerciales y de mejora
4. Generación de planes de acción priorizados
5. Insights segmentados por audiencia (Account Manager, Equipo Técnico, Management)
6. Evaluación de clima y moral del equipo

ENFOQUE DE ANÁLISIS:
- Basado en evidencia: Todo insight debe tener fundamento en la transcripción o métricas
- Orientado a acción: Recomendaciones específicas y ejecutables
- Consciente del contexto: Sector bancario/tecnológico, relaciones cliente-proveedor
- Balanceado: Resalta tanto riesgos como oportunidades

AUDIENCIAS CLAVE:
1. Account Manager: Relación con cliente, satisfacción, oportunidades de negocio
2. Equipo Técnico: Aspectos técnicos, blockers, plan de trabajo
3. Management: Visión estratégica, estado general, decisiones necesarias

FORMATO DE SALIDA:
JSON estructurado según el schema proporcionado.`;
  }

  private buildConclusionPrompt(request: SessionConclusionAnalysisRequest): string {
    const sentimentText = this.getSentimentText(request.overallSentiment);
    const confidenceText = (request.confidence * 100).toFixed(0);

    return `Genera una conclusión ejecutiva y recomendaciones estratégicas para la siguiente sesión de trabajo.

CONTEXTO:
- Cliente: ${request.clientName}
- Documento: ${request.documentName}
- Sentimiento general: ${sentimentText}
- Confianza: ${confidenceText}%

MÉTRICAS CALCULADAS:
- Duración: ${request.metrics.duration} minutos
- Participantes: ${request.metrics.participantCount}
- Productividad: ${request.metrics.productivityScore}/100
- Efectividad: ${request.metrics.effectivenessScore}/100
- Engagement: ${request.metrics.engagementScore}/100
- Tasa de resolución: ${request.metrics.resolutionRate}%
- Blockers: ${request.metrics.blockers.length}
- Logros: ${request.metrics.achievements.length}

DISTRIBUCIÓN DE TIEMPO:
- Problemas: ${request.metrics.problemsTimePercentage}%
- Logros: ${request.metrics.achievementsTimePercentage}%
- Coordinación: ${request.metrics.coordinationTimePercentage}%

TRANSCRIPCIÓN COMPLETA:
"""
${request.transcript}
"""

INSTRUCCIONES DE ANÁLISIS:

1. RESUMEN EJECUTIVO (2-3 oraciones):
   - Resultado general de la sesión
   - Sentimiento predominante
   - Hallazgos clave

2. SCORE DE SATISFACCIÓN (0-100):
   - Basado en sentimiento, logros, resolución de problemas
   - Considera engagement y productividad

3. RIESGOS:
   - Identifica amenazas al proyecto/relación
   - Categoriza por nivel (high/medium/low)
   - Proporciona impacto específico
   - Sugiere recomendación accionable
   - Ejemplos: blockers no resueltos, baja productividad, tensiones

4. OPORTUNIDADES:
   - Detecta oportunidades de negocio o mejora
   - Ejemplos: alta satisfacción → upselling, logros → caso de éxito
   - Evalúa valor potencial y esfuerzo requerido

5. PLAN DE ACCIÓN:
   - Immediate (24-48h): Acciones urgentes, blockers high priority
   - Short-term (1 semana): Seguimientos, tareas pendientes
   - Continuous: Monitoreo, comunicación regular

6. INSIGHTS SEGMENTADOS:
   - For Account Manager: Estado de relación, satisfacción, oportunidades comerciales
   - For Technical Team: Aspectos técnicos, blockers, tareas asignadas
   - For Management: Visión estratégica, decisiones requeridas, estado general

7. CLIMA DEL EQUIPO (0-100):
   - Moral: Basado en sentimiento y tono de conversación
   - Collaboration: Nivel de participación e interacción
   - Proactivity: Iniciativa mostrada, propuestas de soluciones

8. RECOMENDACIONES:
   - 3-5 recomendaciones específicas y accionables
   - Basadas en hallazgos de la sesión

9. PRÓXIMOS PASOS:
   - 2-4 pasos concretos a seguir
   - Priorizados por importancia

Genera un análisis profundo, estratégico y accionable.`;
  }

  private getConclusionSchema(): any {
    return {
      type: 'object',
      properties: {
        executiveSummary: {
          type: 'string',
          description: 'Resumen ejecutivo de 2-3 oraciones',
        },
        satisfactionScore: {
          type: 'number',
          description: 'Score de satisfacción 0-100',
        },
        risks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              level: {
                type: 'string',
                enum: ['high', 'medium', 'low'],
              },
              description: { type: 'string' },
              impact: { type: 'string' },
              recommendation: { type: 'string' },
            },
            required: ['level', 'description', 'impact', 'recommendation'],
            additionalProperties: false,
          },
        },
        opportunities: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              description: { type: 'string' },
              potentialValue: { type: 'string' },
              priority: {
                type: 'string',
                enum: ['high', 'medium', 'low'],
              },
              effort: {
                type: 'string',
                enum: ['low', 'medium', 'high'],
              },
            },
            required: ['description', 'potentialValue', 'priority', 'effort'],
            additionalProperties: false,
          },
        },
        actionPlan: {
          type: 'object',
          properties: {
            immediate: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  description: { type: 'string' },
                  priority: {
                    type: 'string',
                    enum: ['high', 'medium', 'low'],
                  },
                },
                required: ['description', 'priority'],
                additionalProperties: false,
              },
            },
            shortTerm: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  description: { type: 'string' },
                  priority: {
                    type: 'string',
                    enum: ['high', 'medium', 'low'],
                  },
                },
                required: ['description', 'priority'],
                additionalProperties: false,
              },
            },
            continuous: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  description: { type: 'string' },
                  priority: {
                    type: 'string',
                    enum: ['high', 'medium', 'low'],
                  },
                },
                required: ['description', 'priority'],
                additionalProperties: false,
              },
            },
          },
          required: ['immediate', 'shortTerm', 'continuous'],
          additionalProperties: false,
        },
        insights: {
          type: 'object',
          properties: {
            forAccountManager: {
              type: 'array',
              items: { type: 'string' },
            },
            forTechnicalTeam: {
              type: 'array',
              items: { type: 'string' },
            },
            forManagement: {
              type: 'array',
              items: { type: 'string' },
            },
          },
          required: ['forAccountManager', 'forTechnicalTeam', 'forManagement'],
          additionalProperties: false,
        },
        teamClimate: {
          type: 'object',
          properties: {
            moral: { type: 'number' },
            collaboration: { type: 'number' },
            proactivity: { type: 'number' },
          },
          required: ['moral', 'collaboration', 'proactivity'],
          additionalProperties: false,
        },
        recommendations: {
          type: 'array',
          items: { type: 'string' },
        },
        nextSteps: {
          type: 'array',
          items: { type: 'string' },
        },
        reasoning: { type: 'string' },
      },
      required: [
        'executiveSummary',
        'satisfactionScore',
        'risks',
        'opportunities',
        'actionPlan',
        'insights',
        'teamClimate',
        'recommendations',
        'nextSteps',
      ],
      additionalProperties: false,
    };
  }

  private parseConclusionResponse(responseContent: string): SessionConclusionAnalysisResponse {
    try {
      const parsed = JSON.parse(responseContent);

      // Validaciones básicas
      this.validateConclusionResponse(parsed);

      return parsed as SessionConclusionAnalysisResponse;
    } catch (error) {
      console.error('Error parsing conclusion response:', error);
      console.error('Response content:', responseContent);
      throw new Error('Failed to parse conclusion response from OpenAI');
    }
  }

  private validateConclusionResponse(response: any): void {
    if (!response.executiveSummary || typeof response.executiveSummary !== 'string') {
      throw new Error('Invalid conclusion response: executive summary missing');
    }

    if (
      typeof response.satisfactionScore !== 'number' ||
      response.satisfactionScore < 0 ||
      response.satisfactionScore > 100
    ) {
      throw new Error('Invalid conclusion response: satisfaction score must be 0-100');
    }

    if (!response.teamClimate || typeof response.teamClimate !== 'object') {
      throw new Error('Invalid conclusion response: team climate missing');
    }

    const { moral, collaboration, proactivity } = response.teamClimate;

    if (
      [moral, collaboration, proactivity].some(
        (score) => typeof score !== 'number' || score < 0 || score > 100
      )
    ) {
      throw new Error('Invalid conclusion response: team climate scores must be 0-100');
    }

    if (!response.actionPlan || typeof response.actionPlan !== 'object') {
      throw new Error('Invalid conclusion response: action plan missing');
    }

    if (!response.insights || typeof response.insights !== 'object') {
      throw new Error('Invalid conclusion response: insights missing');
    }
  }

  // ==================== UTILITIES ====================

  private getSentimentText(sentiment: SentimentType): string {
    switch (sentiment) {
      case SentimentType.POSITIVE:
        return 'Positivo';
      case SentimentType.NEGATIVE:
        return 'Negativo';
      case SentimentType.NEUTRAL:
        return 'Neutral';
      default:
        return 'Desconocido';
    }
  }
}
