# Proactive Insights - Roadmap de Pendientes

## Estado Actual

El sistema de **Insights Proactivos** está implementado con la siguiente arquitectura:

```
Capa                    Archivo                                  Estado
─────────────────────────────────────────────────────────────────────────
Dominio                 ProactiveInsight.ts                      ✅ Completo
                        IProactiveInsightsPort.ts                ✅ Completo

Aplicación              GenerateProactiveInsightsUseCase.ts      ✅ Completo

Infraestructura         OpenAIProactiveInsightsEngine.ts         ✅ Completo
                        proactiveInsightsModule.ts               ✅ Completo

API                     /api/advisor/proactive-insights          ✅ Completo

Presentación            useModuleInsights.ts                     ✅ Completo
                        ProactiveInsightCard.tsx                 ✅ Completo
                        ModuleInsightsSection.tsx                ✅ Completo

Integración             BudgetModule.tsx                         ✅ Integrado
                        SavingsModule.tsx                        ✅ Integrado
                        DebtModule.tsx                           ✅ Integrado
```

---

## Pendientes por Implementar

### 1. Sistema de Modales Dinámicos (Alta Prioridad)

**Ubicación de TODOs:**
- `BudgetModule.tsx:176` - `TODO: Implement action handling (navigate, api-call, modal)`
- `SavingsModule.tsx:101` - `TODO: Implement action handling`
- `DebtModule.tsx:138` - `TODO: Implement action handling`

**Descripción:**
Los insights generan acciones ejecutables pero actualmente solo hacen `console.log`.
Se requiere implementar un sistema que maneje las acciones de tipo:
- `navigate` - Redirigir a otra sección
- `modal` - Abrir un modal con contexto
- `api-call` - Ejecutar una acción en el backend
- `external` - Abrir enlace externo
- `dismiss` - Ya implementado

**Enfoque Propuesto: Provider Pattern + Registry Pattern**

```
src/app/
├── context/
│   └── ModalContext.tsx       # Provider + hook useModal()
├── components/
│   └── modals/
│       ├── ModalContainer.tsx # Renderiza modal activo
│       ├── registry.ts        # Mapeo nombre → componente
│       └── types.ts           # Tipado de payloads
```

**Modales a registrar (detectados en payloads de insights):**

| Modal ID               | Componente Existente    | Acción                           |
|------------------------|-------------------------|----------------------------------|
| `CategoryEdit`         | CategoryModal           | Ajustar presupuesto de categoría |
| `CategoryLimit`        | (Nuevo)                 | Establecer límite de categoría   |
| `GoalEdit`             | GoalModal               | Modificar meta de ahorro         |
| `GoalCreate`           | GoalModal               | Crear nueva meta                 |
| `GoalSimulation`       | (Nuevo)                 | Ver proyección de meta           |
| `SavingRuleWizard`     | SavingRuleWizard        | Crear regla de ahorro            |
| `PaymentModal`         | PaymentModal            | Registrar pago de deuda          |
| `ConsolidationSimulator` | (Nuevo)               | Simular consolidación de deudas  |
| `ExtraPaymentWizard`   | (Nuevo)                 | Distribuir pagos extra           |

**API del hook propuesto:**
```typescript
const { openModal, closeModal } = useModal();

// Desde un insight action:
openModal('SavingRuleWizard', {
  prefill: { category: 'Café', amount: 500 },
  onComplete: () => refetchInsights()
});
```

**Beneficios:**
- Desacoplamiento entre módulos y modales
- Type-safety con payloads tipados
- Extensible (agregar modal = agregar al registry)
- Los insights pueden abrir cualquier modal sin importarlo

---

### 2. Contexto Financiero Global (Media Prioridad)

**Ubicación de TODO:**
- `SavingsModule.tsx:27` - `TODO: Obtener de contexto financiero real`

**Descripción:**
Actualmente `monthlyIncome` y `monthlyExpenses` están hardcodeados:
```typescript
const monthlyIncome = 30000; // TODO: Obtener de contexto financiero real
const monthlyExpenses = 18000;
```

**Solución propuesta:**
Crear un `FinancialContext` que provea datos financieros del usuario:
```typescript
const { income, expenses, netWorth } = useFinancialContext();
```

---

### 3. Navegación con Highlight (Baja Prioridad)

**Descripción:**
Algunos payloads de navegación incluyen `highlight`:
```typescript
{ path: '/presupuestos', highlight: 'categoria-id' }
{ path: '/ahorros', highlight: 'goal-id' }
```

Se requiere:
1. Scroll automático al elemento
2. Animación de highlight temporal
3. Query param `?highlight=id` para deep linking

---

### 4. Persistencia de Insights (Futuro)

**Descripción:**
Actualmente los insights se generan on-demand. Para mejorar UX:
- Cache de insights en backend
- Invalidación al cambiar datos financieros
- Historial de insights descartados por el usuario

---

## Archivos Relacionados

```
apps/banorte-financial-app/src/
├── app/
│   ├── api/advisor/proactive-insights/route.ts
│   ├── components/insights/
│   │   ├── index.ts
│   │   ├── ModuleInsightsSection.tsx
│   │   └── ProactiveInsightCard.tsx
│   ├── hooks/useModuleInsights.ts
│   └── pages/
│       ├── BudgetModule.tsx
│       ├── SavingsModule.tsx
│       └── DebtModule.tsx
├── core/
│   ├── application/use-cases/advisor/GenerateProactiveInsightsUseCase.ts
│   └── domain/
│       ├── entities/advisor/ProactiveInsight.ts
│       └── ports/ai-services/IProactiveInsightsPort.ts
└── infrastructure/
    ├── ai/providers/openai/OpenAIProactiveInsightsEngine.ts
    └── di/modules/proactiveInsightsModule.ts
```

---

## Notas de Implementación

- El sistema actual **no rompe la arquitectura Clean Architecture**
- Los modales existentes siguen funcionando sin cambios
- La migración al sistema de modales dinámicos es opcional y gradual
- No se requieren dependencias adicionales (usa React Context nativo)
