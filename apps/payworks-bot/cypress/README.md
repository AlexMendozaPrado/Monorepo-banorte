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

- [x] Veredictos específicos por bundle — snapshoteados en B.1
  (may-2026). Los 4 bundles actuales son RECHAZADO con conteo total
  esperado (3, 1, 2, 1 tx).
- [x] Click en `RuleLine` con verdict FAIL → panel expandible con
  `failReason`. Cubierto en B.2 (spec extra del bundle 01).
- [x] Botón "Descargar Carta Oficial (.docx)" disabled cuando
  RECHAZADO + endpoint /carta/:id → 409. Cubierto en B.3 (spec del
  bundle 04 con gate P8).
- [ ] **Falta bundle APROBADO** para verificar:
  - Descarga real del `.docx` (Content-Type, Content-Disposition con
    folio en filename).
  - Folio generado por `FolioGenerator` con sufijo correcto del
    laboratorio + capas activas.
  - Botón habilitado.
  Bloqueado: ningún bundle del equipo es happy-path. Cuando llegue
  uno, el spec va en `0X-bundle-aprobado.cy.ts`.
- [ ] Conteos exactos de PASS/FAIL **por capa** (Servlet/3DS/CS/AN5822/
  Tokenización/Anexo D) para regresiones cuantitativas. La página
  hoy expone `data-testid="type-counter-{TYPE}"` por tipo de
  transacción pero no por capa. Requiere componente nuevo o
  agregación en `useCertificationDetail`.
- [ ] Bundle 06 (Agregadores e Integradores TP V2.4.2) — bloqueado
  por logs reales del equipo Banorte.

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
