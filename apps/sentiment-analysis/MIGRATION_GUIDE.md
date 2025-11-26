# Guía de Migración: Análisis con IA para Sesiones

Esta guía explica cómo se ha refactorizado el sistema de análisis de sesiones para usar IA en lugar de lógica hardcodeada.

## ¿Qué Ha Cambiado?

### Antes (Lógica Hardcodeada)

```typescript
// SessionMetricsService - Análisis determinístico
const productivityScore = 50 + (sentiment === POSITIVE ? 20 : -10);
if (blockers.length > 3) productivityScore -= 15;

// Detección de blockers por keywords
if (line.includes('blocker') || line.includes('problema')) {
  blockers.push({ description: line, priority: 'medium' });
}
```

**Problemas:**
- ❌ Keywords fijos no capturan contexto
- ❌ Umbrales hardcodeados (60, 80, etc.)
- ❌ No detecta intención o gravedad real
- ❌ Pesos manuales que requieren ajuste constante

### Después (Análisis con IA)

```typescript
// SessionMetricsService - Análisis con LLM
const response = await aiAnalyzer.analyzeMetrics({
  transcript: documentContent,
  overallSentiment: analysis.overallSentiment,
  confidence: analysis.confidence,
  clientName: 'Banorte',
  documentName: 'CelulaMiercoles.pdf'
});

// LLM entiende contexto:
// "no tenemos permisos para GCP" → blocker HIGH (bloquea trabajo)
// "NPS sobrepasa 90 puntos" → achievement HIGH con metric=NPS, value=90
```

**Ventajas:**
- ✅ Análisis contextual completo
- ✅ Detecta intención y gravedad real
- ✅ Extrae métricas cuantitativas
- ✅ Se adapta automáticamente a nuevos formatos

## Arquitectura Refactorizada

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
│                                                              │
│  ┌────────────────────┐      ┌──────────────────────────┐  │
│  │SessionMetricsService│      │SessionConclusionService │  │
│  │                     │      │                          │  │
│  │ - generateWithAI() │      │ - generateWithAI()       │  │
│  │ - generateWithRules│      │ - generateWithRules()    │  │
│  └────────────────────┘      └──────────────────────────┘  │
│           ↓                              ↓                  │
└───────────│──────────────────────────────│──────────────────┘
            │                              │
┌───────────│──────────────────────────────│──────────────────┐
│           ↓          Domain Layer        ↓                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         SessionAnalysisPort (Interface)             │   │
│  │                                                      │   │
│  │  + analyzeMetrics(request): MetricsResponse         │   │
│  │  + analyzeConclusion(request): ConclusionResponse   │   │
│  │  + isReady(): boolean                                │   │
│  │  + getModelInfo(): ModelInfo                         │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────────────│────────────────────────────┘
                               │
                               │ implements
                               ↓
┌─────────────────────────────────────────────────────────────┐
│                 Infrastructure Layer                         │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │          OpenAISessionAnalyzer                        │  │
│  │                                                        │  │
│  │  - GPT-4o / GPT-4 Turbo                               │  │
│  │  - Structured Outputs (JSON Schema)                   │  │
│  │  - Prompts especializados para transcripciones       │  │
│  │  - Validación de respuestas                           │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │          SessionAnalyzerFactory                        │  │
│  │                                                        │  │
│  │  + create(config): SessionAnalysisPort                │  │
│  │  + createFromEnv(): SessionAnalysisPort               │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Estrategia: AI-First con Fallback

Ambos services usan la misma estrategia:

```typescript
async calculateSessionMetrics(analysis: SentimentAnalysis): Promise<SessionMetrics> {
  // 1. Intentar con IA (si está disponible)
  if (this.aiAnalyzer) {
    try {
      const aiMetrics = await this.generateWithAI(analysis);
      return await this.metricsRepository.save(aiMetrics);
    } catch (error) {
      console.warn('AI failed, using rule-based approach:', error);
      // Continuar al fallback
    }
  }

  // 2. Fallback: Lógica basada en reglas
  const ruleBasedMetrics = await this.generateWithRules(analysis);
  return await this.metricsRepository.save(ruleBasedMetrics);
}
```

**Beneficios:**
- ✅ **Graceful Degradation**: Si la IA falla, sigue funcionando
- ✅ **Backward Compatible**: Código existente no se rompe
- ✅ **Opcional**: AI es opt-in via dependency injection

## Cambios en Services

### SessionMetricsService

**Constructor:**
```diff
  constructor(
    private metricsRepository: SessionMetricsRepositoryPort,
+   private aiAnalyzer?: SessionAnalysisPort  // Nuevo parámetro opcional
  ) {}
```

**Nuevos Métodos:**
- `generateWithAI()`: Usa LLM para análisis
- `mapAIResponseToMetrics()`: Mapea respuesta a entity
- `generateWithRules()`: Lógica original (renombrado)

### SessionConclusionService

**Constructor:**
```diff
  constructor(
    private conclusionRepository: SessionConclusionRepositoryPort,
-   private aiAnalyzer?: SentimentAnalyzerPort  // Viejo port
+   private aiAnalyzer?: SessionAnalysisPort    // Nuevo port
  ) {}
```

**Cambios:**
- `generateWithAI()`: Ahora realmente usa el AI analyzer (antes era stub)
- Elimina `buildAIPrompt()`: El prompt está en el analyzer

## Configuración

### Opción 1: Variables de Entorno

```bash
# .env
SESSION_ANALYZER_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
SESSION_ANALYZER_MAX_TOKENS=16000
SESSION_ANALYZER_TEMPERATURE=0.3
```

```typescript
import { SessionAnalyzerFactory } from './infrastructure/session-analysis';

const analyzer = SessionAnalyzerFactory.createFromEnv();
```

### Opción 2: Configuración Manual

```typescript
import { SessionAnalyzerFactory } from './infrastructure/session-analysis';

const analyzer = SessionAnalyzerFactory.create({
  provider: 'openai',
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiModel: 'gpt-4o',
  maxTokens: 16000,
  temperature: 0.3,
});
```

### Opción 3: Dependency Injection Container

```typescript
// infrastructure/di/DIContainer.ts
import { SessionAnalysisPort } from '../../core/domain/ports/SessionAnalysisPort';
import { SessionAnalyzerFactory } from '../session-analysis/SessionAnalyzerFactory';

export class DIContainer {
  private static sessionAnalyzer?: SessionAnalysisPort;

  static getSessionMetricsService(): SessionMetricsService {
    if (!this.sessionMetricsService) {
      const repository = this.getSessionMetricsRepository();
      const aiAnalyzer = this.getSessionAnalyzer(); // Opcional

      this.sessionMetricsService = new SessionMetricsService(
        repository,
        aiAnalyzer  // Si es undefined, usa reglas
      );
    }
    return this.sessionMetricsService;
  }

  static getSessionConclusionService(): SessionConclusionService {
    if (!this.sessionConclusionService) {
      const repository = this.getSessionConclusionRepository();
      const aiAnalyzer = this.getSessionAnalyzer(); // Opcional

      this.sessionConclusionService = new SessionConclusionService(
        repository,
        aiAnalyzer  // Si es undefined, usa reglas
      );
    }
    return this.sessionConclusionService;
  }

  private static getSessionAnalyzer(): SessionAnalysisPort | undefined {
    if (!this.sessionAnalyzer) {
      try {
        // Intenta crear desde env
        this.sessionAnalyzer = SessionAnalyzerFactory.createFromEnv();
      } catch (error) {
        console.warn('Session analyzer not available, will use rule-based approach:', error);
        return undefined; // Graceful degradation
      }
    }
    return this.sessionAnalyzer;
  }
}
```

## Uso

### Caso de Uso Típico

```typescript
import { DIContainer } from './infrastructure/di/DIContainer';

// 1. Analizar sentimiento (como antes)
const analysisUseCase = DIContainer.getAnalyzeSentimentUseCase();
const analysis = await analysisUseCase.execute({
  text: transcriptionContent,
  clientName: 'Banorte',
  documentName: 'CelulaMiercoles.pdf',
  channel: 'meeting',
});

// 2. Calcular métricas (ahora usa IA automáticamente si está disponible)
const metricsService = DIContainer.getSessionMetricsService();
const metrics = await metricsService.calculateSessionMetrics(analysis);

// 3. Generar conclusión (ahora usa IA automáticamente si está disponible)
const conclusionService = DIContainer.getSessionConclusionService();
const conclusion = await conclusionService.generateConclusion(analysis, metrics);

console.log('Métricas calculadas por IA:', metrics);
console.log('Conclusión generada por IA:', conclusion);
```

## Ejemplo de Salida

### Input (Transcripción)
```
Leonardo: NPS sobrepasa 90 puntos, muy satisfactorio
Alex: no tenemos permisos para configurar componentes en GCP
Karla: me llevo el comentario para resolver
```

### Output del LLM (Métricas)
```json
{
  "participants": ["Leonardo", "Alex", "Karla"],
  "achievements": [{
    "description": "NPS del cliente supera los 90 puntos",
    "impact": "high",
    "metric": "NPS",
    "value": 90
  }],
  "blockers": [{
    "description": "Falta de permisos para configurar componentes en GCP",
    "priority": "high",
    "context": "Impide configuración necesaria para desarrollo"
  }],
  "scores": {
    "productivity": 65,
    "effectiveness": 70,
    "engagement": 85,
    "resolutionRate": 50
  }
}
```

### Output del LLM (Conclusión)
```json
{
  "executiveSummary": "Sesión positiva con logro destacado en NPS (90 puntos), pero bloqueada por falta de permisos en GCP que requiere atención inmediata.",
  "risks": [{
    "level": "high",
    "description": "Blocker de permisos en GCP",
    "impact": "Retrasa desarrollo y pruebas",
    "recommendation": "Escalar con equipo de seguridad para resolver en 24h"
  }],
  "opportunities": [{
    "description": "NPS excepcional - oportunidad de caso de éxito",
    "potentialValue": "Marketing y referencias",
    "priority": "high",
    "effort": "low"
  }],
  "satisfactionScore": 75
}
```

## Testing

### Mockear el Analyzer

```typescript
// __tests__/SessionMetricsService.test.ts
import { SessionAnalysisPort } from '../domain/ports/SessionAnalysisPort';

const mockAnalyzer: SessionAnalysisPort = {
  async analyzeMetrics(req) {
    return {
      participants: ['Test User'],
      durationMinutes: 30,
      topics: [],
      // ... mock data
    };
  },
  async analyzeConclusion(req) {
    return {
      executiveSummary: 'Mock summary',
      // ... mock data
    };
  },
  async isReady() {
    return true;
  },
  getModelInfo() {
    return {
      name: 'mock',
      provider: 'test',
      capabilities: []
    };
  },
};

const service = new SessionMetricsService(repository, mockAnalyzer);
```

## Rollback Plan

Si necesitas volver a la lógica anterior:

```typescript
// Opción 1: No pasar aiAnalyzer
const service = new SessionMetricsService(repository);
// Automáticamente usa generateWithRules()

// Opción 2: Modificar DIContainer
private static getSessionAnalyzer(): SessionAnalysisPort | undefined {
  return undefined; // Forzar uso de reglas
}
```

## Performance y Costos

### Latencia
- **Con IA**: 3-8 segundos por análisis completo
- **Sin IA (reglas)**: <100ms

### Costos (GPT-4o)
- Análisis de métricas: ~$0.03-0.08
- Análisis de conclusión: ~$0.04-0.10
- **Total por sesión**: ~$0.05-0.15

### Recomendaciones
- Usa IA para sesiones importantes/clientes clave
- Usa reglas para análisis masivo/batch
- Configura timeout apropiado (recomendado: 30s)

## Troubleshooting

### Error: "AI analyzer not available"
```bash
# Verifica variables de entorno
echo $OPENAI_API_KEY
echo $SESSION_ANALYZER_PROVIDER

# Verifica conectividad
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models
```

### Error: "Session metrics analysis failed"
```typescript
// Los logs mostrarán el error específico
// El sistema automáticamente usa fallback a reglas
```

### Scores fuera de rango
```typescript
// El analyzer valida automáticamente
// Si falla validación, lanza error y usa fallback
```

## Próximos Pasos

1. **Monitoreo**: Agregar métricas de uso de IA vs reglas
2. **Cache**: Cachear análisis de sesiones similares
3. **Fine-tuning**: Afinar modelo para dominio específico
4. **Ollama**: Implementar provider local para reducir costos
5. **Streaming**: Implementar respuestas en streaming para mejor UX

## Soporte

Para preguntas o problemas:
- Revisa `infrastructure/session-analysis/README.md`
- Consulta ejemplos en tests
- Revisa logs de fallback para debugging
