# Banorte Sentiment Analysis POC

Una aplicación web Next.js 14+ para análisis de sentimientos de documentos PDF usando OpenAI GPT-4, construida con principios de Clean Architecture.

## 🚀 Características Principales

### 📄 Análisis de Documentos
- **Carga de archivos PDF** (máximo 10MB)
- **Extracción automática de texto** de documentos PDF
- **Análisis de sentimientos** usando OpenAI GPT-4
- **Detección de emociones** específicas (alegría, tristeza, enojo, miedo, sorpresa, disgusto)
- **Métricas de texto** (palabras, oraciones, legibilidad)
- **Indicador de confianza** del análisis
- **Tiempo de procesamiento** detallado

### 📊 Historial y Análisis
- **Visualización de análisis previos** con tabla interactiva
- **Filtros avanzados** por:
  - Cliente
  - Canal de comunicación
  - Tipo de sentimiento (positivo, neutral, negativo)
  - Rango de fechas
  - Nivel de confianza
- **Paginación y ordenamiento** de resultados
- **Estadísticas agregadas** del historial

### 📤 Exportación de Datos
- **Exportación a CSV y JSON**
- **Configuración de campos** incluidos en la exportación
- **Aplicación de filtros** a los datos exportados
- **Descarga directa** de archivos

### 🎨 Interfaz de Usuario
- **Diseño responsivo** con Material-UI
- **Branding de Banorte** (colores corporativos)
- **Navegación por pestañas** intuitiva
- **Indicadores de carga** y estados de progreso
- **Manejo de errores** con mensajes informativos

## 🏗️ Arquitectura

Esta aplicación implementa **Clean Architecture (Arquitectura Hexagonal)** con clara separación de responsabilidades:

### 🎯 Domain Layer (`src/core/domain/`)
- **Entidades**: `SentimentAnalysis`, `Conversation`
- **Value Objects**: `EmotionScore`, `SentimentType`, `AnalysisMetrics`
- **Ports**: Interfaces para dependencias externas

### ⚙️ Application Layer (`src/core/application/`)
- **Use Cases**: Lógica de negocio pura
  - `AnalyzeSentimentUseCase`: Análisis de documentos
  - `GetHistoricalAnalysisUseCase`: Consulta de historial
  - `FilterAnalysisUseCase`: Filtrado de análisis
  - `ExportAnalysisUseCase`: Exportación de datos

### 🔧 Infrastructure Layer (`src/infrastructure/`)
- **OpenAISentimentAnalyzer**: Integración con OpenAI GPT-4
- **PDFTextExtractor**: Extracción de texto de PDFs
- **InMemorySentimentAnalysisRepository**: Almacenamiento en memoria
- **CSVExportService**: Servicio de exportación

### 🖥️ Presentation Layer (`src/app/`)
- **Componentes React** con Material-UI
- **API Routes** de Next.js
- **Páginas** y navegación
- **Manejo de estado** y efectos

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18.0.0 o superior
- Yarn 1.22.0 o superior
- Cuenta de OpenAI con API key

### 1. Instalar dependencias
```bash
yarn install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env.local
```

### 3. Configurar `.env.local`
```env
# OpenAI Configuration
OPENAI_API_KEY=tu_api_key_de_openai_aqui

# Application Configuration
NEXT_PUBLIC_APP_NAME=Banorte Sentiment Analysis
NEXT_PUBLIC_APP_VERSION=1.0.0

# File Upload Configuration
MAX_FILE_SIZE=10485760  # 10MB en bytes
ALLOWED_FILE_TYPES=application/pdf

# OpenAI Model Configuration
DEFAULT_MODEL=gpt-4
MAX_TOKENS=4000
TEMPERATURE=0.3
```

### 4. Ejecutar en desarrollo
```bash
yarn dev
```

### 5. Abrir en el navegador
Visita [http://localhost:3000](http://localhost:3000)

## 🤖 Configuración de Proveedores de IA

La aplicación soporta **múltiples proveedores de IA** para el análisis de sentimientos, permitiendo flexibilidad entre soluciones cloud y locales:

### Proveedores Disponibles

#### 1. OpenAI (Default)
**Características**:
- Modelos: GPT-4, GPT-4 Turbo, GPT-3.5 Turbo
- Alta precisión en análisis de sentimientos
- Requiere conexión a internet y API key

**Configuración**:
```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
DEFAULT_MODEL=gpt-4
```

#### 2. Ollama (Local LLM)
**Características**:
- Modelos locales: Llama 3.2, Qwen 2.5, Llama 3.1, Mistral, CodeLlama
- Sin costo de API, procesamiento 100% local
- No requiere conexión a internet
- Mayor privacidad de datos

**Configuración**:
```env
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2  # o qwen2.5:latest para mejor precisión
```

**Modelos Recomendados**:
- `llama3.2:latest` (2.0 GB) - Rápido y eficiente
- `qwen2.5:latest` (4.7 GB) - Mayor precisión y mejor comprensión contextual

### Instalación de Ollama

#### Windows
1. Descargar desde [https://ollama.ai](https://ollama.ai)
2. Ejecutar el instalador
3. Abrir terminal y ejecutar:
```bash
ollama pull llama3.2
```

#### Linux
```bash
curl -fsSL https://ollama.ai/install.sh | sh
ollama pull llama3.2
```

#### macOS
```bash
brew install ollama
ollama serve &
ollama pull llama3.2
```

#### Verificar instalación
```bash
# Verificar que Ollama está corriendo
curl http://localhost:11434/api/tags

# Listar modelos disponibles
ollama list
```

### Modelos Recomendados de Ollama

| Modelo | Tamaño | Uso RAM | Velocidad | Calidad |
|--------|--------|---------|-----------|---------|
| llama3.2 | ~2GB | 4GB | ⚡⚡⚡ Rápido | ⭐⭐⭐ Buena |
| llama3.1 | ~4GB | 8GB | ⚡⚡ Media | ⭐⭐⭐⭐ Muy Buena |
| mistral | ~4GB | 8GB | ⚡⚡⚡ Rápido | ⭐⭐⭐⭐ Muy Buena |
| llama2 | ~3GB | 6GB | ⚡⚡ Media | ⭐⭐⭐ Buena |

### Cambiar entre Proveedores

Simplemente cambia la variable `AI_PROVIDER` en tu `.env.local`:

```bash
# Usar OpenAI
AI_PROVIDER=openai

# Usar Ollama
AI_PROVIDER=ollama
```

**No se requieren cambios en el código** - la arquitectura usa el patrón Strategy para intercambiar proveedores dinámicamente.

### Parámetros Opcionales Comunes

Ambos proveedores soportan configuración opcional:

```env
# Temperatura (creatividad del modelo)
# - OpenAI default: 0.3
# - Ollama default: 0.8
# - Rango: 0.0-2.0
TEMPERATURE=0.3

# Máximo de tokens a generar
# - OpenAI default: 4000
# - Ollama default: ilimitado (-1)
MAX_TOKENS=4000
```

### Arquitectura de Proveedores

La abstracción de proveedores de IA se implementa usando:

- **Port**: `SentimentAnalyzerPort` (interfaz del dominio)
- **Adapters**: `OpenAISentimentAnalyzer`, `OllamaSentimentAnalyzer`
- **Factory**: `SentimentAnalyzerFactory` (crea el adaptador correcto)
- **DI Container**: Inyecta el adaptador según configuración

Esto sigue los principios de **Hexagonal Architecture** y permite agregar nuevos proveedores sin modificar el código existente.

### Comparación de Proveedores

| Característica | OpenAI | Ollama |
|---------------|--------|--------|
| **Costo** | Por token | Gratis |
| **Privacidad** | Cloud | 100% Local |
| **Internet** | Requerido | No requerido |
| **Velocidad** | Media-Rápida | Rápida* |
| **Calidad** | Excelente | Muy Buena* |
| **Setup** | API Key | Instalación local |

\* *Depende del modelo y hardware*

## 📁 Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router (Presentation Layer)
│   ├── api/               # API Routes
│   │   ├── analyze/       # Endpoint de análisis
│   │   └── analyses/      # Endpoints de historial y exportación
│   ├── components/        # React Components
│   │   ├── AnalyzePage.tsx
│   │   ├── HistoryPage.tsx
│   │   ├── FileUploadZone.tsx
│   │   ├── AnalysisResults.tsx
│   │   ├── AnalysisTable.tsx
│   │   ├── AnalysisFilters.tsx
│   │   └── ...
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Página principal
│   └── theme.ts           # Tema de Material-UI
├── core/
│   ├── domain/            # Domain Layer
│   │   ├── entities/      # Entidades de dominio
│   │   ├── value-objects/ # Objetos de valor
│   │   └── ports/         # Interfaces/Puertos
│   └── application/       # Application Layer
│       └── use-cases/     # Casos de uso
├── infrastructure/        # Infrastructure Layer
│   ├── sentiment/         # Analizador OpenAI
│   ├── text-extraction/   # Extractor PDF
│   ├── repository/        # Repositorio en memoria
│   ├── export/           # Servicios de exportación
│   └── di/               # Inyección de dependencias
└── shared/               # Utilidades compartidas
    ├── types/            # Tipos TypeScript
    └── utils/            # Funciones utilitarias
```

## 🔄 Flujo de Trabajo

### Análisis de Documentos
1. **Carga**: Usuario sube archivo PDF a través de la interfaz
2. **Extracción**: Sistema extrae texto del PDF usando `PDFTextExtractor`
3. **Análisis**: OpenAI GPT-4 analiza el sentimiento y emociones
4. **Métricas**: Se calculan métricas de texto y tiempo de procesamiento
5. **Almacenamiento**: Resultado se guarda en el repositorio
6. **Visualización**: Resultados se muestran en la interfaz

### Consulta de Historial
1. **Filtros**: Usuario aplica filtros de búsqueda
2. **Consulta**: Sistema consulta el repositorio con filtros aplicados
3. **Paginación**: Resultados se paginan y ordenan
4. **Estadísticas**: Se calculan estadísticas agregadas
5. **Exportación**: Opción de exportar resultados filtrados

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Next.js 14+**: Framework React con App Router
- **TypeScript**: Tipado estático
- **Material-UI (MUI)**: Componentes de interfaz
- **React Hook Form**: Manejo de formularios
- **Axios**: Cliente HTTP

### Backend
- **Next.js API Routes**: Endpoints REST
- **OpenAI API**: Análisis de sentimientos con GPT-4
- **PDF-Parse**: Extracción de texto de PDFs
- **UUID**: Generación de identificadores únicos

### Arquitectura
- **Clean Architecture**: Separación de capas
- **Dependency Injection**: Inversión de dependencias
- **Repository Pattern**: Abstracción de datos
- **Use Case Pattern**: Lógica de negocio encapsulada

## 📊 API Endpoints

### POST `/api/analyze`
Analiza un documento PDF subido.

**Request:**
- `file`: Archivo PDF (multipart/form-data)
- `clientName`: Nombre del cliente
- `channel`: Canal de comunicación

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "clientName": "string",
    "documentName": "string",
    "overallSentiment": "positive|neutral|negative",
    "emotionScores": {
      "joy": 0.8,
      "sadness": 0.1,
      "anger": 0.0,
      "fear": 0.0,
      "surprise": 0.1,
      "disgust": 0.0
    },
    "analysisMetrics": {
      "wordCount": 150,
      "sentenceCount": 8,
      "readabilityScore": 0.7
    },
    "confidence": 0.9,
    "channel": "string",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "processingTimeMs": 2500
  }
}
```

### GET `/api/analyses/history`
Obtiene el historial de análisis con filtros opcionales.

**Query Parameters:**
- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 20)
- `sortBy`: Campo de ordenamiento (default: createdAt)
- `sortOrder`: Orden asc/desc (default: desc)
- `clientName`: Filtro por cliente
- `sentimentType`: Filtro por sentimiento
- `channel`: Filtro por canal
- `startDate`: Fecha de inicio
- `endDate`: Fecha de fin
- `minConfidence`: Confianza mínima

### GET `/api/analyses/export`
Exporta análisis filtrados a CSV o JSON.

**Query Parameters:**
- Mismos filtros que `/history`
- `format`: csv|json (default: csv)
- `fields`: Campos a incluir (comma-separated)

## 🧪 Testing

Para ejecutar las pruebas:

```bash
# Ejecutar todas las pruebas
yarn test

# Ejecutar pruebas en modo watch
yarn test:watch

# Ejecutar pruebas con coverage
yarn test:coverage
```

## 🚀 Scripts Disponibles

```bash
# Desarrollo
yarn dev                    # Ejecutar en modo desarrollo
yarn build                  # Construir para producción
yarn start                  # Ejecutar en modo producción
yarn lint                   # Ejecutar linter
yarn lint:fix              # Corregir errores de linting automáticamente

# Testing
yarn test                   # Ejecutar pruebas
yarn test:watch            # Ejecutar pruebas en modo watch
yarn test:coverage         # Ejecutar pruebas con coverage

# Utilidades
yarn type-check            # Verificar tipos TypeScript
yarn validate-setup        # Validar configuración del proyecto
```

## 🔧 Configuración Avanzada

### Variables de Entorno Completas

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-...                    # API Key de OpenAI (requerido)
DEFAULT_MODEL=gpt-4                      # Modelo a usar (gpt-4, gpt-3.5-turbo)
MAX_TOKENS=4000                          # Máximo tokens por request
TEMPERATURE=0.3                          # Temperatura del modelo (0.0-2.0)

# Application Configuration
NEXT_PUBLIC_APP_NAME=Banorte Sentiment Analysis
NEXT_PUBLIC_APP_VERSION=1.0.0
NODE_ENV=development                     # development, production, test

# File Upload Configuration
MAX_FILE_SIZE=10485760                   # 10MB en bytes
ALLOWED_FILE_TYPES=application/pdf       # Tipos de archivo permitidos

# Security Configuration
NEXTAUTH_SECRET=your-secret-key          # Para autenticación (futuro)
NEXTAUTH_URL=http://localhost:3000       # URL base de la aplicación

# Database Configuration (futuro)
DATABASE_URL=                            # URL de base de datos
REDIS_URL=                              # URL de Redis para cache
```

### Personalización del Tema

El tema de Material-UI se puede personalizar en `src/app/theme.ts`:

```typescript
// Colores corporativos de Banorte
const theme = createTheme({
  palette: {
    primary: {
      main: '#C8102E', // Rojo Banorte
    },
    secondary: {
      main: '#1976d2',
    },
  },
});
```

## 📈 Métricas y Monitoreo

La aplicación incluye métricas detalladas:

### Métricas de Análisis
- **Tiempo de procesamiento**: Tiempo total del análisis
- **Confianza del modelo**: Nivel de certeza del análisis
- **Métricas de texto**: Palabras, oraciones, legibilidad
- **Distribución de emociones**: Scores de cada emoción detectada

### Estadísticas del Sistema
- **Análisis por día/semana/mes**
- **Distribución de sentimientos**
- **Clientes más activos**
- **Canales de comunicación más utilizados**
- **Tiempo promedio de procesamiento**

## 🔒 Seguridad

### Validaciones Implementadas
- **Validación de archivos**: Solo PDFs, máximo 10MB
- **Sanitización de inputs**: Prevención de XSS
- **Rate limiting**: Límite de requests por IP (futuro)
- **Validación de API Key**: Verificación de credenciales OpenAI

### Buenas Prácticas
- Variables de entorno para configuración sensible
- Validación de tipos con TypeScript
- Manejo seguro de errores sin exposición de detalles internos
- Logs estructurados para auditoría

## 🐳 Docker y Deployment

### Construcción de Imagen Docker

Esta aplicación está optimizada para deployment en contenedores Docker/OpenShift:

```bash
# Construcción desde la raíz del monorepo
cd ../..
docker build -t sentiment-analysis:latest -f apps/sentiment-analysis/Dockerfile.openshift .
```

### Pruebas Locales de la Imagen

#### Linux/macOS
```bash
cd apps/sentiment-analysis
./docker-test.sh
```

#### Windows (PowerShell)
```powershell
cd apps\sentiment-analysis
.\docker-test.ps1
```

Estos scripts automatizan:
- ✅ Verificación de Docker
- ✅ Construcción de la imagen
- ✅ Ejecución del contenedor
- ✅ Pruebas de health check
- ✅ Validación de endpoints

### Variables de Entorno para Docker

```bash
# Requeridas
OPENAI_API_KEY=sk-xxx
NODE_ENV=production
PORT=3001

# Opcionales
AI_PROVIDER=openai
DEFAULT_MODEL=gpt-4
MAX_FILE_SIZE=10485760
NEXT_TELEMETRY_DISABLED=1
```

### Health Check Endpoint

El contenedor expone un endpoint de salud para Kubernetes/OpenShift:

```bash
GET /api/health

Response:
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "environment": "production",
  "version": "1.0.0",
  "service": "sentiment-analysis"
}
```

### Deployment en OpenShift

Los manifiestos de OpenShift están disponibles en `openshift/`:
- `deployment.yaml` - Configuración del deployment
- `service.yaml` - Servicio interno
- `route.yaml` - Exposición externa
- `configmap.yaml` - Configuración de la app

Ver [DOCKER.md](./DOCKER.md) para documentación técnica detallada sobre la imagen Docker.

## 📝 Documentación Adicional

- [DOCKER.md](./DOCKER.md) - Documentación técnica de Docker y deployment
- [INSTALLATION.md](./INSTALLATION.md) - Guía detallada de instalación y configuración
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Documentación completa de la arquitectura
- [API.md](./API.md) - Documentación detallada de todos los endpoints (futuro)
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guía de despliegue en producción (futuro)

## 🤝 Contribución

### Proceso de Desarrollo
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Sigue las convenciones de código establecidas
4. Escribe pruebas para tu código
5. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
6. Push a la rama (`git push origin feature/AmazingFeature`)
7. Abre un Pull Request

### Convenciones de Código
- **TypeScript**: Tipado estricto obligatorio
- **ESLint**: Seguir las reglas configuradas
- **Prettier**: Formateo automático de código
- **Conventional Commits**: Mensajes de commit estructurados
- **Clean Architecture**: Respetar la separación de capas

## 🐛 Solución de Problemas

### Problemas Comunes

**Error: OpenAI API Key no configurada**
```bash
# Verificar que la variable esté configurada
echo $OPENAI_API_KEY
# O en Windows
echo %OPENAI_API_KEY%
```

**Error: Archivo PDF no se puede procesar**
- Verificar que el archivo no esté corrupto
- Confirmar que el tamaño sea menor a 10MB
- Asegurar que el PDF contenga texto extraíble

**Error: Dependencias no instaladas**
```bash
# Limpiar cache y reinstalar
rm -rf node_modules package-lock.json
yarn install
```

### Logs y Debugging
Los logs se encuentran en la consola del navegador y en la terminal del servidor. Para debugging detallado:

```bash
# Ejecutar con logs detallados
DEBUG=* yarn dev
```

## 📄 Licencia

Este proyecto es un POC (Proof of Concept) desarrollado para Banorte. Todos los derechos reservados.

## 🆘 Soporte

Para soporte técnico o preguntas sobre el proyecto:

- **Email**: [soporte-tech@banorte.com](mailto:soporte-tech@banorte.com)
- **Documentación**: Consultar archivos de documentación en el repositorio
- **Issues**: Crear un issue en el repositorio para reportar bugs o solicitar features

---

**Desarrollado con ❤️ para Banorte**
