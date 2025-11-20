# DocuMind - POC Análisis de Documentos PDF con RAG

Una aplicación web desarrollada con Next.js 14+ que permite subir archivos PDF, visualizarlos, extraer palabras clave automáticamente y chatear con los documentos usando RAG (Retrieval-Augmented Generation).

## 🚀 Características

- **Subida de archivos PDF**: Interfaz drag & drop para cargar documentos
- **Visualización de PDF**: Visor integrado con navegación entre páginas
- **Extracción de palabras clave**: Análisis automático usando OpenAI GPT
- **💡 RAG (Retrieval-Augmented Generation)**:
  - Chat interactivo con tus documentos PDF
  - Búsqueda semántica usando embeddings de OpenAI
  - Almacenamiento vectorial con Supabase + pgvector
  - Respuestas contextualizadas en tiempo real con streaming
- **Arquitectura limpia**: Implementación con Clean Architecture/Hexagonal
- **UI moderna**: Interfaz oscura con Material UI
- **TypeScript**: Tipado estático completo

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14+ (App Router), React 18, TypeScript
- **UI**: Material UI (MUI), CSS-in-JS
- **PDF**: react-pdf (pdfjs-dist)
- **Backend**: Next.js API Routes, pdf-parse
- **IA**: OpenAI Node SDK (GPT-4o, text-embedding-3-small)
- **RAG**:
  - **Vector Store**: Supabase con extensión pgvector
  - **Embeddings**: OpenAI text-embedding-3-small (1536 dimensiones)
  - **Streaming**: Vercel AI SDK v5
  - **Chunking**: RecursiveTextChunker (configurable)
- **Arquitectura**: Clean Architecture / Hexagonal

## 📁 Estructura del Proyecto

```
src/
├── app/                          # Next.js App Router
│   ├── analyze/                  # Página de análisis de PDFs
│   │   ├── page.tsx             # Componente principal
│   │   └── components/          # Componentes UI
│   ├── api/                     # API Routes
│   │   ├── analyze/             # Análisis de keywords
│   │   ├── chat/                # Chat RAG con documentos
│   │   └── documents/store/     # Almacenamiento de documentos
│   ├── layout.tsx               # Layout raíz
│   └── globals.css              # Estilos globales
├── components/                  # Componentes compartidos
│   ├── chat/                    # Componentes del chat
│   │   ├── ChatWidget.tsx       # Widget de chat principal
│   │   └── ChatMessage.tsx      # Mensaje individual
│   └── UploadDropzone.tsx       # Zona de carga de archivos
├── core/                        # Lógica de dominio (Clean Architecture)
│   ├── domain/                  # Entidades y puertos (interfaces)
│   │   ├── chat/                # Dominio de chat y RAG
│   │   └── documents/           # Dominio de documentos
│   └── application/             # Casos de uso y servicios
│       └── chat/
│           ├── use-cases/       # Casos de uso principales
│           │   ├── ChatWithDocsUseCase.ts      # Chat con RAG
│           │   └── StoreDocumentUseCase.ts     # Almacenar documentos
│           └── services/        # Servicios de aplicación
│               ├── ChatPromptBuilder.ts        # Constructor de prompts
│               └── ContextAssembler.ts         # Ensamblador de contexto
├── infrastructure/              # Adaptadores externos
│   ├── pdf/                     # Extractor de texto PDF
│   ├── llm/                     # Cliente OpenAI para chat
│   ├── embeddings/              # Generación de embeddings
│   │   └── OpenAIEmbeddingGenerator.ts
│   ├── chunking/                # División de documentos
│   │   └── RecursiveTextChunker.ts
│   └── vector-store/            # Almacenamiento vectorial
│       └── SupabaseVectorStore.ts
├── composition/                 # Inyección de dependencias
│   ├── container.ts             # Contenedor principal
│   └── rag-container.ts         # Contenedor RAG
└── lib/                         # Utilidades
    ├── env.ts                   # Variables de entorno
    └── supabase.ts              # Cliente Supabase
```

## 🚀 Instalación y Configuración

### 1. Instalar dependencias

Con Yarn (recomendado y configurado en el proyecto):
```bash
yarn install
```

O con npm (alternativo):
```bash
npm install
```

### 2. Configurar Supabase

Necesitas crear un proyecto en Supabase y configurar la base de datos vectorial:

1. Ve a [Supabase](https://supabase.com) y crea un nuevo proyecto
2. En el SQL Editor, ejecuta el siguiente script para crear la tabla de documentos con soporte vectorial:

```sql
-- Habilitar la extensión pgvector
create extension if not exists vector;

-- Crear tabla de documentos
create table documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  embedding vector(1536),
  chunk_index integer,
  parent_document_id uuid,
  metadata jsonb,
  created_at timestamp with time zone default now()
);

-- Crear índice para búsqueda vectorial eficiente
create index on documents using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Crear función para búsqueda de similitud
create or replace function match_documents(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_parent_id uuid default null
)
returns table (
  id uuid,
  title text,
  content text,
  chunk_index integer,
  parent_document_id uuid,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    documents.id,
    documents.title,
    documents.content,
    documents.chunk_index,
    documents.parent_document_id,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where
    (filter_parent_id is null or documents.parent_document_id = filter_parent_id)
    and 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y configúralo con tus credenciales:

```bash
cp .env.example .env.local
```

Luego edita `.env.local` con tus credenciales reales:

```env
# OpenAI API
OPENAI_API_KEY=sk-tu-api-key-aqui
OPENAI_MODEL=gpt-4o-mini

# Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-anon-key-aqui

# Configuración de carga
MAX_UPLOAD_MB=20

# Configuración RAG (opcional, valores por defecto)
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
RAG_CHUNK_SIZE=1000
RAG_CHUNK_OVERLAP=200
RAG_MAX_RESULTS=5
RAG_SIMILARITY_THRESHOLD=0.7

# Configuración de Chat (opcional, valores por defecto)
CHAT_MODEL=gpt-4o
CHAT_MAX_TOKENS=2000
CHAT_TEMPERATURE=0.7
```

### 4. Ejecutar en desarrollo

Con Yarn:
```bash
yarn dev
```

O con npm:
```bash
npm run dev
```

### 5. Abrir la aplicación

Navega a [http://localhost:3000/analyze](http://localhost:3000/analyze)

## 📖 Uso

### Análisis de Documentos (Keywords)

1. **Subir PDF**: Arrastra un archivo PDF o usa el botón "Seleccionar archivo"
2. **Visualizar**: El PDF se mostrará inmediatamente en la columna izquierda
3. **Analizar**: La aplicación extraerá automáticamente el texto y generará palabras clave
4. **Revisar**: Las palabras clave aparecerán como chips de colores en la columna derecha

### Chat con Documentos (RAG)

1. **Subir documento**: Carga un PDF que será procesado y almacenado en la base de datos vectorial
   - El documento se divide automáticamente en chunks
   - Se generan embeddings para cada chunk
   - Se almacena en Supabase con índice vectorial
2. **Iniciar chat**: Haz preguntas sobre tu documento en lenguaje natural
3. **Recibir respuestas**: El sistema:
   - Genera un embedding de tu pregunta
   - Busca los chunks más relevantes usando similitud semántica
   - Construye un contexto con los fragmentos relevantes
   - Genera una respuesta usando GPT-4o basada en el contexto
4. **Ver fuentes**: Cada respuesta incluye los chunks relevantes con su nivel de similitud

### Categorías de Palabras Clave

- **Persona** (azul): Nombres de personas
- **Organización** (cian): Empresas, instituciones
- **Fecha** (verde): Fechas importantes
- **Cantidad** (rojo): Montos, números
- **Ubicación** (naranja): Lugares, direcciones
- **Tema/Otro** (gris): Conceptos generales

## 🏗️ Arquitectura

### Clean Architecture

El proyecto implementa una arquitectura limpia con las siguientes capas:

- **Dominio**: Entidades y puertos (interfaces)
- **Aplicación**: Casos de uso y servicios de aplicación
- **Infraestructura**: Adaptadores para servicios externos
- **Presentación**: Componentes UI y API routes

### Flujo de Datos - Análisis de Keywords

1. Usuario sube PDF → Componente UI
2. UI llama API `/api/analyze` → API Route
3. API Route ejecuta `AnalyzePdfUseCase` → Caso de Uso
4. Caso de Uso orquesta:
   - `PdfParseTextExtractor` → Extrae texto
   - `OpenAIKeywordExtractor` → Genera palabras clave
5. Resultado regresa a UI → Muestra chips

### Flujo de Datos - RAG (Chat con Documentos)

#### 1. Almacenamiento de Documentos
```
Usuario sube PDF
    ↓
POST /api/documents/store
    ↓
StoreDocumentUseCase
    ↓
    ├─→ RecursiveTextChunker (divide en chunks)
    ├─→ OpenAIEmbeddingGenerator (genera embeddings)
    └─→ SupabaseVectorStore (almacena en Supabase)
```

#### 2. Chat con RAG
```
Usuario hace pregunta
    ↓
POST /api/chat
    ↓
ChatWithDocsUseCase
    ↓
    ├─→ OpenAIEmbeddingGenerator (embedding de pregunta)
    ├─→ SupabaseVectorStore (búsqueda semántica)
    ├─→ ContextAssembler (ensambla contexto)
    ├─→ ChatPromptBuilder (construye prompt)
    └─→ OpenAIChatService (genera respuesta streaming)
         ↓
    Respuesta streaming + chunks relevantes
```

### Componentes Principales RAG

- **StoreDocumentUseCase** (`src/core/application/chat/use-cases/StoreDocumentUseCase.ts:69`)
  - Orquesta el proceso de almacenamiento de documentos
  - Divide, genera embeddings y almacena

- **ChatWithDocsUseCase** (`src/core/application/chat/use-cases/ChatWithDocsUseCase.ts:104`)
  - Orquesta el flujo RAG completo
  - Búsqueda semántica + generación de respuesta

- **RecursiveTextChunker** (`src/infrastructure/chunking/RecursiveTextChunker.ts`)
  - Divide documentos usando separadores jerárquicos
  - Mantiene overlap entre chunks para contexto

- **OpenAIEmbeddingGenerator** (`src/infrastructure/embeddings/OpenAIEmbeddingGenerator.ts`)
  - Genera embeddings con OpenAI API
  - Soporta operaciones batch

- **SupabaseVectorStore** (`src/infrastructure/vector-store/SupabaseVectorStore.ts`)
  - Almacena y busca vectores usando pgvector
  - Función RPC `match_documents` para similitud coseno

## 🔧 Scripts Disponibles

Con Yarn:
```bash
yarn dev         # Desarrollo
yarn build       # Construcción para producción
yarn start       # Servidor de producción
yarn lint        # Linter ESLint
```

Con npm:
```bash
npm run dev      # Desarrollo
npm run build    # Construcción para producción
npm run start    # Servidor de producción
npm run lint     # Linter ESLint
```

## 🚨 Limitaciones

- **Tamaño máximo**: 20MB por archivo (configurable)
- **Formato**: Solo archivos PDF
- **Persistencia Keywords**: Sin base de datos, solo en memoria
- **Persistencia RAG**: Requiere Supabase configurado
- **Costos**: Uso de OpenAI API (embeddings + chat)
- **Idioma**: Optimizado para español, funciona con otros idiomas

## 🔒 Seguridad

- API keys de OpenAI y Supabase solo en servidor
- Validación de tipos de archivo
- Límites de tamaño de archivo
- Manejo de errores robusto
- Row Level Security (RLS) recomendado en Supabase para producción
- Sanitización de inputs para prevenir inyección SQL

## 🐛 Solución de Problemas

### Error: "OPENAI_API_KEY environment variable is required"
- Verifica que el archivo `.env.local` existe
- Confirma que la API key es válida
- Reinicia el servidor de desarrollo después de cambiar variables de entorno

### Error al cargar PDF
- Verifica que el archivo es un PDF válido
- Confirma que el tamaño no excede el límite

### Palabras clave vacías
- Revisa que el PDF contiene texto extraíble
- Verifica la conectividad con OpenAI

### Error de conexión con Supabase
- Verifica que `SUPABASE_URL` y `SUPABASE_ANON_KEY` están configuradas
- Confirma que la tabla `documents` existe en Supabase
- Verifica que la extensión `pgvector` está habilitada
- Revisa que la función `match_documents` fue creada correctamente

### El chat no encuentra documentos relevantes
- Verifica que los documentos fueron almacenados correctamente
- Ajusta `RAG_SIMILARITY_THRESHOLD` (valores más bajos = menos estricto)
- Aumenta `RAG_MAX_RESULTS` para obtener más resultados
- Revisa los logs del servidor para ver los scores de similitud

### Respuestas lentas en el chat
- Considera usar un modelo más rápido (ej. `gpt-4o-mini` en lugar de `gpt-4o`)
- Reduce `RAG_MAX_RESULTS` para buscar menos chunks
- Reduce `RAG_CHUNK_SIZE` para chunks más pequeños
- Optimiza el índice vectorial en Supabase (aumenta `lists` en el índice)

## 🧠 Cómo Funciona RAG

### ¿Qué es RAG?

RAG (Retrieval-Augmented Generation) es una técnica que combina:
1. **Recuperación**: Búsqueda de información relevante en documentos
2. **Generación**: Creación de respuestas usando LLMs con el contexto recuperado

### Proceso Técnico

#### 1. **Indexación de Documentos** (Cuando subes un PDF)
```
PDF → Extracción de texto → Chunking → Embeddings → Vector Store
```

- **Chunking**: El documento se divide en fragmentos de ~1000 caracteres con 200 de overlap
- **Embeddings**: Cada chunk se convierte en un vector de 1536 dimensiones usando `text-embedding-3-small`
- **Almacenamiento**: Los vectores se guardan en Supabase con un índice IVFFLAT para búsqueda eficiente

#### 2. **Consulta y Respuesta** (Cuando haces una pregunta)
```
Pregunta → Embedding → Búsqueda vectorial → Top-K chunks → Prompt + Contexto → LLM → Respuesta
```

- **Embedding de pregunta**: Tu pregunta se convierte en un vector usando el mismo modelo
- **Similitud coseno**: Se buscan los chunks más similares usando distancia vectorial
- **Threshold**: Solo se usan chunks con similitud > 0.7 (configurable)
- **Contexto**: Los top 5 chunks más relevantes se incluyen en el prompt
- **Generación**: GPT-4o genera la respuesta basándose únicamente en el contexto proporcionado

### Configuración de Parámetros

| Parámetro | Variable de Entorno | Valor por Defecto | Descripción |
|-----------|---------------------|-------------------|-------------|
| Tamaño de chunk | `RAG_CHUNK_SIZE` | 1000 | Caracteres por fragmento |
| Overlap | `RAG_CHUNK_OVERLAP` | 200 | Caracteres compartidos entre chunks |
| Resultados | `RAG_MAX_RESULTS` | 5 | Número máximo de chunks a recuperar |
| Similitud | `RAG_SIMILARITY_THRESHOLD` | 0.7 | Umbral de similitud (0-1) |
| Modelo chat | `CHAT_MODEL` | gpt-4o | Modelo para generar respuestas |

### Ventajas de esta Implementación

- ✅ **Respuestas precisas**: Basadas en tus documentos específicos
- ✅ **Trazabilidad**: Cada respuesta incluye las fuentes utilizadas
- ✅ **Escalabilidad**: Supabase + pgvector maneja miles de documentos
- ✅ **Streaming**: Respuestas en tiempo real usando Vercel AI SDK
- ✅ **Clean Architecture**: Fácil de extender y mantener

## 📝 Licencia

Este es un proyecto de demostración (POC) para fines educativos.
