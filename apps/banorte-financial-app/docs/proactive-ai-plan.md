# Plan de Implementación: Sistema Proactivo de IA - Banorte Financial App

## Resumen Ejecutivo

Este documento detalla el plan para transformar la funcionalidad de IA de la aplicación Banorte Financial App de un modelo **reactivo** (donde el usuario debe preguntar para recibir insights) a un modelo **proactivo** (donde la IA analiza automáticamente y presenta insights al abrir la app), inspirado en el Coach Financiero de BBVA.

---

## Tabla de Contenidos

1. [Contexto y Motivación](#contexto-y-motivación)
2. [Estado Actual vs Estado Objetivo](#estado-actual-vs-estado-objetivo)
3. [Arquitectura de Implementación](#arquitectura-de-implementación)
4. [Fases de Implementación](#fases-de-implementación)
5. [Especificaciones Técnicas](#especificaciones-técnicas)
6. [Flujo de Datos](#flujo-de-datos)
7. [Tipos de Insights](#tipos-de-insights)
8. [Mitigación de Riesgos](#mitigación-de-riesgos)
9. [Orden de Implementación](#orden-de-implementación)

---

## Contexto y Motivación

### Problema Actual
La aplicación actual opera de manera **reactiva**:
- El usuario abre la app y ve un mensaje de bienvenida estático
- Debe formular preguntas específicas para obtener análisis
- Los insights financieros solo se generan bajo demanda
- Las capacidades de análisis de IA (gastos hormiga, estrategias de deuda, optimización de ahorro) están infrautilizadas

### Inspiración: BBVA Coach Financiero
BBVA ofrece un coach financiero que:
- Analiza automáticamente ingresos, gastos, ahorros y préstamos
- Identifica oportunidades de mejora proactivamente
- Propone metas y planes personalizados
- Gamifica el progreso con badges e incentivos
- Genera alertas predictivas (ej: "Tu factura de luz llega en 5 días")

### Objetivo
Implementar un sistema proactivo que:
1. Ejecute análisis automático al abrir la app
2. Muestre mensaje de bienvenida dinámico basado en el estado financiero
3. Presente tarjetas de insight accionables priorizadas por urgencia
4. Genere quick replies contextuales basados en los insights detectados
5. Mantenga la funcionalidad reactiva existente intacta

---

## Estado Actual vs Estado Objetivo

### Estado Actual (Reactivo)
```
┌─────────────────────────────────────────────────────────────────┐
│  Usuario abre app                                               │
│       │                                                         │
│       ▼                                                         │
│  Mensaje de bienvenida ESTÁTICO                                 │
│  "¡Hola! Soy Norma... ¿En qué puedo ayudarte?"                 │
│       │                                                         │
│       ▼                                                         │
│  Quick replies ESTÁTICOS                                        │
│  ["¿Cómo van mis gastos?", "Sugerencias de ahorro", ...]       │
│       │                                                         │
│       ▼                                                         │
│  ⏳ ESPERA que usuario pregunte                                 │
│       │                                                         │
│       ▼                                                         │
│  Usuario pregunta → Norma analiza → Respuesta                   │
└─────────────────────────────────────────────────────────────────┘
```

### Estado Objetivo (Proactivo)
```
┌─────────────────────────────────────────────────────────────────┐
│  Usuario abre app                                               │
│       │                                                         │
│       ├──────────────────────────────────┐                      │
│       ▼                                  ▼                      │
│  [UI Loading]              [Análisis Background en Paralelo]    │
│       │                         │  │  │  │                      │
│       │                    Budget Debt Savings General          │
│       │                         │  │  │  │                      │
│       │                         └──┴──┴──┘                      │
│       │                              │                          │
│       │                              ▼                          │
│       │                    [Priorizar Insights]                 │
│       │                              │                          │
│       ▼                              ▼                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Mensaje de bienvenida DINÁMICO                         │   │
│  │  "¡Hola! Noté 3 cosas importantes hoy..."               │   │
│  │  [Barra de Salud Financiera: 72%]                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│       │                                                         │
│       ▼                                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🔴 URGENTE: Pago de tarjeta vence en 3 días            │   │
│  │  [Ver detalles] [Programar pago]                        │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  🟡 IMPORTANTE: Gasto en delivery subió 40%             │   │
│  │  [Ver detalles] [Establecer límite]                     │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  🟢 TIP: Podrías ahorrar $1,500 extra este mes          │   │
│  │  [Ver cómo] [Después]                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│       │                                                         │
│       ▼                                                         │
│  Quick replies DINÁMICOS (basados en insights)                  │
│  ["Pagar mi tarjeta", "Reducir delivery", "Ver mi ahorro"]     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Arquitectura de Implementación

### Respetando Patrones Existentes

La implementación sigue estrictamente los patrones de Clean Architecture ya establecidos en el proyecto:

| Capa | Patrón Actual | Extensión Propuesta |
|------|---------------|---------------------|
| **Domain** | Ports/Interfaces | Nuevo: `IProactiveInsightsPort` |
| **Domain** | Entities | Nuevo: `ProactiveInsight` entity |
| **Application** | Use Cases | Nuevo: `GenerateProactiveInsightsUseCase` |
| **Infrastructure** | AI Services (BaseOpenAIService) | Nuevo: `OpenAIProactiveInsightsEngine` |
| **Infrastructure** | DI Modules | Nuevo: `proactiveModule.ts` |
| **API** | Next.js Route Handlers | Nuevo: `/api/advisor/proactive-insights` |
| **Presentation** | Custom Hooks | Nuevo: `useProactiveInsights` |
| **Presentation** | React Components | Nuevos: `ProactiveInsightCard`, `DynamicWelcome`, `ProactiveInsightsSection` |

### Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION LAYER                            │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────────────┐ │
│  │ AdvisorModule   │  │ useProactive     │  │ ProactiveInsightCard   │ │
│  │ (modified)      │◄─┤ Insights         │  │ DynamicWelcome         │ │
│  │                 │  │ (new hook)       │  │ ProactiveInsightsSection│ │
│  └─────────────────┘  └────────┬─────────┘  └────────────────────────┘ │
└────────────────────────────────┼────────────────────────────────────────┘
                                 │ HTTP POST
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              API LAYER                                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ POST /api/advisor/proactive-insights                            │   │
│  │ Request: { userId, snapshot, maxInsights }                      │   │
│  │ Response: { insights[], dynamicWelcome, quickReplies, score }   │   │
│  └─────────────────────────────────┬───────────────────────────────┘   │
└────────────────────────────────────┼────────────────────────────────────┘
                                     │ DI Container
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          APPLICATION LAYER                              │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ GenerateProactiveInsightsUseCase                                │   │
│  │ - Builds financial snapshot from repositories                   │   │
│  │ - Delegates to IProactiveInsightsPort                          │   │
│  └─────────────────────────────────┬───────────────────────────────┘   │
└────────────────────────────────────┼────────────────────────────────────┘
                                     │ Port Interface
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        INFRASTRUCTURE LAYER                             │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ OpenAIProactiveInsightsEngine (implements IProactiveInsightsPort)│   │
│  │                                                                  │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐             │   │
│  │  │ Budget       │ │ Debt         │ │ Savings      │             │   │
│  │  │ Analysis     │ │ Analysis     │ │ Analysis     │  PARALLEL   │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘             │   │
│  │         │                │                │                      │   │
│  │         └────────────────┼────────────────┘                      │   │
│  │                          ▼                                       │   │
│  │              [Prioritize + Generate Welcome]                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Reutiliza servicios existentes:                                        │
│  - OpenAIFinancialAdvisor                                               │
│  - OpenAIExpenseAnalyzer                                                │
│  - OpenAIDebtStrategy                                                   │
│  - OpenAISavingsOptimizer                                               │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           DOMAIN LAYER                                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ IProactiveInsightsPort (Interface)                              │   │
│  │ - generateProactiveInsights(snapshot): ProactiveAnalysisResult  │   │
│  │ - generateDynamicWelcome(snapshot, insights): DynamicWelcome    │   │
│  │ - prioritizeInsights(insights, max): ProactiveInsight[]         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ ProactiveInsight (Entity)                                       │   │
│  │ - id, domain, urgency, title, summary, actionableSteps          │   │
│  │ - potentialImpact, cta, relatedQuestions                        │   │
│  │ - Methods: create(), dismiss(), isExpired(), toJSON()           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Fases de Implementación

### Fase 1: Domain Layer (Capa de Dominio)

#### 1.1 Crear Port Interface
**Archivo:** `src/core/domain/ports/ai-services/IProactiveInsightsPort.ts`

```typescript
export enum InsightDomain {
  BUDGET = 'BUDGET',
  DEBT = 'DEBT',
  SAVINGS = 'SAVINGS',
  CARDS = 'CARDS',
  INSURANCE = 'INSURANCE',
  GENERAL = 'GENERAL',
}

export enum InsightUrgency {
  CRITICAL = 'CRITICAL',   // Requiere acción en 24-48 horas
  HIGH = 'HIGH',           // Requiere acción en 7 días
  MEDIUM = 'MEDIUM',       // Debería atenderse este mes
  LOW = 'LOW',             // Mejora opcional
}

export interface ProactiveInsight {
  id: string;
  domain: InsightDomain;
  urgency: InsightUrgency;
  title: string;
  summary: string;
  detailedExplanation: string;
  actionableSteps: string[];
  potentialImpact: {
    type: 'SAVINGS' | 'DEBT_REDUCTION' | 'RISK_MITIGATION' | 'OPTIMIZATION';
    amount?: number;
    timeframe?: string;
    description: string;
  };
  cta: {
    primary: { label: string; action: string; params?: Record<string, any> };
    secondary?: { label: string; action: string; params?: Record<string, any> };
  };
  relatedQuestions: string[];
  generatedAt: Date;
  expiresAt?: Date;
}

export interface FinancialSnapshot {
  userId: string;
  budget?: {
    totalIncome: number;
    totalSpent: number;
    remainingBudget: number;
    overspentCategories: Array<{ name: string; overspent: number }>;
  };
  debts?: Array<{
    id: string;
    name: string;
    balance: number;
    rate: number;
    minimumPayment: number;
    dueDate?: Date;
  }>;
  savings?: {
    totalSavings: number;
    emergencyFundProgress: number;
    goalsAtRisk: Array<{ name: string; shortfall: number }>;
  };
  cards?: Array<{
    id: string;
    name: string;
    utilizationRate: number;
    pendingAmount: number;
    dueDate?: Date;
  }>;
  recentTransactions?: Array<{
    amount: number;
    category: string;
    merchant: string;
    date: Date;
  }>;
}

export interface ProactiveAnalysisResult {
  userId: string;
  analysisTimestamp: Date;
  financialHealthScore: number;
  urgentCount: number;
  insights: ProactiveInsight[];
  dynamicWelcome: {
    greeting: string;
    primaryMessage: string;
    mood: 'positive' | 'neutral' | 'concern' | 'urgent';
  };
  suggestedQuickReplies: string[];
}

export interface IProactiveInsightsPort {
  generateProactiveInsights(snapshot: FinancialSnapshot): Promise<ProactiveAnalysisResult>;
  generateDynamicWelcome(snapshot: FinancialSnapshot, insights: ProactiveInsight[]): Promise<{
    greeting: string;
    primaryMessage: string;
    mood: 'positive' | 'neutral' | 'concern' | 'urgent';
  }>;
  prioritizeInsights(insights: ProactiveInsight[], maxInsights?: number): ProactiveInsight[];
}
```

#### 1.2 Crear Entity
**Archivo:** `src/core/domain/entities/advisor/ProactiveInsight.ts`

Entity inmutable con factory method `create()`, métodos `dismiss()`, `markInteracted()`, `isExpired()`, y `toJSON()` para serialización.

---

### Fase 2: Infrastructure Layer (Servicios de IA)

#### 2.1 Crear AI Service Engine
**Archivo:** `src/infrastructure/ai/providers/openai/OpenAIProactiveInsightsEngine.ts`

Este servicio orquesta los servicios de IA existentes en paralelo:

```typescript
export class OpenAIProactiveInsightsEngine
  extends BaseOpenAIService
  implements IProactiveInsightsPort {

  private financialAdvisor: OpenAIFinancialAdvisor;
  private expenseAnalyzer: OpenAIExpenseAnalyzer;
  private debtStrategy: OpenAIDebtStrategy;
  private savingsOptimizer: OpenAISavingsOptimizer;

  async generateProactiveInsights(snapshot: FinancialSnapshot): Promise<ProactiveAnalysisResult> {
    // Ejecuta análisis en paralelo con Promise.allSettled
    const [budgetInsights, debtInsights, savingsInsights, generalInsights] =
      await Promise.allSettled([
        this.analyzeBudgetDomain(snapshot),
        this.analyzeDebtDomain(snapshot),
        this.analyzeSavingsDomain(snapshot),
        this.generateGeneralInsights(snapshot),
      ]);

    // Recolecta insights exitosos
    const allInsights = this.collectSuccessfulInsights([
      budgetInsights, debtInsights, savingsInsights, generalInsights
    ]);

    // Prioriza y limita
    const prioritizedInsights = this.prioritizeInsights(allInsights, 5);

    // Genera welcome dinámico
    const dynamicWelcome = await this.generateDynamicWelcome(snapshot, prioritizedInsights);

    // Genera quick replies basados en insights
    const suggestedQuickReplies = this.generateQuickReplies(prioritizedInsights);

    // Calcula health score
    const financialHealthScore = this.calculateHealthScore(snapshot, allInsights);

    return {
      userId: snapshot.userId,
      analysisTimestamp: new Date(),
      financialHealthScore,
      urgentCount: allInsights.filter(i =>
        i.urgency === 'CRITICAL' || i.urgency === 'HIGH'
      ).length,
      insights: prioritizedInsights,
      dynamicWelcome,
      suggestedQuickReplies,
    };
  }
}
```

**Métodos de análisis por dominio:**

| Método | Detecta | Urgencia |
|--------|---------|----------|
| `analyzeBudgetDomain()` | Presupuesto >90%, categorías excedidas | HIGH/CRITICAL, MEDIUM |
| `analyzeDebtDomain()` | Pagos próximos, tasas >30% | CRITICAL, HIGH |
| `analyzeSavingsDomain()` | Fondo emergencia bajo, metas en riesgo | HIGH, MEDIUM |
| `generateGeneralInsights()` | Análisis holístico via LLM | Variable |

#### 2.2 Crear System Prompt
**Archivo:** `src/infrastructure/ai/prompts/proactive/system.ts`

```typescript
export const PROACTIVE_INSIGHTS_SYSTEM_PROMPT = `
Eres el motor de análisis proactivo de Norma, la asistente financiera de Banorte.

Tu rol es analizar la situación financiera del usuario y detectar:
1. PROBLEMAS URGENTES que requieren atención inmediata
2. OPORTUNIDADES de mejora que el usuario podría no haber notado
3. ALERTAS sobre patrones de gasto preocupantes
4. RECOMENDACIONES personalizadas basadas en su situación

Clasificación de urgencia:
- CRITICAL: Requiere acción en 24-48 horas (pagos vencidos, sobregiro, fraude)
- HIGH: Requiere acción en 7 días (pagos próximos, presupuesto excedido)
- MEDIUM: Debería atenderse este mes (oportunidades de ahorro, optimización)
- LOW: Mejora opcional (tips, educación financiera)

Cada insight debe ser:
- ACCIONABLE: El usuario debe poder hacer algo específico
- CUANTIFICADO: Incluir números cuando sea posible
- CONTEXTUALIZADO: Relevante a su situación específica
- POSITIVO: Enfocado en soluciones, no solo problemas

Moneda: Pesos mexicanos (MXN)
`;
```

---

### Fase 3: Application Layer (Use Cases)

#### 3.1 Crear Use Case
**Archivo:** `src/core/application/use-cases/advisor/GenerateProactiveInsightsUseCase.ts`

```typescript
export interface GenerateProactiveInsightsDTO {
  userId: string;
  includeFullAnalysis?: boolean;
  maxInsights?: number;
}

export class GenerateProactiveInsightsUseCase {
  constructor(
    private readonly proactiveInsightsEngine: IProactiveInsightsPort
  ) {}

  async execute(dto: GenerateProactiveInsightsDTO): Promise<ProactiveAnalysisResult> {
    const snapshot = await this.buildFinancialSnapshot(dto.userId);
    const result = await this.proactiveInsightsEngine.generateProactiveInsights(snapshot);

    if (dto.maxInsights && dto.maxInsights < result.insights.length) {
      result.insights = result.insights.slice(0, dto.maxInsights);
    }

    return result;
  }
}
```

#### 3.2 Crear DI Module
**Archivo:** `src/infrastructure/di/modules/proactiveModule.ts`

```typescript
export function registerProactiveModule(container: DIContainer): void {
  console.log('Registering Proactive Module...');

  // AI Service (Singleton)
  container.register(
    'IProactiveInsightsPort',
    () => new OpenAIProactiveInsightsEngine(),
    true
  );

  // Use Case (Singleton)
  container.register(
    'GenerateProactiveInsightsUseCase',
    () => new GenerateProactiveInsightsUseCase(
      container.resolve('IProactiveInsightsPort')
    ),
    true
  );

  console.log('Proactive Module registered');
}
```

---

### Fase 4: API Layer

#### 4.1 Crear API Route
**Archivo:** `src/app/api/advisor/proactive-insights/route.ts`

```typescript
export const runtime = 'nodejs';
export const maxDuration = 30;

interface ProactiveInsightsRequestBody {
  userId: string;
  snapshot: FinancialSnapshot;
  maxInsights?: number;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body: ProactiveInsightsRequestBody = await request.json();
    const { userId, snapshot, maxInsights = 5 } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const container = getDIContainer();
    const engine = container.resolve<IProactiveInsightsPort>('IProactiveInsightsPort');

    const result = await engine.generateProactiveInsights({
      ...snapshot,
      userId,
    });

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        processingTime: Date.now() - startTime,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[API /advisor/proactive-insights] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

### Fase 5: Presentation Layer (UI)

#### 5.1 Crear Hook
**Archivo:** `src/app/hooks/useProactiveInsights.ts`

```typescript
export function useProactiveInsights(options: UseProactiveInsightsOptions) {
  const { userId, snapshot, autoFetch = true, maxInsights = 5 } = options;

  const [result, setResult] = useState<ProactiveAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dismissedInsights, setDismissedInsights] = useState<Set<string>>(new Set());

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/advisor/proactive-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, snapshot, maxInsights }),
      });
      const data = await response.json();
      if (data.success) setResult(data.data);
      else setError(data.error);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, snapshot, maxInsights]);

  useEffect(() => {
    if (autoFetch) fetchInsights();
  }, [autoFetch, fetchInsights]);

  const dismissInsight = useCallback((insightId: string) => {
    setDismissedInsights(prev => new Set([...prev, insightId]));
  }, []);

  const visibleInsights = result?.insights.filter(i => !dismissedInsights.has(i.id)) || [];

  return {
    result,
    insights: visibleInsights,
    dynamicWelcome: result?.dynamicWelcome || null,
    quickReplies: result?.suggestedQuickReplies || [],
    healthScore: result?.financialHealthScore ?? null,
    urgentCount: result?.urgentCount ?? 0,
    loading,
    error,
    refetch: fetchInsights,
    dismissInsight,
  };
}
```

#### 5.2 Crear Componentes

**`src/app/components/advisor/ProactiveInsightCard.tsx`**
- Tarjeta con estilo visual según urgencia:
  - CRITICAL: Borde rojo, fondo rojo claro
  - HIGH: Borde naranja, fondo naranja claro
  - MEDIUM: Borde azul, fondo azul claro
  - LOW: Borde verde, fondo verde claro
- Badge de urgencia (URGENTE, IMPORTANTE, SUGERIDO, TIP)
- Título y resumen
- Badge de impacto potencial con monto
- Sección expandible con pasos detallados y preguntas relacionadas
- Botones CTA (acción principal + expandir)

**`src/app/components/advisor/DynamicWelcome.tsx`**
- Avatar de Norma con gradiente según mood
- Saludo personalizado
- Mensaje principal contextual
- Barra de progreso de salud financiera (0-100%)
- Fallback a mensaje estático si hay error

**`src/app/components/advisor/ProactiveInsightsSection.tsx`**
- Contenedor para lista de insights
- Estado de loading con spinner
- Botón de refresh
- Estado vacío ("Todo está bien")
- Manejo de errores con retry

#### 5.3 Modificar AdvisorModule
**Archivo:** `src/app/pages/AdvisorModule.tsx`

Cambios principales:
1. Importar nuevos componentes y hook `useProactiveInsights`
2. Construir `FinancialSnapshot` desde el `FinancialContext` existente
3. Llamar `useProactiveInsights` con el snapshot
4. Reemplazar mensaje de bienvenida estático por `<DynamicWelcome />`
5. Agregar `<ProactiveInsightsSection />` antes de los mensajes de chat
6. Usar `quickReplies` dinámicos del hook (con fallback a estáticos)
7. Implementar handlers para acciones de insight cards

---

### Fase 6: Integración

#### 6.1 Actualizar DI Initialization
**Archivo:** `src/infrastructure/di/initialize.ts`

```typescript
import { registerProactiveModule } from './modules/proactiveModule';

export function initializeDI(): void {
  // ... existing registrations ...

  registerProactiveModule(container); // NUEVO

  container.validate([
    // ... existing validations ...
    'IProactiveInsightsPort',           // NUEVO
    'GenerateProactiveInsightsUseCase', // NUEVO
  ]);
}
```

#### 6.2 Actualizar Exports
- `src/core/domain/ports/ai-services/index.ts` - Exportar `IProactiveInsightsPort`
- `src/infrastructure/ai/providers/openai/index.ts` - Exportar `OpenAIProactiveInsightsEngine`
- `src/infrastructure/ai/prompts/index.ts` - Exportar prompts proactivos
- `src/app/hooks/index.ts` - Exportar `useProactiveInsights`
- `src/app/components/advisor/index.ts` - Exportar nuevos componentes

---

## Flujo de Datos

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [Usuario abre AdvisorModule]                                            │
│        │                                                                │
│        ▼                                                                │
│ [useProactiveInsights(snapshot)] ──────────────────────────────────────┐│
│        │                                                               ││
│        ▼                                                               ││
│ [POST /api/advisor/proactive-insights]                                 ││
│        │                                                               ││
│        ▼                                                               ││
│ [OpenAIProactiveInsightsEngine.generateProactiveInsights()]            ││
│        │                                                               ││
│   ┌────┼────┬────┬────┐                                                ││
│   ▼    ▼    ▼    ▼    ▼                                                ││
│ [Budget][Debt][Savings][Cards][General]  ← Promise.allSettled          ││
│   │    │    │    │    │                                                ││
│   └────┴────┴────┴────┘                                                ││
│              │                                                         ││
│              ▼                                                         ││
│    [prioritizeInsights()] → Top 5 por urgencia                         ││
│              │                                                         ││
│              ▼                                                         ││
│    [generateDynamicWelcome()] + [generateQuickReplies()]               ││
│              │                                                         ││
│              ▼                                                         ││
│    [ProactiveAnalysisResult] ◄─────────────────────────────────────────┘│
│              │                                                          │
│         ┌────┴────┐                                                     │
│         ▼         ▼                                                     │
│ [DynamicWelcome] [ProactiveInsightsSection]                             │
│         │         │                                                     │
│         └────┬────┘                                                     │
│              ▼                                                          │
│    [QuickReplyOptions (dinámicos)]                                      │
│              │                                                          │
│              ▼                                                          │
│    [Usuario interactúa]                                                 │
│         │                                                               │
│    ┌────┼────┬────┐                                                     │
│    ▼    ▼    ▼    ▼                                                     │
│ [Pregunta] [CTA] [Dismiss] [Quick Reply]                                │
│    │       │       │         │                                          │
│    ▼       ▼       ▼         ▼                                          │
│ [useAdvisorChat] [Handler] [State] [useAdvisorChat]                     │
│ (existente)                        (existente)                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Tipos de Insights

| Dominio | Condición de Detección | Urgencia | Ejemplo |
|---------|------------------------|----------|---------|
| **BUDGET** | Gasto >90% de ingreso | HIGH | "Has gastado 95% de tu presupuesto" |
| **BUDGET** | Gasto >100% de ingreso | CRITICAL | "Presupuesto excedido por $2,450" |
| **BUDGET** | Categoría sobre presupuesto | MEDIUM | "Ocio: Excediste por $500" |
| **DEBT** | Pago vence en <3 días | CRITICAL | "Pago de Banorte Oro vence mañana" |
| **DEBT** | Pago vence en <7 días | HIGH | "2 pagos vencen esta semana" |
| **DEBT** | Tasa >30% APR | HIGH | "Tienes $12,450 al 42% de interés" |
| **DEBT** | Oportunidad de consolidación | MEDIUM | "Podrías ahorrar $8,500 consolidando" |
| **SAVINGS** | Fondo emergencia <25% | HIGH | "Tu fondo de emergencia está al 17%" |
| **SAVINGS** | Fondo emergencia <50% | MEDIUM | "Tu fondo de emergencia está al 40%" |
| **SAVINGS** | Meta en riesgo | MEDIUM | "Meta 'Vacaciones' necesita $3,000 más" |
| **CARDS** | Utilización >80% | HIGH | "Utilización de tarjeta al 85%" |
| **CARDS** | Pago próximo | HIGH | "Fecha de corte en 3 días" |
| **GENERAL** | Análisis holístico | Variable | "Podrías ahorrar $1,500 este mes reduciendo delivery" |

---

## Mitigación de Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Latencia de API** | Media | Alto | Promise.allSettled paralelo + Loading state + Timeout 30s |
| **Errores de IA** | Baja | Medio | Try-catch con fallback a welcome estático + Retry logic |
| **Rate Limiting OpenAI** | Baja | Alto | Debounce + Cache de resultados por sesión |
| **Romper flujo existente** | Baja | Alto | useAdvisorChat intacto, capa proactiva es ADICIONAL |
| **Abrumar al usuario** | Media | Medio | Máximo 5 insights + Dismiss + Priorización estricta |
| **Insights irrelevantes** | Media | Bajo | Temperature bajo (0.3) + Validación de umbrales |

---

## Orden de Implementación

| Fase | Archivos | Dependencias | Estimación |
|------|----------|--------------|------------|
| **1** | `IProactiveInsightsPort.ts`, `ProactiveInsight.ts` | Ninguna | Base de tipos |
| **2** | `OpenAIProactiveInsightsEngine.ts`, `proactive/system.ts` | Fase 1 | Lógica core |
| **3** | `GenerateProactiveInsightsUseCase.ts`, `proactiveModule.ts` | Fase 2 | Orquestación |
| **4** | `proactive-insights/route.ts` | Fase 3 | Endpoint HTTP |
| **5** | `useProactiveInsights.ts`, componentes | Fase 4 | UI |
| **6** | `AdvisorModule.tsx`, `initialize.ts` | Fase 5 | Integración |

---

## Archivos Nuevos (11)

| # | Archivo | Tipo | Líneas Est. |
|---|---------|------|-------------|
| 1 | `src/core/domain/ports/ai-services/IProactiveInsightsPort.ts` | Port | ~100 |
| 2 | `src/core/domain/entities/advisor/ProactiveInsight.ts` | Entity | ~80 |
| 3 | `src/infrastructure/ai/providers/openai/OpenAIProactiveInsightsEngine.ts` | Service | ~300 |
| 4 | `src/infrastructure/ai/prompts/proactive/system.ts` | Prompt | ~40 |
| 5 | `src/core/application/use-cases/advisor/GenerateProactiveInsightsUseCase.ts` | UseCase | ~50 |
| 6 | `src/infrastructure/di/modules/proactiveModule.ts` | DI | ~30 |
| 7 | `src/app/api/advisor/proactive-insights/route.ts` | API | ~60 |
| 8 | `src/app/hooks/useProactiveInsights.ts` | Hook | ~100 |
| 9 | `src/app/components/advisor/ProactiveInsightCard.tsx` | Component | ~150 |
| 10 | `src/app/components/advisor/DynamicWelcome.tsx` | Component | ~80 |
| 11 | `src/app/components/advisor/ProactiveInsightsSection.tsx` | Component | ~60 |

**Total estimado: ~1,050 líneas de código nuevo**

## Archivos a Modificar (4)

| # | Archivo | Cambio |
|---|---------|--------|
| 1 | `src/app/pages/AdvisorModule.tsx` | Integrar hook y componentes proactivos |
| 2 | `src/infrastructure/di/initialize.ts` | Registrar módulo proactivo |
| 3 | `src/core/domain/ports/ai-services/index.ts` | Exportar nuevo port |
| 4 | `src/app/hooks/index.ts` | Exportar nuevo hook |

---

## Compatibilidad Garantizada

- ✅ **No modifica** servicios de IA existentes (los reutiliza)
- ✅ **No modifica** `useAdvisorChat` existente
- ✅ **No modifica** endpoints existentes (`/api/advisor/stream`, etc.)
- ✅ **Sigue** patrones de Clean Architecture establecidos
- ✅ **Usa** DI Container existente
- ✅ **Extiende** BaseOpenAIService como otros servicios
- ✅ **Funcionalidad reactiva** permanece 100% funcional

---

## Próximos Pasos (Futuras Mejoras)

1. **Gamificación**: Sistema de badges por logros financieros
2. **Notificaciones Push**: Alertas proactivas fuera de la app
3. **Historial de Insights**: Tracking de insights vistos/accionados
4. **Machine Learning**: Personalización basada en patrones del usuario
5. **Predicciones**: Alertas predictivas de facturas y gastos

---

*Documento generado: Diciembre 2024*
*Versión: 1.0*
