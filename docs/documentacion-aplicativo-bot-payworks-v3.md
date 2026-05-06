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
