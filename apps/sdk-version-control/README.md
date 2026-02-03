# SDK Version Control

Dashboard para monitoreo, gestion y comparacion de versiones de SDKs de terceros integrados en las aplicaciones de Banorte.

## Descripcion

Esta aplicacion permite a los equipos de desarrollo rastrear las versiones de SDKs utilizados (Incode, Firebase, Segment, AppsFlyer, Dynatrace, Stripe, Braze, Contentful) a traves de multiples plataformas (Web, iOS, Android) y canales de despliegue de Banorte.

### Funcionalidades principales

- **Gestion de servicios (CRUD)**: Crear, editar y eliminar servicios/SDKs con informacion detallada.
- **Monitoreo de versiones**: Scraping automatico de versiones mas recientes desde la documentacion oficial de cada SDK.
- **Estado de versiones**: Calculo inteligente del estado de cada version (current, warning, outdated, critical).
- **Comparacion de servicios**: Comparacion lado a lado de 2 a 4 servicios con desglose por plataforma.
- **Filtros avanzados**: Filtrado por categoria, plataforma, estado, status del proyecto, entidad y ASM.
- **Estadisticas en tiempo real**: Conteo total, desglose por estado, categoria y plataforma.
- **Canales Banorte**: Seguimiento de 9 canales de despliegue (Banorte Movil, Contrata, Casa de Bolsa, SGV1, APM, MBIO, Banortec, Auto, BMJS).
- **Tracking de proyecto**: Estado del proyecto, fecha de implementacion y responsables (Negocio, TI, ERN).

## Arquitectura

El proyecto sigue **Clean Architecture** con **Domain-Driven Design (DDD)**:

```
src/
├── app/                          # UI Layer (Next.js App Router)
│   ├── api/                      # API Routes (REST endpoints)
│   ├── components/               # React components
│   │   ├── dashboard/            # Dashboard (ServiceCard, FilterBar, etc.)
│   │   └── layout/               # Layout principal
│   └── hooks/                    # Custom hooks (useServices, useComparison, etc.)
│
├── core/                         # Domain & Application Layer
│   ├── domain/
│   │   ├── entities/             # Service, SDKVersion, VersionCheckResult
│   │   ├── value-objects/        # ProjectStatus, EntityType, Channel, SemanticVersion, etc.
│   │   ├── exceptions/           # Excepciones de dominio
│   │   └── ports/                # Interfaces (IServiceRepository, IVersionCheckerPort)
│   └── application/
│       ├── use-cases/            # GetAllServices, CreateService, CompareServices, etc.
│       └── dtos/                 # ServiceDTO, ComparisonDTO, ResponseDTO
│
└── infrastructure/               # Infrastructure Layer
    ├── di/                       # Contenedor de inyeccion de dependencias
    ├── repositories/             # InMemoryServiceRepository, GitHubServiceRepository
    ├── scrapers/                 # Web scrapers para deteccion de versiones
    ├── services/                 # GitHubApiClient, JSONConfigLoader
    └── config/                   # Configuracion de scraping y GitHub
```

### Patrones de diseno

- **Dependency Injection**: Contenedor DI ligero para desacoplar capas.
- **Repository Pattern**: Abstraccion `IServiceRepository` con implementaciones InMemory y GitHub.
- **Port/Adapter Pattern**: `IVersionCheckerPort` para web scraping.
- **Use Cases**: Un caso de uso por operacion (Single Responsibility Principle).
- **Value Objects**: Objetos inmutables y validados para el dominio.

## API

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `/api/services` | GET | Listar servicios (soporta query params: `category`, `platform`, `status`, `search`) |
| `/api/services` | POST | Crear un servicio |
| `/api/services/[id]` | GET | Obtener servicio por ID |
| `/api/services/[id]` | PUT | Actualizar servicio |
| `/api/services/[id]` | PATCH | Actualizar solo la version |
| `/api/services/[id]` | DELETE | Eliminar servicio |
| `/api/services/check-updates` | POST | Verificar versiones mas recientes (`serviceIds`, `platforms`, `forceRefresh`) |
| `/api/services/compare` | GET | Comparar servicios (`ids`, `platforms`) |
| `/api/health` | GET | Health check |

Formato de respuesta:

```json
{
  "success": true,
  "data": {},
  "error": { "code": "string", "message": "string" }
}
```

## Inicio rapido

### Requisitos

- Node.js >= 18.0.0
- pnpm (monorepo)

### Desarrollo

```bash
# Desde la raiz del monorepo
pnpm dev:sdk-control

# O directamente desde la app
cd apps/sdk-version-control
pnpm dev
```

La aplicacion estara disponible en `http://localhost:3005`.

### Build

```bash
# Desde la raiz del monorepo
pnpm build:sdk-control

# O directamente
cd apps/sdk-version-control
pnpm build
pnpm start
```

### Scripts disponibles

| Script | Descripcion |
|--------|-------------|
| `dev` | Inicia el servidor de desarrollo en puerto 3005 |
| `build` | Genera el build de produccion |
| `start` | Inicia el servidor de produccion en puerto 3005 |
| `lint` | Ejecuta ESLint |
| `type-check` | Verifica tipos con TypeScript |
| `clean` | Limpia cache de `.next`, `.turbo` y `node_modules/.cache` |

## Variables de entorno

```bash
# Estrategia de repositorio
REPOSITORY_TYPE=memory              # "memory" (desarrollo) o "github" (produccion)

# Configuracion de GitHub (para persistencia en produccion)
GITHUB_TOKEN=ghp_xxxxx             # Personal Access Token con scope "repo"
GITHUB_OWNER=AlexMendozaPrado      # Owner del repositorio
GITHUB_REPO=Monorepo-banorte       # Nombre del repositorio
GITHUB_BRANCH=main                 # Branch para commits
GITHUB_CONFIG_PATH=apps/sdk-version-control/src/infrastructure/config/services.config.json
GITHUB_COMMITTER_NAME=SDK Version Control Bot
GITHUB_COMMITTER_EMAIL=sdk-bot@banorte.com
```

### Modos de persistencia

- **`memory`**: Los datos viven en memoria (InMemoryServiceRepository). Ideal para desarrollo local. Los datos no persisten entre reinicios.
- **`github`**: Los cambios se persisten como commits automaticos al repositorio (GitHubServiceRepository). Si la configuracion de GitHub es invalida, hace fallback automatico a memoria.

Cuando se usa el modo `github`, las operaciones CRUD generan commits automaticos:
- Crear: `feat(services): add NombreServicio`
- Actualizar: `chore(services): update NombreServicio`
- Eliminar: `chore(services): remove NombreServicio`

## Stack tecnologico

- **Framework**: Next.js 14 (App Router)
- **UI**: React 18, Tailwind CSS 3.4, @banorte/ui (design system)
- **Lenguaje**: TypeScript 5.4
- **Validacion**: Zod
- **Iconos**: Lucide React
- **Fechas**: date-fns
- **Scraping**: Cheerio
- **HTTP**: Axios
- **IDs**: UUID

## Modelo de dominio

### Entidades principales

- **Service** (Aggregate Root): Representa un SDK/servicio con su nombre, categoria, versiones por plataforma, canales de despliegue e informacion del proyecto.
- **SDKVersion**: Version de un SDK para una plataforma especifica, con version actual, ultima version disponible y estado.
- **VersionCheckResult**: Resultado de una verificacion de version contra la documentacion oficial.

### Value Objects

| Value Object | Valores |
|--------------|---------|
| `ProjectStatus` | `productivo`, `piloto`, `desarrollo`, `iniciativa` |
| `EntityType` | `banco`, `filial` |
| `Channel` | Banorte Movil, Contrata, Casa de Bolsa, SGV1, APM, MBIO, Banortec, Auto, BMJS |
| `PlatformType` | `web`, `ios`, `android` |
| `VersionStatus` | `current`, `warning`, `outdated`, `critical`, `unknown` |
| `SemanticVersion` | Parseo y comparacion de versiones `major.minor.patch` |

### Colores por estado

```
productivo  → #6CC04A (Verde)
piloto      → #FFA400 (Naranja)
desarrollo  → #3B82F6 (Azul)
iniciativa  → #9CA3AF (Gris)
```

```
banco  → #EC0029 (Rojo Banorte)
filial → #3B82F6 (Azul)
```
