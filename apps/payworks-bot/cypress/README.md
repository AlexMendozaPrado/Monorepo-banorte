# Cypress E2E — payworks-bot

Suite de tests end-to-end del flujo UI completo: subir bundle → procesar
→ ver resultados.

## Cómo correr

```bash
# headless (CI)
pnpm test:e2e

# UI interactiva (desarrollo)
pnpm test:e2e:open
```

`start-server-and-test` levanta `next dev` en `:3006`, espera a que
responda, y entonces dispara la suite de Cypress. El dev server muere
al terminar.

## Estructura

- `cypress.config.ts` — `baseUrl: localhost:3006`. `fixturesFolder`
  apunta a `__tests__/fixtures/` para reusar los bundles canónicos sin
  duplicar archivos.
- `cypress/e2e/` — un spec por bundle (`01-bundle-dlocal.cy.ts`, etc.).
- `cypress/support/commands.ts` — `cy.uploadBundle(slug, integration, options?)`.
- `cypress/support/e2e.ts` — entry point que importa commands +
  `cypress-file-upload`.

## Cobertura actual: smoke

Cada spec hoy verifica el happy path:
1. Subir todos los archivos del bundle.
2. Llegar a `/resultados/<id>`.
3. Confirmar que aparecen las referencias de transacciones esperadas
   y las capas activas (Servlet / 3DS / Cybersource según bundle).

## TODO — cobertura detallada

Items pendientes para una segunda iteración:

- [ ] Assertar veredictos específicos (APROBADO / RECHAZADO) por
  bundle. Hoy el smoke no fija expectativa porque los veredictos
  pueden cambiar al iterar reglas; conviene snapshotearlos primero.
- [ ] Assertar conteos exactos de PASS / FAIL por capa para detectar
  regresiones cuantitativas (ej. el bundle 04 antes generaba ~20
  POSTAUT 3DS fails que la Fase A.1 eliminó).
- [ ] Click en una `RuleLine` con verdict FAIL → assertar que el
  panel expandible (Fase F.2) muestra `failReason`/`failDetail`.
- [ ] Verificar que la carta PDF se descarga y que el folio
  generado por `FolioGenerator` (Fase D) aparece en el nombre del
  archivo.
- [ ] Bundle 06 (Agregadores e Integradores TP V2.4.2) — bloqueado
  por logs reales del equipo Banorte.
- [x] Bundle 04 — capa Cybersource ahora aparece en el árbol. El
  servlet log siempre tuvo `ID_CYBERSOURCE` poblado, pero el orquestador
  llamaba `parseByOrderId(content, txn.referencia)` con la referencia de
  PROSA (numérica) en lugar del OrderId real (alfanumérico = `ID_CYBERSOURCE`
  del servlet). Fix B.4 (may-2026): `RunCertificationUseCase` ahora prefiere
  `servletRequest.getField('ID_CYBERSOURCE')` con fallback a `txn.referencia`.

## Notas para el desarrollador

- Los inputs file en `UploadCard` están ocultos (clase `hidden`). El
  comando `cy.attachFile()` de `cypress-file-upload` adjunta el
  archivo al input directamente sin necesidad de hacer click sobre
  el dropzone padre.
- El dev server tarda ~10s en estar listo la primera vez. Si los
  tests fallan con timeout en `cy.visit()`, espera o revisa la
  terminal donde corre `start-server-and-test`.
- En CI: las afiliaciones del bundle son `.csv` reales — Cypress las
  lee desde `__tests__/fixtures/scenarios/<slug>/afiliaciones.csv`.
