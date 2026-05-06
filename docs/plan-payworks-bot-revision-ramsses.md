# Plan — Revisión Ramsses + Cypress detallado (payworks-bot)

> **Branch**: `feat/payworks-bot-revision-ramsses`
> **Fecha de inicio**: 2026-05-05
> **Origen**: PR #23 mergeado a `main` (carta `.docx` desde template oficial — commit `f2cd477`)

## Contexto

Tras cerrar el bloque A (carta `.docx` + UI con notas), el equipo de certificación de Banorte (Ramsses Bautista et al.) entregó dos documentos que **resuelven preguntas pendientes** y **descubren reglas nuevas** que no estaban en el plan original (`docs/plan-certificacion-payworks.md`):

1. **`REVISIÓN DE REGLAS DE VALIDACIÓN BOT DE CERTIFICACIÓN PAYWORKS.docx`** — comentarios B4/C4/C7/D4-D7/E4/E5/F/F1/G6 sobre reglas, y respuestas P1-P15 a las preguntas abiertas que se habían registrado en `docs/preguntas-ramsses.md`.
2. **`NOMENCLATURAS FOLIOS LABS.xlsx`** — folios oficiales de los 3 laboratorios (CAV/VIP, ECOMM, Agregadores) con sufijos por producto, capa y recertificación.

La exploración del código revela que la mayoría de las reglas ya están implementadas: `CrossFieldValidator` con 9+ validaciones (C3, C5, C7, C11, C12, BIN condicional P10), `layer-an5822.json` cargado y wired, ECI `validValuesByBrand`, `CERTIFICACION_3D`/`STATUS_3D` separados, `REFERENCE3D`/`REFERENCE` separados, soporte de transacciones VENTA/PREAUTH CON PROMOCIÓN, `R_PCI` para PAN/EXP/CVV. El `FolioGenerator` ya combina producto × capas × `isVIP` × `isRecertification` con sufijos de `folio-nomenclatures.json`.

**Lo que realmente falta** es un subset acotado: una cross-rule nueva (C13), AMEX por marca en TNP, gate P8 en la carta, selector de laboratorio en UI, eliminación del fallback PDF jsPDF, fixture del bundle 04, y Cypress detallado.

### Decisiones de alcance

- **Migración a Vercel Postgres**: queda **fuera de alcance** de esta rama — se atiende en un sprint separado siguiendo `docs/plan-certificacion-payworks.md` líneas 39-242 (F-VP1 a F-VP7).
- **Folio para `API_PW2_SEGURO` e `INTERREDES_REMOTO`**: queda **fuera de alcance** — el xlsx de nomenclaturas no tiene fila clara para estos productos puros y requiere confirmación de Ramsses. El `FolioGenerator` seguirá emitiendo `PENDIENTE-…` para ellos.
- **Plan en repo**: este documento queda versionado para que cualquier integrante del equipo lo referencie desde issues / PRs.

## Orden de ejecución

```
Step 0 → A.5 → A.6 → C.1 → C.2 → C.3 → C.4 → B.4 → B.1 → B.2 → B.3
```

A es cierre rápido de la carta. C son 4 commits chicos que estabilizan reglas/UX antes de snapshotear. B detallado va al final porque snapshotea veredictos.

**Cada fase = 1 commit autocontenido** (type-check + tests verdes antes de cerrar).

---

## Bloque A — Cierre carta `.docx`

### A.5 — Eliminar fallback PDF jsPDF

**Por qué**: Confirmado por el usuario que nadie usa `?format=pdf`. Mantenerlo agrega ~300 KB de dependencia y duplica el flujo.

**Cambios**:
- Borrar `apps/payworks-bot/src/presentation/utils/generateCertificationLetterPDF.ts`.
- En `apps/payworks-bot/src/app/api/certificacion/carta/[id]/route.ts`: eliminar el branching `format === 'pdf'` y el import del renderer jsPDF.
- En `apps/payworks-bot/package.json`: remover `"jspdf": "^4.2.1"`.
- Ejecutar `pnpm install` para actualizar `pnpm-lock.yaml`.
- Borrar la sección "Test 3 — `?format=pdf` preserva fallback legacy" y la sección "Rollback" en `docs/payworks-bot-carta-docx-tests.md`.

**Commit**: `chore(payworks-bot): eliminar fallback PDF jsPDF, la carta es solo .docx`

### A.6 — Gate P8: carta solo si APROBADO

**Por qué**: Docx P8 — *"La carta solo se emite cuando la mensajería de la matriz de pruebas realizada por el comercio se encuentra de manera correcta bajo los manuales de integración"*.

**Cambios**:
- En `apps/payworks-bot/src/app/api/certificacion/carta/[id]/route.ts`: tras cargar `session`, verificar `session.getGlobalVerdict() === ValidationVerdict.APROBADO`. Si no → 409 con body `{ success: false, error: 'No se puede emitir carta hasta que la certificación esté APROBADA' }`.
- En `apps/payworks-bot/src/app/resultados/[id]/page.tsx`: si veredicto global ≠ APROBADO, deshabilitar el botón "Descargar Carta Oficial (.docx)" con tooltip explicativo.
- Test que verifique el 409 en el endpoint.

**Commit**: `feat(payworks-bot): gate P8 — carta de certificación solo se emite si veredicto global APROBADO`

---

## Bloque C — Reglas faltantes según revisión Ramsses

### C.1 — Cross-rule C13 `REFERENCE_3D` = `NUMERO_CONTROL`

**Por qué**: Docx E5 — *"Siempre deben de ser iguales los valores de las variables `REFERENCE_3D` y la variable `NÚMERO DE CONTROL` de Payworks"*. Único cross-rule del docx no implementado.

**Cambios**:
- En `apps/payworks-bot/src/core/domain/services/CrossFieldValidator.ts`: agregar método `validateReference3DEqualsControlNumber()` siguiendo el patrón de `validateProsaReferenceMatch()`.
- Layer: `THREEDS`. `failReason: 'cross_field'`. `failDetail`: "REFERENCE_3D y CONTROL_NUMBER deben coincidir (E5 manual revisión 2026)".
- Llamarlo desde `ValidateTransactionFieldsUseCase.execute()` cerca de los otros cross-field 3DS.
- Test unitario: caso PASS, caso FAIL, caso N/A (no es transacción 3DS).

**Commit**: `feat(payworks-bot): cross-rule C13 — REFERENCE_3D debe coincidir con NUMERO_CONTROL (E5)`

### C.2 — AMEX `requiredByBrand` en `ecommerce-tradicional.json`

**Por qué**: Docx P9 — *"Solo hay 4 variables que sí son R (Requeridas) las cuales son: DOMICILIO, CODIGO_POSTAL, TELEFONO y CORREO_ELECTRONICO y el resto de variables de transacciones con AMEX son opcionales"*. Hoy `ecommerce-tradicional.json` no distingue por marca.

**Cambios**:
- Extender `apps/payworks-bot/src/core/domain/value-objects/FieldRequirement.ts` con `requiredByBrand?: Record<CardBrand, FieldRule>` (similar a cómo `validValuesByBrand` ya existe en layer-3ds).
- En `evaluateDetailed()`: si `requiredByBrand` está presente y hay un `CARD_BRAND` en el contexto, usar la regla de esa marca; si no, caer al `rules` global.
- En `apps/payworks-bot/src/config/mandatory-fields/ecommerce-tradicional.json`: agregar `requiredByBrand` a las 4 variables AMEX (DOMICILIO, CODIGO_POSTAL, TELEFONO, CORREO_ELECTRONICO) → `R` para AMEX, mantener regla actual para otras marcas. Marcar como `O` el resto de variables AMEX adicionales que hoy estén como R.
- Tests: caso AMEX (4 R, resto O) y caso VISA (las 4 vuelven a su regla base).

**Commit**: `feat(payworks-bot): requiredByBrand para AMEX en ecommerce-tradicional (P9 revisión Ramsses)`

### C.3 — Cross-rule C14 — Variables MIT/CIT no se mezclan entre productos

**Por qué**: Docx F — *"en Comercio Electrónico no pueden enviar la variable `IND_PAGO = 'R'` ya que esta es solo para Cargos Recurrentes, otro ejemplo es que en Comercio Electrónico no deben de enviar la variable `COF = 4`"*. Hoy `layer-an5822.json` ya restringe COF=4 a Cargos Periódicos a nivel JSON, pero falta cross-rule **runtime** que detecte mezclas.

**Cambios**:
- En `CrossFieldValidator.ts`: nuevo `validateMitCitProductMix()` — si producto NO está en `{CARGOS_PERIODICOS_POST, AGREGADORES_CARGOS_PERIODICOS}` y aparece `IND_PAGO=R` o `COF=4` en log → FAIL. Si aparece `INFO_PAGO=2` (subseqMIT) en producto de comercio electrónico no-recurrente → FAIL.
- Layer: `AN5822`. `failReason: 'cross_field'`.
- Llamarlo desde `ValidateTransactionFieldsUseCase.execute()` después de la validación AN5822.
- Tests con scenario real: ZIGU bundle (CE Esquema 1 con `IND_PAGO=U` es válido) vs un caso sintético con `IND_PAGO=R` en CE (debe FAIL).

**Commit**: `feat(payworks-bot): cross-rule C14 — variables MIT/CIT prohibidas en productos no-recurrentes (F revisión)`

### C.4 — Selector de laboratorio en UI + persistencia en sesión

**Por qué**: Hoy `FolioGenerator` recibe `isVIP: boolean` pero no hay control UI para definirlo. Las nomenclaturas oficiales del xlsx exigen distinguir 3 labs (CAV/VIP, ECOMM, AGREGADORES) y para AGREGADORES además distinguir Agregador vs Integrador.

**Cambios**:
- Modelar laboratorio: nuevo VO `LaboratoryType` (`CAV` | `ECOMM` | `AGREGADORES_AGREGADOR` | `AGREGADORES_INTEGRADOR`) en `apps/payworks-bot/src/core/domain/value-objects/LaboratoryType.ts`.
- Extender `RunCertificationCommand` y `CertificationSession` con `laboratoryType: LaboratoryType`.
- `FolioGenerator`: reemplazar `isVIP: boolean` por `laboratoryType` y derivar el sufijo de `folio-nomenclatures.json` según `(laboratoryType, integrationType, has3DS, hasCybersource, isRecertificacion)`.
- UI: agregar `<Select>` "Laboratorio" en `apps/payworks-bot/src/app/nueva-certificacion/page.tsx` (antes del selector de IntegrationType). Validar combinaciones inválidas (ej. lab AGREGADORES + integrationType ECOMMERCE_TRADICIONAL → mostrar error inline).
- Tests `FolioGenerator.test.ts`: round-trip de los 4 laboratorios contra los sufijos del xlsx.

**Commit**: `feat(payworks-bot): selector de laboratorio (CAV/ECOMM/AGREG) + folio por laboratorio`

---

## Bloque B — Cypress detallado

### B.4 — Fix bundle 04 enlace Cybersource

**Por qué**: README de cypress reporta que la capa CS no aparece en el árbol del bundle 04. Confirmado: el servlet log no contiene `CYBERSOURCE_ID` que enlace con el `requestID` de `cybersource.log`.

**Cambios**:
- Editar `apps/payworks-bot/__tests__/fixtures/scenarios/04-ecommerce-3ds-cybersource/servlet.log` para agregar el campo `CYBERSOURCE_ID: [<requestID-real>]` en cada transacción 3DS+CS.
- Si los datos vienen de `apps/payworks-bot/scripts/scenarios/04-*.ts`, regenerar con `pnpm fixtures:generate` después de actualizar la fuente.
- Verificar manualmente en `/nueva-certificacion` que la capa Cybersource ahora aparece en el árbol.

**Commit**: `fix(payworks-bot): bundle 04 servlet.log con CYBERSOURCE_ID para correlar capa CS`

### B.1 — Snapshot de veredictos y conteos por capa

**Por qué**: Hoy los specs solo verifican que la página renderiza. Sin assertions de veredicto/conteos no detectamos regresiones cuantitativas.

**Cambios**:
- En cada spec (`cypress/e2e/0[1-4]-bundle-*.cy.ts`): assertions del veredicto global y de los conteos por capa (PASS/FAIL).
- Si los `data-testid` no existen, agregarlos en los componentes de la página de resultados.
- Conteos esperados de `__tests__/fixtures/scenarios/README.md`: bundle 01 (60·4·6), bundle 02 (20·3), bundle 03 (44·3), bundle 04 (re-medir tras C/B.4).

**Commit**: `test(payworks-bot): cypress assertea veredictos y conteos PASS/FAIL por capa`

### B.2 — Click-to-expand `RuleLine`

**Por qué**: La fase F.2 implementó panel expandible con `failReason`/`failDetail`. Falta cobertura E2E.

**Cambios**:
- En 1-2 specs: hacer click sobre una `RuleLine` con verdict FAIL conocido, asertar que el panel expandido muestra `failReason` y `failDetail`.
- `data-testid` accesibles si no existen.

**Commit**: `test(payworks-bot): cypress cobertura del panel expandible de RuleLine (F.2)`

### B.3 — Descarga `.docx` con folio en filename

**Por qué**: La feature recién hecha (commits `ed08d08` + `7accca2`) carece de cobertura E2E.

**Cambios**:
- Spec nuevo o sección en spec existente: tras llegar a página de resultados con sesión APROBADA, click en "Descargar Carta Oficial (.docx)". `cy.intercept()` para validar `Content-Type` y `Content-Disposition` con `filename="<folio-real>.docx"`.
- Asertar también que con sesión RECHAZADA el botón está deshabilitado (gate A.6).

**Commit**: `test(payworks-bot): cypress cobertura E2E de descarga de carta .docx con folio en filename`

---

## Out of scope (sprints separados)

- **Migración a Vercel Postgres** — F-VP1 a F-VP7 en `docs/plan-certificacion-payworks.md`. Mientras, `globalThis.__banortePayworksCertificationStore` (`InMemoryCertificationRepository:11-19`) y `globalThis.__banortePayworksDI` (`DIContainer:79-86`) seguirán activos.
- **Folio API_PW2_SEGURO + INTERREDES_REMOTO** — bloqueado por confirmación Ramsses.
- **Variables Anexo V faltantes** en Interredes Remoto y API PW2 (CASHBACK_AMOUNT, PAGO_MOVIL, AUTH_CODE, BANROTE_URL, TRANS_TIMEOUT, Q6 MSI, RESPONSE_LANGUAGE, QPS, CUSTOMER_REF2-5).
- **Validación VCE cifrado** (post-MVP) — requiere credenciales AES/CTR.
- **Bundles fixtures 05+** para MOTO, CARGOS_PERIODICOS_POST, VENTANA_CE, AGREGADORES_CARGOS_PERIODICOS, API_PW2_SEGURO, INTERREDES_REMOTO — bloqueado por entrega de logs reales del equipo.

---

## Archivos críticos

### Modificados
- `apps/payworks-bot/src/app/api/certificacion/carta/[id]/route.ts` (A.5, A.6)
- `apps/payworks-bot/src/app/resultados/[id]/page.tsx` (A.6)
- `apps/payworks-bot/src/core/domain/services/CrossFieldValidator.ts` (C.1, C.3)
- `apps/payworks-bot/src/core/application/use-cases/ValidateTransactionFieldsUseCase.ts` (C.1, C.3)
- `apps/payworks-bot/src/core/domain/value-objects/FieldRequirement.ts` (C.2)
- `apps/payworks-bot/src/config/mandatory-fields/ecommerce-tradicional.json` (C.2)
- `apps/payworks-bot/src/core/domain/services/FolioGenerator.ts` (C.4)
- `apps/payworks-bot/src/core/domain/entities/CertificationSession.ts` (C.4)
- `apps/payworks-bot/src/app/nueva-certificacion/page.tsx` (C.4)
- `apps/payworks-bot/__tests__/fixtures/scenarios/04-ecommerce-3ds-cybersource/servlet.log` (B.4)
- `apps/payworks-bot/cypress/e2e/0[1-4]-bundle-*.cy.ts` (B.1, B.2, B.3)
- `apps/payworks-bot/package.json` (A.5: drop jspdf)
- `docs/payworks-bot-carta-docx-tests.md` (A.5: borrar sección PDF)

### Nuevos
- `docs/plan-payworks-bot-revision-ramsses.md` (este archivo)
- `apps/payworks-bot/src/core/domain/value-objects/LaboratoryType.ts` (C.4)

### Borrados
- `apps/payworks-bot/src/presentation/utils/generateCertificationLetterPDF.ts` (A.5)

---

## Verificación

### Por fase
- **Cada commit**: `cd apps/payworks-bot && npx tsc --noEmit && npm test` debe pasar (181+ tests verdes).
- **A.5**: `curl /api/certificacion/carta/<id>?format=pdf` devuelve `.docx` (param ignorado).
- **A.6**: con sesión RECHAZADA, `curl /api/certificacion/carta/<id>` → 409. Con APROBADA → 200 `.docx`.
- **C.1**: test unitario explícito caso PASS/FAIL/N/A.
- **C.2**: test unitario con CARD_BRAND=AMEX vs VISA en una transacción VENTA.
- **C.3**: bundle 03 (ZIGU CE Esq.1 con `IND_PAGO=U`) sigue PASANDO esa regla; un caso sintético con `IND_PAGO=R` en CE FALLA.
- **C.4**: round-trip selector → sesión → folio en los 3 labs.
- **B.4**: bundle 04 ahora muestra capa Cybersource en el árbol.
- **B.1-B.3**: `pnpm test:e2e` corre los 4 specs sin regresiones.

### End-to-end (post-todo)
- Levantar `pnpm --filter payworks-bot dev`.
- Ir a `/nueva-certificacion`, seleccionar laboratorio + producto, subir bundle 03.
- Ver árbol de validación con conteos correctos.
- Click "Descargar Carta Oficial (.docx)" → folio real con sufijo correcto del laboratorio.
- Tests Cypress verdes localmente con `pnpm test:e2e`.
