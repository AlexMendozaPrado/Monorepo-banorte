# Plan de Implementacion: POC Payworks Bot

## Contexto

Automatizar la certificacion de comercios en Payworks. El proceso manual (2-4 hrs por comercio) implica: buscar transacciones en BD Oracle (`VTRANSACCIONES`), descargar LOGs de OwnCloud (Servlet + PROSA), parsear LOGs, y comparar campos contra matriz de datos mandatorios. El bot automatiza los pasos 3-7, reduciendo a 5-30 min.

**Estrategia dual:**
- **Alternativa A** (semi-auto): analista sube CSV de BD y LOGs manualmente
- **Alternativa B** (full-auto): conexion directa a BD Oracle y OwnCloud via WebDAV

Ambas comparten la misma UI de resultados, mismos use cases, mismos parsers. Solo cambia la fuente de datos (Ports).

**Pantallas disenadas en Magic Patterns:**
1. Dashboard de certificaciones
2. Carga de Matriz de Pruebas
3. Resultados de certificacion (con tabla campo por campo)
4. Estado de procesamiento (progress)
5. Wizard semi-automatico (stepper 4 pasos)
6. Detalle de transaccion (visor de LOGs)

**Arquitectura:** Clean Architecture + DDD, mismos patrones que `apps/sentiment-analysis/`

---

## Fases y Commits

### Fase 1: Setup del Proyecto en el Monorepo
**Duracion:** Dia 1-2

| # | Tarea | Commit |
|---|-------|--------|
| 1.1 | Crear `apps/payworks-bot/` con package.json, tsconfig.json | `chore(payworks-bot): scaffold project structure` |
| 1.2 | Configurar tailwind.config.js con preset Banorte, next.config.js | `chore(payworks-bot): configure tailwind with banorte preset and next.js` |
| 1.3 | Configurar jest.config.js, jest.setup.js | `chore(payworks-bot): configure jest for unit testing` |
| 1.4 | Agregar scripts al root package.json y env vars a turbo.json | `chore(monorepo): add payworks-bot to workspace scripts and turbo config` |
| 1.5 | Crear layout.tsx y page.tsx base con Header | `feat(payworks-bot): add root layout with banorte header` |

**Verificacion:** `pnpm install && pnpm dev:payworks` arranca en :3006

---

### Fase 2: Capa de Dominio
**Duracion:** Dia 2-4

| # | Tarea | Commit |
|---|-------|--------|
| 2.1 | Value Objects: TransactionType, CardBrand, IntegrationType, ValidationVerdict, FieldRequirement, MandatoryFieldsMatrix | `feat(payworks-bot): add domain value objects` |
| 2.2 | Entidades: Transaction, ServletLog, ProsaLog | `feat(payworks-bot): add domain entities for transactions and logs` |
| 2.3 | Entidades: CertificationSession, ValidationResult, FieldValidationResult | `feat(payworks-bot): add domain entities for certification results` |
| 2.4 | Ports: TransactionRepositoryPort, LogRetrievalPort, ServletLogParserPort, ProsaLogParserPort | `feat(payworks-bot): add domain port interfaces for data access` |
| 2.5 | Ports: MatrixParserPort, MandatoryFieldsPort, CertificationRepositoryPort, ReportGeneratorPort | `feat(payworks-bot): add domain port interfaces for business operations` |

**Verificacion:** `pnpm type-check --filter=payworks-bot` sin errores

---

### Fase 3: Parsers de LOGs (core del valor)
**Duracion:** Dia 4-6

| # | Tarea | Commit |
|---|-------|--------|
| 3.1 | PayworksServletLogParser: parsea formato `CAMPO: [valor]`, busca por NUMERO_CONTROL | `feat(payworks-bot): implement servlet log parser` |
| 3.2 | Tests para ServletLogParser con fixtures reales del documento | `test(payworks-bot): add servlet log parser unit tests with real fixtures` |
| 3.3 | PayworksProsaLogParser: parsea formato ISO 8583 `Campo N: [valor]`, busca por REFERENCIA (Campo 37) | `feat(payworks-bot): implement prosa ISO 8583 log parser` |
| 3.4 | Tests para ProsaLogParser con fixtures reales | `test(payworks-bot): add prosa log parser unit tests with real fixtures` |
| 3.5 | ExcelMatrixParser: parsea Matriz de Pruebas .xlsx | `feat(payworks-bot): implement excel matrix parser` |

**Verificacion:** `pnpm test:unit --filter=payworks-bot` - parsers extraen campos correctamente de LOGs reales

---

### Fase 4: Mandatory Fields + Repositorios + DI
**Duracion:** Dia 5-7

| # | Tarea | Commit |
|---|-------|--------|
| 4.1 | JSONs de matrices mandatorias: ecommerce-tradicional.json (completo basado en documento Datos_mandatorios.pdf) | `feat(payworks-bot): add mandatory fields config for e-commerce tradicional` |
| 4.2 | JSONs restantes: tokenizacion, ventana, cybersource, agregadores x2 | `feat(payworks-bot): add mandatory fields config for all integration types` |
| 4.3 | MandatoryFieldsConfig: implementa MandatoryFieldsPort, carga JSONs | `feat(payworks-bot): implement mandatory fields config loader` |
| 4.4 | InMemoryTransactionRepository + InMemoryCertificationRepository | `feat(payworks-bot): add in-memory repositories` |
| 4.5 | FileUploadLogRetrieval: retorna contenido de archivos subidos | `feat(payworks-bot): add file upload log retrieval adapter` |
| 4.6 | DIContainer: singleton, lazy init, seleccion de implementacion por operationMode | `feat(payworks-bot): implement dependency injection container` |

**Verificacion:** DIContainer instancia correctamente todos los componentes

---

### Fase 5: Use Cases
**Duracion:** Dia 7-9

| # | Tarea | Commit |
|---|-------|--------|
| 5.1 | ParseTestMatrixUseCase | `feat(payworks-bot): implement parse test matrix use case` |
| 5.2 | ValidateTransactionFieldsUseCase: compara campos vs mandatorios | `feat(payworks-bot): implement validate transaction fields use case` |
| 5.3 | Tests para ValidateTransactionFieldsUseCase (APROBADO, RECHAZADO, multiples tipos integracion) | `test(payworks-bot): add validation use case unit tests` |
| 5.4 | RunCertificationUseCase: orquesta flujo completo (parsea matriz → obtiene BD → obtiene LOGs → parsea → valida) | `feat(payworks-bot): implement run certification orchestrator use case` |
| 5.5 | Tests para RunCertificationUseCase con mocks | `test(payworks-bot): add certification orchestrator integration tests` |
| 5.6 | GetCertificationHistoryUseCase + GenerateReportUseCase | `feat(payworks-bot): implement history and report use cases` |
| 5.7 | Barrel exports (index.ts) | `refactor(payworks-bot): add barrel exports for use cases` |

**Verificacion:** `pnpm test --filter=payworks-bot` - todos los use cases pasan con mocks

---

### Fase 6: Presentacion - Adaptar Pantallas
**Duracion:** Dia 9-12

| # | Tarea | Commit |
|---|-------|--------|
| 6.1 | Adaptar Header.tsx: usar tokens Tailwind en vez de hex hardcoded | `feat(payworks-bot): adapt header component to design system` |
| 6.2 | Adaptar StatCard.tsx + StatusBadge.tsx: usar Card de @banorte/ui | `feat(payworks-bot): adapt stat cards and status badges` |
| 6.3 | Adaptar CertificationsTable.tsx: usar Table de @banorte/ui | `feat(payworks-bot): adapt certifications table component` |
| 6.4 | Dashboard page completa (dashboard/page.tsx) | `feat(payworks-bot): implement dashboard page` |
| 6.5 | Adaptar UploadCard.tsx: dropzone + selector integracion + selector modo | `feat(payworks-bot): adapt upload card with integration selector` |
| 6.6 | Pagina nueva-certificacion (nueva-certificacion/page.tsx) | `feat(payworks-bot): implement new certification page` |
| 6.7 | Adaptar UploadWizardSteps.tsx (stepper semi-auto con 4 pasos) | `feat(payworks-bot): implement semi-auto upload wizard` |
| 6.8 | Adaptar TransactionResultCard.tsx + FieldValidationTable.tsx | `feat(payworks-bot): implement transaction result cards with field validation` |
| 6.9 | Pagina resultados/[id]/page.tsx | `feat(payworks-bot): implement certification results page` |
| 6.10 | Adaptar LogViewer.tsx (tabs Servlet/PROSA, dark code block) | `feat(payworks-bot): implement transaction log viewer` |
| 6.11 | Pagina transaccion/[ref]/page.tsx (detalle con LOGs side by side) | `feat(payworks-bot): implement transaction detail page` |
| 6.12 | Adaptar ProcessingChecklist.tsx (progress bar + checklist animada) | `feat(payworks-bot): implement processing status page` |

**Verificacion:** Todas las paginas renderizan correctamente, navegacion funciona

---

### Fase 7: API Routes + Integracion
**Duracion:** Dia 12-14

| # | Tarea | Commit |
|---|-------|--------|
| 7.1 | API Route POST /api/certificacion/validar: recibe FormData, ejecuta RunCertificationUseCase | `feat(payworks-bot): implement certification validation API route` |
| 7.2 | API Route GET /api/certificacion/historial | `feat(payworks-bot): implement certification history API route` |
| 7.3 | API Route GET /api/certificacion/reporte/[id] (genera PDF) | `feat(payworks-bot): implement PDF report generation API route` |
| 7.4 | API Route GET /api/health | `feat(payworks-bot): implement health check endpoint` |
| 7.5 | Conectar frontend con API routes (fetch desde pages) | `feat(payworks-bot): connect frontend pages to API routes` |
| 7.6 | Pruebas end-to-end del flujo completo | `test(payworks-bot): add end-to-end flow validation` |
| 7.7 | Ajustes finales, limpieza | `chore(payworks-bot): final cleanup and adjustments` |

**Verificacion final:**
- `pnpm dev:payworks` arranca en :3006
- Dashboard muestra datos mock
- Subir Matriz Excel → seleccionar integracion → iniciar → ver resultados con campos validados
- `pnpm test --filter=payworks-bot` - todos pasan
- Parsers procesan LOGs reales del documento correctamente

---

## Fase Futura: Conectores Reales (Post-POC)

| # | Tarea | Commit |
|---|-------|--------|
| F.1 | OracleTransactionRepository (driver oracledb, query a VTRANSACCIONES) | `feat(payworks-bot): add oracle database transaction repository` |
| F.2 | OwnCloudLogRetrieval (WebDAV API, descarga Http.log) | `feat(payworks-bot): add owncloud webdav log retrieval` |
| F.3 | PDFReportGenerator (jsPDF, dictamen formal) | `feat(payworks-bot): implement pdf report generator` |
| F.4 | Actualizar DIContainer para modo 'auto' con conectores reales | `feat(payworks-bot): enable full-auto mode with oracle and owncloud` |

---

## Estructura Final del Proyecto

```
apps/payworks-bot/
├── src/
│   ├── core/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   ├── Transaction.ts
│   │   │   │   ├── ServletLog.ts
│   │   │   │   ├── ProsaLog.ts
│   │   │   │   ├── CertificationSession.ts
│   │   │   │   └── ValidationResult.ts
│   │   │   ├── value-objects/
│   │   │   │   ├── TransactionType.ts
│   │   │   │   ├── CardBrand.ts
│   │   │   │   ├── IntegrationType.ts
│   │   │   │   ├── ValidationVerdict.ts
│   │   │   │   ├── FieldRequirement.ts
│   │   │   │   └── MandatoryFieldsMatrix.ts
│   │   │   └── ports/
│   │   │       ├── TransactionRepositoryPort.ts
│   │   │       ├── LogRetrievalPort.ts
│   │   │       ├── ServletLogParserPort.ts
│   │   │       ├── ProsaLogParserPort.ts
│   │   │       ├── MatrixParserPort.ts
│   │   │       ├── MandatoryFieldsPort.ts
│   │   │       ├── CertificationRepositoryPort.ts
│   │   │       └── ReportGeneratorPort.ts
│   │   └── application/
│   │       └── use-cases/
│   │           ├── ParseTestMatrixUseCase.ts
│   │           ├── ValidateTransactionFieldsUseCase.ts
│   │           ├── RunCertificationUseCase.ts
│   │           ├── GenerateReportUseCase.ts
│   │           ├── GetCertificationHistoryUseCase.ts
│   │           └── index.ts
│   ├── infrastructure/
│   │   ├── log-parsers/
│   │   │   ├── PayworksServletLogParser.ts
│   │   │   └── PayworksProsaLogParser.ts
│   │   ├── matrix-parser/
│   │   │   └── ExcelMatrixParser.ts
│   │   ├── mandatory-rules/
│   │   │   └── MandatoryFieldsConfig.ts
│   │   ├── repositories/
│   │   │   ├── InMemoryTransactionRepository.ts
│   │   │   └── InMemoryCertificationRepository.ts
│   │   ├── log-retrieval/
│   │   │   └── FileUploadLogRetrieval.ts
│   │   └── di/
│   │       └── DIContainer.ts
│   ├── presentation/
│   │   └── components/
│   │       ├── Header.tsx
│   │       ├── StatCard.tsx
│   │       ├── StatusBadge.tsx
│   │       ├── CertificationsTable.tsx
│   │       ├── UploadCard.tsx
│   │       ├── TransactionResultCard.tsx
│   │       ├── FieldValidationTable.tsx
│   │       ├── LogViewer.tsx
│   │       ├── ProcessingChecklist.tsx
│   │       └── UploadWizardSteps.tsx
│   ├── config/
│   │   └── mandatory-fields/
│   │       ├── ecommerce-tradicional.json
│   │       ├── ecommerce-tokenizacion.json
│   │       ├── ventana-comercios.json
│   │       ├── cybersource-directo.json
│   │       ├── agregadores-ecomm.json
│   │       └── agregadores-cargos-auto.json
│   ├── shared/
│   │   └── types/
│   │       └── api.ts
│   └── app/
│       ├── layout.tsx
│       ├── page.tsx
│       ├── dashboard/page.tsx
│       ├── nueva-certificacion/page.tsx
│       ├── wizard/page.tsx
│       ├── procesamiento/page.tsx
│       ├── resultados/[id]/page.tsx
│       ├── transaccion/[ref]/page.tsx
│       └── api/
│           ├── certificacion/
│           │   ├── validar/route.ts
│           │   ├── reporte/[id]/route.ts
│           │   └── historial/route.ts
│           └── health/route.ts
├── __tests__/
│   ├── mocks/
│   │   ├── testData.ts
│   │   ├── LogParserMock.ts
│   │   ├── RepositoryMock.ts
│   │   └── TransactionRepositoryMock.ts
│   └── unit/
│       ├── log-parsers/
│       │   ├── PayworksServletLogParser.test.ts
│       │   └── PayworksProsaLogParser.test.ts
│       └── use-cases/
│           ├── ValidateTransactionFieldsUseCase.test.ts
│           └── RunCertificationUseCase.test.ts
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
├── jest.config.js
└── jest.setup.js
```

---

## Contactos del Proyecto

- **Solicitante:** Daniel Eliud Guzman Villarreal
- **Sponsor:** Jorge Ramon Carranza Velez
- **Documentacion:** Oscar Eduardo Wong Martinez
- **Equipo Tecnico:** Por definir
