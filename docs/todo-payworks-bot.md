# TODO — payworks-bot

Extensiones identificadas durante PRs #16, #17, #18, #19 que quedan diferidas. Cada item indica el alcance y un punto de partida sugerido.

---

## UI — `TransactionRuleTree`

### Click-to-expand por fila (Fase B del refactor de UI)
**Por qué:** el Tooltip muestra texto completo al hover, pero info estructurada (categoría de falla, valor recibido completo, fuente del manual con link) cabe mejor en un panel inline expandible — patrón consistente con el resto del árbol que ya usa colapsar/expandir.

**Alcance estimado:** ~25 LOC.
- En `RuleLine` agregar `useState(open)` + `onClick` toggle.
- Al expandir, mostrar debajo un panel con: `failReason` (badge), `value` recibido (sin recortar), `failDetail` multilínea, link a `source` del manual.
- Solo expandible cuando `status === 'fail'` (en pass/skip no aporta).

**Archivos:** `apps/payworks-bot/src/presentation/components/TransactionRuleTree.tsx` (`RuleLine`).

### Tooltip auto-flip cuando no cabe
**Por qué:** la implementación actual coloca el tooltip estáticamente según `placement`. Si está cerca del borde del viewport puede salirse.

**Alcance:** mediano. Requiere `@floating-ui/react` o equivalente para posicionamiento dinámico.

**Decisión:** dejar pendiente hasta que aparezca un caso real. Para el árbol los placements `top` por defecto bastan en la mayoría de viewports.

### Variantes del Tooltip (success/warning/error)
**Por qué:** hoy el `Tooltip` es solo banorte-dark. Útil tener variantes con `bg-banorte-success` / `bg-banorte-error` para tooltips contextuales.

**Alcance:** trivial — agregar prop `variant`.

**Archivos:** `packages/ui/src/components/Tooltip/`.

---

## Limpieza de código huérfano

### Eliminar `FieldValidationTable` y `TransactionResultCard`
**Por qué:** `FieldValidationTable` ya no se usa en el flujo principal (sustituido por `TransactionRuleTree` en PR #17). `TransactionResultCard` no está enrutado por ninguna página. Ambos viven sin consumidores.

**Alcance:** trivial — `git rm` + actualizar imports si los hay.

**Archivos:**
- `apps/payworks-bot/src/presentation/components/FieldValidationTable.tsx`
- `apps/payworks-bot/src/presentation/components/TransactionResultCard.tsx`

**Verificación previa:** confirmar con `grep -r "FieldValidationTable\|TransactionResultCard"` que no haya consumidores ocultos (PDFs, tests, etc.).

---

## Configuración del aplicativo (impacto en validación)

Hallados al subir bundles reales en PRs #18-#19:

### Catálogo de `ENTRY_MODE` para `AGREGADORES_COMERCIO_ELECTRONICO`
**Síntoma:** bundle 02 OPENLINEA falla con `Valor "CONTACTLESSCHIP" no está en [MANUAL]`.

**Hipótesis:** la config solo lista `MANUAL` pero el integrador real envía `CONTACTLESSCHIP` (chip + contactless, propio de tarjeta presente). El manual `AGREGADORES_CE V2.6.4` puede contemplar otros valores.

**Acción:** revisar manual oficial Banorte y actualizar `apps/payworks-bot/src/config/mandatory-fields/agregadores-comercio-electronico.json` (o equivalente) con los valores válidos completos.

### Mismatch nombres de campos 3DS
**Síntoma:** bundle 04 ECOMMERCE 3DS+CS reporta 20 fails todos `[THREEDS] found=false` para campos como `CARD_NUMBER`, `CARD_EXP`, `MERCHANT_ID`, etc.

**Hipótesis:** el config 3DS busca campos en español/MAYÚSCULAS (`MERCHANT_ID`, `CARD_NUMBER`...) pero el log real del equipo emite camelCase inglés (`MerchantId`, `Card`, `Total`...). El parser 3DS reconoce ambos pero el config debe estar alineado.

**Acción:** revisar `layer-3ds.json` y mapear correctamente los nombres del log real.

**Archivos:** `apps/payworks-bot/src/config/mandatory-fields/layer-3ds.json`.

### Reglas AN5822 sobre `COF` / `PAYMENT_IND`
**Síntoma:** bundle 03 ZIGU rechaza `COF=4` y `PAYMENT_IND=R` que parecen valores válidos.

**Hipótesis:** la regla AN5822 espera otra combinación según el `flujo_an5822` declarado en la matriz. Hay que revisar la lógica de `An5822Validator`.

**Acción:** revisar reglas en `apps/payworks-bot/src/core/domain/services/An5822Validator.ts` contra el manual oficial AN5822 MasterCard.

---

## Bugs del dominio (no UI)

### `value` contiene mensaje de error en `AUTH_CODE` POSTAUTH
**Síntoma:** bundle 01 DLOCAL POSTAUTH muestra `AUTH_CODE [SERVLET] found=true value="No se encontró AUTH_CODE en respuestas previas..."`.

**Causa:** algún validador (probablemente `CrossFieldValidator`) está poniendo el mensaje de error en el campo `value` del `FieldValidationResult` en lugar de un campo separado.

**Acción:** localizar dónde se asigna ese `value`, separar el mensaje a `failDetail` y dejar `value: undefined` (o el valor real cuando exista).

**Archivos a revisar:** `apps/payworks-bot/src/core/domain/services/CrossFieldValidator.ts` y `PreAuthPostAuthCorrelator.ts`.

---

## Endpoints e infraestructura

### Hacer público `GET /api/certificacion/[id]` para clientes externos
**Hoy:** consumido solo por `httpCertificationGateway` desde el browser. PR #16 dejó la puerta abierta para que apps mobile o CLIs externas también lo usen.

**Acción si surge la necesidad:** agregar autenticación (API key / OAuth) y documentar contrato en OpenAPI / Swagger. Hoy no hace falta.

### Migrar `validar` y `historial` a Server Actions (opcional)
**Hoy:** los 4 endpoints son Route Handlers REST. La comunidad Next.js (Nikolov, Herrington) recomienda Server Actions para mutaciones internas.

**Acción:** evaluar si vale la pena migrar. Si se hace, hacer **los 4 endpoints juntos** (validar, historial, [id], carta) en una PR para no bifurcar la convención del repo.

---

## Cobertura de tests

### Tests de integración del flujo HTTP completo
**Hoy:** los 4 bundles se prueban manualmente con curl. Vale la pena automatizar:

```ts
test('bundle 01 DLOCAL produce verdict RECHAZADO con capas SERVLET+AGREGADOR', async () => {
  const formData = new FormData();
  formData.append('matriz', readFixture('01-dlocal/matriz.xlsx'));
  // ...
  const res = await fetch('http://localhost:3006/api/certificacion/validar', { method: 'POST', body: formData });
  expect(res.status).toBe(200);
  // ...
});
```

**Alcance:** ~80 LOC, requiere setup que levante dev server o use Next test utils.

### Tests del script `generate-fixtures`
**Hoy:** el flag `--validate` cumple parte. Tests Jest formales para los builders darían más confianza.

**Alcance:** ~50 LOC por builder con casos de borde.

---

## Productos sin fixture

Ver `apps/payworks-bot/__tests__/fixtures/scenarios/README.md` sección "TODO". Resumen: faltan logs reales del equipo para `MOTO`, `CARGOS_PERIODICOS_POST`, `VENTANA_COMERCIO_ELECTRONICO`, `AGREGADORES_CARGOS_PERIODICOS`, `API_PW2_SEGURO`, `INTERREDES_REMOTO`.

**Política:** no inventar — esperar logs del equipo.

---

## Priorización sugerida

| Item | Impacto | Esfuerzo | Urgencia |
|---|---|---|---|
| Eliminar `FieldValidationTable` + `TransactionResultCard` | Bajo | Trivial | Baja |
| Click-to-expand panel en `RuleLine` | Medio (UX) | ~25 LOC | Media |
| Catálogo de `ENTRY_MODE` actualizado | **Alto** (fixes false negatives) | Bajo | **Alta** |
| Mismatch 3DS nombres de campo | **Alto** (20 false negatives en bundle 04) | Medio | **Alta** |
| `value` con mensaje de error en POSTAUTH | Alto (cambia interpretación del DTO) | Bajo | Media |
| Reglas AN5822 sobre data válida | Alto | Medio (requiere análisis del manual) | Media |
| Tooltip variants / auto-flip | Bajo | Bajo / Medio | Baja |
| Tests E2E HTTP | Medio (calidad) | Medio | Baja |
| Server Actions migration | Bajo (consistencia) | Medio | Baja |
