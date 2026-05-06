# DOCUMENTACIÓN DEL APLICATIVO PAYWORKS CERTIFICATION BOT

**Versión 3.0** · 5 / Mayo / 2026 · *Estado actual del aplicativo — evolución vs revisión v2.0*

---

## Introducción

El **Payworks Certification Bot** es un aplicativo interno Banorte desarrollado por el equipo de Soporte Técnico Payworks. Automatiza el proceso manual de certificación de comercios que integran con la plataforma Payworks Banorte, reemplazando la validación humana campo por campo de matrices Excel y de logs servlet, PROSA, 3DS y Cybersource contra los manuales oficiales. Este documento presenta el estado actual del aplicativo y va dirigido a los equipos de Soporte Técnico Payworks, Laboratorio de Certificación, Arquitectura de Aplicaciones y Gobierno de Riesgos.

Respecto a la versión 2.0 del 23 de abril de 2026, este documento incorpora la **iteración 3** ("Revisión Ramsses"), cerrada el 5 de mayo de 2026. La iteración integró comentarios del equipo de certificación de Banorte (Ramsses Bautista et al.) y entregó: cross-rules nuevas C13 y C14, soporte AMEX por marca (`requiredByBrand`), gate P8 sobre la emisión de carta, generación de carta `.docx` desde template oficial reemplazando el PDF jsPDF legacy, folio por laboratorio (CAV/ECOMM/AGREG) según nomenclaturas oficiales, y cobertura Cypress E2E de los 4 bundles canónicos.

### Cambios vs versión 2.0

- **Reglas nuevas (3)**: A8 (`requiredByBrand` AMEX), H16 (cross-rule C13: `REFERENCE_3D = NUMERO_CONTROL`), H17 (cross-rule C14: variables MIT/CIT prohibidas en productos no-recurrentes). Total reglas v3.0: **87** (vs 84 en v2.0).
- **Carta de certificación**: el aplicativo ahora emite la carta como `.docx` desde un template oficial Banorte con 28 placeholders + 3 loops, vía `docxtemplater` + `pizzip`. El generador jsPDF legacy fue eliminado. La emisión está condicionada a veredicto global APROBADO (gate P8).
- **Folio por laboratorio**: nuevo VO `LaboratoryType` (CAV/ECOMM/AGREG_AGREGADOR/AGREG_INTEGRADOR) y `FolioGenerator` que deriva el sufijo del JSON `folio-nomenclatures.json` (fuente: xlsx oficial Banorte abril 2026).
- **Soporte AMEX**: `CardBrand` extendido a tres marcas (VISA, MC, AMEX); `FieldRequirement` admite `requiredByBrand` para reglas R/O distintas por marca.
- **Cypress E2E**: 4 specs canónicos cubren los 4 bundles (`01-dlocal`, `02-openlinea`, `03-zigu`, `04-ecommerce-3ds-cybersource`) con assertions cuantitativas de veredicto y conteos PASS/FAIL.
- **JSONs**: 14 JSONs de configuración (vs 12 en v2.0) — añadidos `agregadores-integradores-tp.json` y `layer-tokenizacion.json`.
- **Sección 17 nueva**: documenta la generación de carta `.docx` desde template.
- **Sección 18 nueva**: documenta el folio por laboratorio con nomenclaturas oficiales.
- **Diagramas 9 y 10 nuevos** en el Anexo B.

Las observaciones se siguen recibiendo por los canales descritos al final del documento. La fuente autoritativa en runtime son los JSONs en `apps/payworks-bot/src/config/mandatory-fields/` y la suite Cypress E2E sobre los 4 bundles canónicos.

---

## Tabla de contenido

| # | Sección |
|---|---|
| 0 | Arquitectura del aplicativo |
| 1 | Grupo A — Presencia de campos (R/O/N/A/PROHIBITED/R_PCI) |
| 2 | Grupo B — Caracteres prohibidos |
| 3 | Grupo C — Formato y longitud |
| 4 | Grupo D — Valores fijos y enumerados |
| 5 | Grupo E — 3D Secure |
| 6 | Grupo F — Mandato AN5822 MasterCard |
| 7 | Grupo G — Agregadores |
| 8 | Grupo H — Validaciones cruzadas |
| 9 | Grupo I — PCI-DSS (datos sensibles) |
| 10 | Grupo J — Tarjeta Presente (EMV) |
| 11 | Ventana de Comercio Electrónico (VCE) |
| 12 | Flujo del bot |
| 13 | Estado post-auditoría iter 3 |
| 14 | Preguntas pendientes |
| 15 | Anexo A — Resolución de preguntas P1-P15 |
| 16 | Anexo B — Diagramas completos |
| 17 | **Generación de Carta `.docx` desde template oficial** *(nueva v3.0)* |
| 18 | **Folio por laboratorio** *(nueva v3.0)* |

---

## Manuales utilizados

El aplicativo valida las reglas extraídas de **10 manuales oficiales** (8 productos + 2 capas transversales). Cada manual tiene un JSON de configuración asociado en `apps/payworks-bot/src/config/mandatory-fields/` que lo *wired* al runtime. Los 14 JSONs (10 manuales + 4 consolidados/derivados) se validaron campo por campo contra los PDF oficiales durante las iteraciones 2 y 3.

| # | Producto / Capa | Manual (nombre exacto) | Versión | JSON runtime |
|---|---|---|---|---|
| 1 | Comercio Electrónico Tradicional | ManualDeIntegración_ComercioElectrónicoTradicional_V2.5.pdf | V2.5 | `ecommerce-tradicional.json` |
| 2 | MOTO | ManualDeIntegración_MOTO_V1.5.pdf | V1.5 | `moto.json` |
| 3 | Cargos Periódicos Post | ManualDeIntegración_CargosPeriódicosPost_V2.1.pdf | V2.1 | `cargos-periodicos-post.json` |
| 4 | Ventana de Comercio Electrónico | Manual de Integración Ventana de Comercio Electrónico_v1.8.pdf | v1.8 | `ventana-comercio-electronico.json` |
| 5 | Agregadores y Aliados (CE) | ManualDeIntegracion_ComercioElectrónicoAgregadoresyAliados_V2.6.4.pdf | V2.6.4 | `agregadores-comercio-electronico.json` |
| 6 | Agregadores Cargos Periódicos | ManualDeIntegración_CargosPeriódicos_Agregadores_V2.6.4.pdf | V2.6.4 | `agregadores-cargos-periodicos.json` |
| 7 | API PW2 Seguro (Tarjeta Presente) | Manual de Integración API PW2 Seguro V2.4.pdf + Anexo V | V2.4 | `api-pw2-seguro.json` |
| 8 | Interredes Remoto (Tarjeta Presente) | Manual de Integración Interredes Remoto V1.7.pdf + Anexos I-VII | V1.7 | `interredes-remoto.json` |
| 9 | 3D Secure 2 (capa transversal) | ManualDeIntegración_3DSecure_Banorte_V1.4.pdf | V1.4 | `layer-3ds.json` |
| 10 | Cybersource Direct (capa transversal) | ManualIntegracion_Cybersource_Direct_V1.10.pdf | V1.10 | `layer-cybersource.json` |

Además de los 10 manuales, el aplicativo mantiene **4 JSONs consolidados/derivados**:

| # | Archivo | Propósito |
|---|---|---|
| 11 | `layer-an5822.json` | Consolidado del mandato MasterCard CIT/MIT a partir de 5 manuales TNP. Define `productMapping` por flujo (firstCIT / subseqCIT / subseqMIT). |
| 12 | `response-rules.json` | Consolidado de reglas de retorno (`RESULTADO_PAYW`, `AUTH_RESULT`, etc.) a partir de 6 fuentes — `compiled-v1.0` del 22-abril-2026. |
| 13 | `agregadores-integradores-tp.json` *(nuevo v3.0)* | Soporte de Agregadores Integradores Tarjeta Presente (`A-CTLSSINTSEG` / `A-INTERSEG` según nomenclaturas oficiales). |
| 14 | `layer-tokenizacion.json` *(nuevo v3.0)* | Capa transversal de tokenización — valida consistencia de marca cuando se opera con tokens (`validateTokenizacionBrandConsistency`). |

---

## Sección 0 — Arquitectura del aplicativo

El aplicativo sigue una arquitectura **hexagonal estricta**. El dominio (entidades `Transaction`, `Field`, `Layer`, `MatrixField`, `CertificationSession`, `Afiliacion`, `ValidationResult`, logs servlet/PROSA/3DS/Cybersource) es independiente de adaptadores concretos. Los casos de uso (`RunCertificationUseCase`, `ValidateTransactionFieldsUseCase`, `GetCertificationHistoryUseCase`) coordinan el dominio con la infraestructura. Los adaptadores de entrada (parser de matriz Excel, parsers de logs servlet/PROSA/3DS/Cybersource, parser de CSV de afiliaciones) y los de salida (renderer `.docx`, repositorios in-memory, dashboard web) son reemplazables sin tocar el dominio.

### Estructura de carpetas

```
apps/payworks-bot/src/
├── core/
│   ├── domain/
│   │   ├── entities/             — Transaction, CertificationSession, Afiliacion, *Log
│   │   ├── value-objects/        — IntegrationType, CardBrand, LaboratoryType, ValidationLayer, ...
│   │   └── services/             — CrossFieldValidator, FolioGenerator, An5822Validator, AnexoDValidator, RateLimitValidator
│   └── application/
│       └── use-cases/            — RunCertificationUseCase, ValidateTransactionFieldsUseCase
├── infrastructure/
│   ├── matrix-parser/            — ExcelMatrixParser
│   ├── log-parsers/              — PayworksServletLogParser, PayworksProsaLogParser, ThreeDSLogParser, CybersourceLogParser
│   ├── parsers/                  — AfiliacionFileParser
│   ├── repositories/             — In-memory (Certification, Transaction, Afiliacion)
│   ├── templates/                — carta-certificacion.template.docx + DocxCertificationLetterRenderer
│   ├── mandatory-rules/          — MandatoryFieldsConfig (carga de los 14 JSONs)
│   └── di/                       — DIContainer
├── presentation/                  — Componentes React (Header, Stepper, RuleLine, ...) + utils
├── app/                           — Next.js 14 App Router (api routes + pages)
├── config/
│   ├── mandatory-fields/         — 14 JSONs runtime (10 manuales + 4 consolidados)
│   └── folio-nomenclatures.json  — sufijos por laboratorio × producto × capas (xlsx oficial)
└── shared/                        — types, mappers
```

### Las 4 familias de integración

Los 8 productos Payworks se agrupan en cuatro familias funcionales para efectos operativos del aplicativo. *Ver Diagrama 1 en Anexo B*.

| Familia | Modelo | Productos |
|---|---|---|
| **Familia 1 — TNP directo** | Tarjeta No Presente directa | Comercio Electrónico Tradicional · MOTO · Cargos Periódicos Post |
| **Familia 2 — Ventana cifrada** | AES/CTR end-to-end | Ventana de Comercio Electrónico (VCE) v1.8 |
| **Familia 3 — Agregadores** | TNP + capa Agregador (3 sub-esquemas) | Agregadores Comercio Electrónico · Agregadores Cargos Periódicos |
| **Familia 4 — Tarjeta Presente (EMV)** | Chip + PinPad | API PW2 Seguro · Interredes Remoto |

### Productos × familia × marcas × capas activas

| Producto | Familia | Marcas soportadas | Capas activas |
|---|---|---|---|
| Comercio Electrónico Tradicional | F1 — TNP directo | VISA / MC / **AMEX** | Servlet + 3DS + Cybersource + AN5822 |
| MOTO | F1 — TNP directo | VISA / MC | Servlet + AN5822 |
| Cargos Periódicos Post | F1 — TNP directo | VISA / MC | Servlet + AN5822 + Rate Limit |
| Ventana CE (VCE) | F2 — Ventana cifrada | VISA / MC / AMEX | Servlet + 3DS + Cybersource + AN5822 |
| Agregadores CE | F3 — Agregadores | VISA / MC | Servlet + Agregador + 3DS + Cybersource + AN5822 |
| Agregadores CP | F3 — Agregadores | VISA / MC | Servlet + Agregador + AN5822 + Rate Limit |
| API PW2 Seguro | F4 — Tarjeta Presente | VISA / MC / AMEX | Servlet + EMV |
| Interredes Remoto | F4 — Tarjeta Presente | VISA / MC / AMEX | Servlet + EMV |

> **Cambio v3.0**: AMEX ahora es marca completa en `CardBrand` (antes solo se reconocía en 3DS para `validValuesByBrand` de ECI). Los productos TNP (Tradicional, API PW2, Interredes) admiten oficialmente AMEX según los manuales V2.5 / V2.4 / V1.7.

### Pipeline de evaluación de campos — 10 niveles en `FieldRequirement.ts`

Cada campo en cada transacción recorre el pipeline de arriba a abajo. El primer nivel que matchea termina la evaluación (short-circuit). Las reglas cruzadas C1-C14 se ejecutan después del pipeline por-campo como capa adicional de coherencia entre campos. El evaluador es agnóstico a la marca — la aplicación resuelve el contexto llamando a `resolveSpecForBrand` antes de invocar al evaluador.

| # | Nivel | Descripción |
|---|---|---|
| 1 | **N/A** (Not Applicable) | Si el campo no aplica a esta combinación (tipo × marca × capa), se omite sin evaluar. |
| 2 | **PROHIBITED** (v5) | Si el campo está marcado como prohibido y trae valor, FAIL. Ej: `IND_PAGO` en CANCELACION debe estar ausente. |
| 3 | **R_PCI** (presencia silenciosa) | Campos PCI (PASSWORD, SECURITY_CODE, PAN completo) pasan sin loggearse — cumplimiento PCI-DSS Requirement 3. |
| 4 | **R** (Required) — presencia obligatoria | El campo debe existir en el log y tener valor no vacío. Si está ausente o vacío: FAIL. |
| 5 | **O** (Opcional) ausente — short-circuit | Si el campo es opcional y está ausente, se considera PASS y se termina la evaluación del pipeline. |
| 6 | **omitIfEmpty** | Regla E1 clásica: si el campo existe pero llega en blanco, se omite del POST (XID/CAVV nulos en MC). |
| 7 | **Vacío rechazado** | Si el campo es presente pero vacío, y no está marcado `omitIfEmpty`, el bot lo reporta como FAIL. |
| 8 | **FORBIDDEN_CHARS** — lista unificada | Se aplica regex unificado (superset). Para Cybersource la verificación de acentos es adicional. |
| 9 | **Validación semántica** | 9a `fixedValue` · 9b `validValues` (con variantes `byBrand` y nuevo `requiredByBrand` v3.0) · 9c `maxLength` · 9d regex específico. |
| 10 | **mustBeMasked** | Para CARD_NUMBER en logs se exige enmascaramiento PCI (ej. `518899******7492`). FAIL si aparece en claro. |

> **Cambio v3.0**: el nivel 9 (Validación semántica) ahora soporta `requiredByBrand` para reglas R/O distintas por marca, no solo `validValuesByBrand` como en v2.0. Esto resuelve P9 (revisión Ramsses) — los campos AMEX de TNP (DOMICILIO, CODIGO_POSTAL, TELEFONO, CORREO_ELECTRONICO) ahora son R cuando `CARD_BRAND=AMEX` y O para otras marcas.

*Ver Diagrama 8 en Anexo B para visualización completa del pipeline.*

### Cobertura de tests

- **26 suites** de Jest (`apps/payworks-bot/__tests__/unit/` + `__tests__/integration/regression/`).
- **387+ tests** unitarios verdes — short-circuit garantiza rendimiento O(1) en casos típicos.
- **4 specs Cypress E2E** (`__tests__/cypress/e2e/0[1-4]-bundle-*.cy.ts`) cubren los 4 bundles canónicos con assertions de veredicto y conteos PASS/FAIL por capa.
- **Type-check limpio**: `npx tsc --noEmit` sin errores.

