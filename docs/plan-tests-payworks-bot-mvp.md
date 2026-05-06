# Plan — Cobertura de tests pre-MVP payworks-bot

> **Branch sugerida**: `test/payworks-bot-mvp-coverage`
> **Fecha**: 2026-05-06
> **Origen**: PR #26 mergeado (documentación v3.0) + reporte de 2 bugs en producción
> **Sesión de ejecución**: pendiente — este plan se ejecuta en otra sesión

## Contexto

Tras cerrar la documentación v3.0 del aplicativo, el usuario reportó 2 bugs críticos en `/nueva-certificacion` que el safety net actual no detectó antes de la entrega del MVP:

1. **No se ve loading state al iniciar certificación** — el endpoint `POST /api/certificacion/validar` puede tardar varios segundos pero la UI no muestra spinner ni overlay durante el procesamiento.
2. **El botón se tiene que seleccionar dos veces para lanzar la certificación** — el primer click no produce efecto visible; el segundo dispara la request.

Una auditoría de cobertura (subagente Plan, 2026-05-06) reveló que **ambos bugs son detectables con tests existentes que no se escribieron**, además de identificar gaps mayores en otras capas. Este plan propone un orden de ejecución por fases atómicas para cerrar esa brecha antes de liberar MVP.

## Diagnóstico de los 2 bugs

### Bug 1 — Loading state ausente

**Causa raíz**: `UploadCard.tsx:451-454` usa solo `disabled={isLoading}` y cambio de texto al hacer click; nunca pasa la prop `isLoading` al `<Button>` de `@banorte/ui`. El Button de la librería **sí soporta** `isLoading` y renderiza `<Loader2 className="animate-spin" />` (`packages/ui/src/components/Button/Button.tsx:31,49`), pero está desactivado por omisión de la prop.

**Resultado visual**: el usuario ve un botón ligeramente más oscuro (`disabled:opacity-50`), texto cambia a "Procesando...", pero **sin spinner ni indicador progresivo**. Si el procesamiento tarda 3+ segundos la página parece congelada.

**Fix sugerido (separado, no entra en este plan de tests)**: pasar `isLoading={isLoading}` al `<Button>`. Opcional: redirigir a `/procesamiento` con `<ProcessingChecklist />` como overlay.

### Bug 2 — Doble click necesario

**Hipótesis principal (alta confianza)**: focus-stealing entre los inputs de coordinador/lenguaje/etc. (`UploadCard.tsx:257-303`) y el botón. El primer `mousedown` del botón roba el foco del input activo en lugar de disparar el `onClick`. Combinado con que `<Button>` no usa `type="button"` explícito ni `onMouseDown` con `preventDefault`, el primer click queda consumido por el blur del input.

**Hipótesis secundaria**: backend devuelve error en el primer click → `setError(...)` + `setIsLoading(false)` → usuario ve error y vuelve a hacer click; no es "doble click obligatorio" sino "primer click falló silenciosamente".

**Fix sugerido**: agregar `type="button"` explícito al `<Button>` y/o convertir el handler en `<form onSubmit={handleSubmit}>` con `<button type="submit">`. Forzar `inputRef.blur()` antes del fetch.

## Orden de ejecución

```
P0 — Bloqueantes MVP (cubren los 2 bugs + flujo carta completo):
  Fase 1 → Fase 2 → Fase 3 (loading state + idempotencia primer click)
                  ↓
  Fase 3.5 → Fase 3.6 (happy path carta .docx + RTL ResultadosPage)

Alto riesgo (capas críticas):
  Fase 4 → Fase 5 → Fase 5.5 → Fase 5.6 (use case + renderer + API carta)
                                ↓
                                Fase 6 (otras API routes)

Cobertura amplia:
  Fase 7 → Fase 8 → Fase 9

Infraestructura:
  Fase 10 (coverage gates en CI)
```

**Cada fase = 1 commit autocontenido** (type-check + tests verdes antes de cerrar). Las fases **1, 2, 3, 3.5, 3.6, 5.5 y 5.6** son **bloqueantes para MVP**; las demás se pueden priorizar según riesgo percibido.

---

## Fase 1 — Setup React Testing Library + helpers de test

**Tamaño**: S · **Depende de**: nada · **Bloqueante MVP**: sí (habilita Fases 2 y 7)

**Por qué**: el repo tiene `@testing-library/react` en `devDependencies` pero no hay `jest.setup.js` cargando `@testing-library/jest-dom` ni helper para mockear `next/navigation`. Sin esto, ningún test de componente puede rendear sin errores.

**Cambios**:
- `apps/payworks-bot/jest.setup.js` — confirmar/agregar `import '@testing-library/jest-dom'`.
- `apps/payworks-bot/jest.config.js` — verificar `testEnvironment: 'jsdom'` para tests `.test.tsx`.
- `apps/payworks-bot/__tests__/utils/renderWithRouter.tsx` (nuevo) — wrapper que monta el componente con un mock de `useRouter`, `useParams`, `useSearchParams`. Usar `next-router-mock` o stub manual.
- `apps/payworks-bot/__tests__/utils/mockNextNavigation.ts` (nuevo) — `jest.mock('next/navigation', () => ({...}))` reusable.

**Commit**: `test(payworks-bot): setup RTL + helpers de mock para next/navigation`

---

## Fase 2 — Tests RTL para UploadCard (cubre Bug 1 + Bug 2)

**Tamaño**: M · **Depende de**: Fase 1 · **Bloqueante MVP**: sí

**Por qué**: `UploadCard.tsx` es el componente más crítico de UI (459 líneas, contiene los 2 bugs reportados) y tiene 0 cobertura. Tests RTL atrapan los 2 bugs y previenen regresiones futuras.

**Cambios**:
- `apps/payworks-bot/__tests__/unit/components/UploadCard.test.tsx` (nuevo).
- Setup: mock `fetch`, `cy/router.push`, helper `setupRequiredFields()`.

**Tests obligatorios**:

| # | Test | Bug que detecta |
|---|---|---|
| 2.1 | `muestra spinner Loader2 mientras la request está en vuelo` | Bug 1 |
| 2.2 | `cambia texto a "Procesando..." durante el fetch` | Bug 1 |
| 2.3 | `botón queda disabled durante el fetch` | Bug 1 |
| 2.4 | `un solo click dispara fetch una sola vez` (con `fetchSpy`) | Bug 2 |
| 2.5 | `foco previo en input de coordinador no impide que primer click dispare submit` | Bug 2 |
| 2.6 | `muestra error en banner si backend responde {success: false, error}` | regresión |
| 2.7 | `navega a /resultados/:id en éxito` | regresión |
| 2.8 | `valida campos requeridos antes de enviar (matriz, csv en modo semi)` | regresión |
| 2.9 | `selección condicional de logs 3DS/Cybersource según producto` | regresión |

**Commit**: `test(payworks-bot): RTL para UploadCard cubre loading state y doble click (P0)`

---

## Fase 3 — Cypress E2E adicional para UI states

**Tamaño**: M · **Depende de**: Fase 1 · **Bloqueante MVP**: sí

**Por qué**: jsdom no captura focus-stealing exacto del navegador. E2E real con Cypress + `cy.intercept` con delay artificial es la única forma confiable de validar el loading state visible y la idempotencia del primer click en producción.

**Cambios**:
- `apps/payworks-bot/__tests__/cypress/e2e/05-ui-states.cy.ts` (nuevo).
- `apps/payworks-bot/__tests__/cypress/support/commands.ts` — extender con `cy.fillCertificationForm()` para reusar setup.

**Tests obligatorios**:

| # | Test | Detalle |
|---|---|---|
| 3.1 | `loading state visible con delay artificial` | `cy.intercept` con `delay: 2000` → assert `[data-testid="submit-certification"]` `.should('be.disabled')` y contiene `svg.animate-spin` |
| 3.2 | `un solo click es suficiente para lanzar certificación` | `cy.intercept` sin alias `cy.wait` con timeout corto (5s) → si requiere doble click falla |
| 3.3 | `mensaje de error se renderiza si backend devuelve 400` | `cy.intercept` con `statusCode: 400` → assert error visible en banner |
| 3.4 | `transición a /resultados/:id en éxito` | mock id, assert `cy.url()` |
| 3.5 | `selector de laboratorio cambia el folio esperado en submit` | si está implementado en UI |

**Commit**: `test(payworks-bot): cypress E2E loading + idempotencia primer click (P0)`

---

## Fase 3.5 — E2E Cypress: Happy path de generación de carta `.docx`

**Tamaño**: M · **Depende de**: Fase 3 · **Bloqueante MVP**: sí (la carta es el output principal del producto)

**Por qué**: el spec actual `04-bundle-3ds-cybersource.cy.ts` solo cubre el **gate P8 negativo** (sesión RECHAZADA → botón disabled + endpoint 409). **El flujo positivo nunca se ejecuta**: con sesión APROBADA, click en botón, descarga del `.docx`, verificación de headers, validación del filename con folio. Como no existe bundle APROBADO en los fixtures, hay que mockear la respuesta del endpoint `validar` con `cy.intercept`.

**Cambios**:
- `apps/payworks-bot/__tests__/cypress/e2e/09-carta-docx-flow.cy.ts` (nuevo).
- `apps/payworks-bot/__tests__/cypress/support/commands.ts` — extender con `cy.mockApprovedSession(sessionId)` que intercepta `POST /api/certificacion/validar` retornando un `CertificationResponse` con todas las transacciones APROBADAS y `verdict: "APROBADO"`.

**Tests obligatorios**:

| # | Test | Detalle |
|---|---|---|
| 3.5.1 | `botón Descargar Carta Oficial está habilitado cuando veredicto es APROBADO` | Mock APROBADO → assert `[data-testid="download-carta-docx"]` `.should('not.be.disabled')` |
| 3.5.2 | `click sin notas adicionales abre /api/certificacion/carta/:id sin query param` | `cy.intercept` captura request → assert `req.url` no contiene `?notas=` |
| 3.5.3 | `click con 2 notas en textarea abre endpoint con ?notas=...URL-encoded` | Escribir 2 líneas en textarea → click → assert `req.url` contiene `?notas=` con valores codificados |
| 3.5.4 | `notas vacías o solo whitespace se filtran` | Escribir `\n  \n  \nnota válida\n` → query param solo trae `nota válida` |
| 3.5.5 | `endpoint responde 200 con Content-Type wordprocessingml + filename con folio` | `cy.request` directo al endpoint → assert headers |
| 3.5.6 | `filename del Content-Disposition matches el folio mostrado en la UI` | Capturar folio de `[data-testid="folio-label"]` y comparar con response |

**Commit**: `test(payworks-bot): cypress E2E happy path de generación de carta .docx (P0)`

---

## Fase 3.6 — RTL para ResultadosPage flow de carta + notas adicionales

**Tamaño**: M · **Depende de**: Fase 1

**Por qué**: el componente `app/resultados/[id]/page.tsx` controla el flow de carta (textarea de notas, botón habilitado/deshabilitado según veredicto, construcción de query param). Hoy 0 cobertura unit y solo cobertura E2E parcial.

**Cambios**:
- `apps/payworks-bot/__tests__/unit/app/resultados-page.test.tsx` (nuevo).

**Tests obligatorios**:

| # | Test |
|---|---|
| 3.6.1 | `con session APROBADA: botón Descargar Carta Oficial está habilitado` |
| 3.6.2 | `con session RECHAZADA: botón disabled + tooltip explicativo` |
| 3.6.3 | `con session PENDIENTE: botón disabled` |
| 3.6.4 | `textarea actualiza estado en cada cambio` |
| 3.6.5 | `click en botón con notas vacías llama window.open(/api/.../carta/:id) sin ?notas=` |
| 3.6.6 | `click con 2 notas separadas por \n llama window.open con ?notas=URL-encoded` |
| 3.6.7 | `notas con whitespace solo se filtran antes de construir el URL` |
| 3.6.8 | `card "Notas adicionales" no aparece si veredicto != APROBADO` (si aplica este comportamiento UX) |
| 3.6.9 | `card de transacciones renderiza por cada result en session.results` |

**Commit**: `test(payworks-bot): RTL para ResultadosPage cubre flow de carta y notas`

---

## Fase 4 — Tests unit para RunCertificationUseCase

**Tamaño**: L · **Depende de**: nada · **Bloqueante MVP**: alto riesgo

**Por qué**: `RunCertificationUseCase` es el orquestador principal del aplicativo. Hoy solo se valida vía 4 specs E2E con bundles canónicos. **No hay tests unit para edge cases**: matriz vacía, integrationType inválido, AGP sin afiliaciones, modo `auto` sin conexión, fallo del FolioGenerator, edge cases del Cybersource correlator.

**Cambios**:
- `apps/payworks-bot/__tests__/unit/use-cases/RunCertificationUseCase.test.ts` (nuevo).
- Mock de los puertos del DIContainer (`certificationRepository`, `transactionRepository`, `afiliacionRepository`, parsers, validators).

**Tests prioritarios**:

| # | Test |
|---|---|
| 4.1 | `matriz vacía → veredicto PENDIENTE` |
| 4.2 | `integrationType desconocido → throw con mensaje claro` |
| 4.3 | `AGP esperado pero afiliaciones ausentes → fail con failReason específico` |
| 4.4 | `mode auto sin conexión a Vercel Postgres → fallback a InMemory` (cuando aplique) |
| 4.5 | `FolioGenerator devuelve PENDIENTE-... → folio se propaga sin throw` |
| 4.6 | `RateLimitValidator se ejecuta solo en Cargos Periódicos` |
| 4.7 | `An5822FlowDetector se ejecuta solo en transacciones MC` |
| 4.8 | `cross-rules C1-C14 se ejecutan en orden esperado` |
| 4.9 | `gate P8: si veredicto != APROBADO no se invoca FolioGenerator (ahorro de secuencia)` |

**Commit**: `test(payworks-bot): unit tests RunCertificationUseCase con 9 edge cases`

---

## Fase 5 — Tests unit para infrastructure crítica

**Tamaño**: M · **Depende de**: nada

**Por qué**: 5 archivos de infrastructure sin tests unit, todos críticos:
- `DocxCertificationLetterRenderer` — output legal del producto
- `InMemoryTransactionRepository.loadFromCSV` — parsing crítico
- `InMemoryCertificationRepository`, `InMemoryAfiliacionRepository` — almacenamiento de sesión
- `MandatoryFieldsConfig` (parcial) — carga de los 14 JSONs runtime

**Cambios**:
- `apps/payworks-bot/__tests__/unit/infrastructure/DocxCertificationLetterRenderer.test.ts` (nuevo).
- `apps/payworks-bot/__tests__/unit/infrastructure/InMemoryTransactionRepository.test.ts` (nuevo).
- `apps/payworks-bot/__tests__/unit/infrastructure/InMemoryCertificationRepository.test.ts` (nuevo).
- `apps/payworks-bot/__tests__/unit/infrastructure/InMemoryAfiliacionRepository.test.ts` (nuevo).

**Tests prioritarios para DocxCertificationLetterRenderer**:
- `genera Buffer válido a partir de CertificationLetterData mínima`
- `loop filasMatriz clona N filas para N transacciones`
- `loop manualesUtilizados respeta capas activas (3DS, Cybersource)`
- `loop notasAdicionales filtra strings vacíos del query param`
- `nullGetter devuelve string vacío en lugar de "{undefined}"`
- `Buffer resultante es ZIP válido (`Zip archive data, made by v2.0`)`

**Commit**: `test(payworks-bot): unit tests DocxRenderer + 3 repos in-memory`

---

## Fase 5.5 — Integration test del renderer `.docx` con verificación de contenido

**Tamaño**: M · **Depende de**: Fase 5 (DocxRenderer básico) · **Bloqueante MVP**: sí

**Por qué**: la Fase 5 valida que `DocxCertificationLetterRenderer.generateBuffer()` produce un Buffer válido. Pero **no valida el contenido sustituido**: que los 28 placeholders quedaron poblados, que el loop `filasMatriz` clonó N filas para N transacciones, que `manualesUtilizados` refleja las capas activas, que `notasAdicionales` se inyectaron en el orden correcto. Sin esto, una refactorización podría romper silenciosamente el formato del entregable legal.

**Cambios**:
- `apps/payworks-bot/__tests__/integration/regression/CartaDocxContent.test.ts` (nuevo).

**Helper compartido**:
```ts
// __tests__/utils/inspectDocx.ts
import PizZip from 'pizzip';
export function extractDocxText(buffer: Buffer): string {
  const zip = new PizZip(buffer);
  const xml = zip.file('word/document.xml').asText();
  return xml.replace(/<[^>]+>/g, ' '); // strip tags
}
export function findUnsubstitutedPlaceholders(buffer: Buffer): string[] {
  const text = extractDocxText(buffer);
  return [...text.matchAll(/\{[^}]{1,40}\}/g)].map(m => m[0]);
}
export function countTableRows(buffer: Buffer, tableMatcher: RegExp): number {
  const zip = new PizZip(buffer);
  const xml = zip.file('word/document.xml').asText();
  const tables = xml.match(/<w:tbl\b[\s\S]*?<\/w:tbl>/g) || [];
  const matriz = tables.find(t => tableMatcher.test(t));
  return matriz ? (matriz.match(/<w:tr\b/g) || []).length : 0;
}
```

**Tests obligatorios**:

| # | Test |
|---|---|
| 5.5.1 | `con CertificationLetterData mínimo: 0 placeholders sin sustituir (`{xxx}` no aparece en document.xml)` |
| 5.5.2 | `loop filasMatriz: 1 transacción → 2 rows (header + 1 data); 5 transacciones → 6 rows` |
| 5.5.3 | `loop filasMatriz: 0 transacciones → 1 row (solo header)` |
| 5.5.4 | `loop manualesUtilizados con 3DS+CS detectados → 3 manuales (producto + 3DSecure + Cybersource)` |
| 5.5.5 | `loop manualesUtilizados sin capas extras → 1 manual (solo producto)` |
| 5.5.6 | `loop notasAdicionales con array vacío → ningún bullet de nota` |
| 5.5.7 | `loop notasAdicionales con 2 strings → 2 bullets en la sección Notas` |
| 5.5.8 | `tabla "Matriz de pruebas" preserva bordes rojos en cada fila clonada` (verificar `<w:tcBorders>` con color `ff0000` en cada cell de cada row) |
| 5.5.9 | `texto del folio aparece en cuerpo del documento (CERTIFICADO {codigo})` |
| 5.5.10 | `firma hardcoded "Dulce María Rivera Luna" + "Soporte Técnico Payworks"` |
| 5.5.11 | `título de portada incluye sufijos correctos (CON 3D SECURE, CON CYBERSOURCE) según capas detectadas` |

---

## Fase 5.6 — API route `/api/certificacion/carta/[id]` integration test

**Tamaño**: M · **Depende de**: Fase 5.5 · **Bloqueante MVP**: sí

**Por qué**: el endpoint orquesta múltiples piezas (gate P8, build de `CertificationLetterData` desde `session`, `FolioGenerator`, renderer). Hoy solo el caso 409 está cubierto E2E. Necesitamos validar:
- 200 con sesión APROBADA → headers correctos
- 404 si sessionId no existe
- Query param `?notas=...` se parsea correctamente (split `\n`, trim, filter empty)
- `?format=pdf` ya no responde (legacy eliminado)

**Cambios**:
- `apps/payworks-bot/__tests__/integration/regression/CartaApiRoute.test.ts` (nuevo).
- Setup: helper `setupApprovedSession(container, integrationType)` que crea una sesión APROBADA en memoria con N transactions PASS.

**Tests obligatorios**:

| # | Test |
|---|---|
| 5.6.1 | `GET /api/certificacion/carta/:id con session APROBADA → 200 + Content-Type wordprocessingml + filename folio.docx` |
| 5.6.2 | `GET /api/certificacion/carta/:id con session RECHAZADA → 409 + body { success: false, verdict: 'RECHAZADO', error: contiene "APROBADA" }` |
| 5.6.3 | `GET /api/certificacion/carta/:id con session PENDIENTE → 409` |
| 5.6.4 | `GET /api/certificacion/carta/no-existe-id → 404 + body { success: false, error: "Certificación no encontrada" }` |
| 5.6.5 | `GET /api/certificacion/carta/:id?notas=Nota+1%0ANota+2 → response body contiene "Nota 1" y "Nota 2" como bullets` |
| 5.6.6 | `GET /api/certificacion/carta/:id?notas= (vacío) → response body sin sección de notas adicionales` |
| 5.6.7 | `GET /api/certificacion/carta/:id?format=pdf → ignora el query param y devuelve .docx` (verificar que el legacy jsPDF está realmente eliminado) |
| 5.6.8 | `filename del Content-Disposition usa el folio generado por FolioGenerator del laboratorio + producto + capas correcto` |

**Commit**: `test(payworks-bot): integration tests carta endpoint + verificación de contenido docx (P0)`

---

## Fase 6 — Tests unit para API routes restantes

**Tamaño**: M · **Depende de**: nada

**Por qué**: 4 API routes sin tests unit. La capa de transporte falla silenciosa cuando el backend devuelve `{success: false}` (visto en Bug 2 hipótesis secundaria).

**Cambios**:
- `apps/payworks-bot/__tests__/unit/api/validar-route.test.ts` (nuevo).
- `apps/payworks-bot/__tests__/unit/api/historial-route.test.ts` (nuevo).
- `apps/payworks-bot/__tests__/unit/api/carta-route.test.ts` (nuevo).
- `apps/payworks-bot/__tests__/unit/api/health-route.test.ts` (nuevo).

**Tests prioritarios**:
- `validar`: matriz ausente → 400; integrationType inválido → 400; éxito con bundle válido → 200 con `success: true, data: CertificationResponse`.
- `historial`: lista vacía inicial → `{success: true, data: []}`; tras run → 1+ entries.
- `carta`: gate P8 con sesión RECHAZADA → 409; APROBADA → 200 con `Content-Type: docx` y filename con folio; sesión inexistente → 404.
- `health`: 200 OK con `{ok: true}`.

**Commit**: `test(payworks-bot): unit tests para 4 API routes (validar, historial, carta, health)`

---

## Fase 7 — Tests RTL para componentes UI restantes

**Tamaño**: M · **Depende de**: Fase 1

**Por qué**: 7 componentes UI sin tests, regresiones visuales/comportamentales no detectadas.

**Cambios**:
- `__tests__/unit/components/Header.test.tsx` (nuevo).
- `__tests__/unit/components/LogViewer.test.tsx` (nuevo).
- `__tests__/unit/components/ProcessingChecklist.test.tsx` (nuevo).
- `__tests__/unit/components/TransactionAccordion.test.tsx` (nuevo).
- `__tests__/unit/components/CertificationsTable.test.tsx` (nuevo).
- `__tests__/unit/components/StatCard.test.tsx` (nuevo).
- `__tests__/unit/components/StatusBadge.test.tsx` (nuevo).

**Tests por componente**: render con props base, render con estado vacío, render con estado de error, accesibilidad mínima (`role`, `aria-label`).

**Commit**: `test(payworks-bot): RTL para 7 componentes UI restantes`

---

## Fase 8 — Tests unit para value-objects + entities pendientes

**Tamaño**: S · **Depende de**: nada

**Por qué**: invariantes del dominio sin tests, refactors riesgosos. 7 value objects + 3 entities sin cobertura unit directa.

**Cambios**:
- `__tests__/unit/value-objects/IntegrationType.test.ts` (nuevo).
- `__tests__/unit/value-objects/CardBrand.test.ts` (nuevo) — incluye AMEX P9.
- `__tests__/unit/value-objects/ValidationLayer.test.ts` (nuevo).
- `__tests__/unit/value-objects/ValidationVerdict.test.ts` (nuevo).
- `__tests__/unit/value-objects/AggregatorScheme.test.ts` (nuevo).
- `__tests__/unit/value-objects/An5822Flow.test.ts` (nuevo).
- `__tests__/unit/value-objects/TransactionType.test.ts` (nuevo).
- `__tests__/unit/entities/Transaction.test.ts` (nuevo).
- `__tests__/unit/entities/Afiliacion.test.ts` (nuevo).
- `__tests__/unit/entities/ValidationResult.test.ts` (nuevo).

**Tests por VO**: construcción válida, throw en valor inválido, normalización (ej. `CardBrand.fromString("AMERICAN EXPRESS")` → `AMEX`), serialización round-trip.

**Commit**: `test(payworks-bot): unit tests para 7 value-objects + 3 entities pendientes`

---

## Fase 9 — Tests E2E Cypress para páginas no cubiertas

**Tamaño**: M · **Depende de**: Fase 3

**Por qué**: páginas `dashboard`, `procesamiento`, `transaccion/[ref]` sin cobertura E2E.

**Cambios**:
- `__tests__/cypress/e2e/06-dashboard.cy.ts` (nuevo).
- `__tests__/cypress/e2e/07-transaccion-detail.cy.ts` (nuevo).
- `__tests__/cypress/e2e/08-procesamiento.cy.ts` (nuevo).

**Tests prioritarios**:
- Dashboard: lista vacía → estado vacío visible; tras run → tabla con N entries; click en entry navega a `/resultados/:id`.
- Transacción detail: render de field results, click en RuleLine fail expande panel.
- Procesamiento: si la página es overlay durante run, validar que se muestra durante `validar` en vuelo.

**Commit**: `test(payworks-bot): cypress E2E para dashboard + transaccion + procesamiento`

---

## Fase 10 — Coverage gates en CI

**Tamaño**: S · **Depende de**: Fases 2-8

**Por qué**: prevenir regresiones de cobertura; bloquear merge de código sin tests para líneas críticas.

**Cambios**:
- `apps/payworks-bot/jest.config.js` — añadir `coverageThreshold`:
  ```js
  coverageThreshold: {
    global: { branches: 70, functions: 75, lines: 75, statements: 75 },
    './src/core/domain/': { branches: 85, functions: 90, lines: 90, statements: 90 },
    './src/core/application/': { branches: 80, functions: 85, lines: 85, statements: 85 },
    './src/infrastructure/': { branches: 75, functions: 80, lines: 80, statements: 80 },
    './src/presentation/': { branches: 65, functions: 70, lines: 70, statements: 70 },
  }
  ```
- `.github/workflows/ci.yml` (si existe) — ejecutar `pnpm --filter payworks-bot test:coverage` en PRs y publicar reporte.
- `apps/payworks-bot/package.json` — añadir script `test:coverage` si no existe.

**Verificación**: PR de prueba con función nueva sin test debe fallar el threshold.

**Commit**: `chore(payworks-bot): coverage gates en jest.config.js + CI workflow`

---

## Out of scope (sprints separados)

- **Visual regression testing** (Percy / Chromatic) — post-MVP.
- **Performance testing** del pipeline de 10 niveles — post-MVP.
- **Accessibility audit completo** (axe-core integration) — siguiente sprint.
- **Mutation testing** (Stryker) — solo si la cobertura plana sigue dejando bugs.
- **Tests del package `@banorte/ui`** — si los componentes Button/Input/etc. tienen sus propios tests, no duplicar aquí.

---

## Archivos críticos a tocar

### Fase 1 (setup)
- `apps/payworks-bot/jest.config.js`
- `apps/payworks-bot/jest.setup.js`
- `apps/payworks-bot/__tests__/utils/renderWithRouter.tsx` (nuevo)
- `apps/payworks-bot/__tests__/utils/mockNextNavigation.ts` (nuevo)

### Fases 2-3 (P0 — los 2 bugs)
- `apps/payworks-bot/__tests__/unit/components/UploadCard.test.tsx` (nuevo)
- `apps/payworks-bot/__tests__/cypress/e2e/05-ui-states.cy.ts` (nuevo)
- `apps/payworks-bot/__tests__/cypress/support/commands.ts`
- (referencia, no tocar) `apps/payworks-bot/src/presentation/components/UploadCard.tsx`
- (referencia, no tocar) `packages/ui/src/components/Button/Button.tsx`

### Fases 3.5-3.6 (P0 — happy path carta `.docx`)
- `apps/payworks-bot/__tests__/cypress/e2e/09-carta-docx-flow.cy.ts` (nuevo)
- `apps/payworks-bot/__tests__/unit/app/resultados-page.test.tsx` (nuevo)
- `apps/payworks-bot/__tests__/cypress/support/commands.ts` — extender con `cy.mockApprovedSession()`
- (referencia, no tocar) `apps/payworks-bot/src/app/resultados/[id]/page.tsx`

### Fases 4-6 (capas application + infrastructure)
- `apps/payworks-bot/__tests__/unit/use-cases/RunCertificationUseCase.test.ts` (nuevo)
- `apps/payworks-bot/__tests__/unit/infrastructure/DocxCertificationLetterRenderer.test.ts` (nuevo)
- `apps/payworks-bot/__tests__/unit/infrastructure/InMemory{Transaction,Certification,Afiliacion}Repository.test.ts` (nuevos)
- `apps/payworks-bot/__tests__/integration/regression/CartaDocxContent.test.ts` (nuevo, P0)
- `apps/payworks-bot/__tests__/integration/regression/CartaApiRoute.test.ts` (nuevo, P0)
- `apps/payworks-bot/__tests__/utils/inspectDocx.ts` (helper, nuevo)
- `apps/payworks-bot/__tests__/unit/api/{validar,historial,health}-route.test.ts` (nuevos — `carta-route` queda en F5.6 como integration)

### Fases 7-9 (UI restante + dominio)
- 7 archivos `__tests__/unit/components/*.test.tsx`
- 10 archivos `__tests__/unit/{value-objects,entities}/*.test.ts`
- 3 specs `__tests__/cypress/e2e/{06,07,08}-*.cy.ts`

### Fase 10 (CI)
- `apps/payworks-bot/jest.config.js`
- `apps/payworks-bot/package.json`
- `.github/workflows/ci.yml` (si existe)

---

## Verificación

### Por fase
- **Cada commit**: `cd apps/payworks-bot && npx tsc --noEmit && pnpm test` debe pasar (incremental ≥ 387+nuevo).
- **Fase 2 específica**: ejecutar `pnpm test UploadCard.test.tsx` debe pasar los 9 tests.
- **Fase 3 específica**: `pnpm test:e2e --spec '05-ui-states.cy.ts'` debe pasar los 5 tests.
- **Fase 10 específica**: `pnpm test:coverage` debe respetar los thresholds; intencionalmente romper uno y verificar que CI falla.

### End-to-end (post-todas las fases)
- Ejecutar el flujo completo de `/nueva-certificacion` con bundle 04 y validar manualmente:
  - Spinner visible inmediatamente tras click.
  - Un solo click es suficiente.
  - Si el backend tarda >2s, `<ProcessingChecklist />` o equivalente se muestra.
  - Tras éxito, transición a `/resultados/:id` sin glitch visual.
- Coverage report tras Fase 10: ≥ 80% global, ≥ 90% en domain, ≥ 70% en presentation.

---

## Notas para la sesión de ejecución

1. **Crear branch desde origin/main fresh** (no desde `docs/payworks-bot`): `git checkout -b test/payworks-bot-mvp-coverage origin/main`. Idealmente trabajar en worktree dedicado con path corto (ej. `C:\Users\fluid\banorte-tests`) por el problema de Cypress screenshots de sentiment-analysis con paths >260 chars en Windows.
2. **Confirmar primero** que las dependencias `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event` están en `apps/payworks-bot/package.json` antes de Fase 1; si faltan, agregarlas como primer paso de esa fase.
3. **No mezclar el fix de los bugs con los tests**: este plan es solo de tests. El fix del Bug 1 (`isLoading={isLoading}`) y Bug 2 (`type="button"` o `<form onSubmit>`) van en branch/PR separado, idealmente después de que los tests rojos del Bug confirmen que el problema existe antes del fix.
4. **Orden recomendado de PRs**:
   - **PR-A** = Fases 1 + 2 + 3 (P0 — los 2 bugs UI)
   - **PR-A2** = Fases 3.5 + 3.6 (P0 — happy path carta `.docx`)
   - **PR-B** = fix de los 2 bugs UI (separado, post tests rojos)
   - **PR-C** = Fases 4 + 5 + 5.5 + 5.6 (capas críticas: use case + renderer + carta endpoint)
   - **PR-D** = Fase 6 (otras API routes)
   - **PR-E** = Fases 7 + 8 + 9 (cobertura amplia)
   - **PR-F** = Fase 10 (gates CI)
5. **Si se rompe algún test existente** durante alguna fase: probable que sea regresión legítima del refactor; arreglar antes de cerrar la fase.
