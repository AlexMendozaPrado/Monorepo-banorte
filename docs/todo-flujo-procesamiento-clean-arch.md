# TODO — Refactor del flujo de loading con `ProcessingChecklist` (Clean Architecture + Hexagonal)

> **Estado**: pendiente. Discutido y pausado durante implementación de F2 del plan de tests pre-MVP (commit `545b684`).
> **Contexto origen**: el usuario reportó que el loading state implementado en F2 usa solo el botón con spinner, pero hay una página `/procesamiento` con el componente `ProcessingChecklist` que **existe en el repo pero nunca se navega a ella** desde el flujo real (tiene mock data hardcodeada). Quería conectarla.

## Estado actual del código (post-F2)

- `UploadCard.tsx:451-462` — botón con `isLoading={isLoading}` que renderiza `<Loader2 className="animate-spin" />` (fix Bug 1 ya aplicado).
- `app/procesamiento/page.tsx` — página standalone con mock data, **desconectada del flow**.
- `presentation/components/ProcessingChecklist.tsx` — componente presentacional completo: progress bar, lista de transacciones con status (`completed`/`processing`/`pending`), `currentStepDetail`. Solo usado por `/procesamiento` con datos falsos.
- `infrastructure/matrix-parser/ExcelMatrixParser.ts` — parser de matriz Excel server-side, completo. Usa `xlsx@0.18.5` (ya dependencia del proyecto).

## Problema a resolver

El usuario quiere que durante el `fetch` a `/api/certificacion/validar`:

1. El form se oculte y aparezca `ProcessingChecklist` con la **lista real** de transacciones que el usuario cargó (no genérica).
2. Se respete la arquitectura **Clean + Hexagonal** del proyecto.
3. La separación de responsabilidades quede limpia: `UploadCard` = form, otro componente = loading view, otro = orquestación.

**Limitación técnica**: el endpoint `validar` es **atómico** — no hay streaming/SSE. El progreso por transacción debe ser **simulado** (animación temporal), no real.

## Diseño aprobado (refactor)

### Mapeo a las 4 capas

```
┌─────────────────────────────────────────────────────────────────────┐
│ DOMAIN (core/domain/)                                               │
│ ├── ports/MatrixPreviewParserPort.ts          NUEVO                 │
│ │   └─ interface { parsePreview(file: File): Promise<Preview[]> }   │
│ └── value-objects/MatrixTransactionPreview.ts NUEVO                 │
│     └─ { referencia: string, tipo: TransactionType, marca: CardBrand }│
└─────────────────────────────────────────────────────────────────────┘
                              ▲ depende de
┌─────────────────────────────────────────────────────────────────────┐
│ APPLICATION (core/application/)                                     │
│ └── use-cases/PrepareCertificationFlowUseCase.ts  NUEVO             │
│     ├─ inyecta: MatrixPreviewParserPort                             │
│     ├─ input: { matrizFile, integrationType, ... }                  │
│     └─ output: { transactions: Preview[], formData: FormData }      │
│ Coordina: parsea preview + arma FormData. NO fetcha (eso es UI).    │
└─────────────────────────────────────────────────────────────────────┘
                              ▲ implementa
┌─────────────────────────────────────────────────────────────────────┐
│ INFRASTRUCTURE (infrastructure/)                                    │
│ └── matrix-parser/BrowserMatrixPreviewParser.ts   NUEVO             │
│     ├─ implements MatrixPreviewParserPort                           │
│     ├─ usa xlsx@0.18.5 directo en el navegador                      │
│     └─ reutiliza COLUMN_MAPPINGS de ExcelMatrixParser existente     │
└─────────────────────────────────────────────────────────────────────┘
                              ▲ depende de (DI)
┌─────────────────────────────────────────────────────────────────────┐
│ PRESENTATION (presentation/ + app/)                                 │
│ ├── components/                                                     │
│ │   ├── UploadCard.tsx                  REFACTOR                    │
│ │   │   └─ Solo form. Prop onSubmit(formData). Sin fetch.           │
│ │   ├── CertificationInProgressView.tsx NUEVO                       │
│ │   │   └─ Wrapper de ProcessingChecklist con simulación progreso   │
│ │   └── ProcessingChecklist.tsx         SIN CAMBIOS                 │
│ ├── hooks/useCertificationFlow.ts       NUEVO                       │
│ │   └─ Orchestra: useCase → fetch → router. Stateful.               │
│ └── app/nueva-certificacion/page.tsx    REFACTOR                    │
│     └─ Container: usa useCertificationFlow + render condicional     │
└─────────────────────────────────────────────────────────────────────┘
```

### Por qué respeta la arquitectura

| Principio | Cómo se cumple |
|---|---|
| **Dependency rule** | Domain no depende de nada. Application depende solo de Domain. Infrastructure implementa puertos del Domain. Presentation depende de Application via DI. |
| **Puerto explícito** | `MatrixPreviewParserPort` es el contrato. La presentación no conoce `BrowserMatrixPreviewParser` directo — recibe el puerto via DI. |
| **Hexagonal — adapters reemplazables** | Si mañana queremos parsear preview server-side (Server Action), creamos `ServerMatrixPreviewParser` con la misma interface. Solo cambia DIContainer. |
| **Single Responsibility** | UploadCard: form. ProgressView: visualización loading. UseCase: orquestación. Parser: parsing. |
| **Reutilización** | `ExcelMatrixParser` existente puede compartir `COLUMN_MAPPINGS` con `BrowserMatrixPreviewParser` sin duplicar código. |

## Plan de sub-fases (F2.1 → F2.8, cada una = 1 commit)

```
F2.1 (S) - Domain: MatrixPreviewParserPort + MatrixTransactionPreview VO + tests
F2.2 (S) - Infrastructure: BrowserMatrixPreviewParser + tests con fixtures reales
F2.3 (S) - Application: PrepareCertificationFlowUseCase + tests con mock del puerto
F2.4 (M) - Presentation: useCertificationFlow hook + tests con renderHook
F2.5 (M) - Presentation: refactor UploadCard (solo form) + actualizar tests F2 existentes
F2.6 (S) - Presentation: CertificationInProgressView + tests RTL con fake timers
F2.7 (S) - Presentation: refactor NuevaCertificacionPage container + tests RTL
F2.8 (S) - Cleanup: decidir destino de /procesamiento page (eliminar / showcase)
```

## Tests por capa (resumen)

| Capa | Test runner | Mocks típicos | Fixtures |
|---|---|---|---|
| Domain (VO) | Jest | ninguno | ninguno |
| Application (UseCase) | Jest | mock del puerto inyectado | ninguno |
| Infrastructure (Parser) | Jest | ninguno | `.xlsx` reales de bundles |
| Presentation (Component) | Jest + RTL | mock de callbacks/props | ninguno |
| Presentation (Hook) | Jest + renderHook | mock use case + fetch + router | ninguno |
| Presentation (Page) | Jest + RTL | mock del hook entero | ninguno |
| E2E | Cypress | `cy.intercept` para fetch | bundles reales |

## Cuándo retomarlo

Después de cerrar el plan de tests pre-MVP (al menos las fases P0 — F1, F2, F3, F3.5, F3.6, F5.5, F5.6). El refactor de flujo no es bloqueante para MVP — el loading state actual (botón con spinner) es funcional. Lo que aporta este refactor:

- Loading state visual rico (lista real de transacciones que el usuario cargó).
- Arquitectura más limpia (separación de responsabilidades).
- Test surface mejor definida (5 suites pequeñas vs 1 grande).
- Página `/procesamiento` se conecta o se elimina (cleanup).

## Ejemplo concreto de uso post-refactor

```tsx
// app/nueva-certificacion/page.tsx (container minimal)
'use client';

export default function NuevaCertificacionPage() {
  const flow = useCertificationFlow();

  if (flow.mode === 'uploading') {
    return (
      <CertificationInProgressView
        transactions={flow.transactions}
        integrationType={flow.integrationType}
        merchantName={flow.merchantName}
      />
    );
  }

  return <UploadCard onSubmit={flow.start} error={flow.error} />;
}
```

```ts
// presentation/hooks/useCertificationFlow.ts
export function useCertificationFlow() {
  const router = useRouter();
  const useCase = useMemo(() => container.prepareCertificationFlow, []);
  const [state, setState] = useState<{mode: 'idle'|'uploading'|'error', ...}>({...});

  const start = async (formInputs) => {
    const { transactions, formData } = await useCase.execute(formInputs);
    setState({ mode: 'uploading', transactions, ... });

    const res = await fetch('/api/certificacion/validar', { method: 'POST', body: formData });
    const data = await res.json();
    if (!data.success) {
      setState({ mode: 'error', error: data.error });
      return;
    }
    router.push(`/resultados/${data.data.id}`);
  };

  return { ...state, start };
}
```

## Notas para la próxima sesión

- Verificar que `xlsx` se puede importar client-side en Next.js sin warnings (probable: sí, ya está en deps directos del bundle).
- Decidir si `ExcelMatrixParser` server-side y `BrowserMatrixPreviewParser` client-side comparten una clase abstracta o solo helpers de mapping de columnas.
- Para `CertificationInProgressView` con simulación de progreso, considerar si el `setInterval` debe pausar al alcanzar 90% (esperando response) o seguir incrementando lento. Sugerencia: pausar en 90% para no llegar al 100% antes de tiempo, y saltar a 100% cuando llega la response.
- Confirmar UX de `/procesamiento` standalone: si se elimina, agregar redirect 301 en `next.config.js` por si hay bookmarks externos.
