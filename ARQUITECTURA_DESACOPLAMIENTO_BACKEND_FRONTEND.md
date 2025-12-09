# Arquitectura para Desacoplar Backend y Frontend - Sentiment Analysis

**Fecha:** 2025-11-27
**Aplicación:** sentiment-analysis (apps/sentiment-analysis)
**Arquitectura Actual:** Next.js con Clean Architecture + DDD

---

## 📋 Tabla de Contenidos

1. [Análisis de la Arquitectura Actual](#análisis-arquitectura-actual)
2. [Opción 1: Backend Node.js + Express (RECOMENDADA)](#opción-1-nodejs-express)
3. [Opción 2: Backend Python + Flask](#opción-2-python-flask)
4. [Comunicación Frontend ↔ Backend](#comunicación-frontend-backend)
5. [Autenticación y Autorización](#autenticación-autorización)
6. [Comparación de Opciones](#comparación-opciones)
7. [Recomendación Final](#recomendación-final)

---

## 📊 Análisis de la Arquitectura Actual {#análisis-arquitectura-actual}

### Estructura Actual

```
apps/sentiment-analysis/
├── src/
│   ├── app/                          # Next.js App Router (Presentation Layer)
│   ├── core/                         # Domain & Application Logic
│   │   ├── application/              # Use Cases & Services
│   │   └── domain/                   # Entities, Value Objects, Ports
│   ├── infrastructure/               # External Services & Data Persistence
│   ├── components/                   # React Components
│   ├── config/                       # Configuration
│   └── shared/                       # Shared Utilities & Types
├── cypress/                          # E2E Tests
└── scripts/                          # Build & Validation Scripts
```

### Clean Architecture + DDD Implementación

```
┌─────────────────────────────────────────────────────────┐
│              PRESENTATION LAYER                         │
│  (Next.js Pages, React Components, API Routes)          │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│         APPLICATION LAYER                               │
│  (Use Cases, Services, Domain Models)                   │
├─────────────────────────────────────────────────────────┤
│  ├── Use Cases (AnalyzeSentiment, GetHistorical, etc)   │
│  ├── Services (SessionMetrics, SessionTrends)           │
│  └── Domain Entities & Value Objects                    │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│       INFRASTRUCTURE LAYER                              │
│  (Repositories, External Service Adapters)              │
├─────────────────────────────────────────────────────────┤
│  ├── In-Memory Repositories                             │
│  ├── OpenAI/Ollama Sentiment Analyzers                  │
│  ├── PDF Text Extraction                                │
│  └── CSV Export Service                                 │
└─────────────────────────────────────────────────────────┘
```

### Capas Principales

#### DOMAIN LAYER (Core)
**Ubicación:** `src/core/domain/`

**Entidades:**
- `SentimentAnalysis` - Registro de análisis con métodos de negocio
- `Conversation` - Datos de conversaciones
- `SessionMetrics` - KPIs de sesiones
- `SessionTrends` - Análisis de tendencias históricas

**Value Objects:**
- `EmotionScore` - 6 dimensiones emocionales (0-1)
- `SentimentType` - POSITIVE | NEUTRAL | NEGATIVE
- `AnalysisMetrics` - Métricas de texto (palabras, legibilidad)
- `SessionConclusion` - Resumen ejecutivo + planes de acción

**Ports (Interfaces):**
- `SentimentAnalyzerPort` - Contrato para análisis de sentimiento
- `TextExtractorPort` - Contrato para extracción de PDF
- `SentimentAnalysisRepositoryPort` - Contrato de persistencia
- `SessionAnalysisPort` - Análisis LLM de sesiones
- `ExportServicePort` - Exportación de datos

#### APPLICATION LAYER (Use Cases)
**Ubicación:** `src/core/application/`

**Use Cases:**
1. `AnalyzeSentimentUseCase` - Análisis completo de PDF
2. `GetHistoricalAnalysisUseCase` - Consulta histórica con filtros
3. `ExportAnalysisUseCase` - Exportación en múltiples formatos
4. `FilterAnalysisUseCase` - Filtrado multi-dimensional

**Services:**
- `SessionMetricsService` - Extracción de KPIs (AI-first con fallback)
- `SessionTrendsService` - Cálculo de tendencias temporales
- `SessionConclusionService` - Generación de resúmenes ejecutivos

#### INFRASTRUCTURE LAYER (Adapters)
**Ubicación:** `src/infrastructure/`

**Repositorios (In-Memory):**
- `InMemorySentimentAnalysisRepository`
- `InMemorySessionMetricsRepository`
- `InMemorySessionConclusionRepository`

**Adaptadores AI:**
- `OpenAISentimentAnalyzer` (GPT-4, GPT-4o-mini)
- `OllamaSentimentAnalyzer` (modelos locales)
- `OpenAISessionAnalyzer` (análisis de sesiones)

**Otros Adaptadores:**
- `PDFTextExtractor` (pdf-parse)
- `CSVExportService` (csv-writer)

### Fortalezas de la Arquitectura Actual

✅ **Separación clara de responsabilidades**
✅ **Inversión de dependencias lista para desacoplamiento**
✅ **Código de dominio agnóstico a frameworks**
✅ **Type-safe (TypeScript)**
✅ **Testeable y modular**

### Limitaciones Críticas

⚠️ **Persistencia in-memory** - No sobrevive reinicios
⚠️ **Acoplamiento Next.js** - Frontend y backend en mismo proceso
⚠️ **Escalabilidad limitada** - Single-process, no distribuible
⚠️ **Sin caché** - Consultas históricas costosas
⚠️ **Sin autenticación** - No hay control de acceso

---

## 🎯 OPCIÓN 1: Backend Node.js + Express (RECOMENDADA) {#opción-1-nodejs-express}

### Ventajas

✅ **Reutilización del 95% del código** - Dominio y aplicación intactos
✅ **Mismo lenguaje** - TypeScript en frontend y backend
✅ **Migración incremental** - Puedes mover módulos uno por uno
✅ **Performance superior** - Excelente para I/O asíncrono (OpenAI/Ollama)
✅ **Ecosistema compartido** - npm, testing, tipos
✅ **Time-to-market rápido** - 2-3 semanas vs 6-8 semanas con Python

### Arquitectura Propuesta

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React/Next.js)                 │
│  ├─ UI Components (MUI, Recharts)                           │
│  ├─ Pages (/app, /sessions)                                 │
│  ├─ HTTP Client (Axios/Fetch)                               │
│  └─ State Management (React Query/SWR)                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTP/REST API (JSON)
                       │ WebSocket (Tiempo real)
                       │
┌──────────────────────▼──────────────────────────────────────┐
│           BACKEND API (Node.js + Express)                   │
├─────────────────────────────────────────────────────────────┤
│  API Layer (Express Routes)                                 │
│  ├─ /api/v1/analyses [POST, GET]                            │
│  ├─ /api/v1/sessions/:id [GET]                              │
│  ├─ /api/v1/sessions/trends [GET]                           │
│  ├─ /api/v1/export [POST]                                   │
│  └─ /api/v1/health [GET]                                    │
├─────────────────────────────────────────────────────────────┤
│  Middleware Layer                                           │
│  ├─ Authentication (JWT)                                    │
│  ├─ Rate Limiting (express-rate-limit)                      │
│  ├─ CORS (cors)                                             │
│  ├─ File Upload (multer)                                    │
│  ├─ Error Handling                                          │
│  └─ Request Validation (zod)                                │
├─────────────────────────────────────────────────────────────┤
│  Application Layer (REUTILIZADO)                            │
│  ├─ Use Cases (AnalyzeSentiment, GetHistorical, etc)        │
│  ├─ Services (SessionMetrics, SessionTrends)                │
│  └─ DIContainer                                             │
├─────────────────────────────────────────────────────────────┤
│  Domain Layer (REUTILIZADO)                                 │
│  ├─ Entities (SentimentAnalysis, SessionMetrics, etc)       │
│  ├─ Value Objects (EmotionScore, SentimentType, etc)        │
│  └─ Ports (Repository, Analyzer, etc)                       │
├─────────────────────────────────────────────────────────────┤
│  Infrastructure Layer (ACTUALIZADO)                         │
│  ├─ Repositories                                            │
│  │  ├─ PostgresSentimentRepository (NUEVO)                 │
│  │  ├─ PostgresSessionMetricsRepository (NUEVO)            │
│  │  └─ PostgresSessionConclusionRepository (NUEVO)         │
│  ├─ Adapters (OpenAI, Ollama, PDF) (REUTILIZADOS)          │
│  ├─ Database (TypeORM/Prisma)                              │
│  └─ Cache (Redis - NUEVO)                                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
          ┌───────────┴────────────┐
          │                        │
     ┌────▼─────┐          ┌──────▼──────┐
     │PostgreSQL│          │   Redis     │
     │(Postgres)│          │   (Cache)   │
     └──────────┘          └─────────────┘
```

### Estructura de Proyecto

```
backend/
├── src/
│   ├── api/                          # API Layer (Express)
│   │   ├── routes/
│   │   │   ├── analyses.routes.ts
│   │   │   ├── sessions.routes.ts
│   │   │   ├── export.routes.ts
│   │   │   └── health.routes.ts
│   │   ├── controllers/              # Request handlers
│   │   │   ├── AnalysesController.ts
│   │   │   ├── SessionsController.ts
│   │   │   └── ExportController.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── rateLimiter.middleware.ts
│   │   │   ├── validation.middleware.ts
│   │   │   ├── errorHandler.middleware.ts
│   │   │   └── fileUpload.middleware.ts
│   │   ├── dto/                      # Data Transfer Objects
│   │   │   ├── AnalyzeRequest.dto.ts
│   │   │   ├── AnalyzeResponse.dto.ts
│   │   │   └── HistoryQuery.dto.ts
│   │   └── validators/               # Request validation
│   │       └── schemas.ts            # Zod schemas
│   │
│   ├── core/                         # COPIADO de sentiment-analysis
│   │   ├── application/
│   │   │   ├── use-cases/
│   │   │   └── services/
│   │   └── domain/
│   │       ├── entities/
│   │       ├── value-objects/
│   │       └── ports/
│   │
│   ├── infrastructure/               # ADAPTADO
│   │   ├── database/
│   │   │   ├── migrations/
│   │   │   ├── entities/             # TypeORM entities
│   │   │   │   ├── SentimentAnalysisEntity.ts
│   │   │   │   ├── SessionMetricsEntity.ts
│   │   │   │   └── SessionConclusionEntity.ts
│   │   │   └── connection.ts
│   │   ├── repositories/
│   │   │   ├── PostgresSentimentRepository.ts
│   │   │   ├── PostgresSessionMetricsRepository.ts
│   │   │   └── PostgresSessionConclusionRepository.ts
│   │   ├── cache/
│   │   │   └── RedisCache.ts
│   │   ├── adapters/                 # REUTILIZADOS
│   │   │   ├── OpenAISentimentAnalyzer.ts
│   │   │   ├── OllamaSentimentAnalyzer.ts
│   │   │   ├── PDFTextExtractor.ts
│   │   │   └── CSVExportService.ts
│   │   └── di/
│   │       └── DIContainer.ts        # Actualizado con nuevas deps
│   │
│   ├── config/
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   └── ai-provider.config.ts     # REUTILIZADO
│   │
│   ├── shared/                       # REUTILIZADO
│   │   ├── types/
│   │   └── utils/
│   │
│   └── server.ts                     # Express app entry
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── package.json
├── tsconfig.json
├── .env.example
└── docker-compose.yml               # PostgreSQL + Redis
```

### Código de Ejemplo: Express Controller

```typescript
// backend/src/api/controllers/AnalysesController.ts
import { Request, Response, NextFunction } from 'express';
import { DIContainer } from '../../infrastructure/di/DIContainer';
import { AnalyzeRequestDto, HistoryQueryDto } from '../dto';
import { validateDto } from '../validators/schemas';

export class AnalysesController {
  async analyze(req: Request, res: Response, next: NextFunction) {
    try {
      // Validar entrada
      const dto = validateDto(AnalyzeRequestDto, {
        clientName: req.body.clientName,
        channel: req.body.channel,
        file: req.file, // Multer
      });

      if (!req.file) {
        return res.status(400).json({ error: 'PDF file is required' });
      }

      // Usar el mismo Use Case que en Next.js
      const container = DIContainer.getInstance();
      const useCase = container.getAnalyzeSentimentUseCase();
      const metricsService = container.getSessionMetricsService();
      const conclusionService = container.getSessionConclusionService();

      // Ejecutar análisis
      const result = await useCase.execute({
        fileBuffer: req.file.buffer,
        clientName: dto.clientName,
        documentName: req.file.originalname,
        channel: dto.channel,
      });

      // Calcular métricas de sesión
      const metrics = await metricsService.calculateSessionMetrics({
        analysisId: result.analysis.id,
        transcript: result.analysis.documentContent,
        analysisDate: result.analysis.createdAt,
      });

      // Generar conclusión
      const conclusion = await conclusionService.generateConclusion({
        analysisId: result.analysis.id,
        transcript: result.analysis.documentContent,
        sentimentAnalysis: result.analysis,
        sessionMetrics: metrics,
      });

      // Respuesta completa
      res.status(201).json({
        success: true,
        data: {
          analysis: result.analysis.toJSON(),
          metrics: metrics,
          conclusion: conclusion,
          processingTimeMs: result.processingTimeMs,
        },
      });
    } catch (error) {
      next(error); // Manejado por errorHandler middleware
    }
  }

  async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const query = validateDto(HistoryQueryDto, req.query);

      const container = DIContainer.getInstance();
      const useCase = container.getHistoricalAnalysisUseCase();

      const result = await useCase.execute({
        page: query.page || 1,
        limit: query.limit || 10,
        sortBy: query.sortBy || 'createdAt',
        sortOrder: query.sortOrder || 'desc',
        filters: {
          clientName: query.clientName,
          sentimentType: query.sentimentType,
          channel: query.channel,
          startDate: query.startDate,
          endDate: query.endDate,
          minConfidence: query.minConfidence,
        },
      });

      res.json({
        success: true,
        data: {
          analyses: result.analyses.map(a => a.toJSON()),
          pagination: result.pagination,
          statistics: result.statistics,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const container = DIContainer.getInstance();
      const repository = container.getSentimentAnalysisRepository();

      const analysis = await repository.findById(id);

      if (!analysis) {
        return res.status(404).json({ error: 'Analysis not found' });
      }

      res.json({
        success: true,
        data: analysis,
      });
    } catch (error) {
      next(error);
    }
  }
}
```

### Código de Ejemplo: PostgreSQL Repository

```typescript
// backend/src/infrastructure/repositories/PostgresSentimentRepository.ts
import { Repository, Between, Like, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { SentimentAnalysisRepositoryPort, FilterOptions } from '../../core/domain/ports/SentimentAnalysisRepositoryPort';
import { SentimentAnalysisEntity } from '../../core/domain/entities/SentimentAnalysis';
import { SentimentAnalysisDbEntity } from '../database/entities/SentimentAnalysisEntity';
import { AppDataSource } from '../database/connection';

export class PostgresSentimentRepository implements SentimentAnalysisRepositoryPort {
  private repository: Repository<SentimentAnalysisDbEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(SentimentAnalysisDbEntity);
  }

  async save(analysis: SentimentAnalysisEntity): Promise<SentimentAnalysisEntity> {
    const dbEntity = this.toDbEntity(analysis);
    const saved = await this.repository.save(dbEntity);
    return this.toDomainEntity(saved);
  }

  async findById(id: string): Promise<SentimentAnalysisEntity | null> {
    const dbEntity = await this.repository.findOne({ where: { id } });
    return dbEntity ? this.toDomainEntity(dbEntity) : null;
  }

  async findAll(options?: FilterOptions): Promise<SentimentAnalysisEntity[]> {
    const queryBuilder = this.repository.createQueryBuilder('analysis');

    // Aplicar filtros
    if (options?.clientName) {
      queryBuilder.andWhere('analysis.clientName ILIKE :clientName', {
        clientName: `%${options.clientName}%`,
      });
    }

    if (options?.sentimentType) {
      queryBuilder.andWhere('analysis.overallSentiment = :sentimentType', {
        sentimentType: options.sentimentType,
      });
    }

    if (options?.channel) {
      queryBuilder.andWhere('analysis.channel = :channel', {
        channel: options.channel,
      });
    }

    if (options?.startDate && options?.endDate) {
      queryBuilder.andWhere('analysis.createdAt BETWEEN :startDate AND :endDate', {
        startDate: options.startDate,
        endDate: options.endDate,
      });
    }

    if (options?.minConfidence !== undefined) {
      queryBuilder.andWhere('analysis.confidence >= :minConfidence', {
        minConfidence: options.minConfidence,
      });
    }

    // Ordenamiento
    if (options?.sortBy && options?.sortOrder) {
      queryBuilder.orderBy(
        `analysis.${options.sortBy}`,
        options.sortOrder.toUpperCase() as 'ASC' | 'DESC'
      );
    } else {
      queryBuilder.orderBy('analysis.createdAt', 'DESC');
    }

    // Paginación
    if (options?.limit) {
      queryBuilder.take(options.limit);
      if (options?.offset) {
        queryBuilder.skip(options.offset);
      }
    }

    const dbEntities = await queryBuilder.getMany();
    return dbEntities.map(e => this.toDomainEntity(e));
  }

  async count(options?: FilterOptions): Promise<number> {
    const queryBuilder = this.repository.createQueryBuilder('analysis');
    // Aplicar mismos filtros que en findAll...
    return await queryBuilder.getCount();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  // Mappers
  private toDbEntity(domain: SentimentAnalysisEntity): SentimentAnalysisDbEntity {
    const dbEntity = new SentimentAnalysisDbEntity();
    dbEntity.id = domain.id;
    dbEntity.clientName = domain.clientName;
    dbEntity.documentName = domain.documentName;
    dbEntity.documentContent = domain.documentContent;
    dbEntity.overallSentiment = domain.overallSentiment;
    dbEntity.emotionScores = domain.emotionScores; // JSON column
    dbEntity.analysisMetrics = domain.analysisMetrics; // JSON column
    dbEntity.confidence = domain.confidence;
    dbEntity.channel = domain.channel;
    dbEntity.createdAt = domain.createdAt;
    dbEntity.updatedAt = domain.updatedAt;
    return dbEntity;
  }

  private toDomainEntity(db: SentimentAnalysisDbEntity): SentimentAnalysisEntity {
    return new SentimentAnalysisEntity(
      db.id,
      db.clientName,
      db.documentName,
      db.documentContent,
      db.overallSentiment,
      db.emotionScores,
      db.analysisMetrics,
      db.confidence,
      db.channel,
      db.createdAt,
      db.updatedAt
    );
  }
}
```

### Código de Ejemplo: TypeORM Entity

```typescript
// backend/src/infrastructure/database/entities/SentimentAnalysisEntity.ts
import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { SentimentType } from '../../../core/domain/value-objects/SentimentType';
import { EmotionScore } from '../../../core/domain/value-objects/EmotionScore';
import { AnalysisMetrics } from '../../../core/domain/value-objects/AnalysisMetrics';

@Entity('sentiment_analyses')
@Index(['clientName', 'createdAt'])
@Index(['channel', 'createdAt'])
@Index(['overallSentiment'])
export class SentimentAnalysisDbEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'client_name', type: 'varchar', length: 255 })
  clientName: string;

  @Column({ name: 'document_name', type: 'varchar', length: 500 })
  documentName: string;

  @Column({ name: 'document_content', type: 'text' })
  documentContent: string;

  @Column({ name: 'overall_sentiment', type: 'varchar', length: 20 })
  overallSentiment: SentimentType;

  @Column({ name: 'emotion_scores', type: 'jsonb' })
  emotionScores: EmotionScore;

  @Column({ name: 'analysis_metrics', type: 'jsonb' })
  analysisMetrics: AnalysisMetrics;

  @Column({ type: 'decimal', precision: 3, scale: 2 })
  confidence: number;

  @Column({ type: 'varchar', length: 50 })
  channel: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

### Código de Ejemplo: Express Server Setup

```typescript
// backend/src/server.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { AppDataSource } from './infrastructure/database/connection';
import { setupRoutes } from './api/routes';
import { errorHandler } from './api/middleware/errorHandler.middleware';
import { requestLogger } from './api/middleware/logger.middleware';

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares globales
app.use(helmet()); // Security headers
app.use(compression()); // Gzip compression
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(requestLogger);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  message: 'Too many requests from this IP',
});
app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
setupRoutes(app);

// Error handling (debe ser el último middleware)
app.use(errorHandler);

// Start server
async function bootstrap() {
  try {
    // Initialize database
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    // Run migrations
    await AppDataSource.runMigrations();
    console.log('✅ Migrations executed');

    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API base: http://localhost:${PORT}/api/v1`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
```

### Migración de Base de Datos

```typescript
// backend/src/infrastructure/database/migrations/1234567890-CreateSentimentAnalyses.ts
import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateSentimentAnalyses1234567890 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'sentiment_analyses',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'client_name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'document_name',
            type: 'varchar',
            length: '500',
          },
          {
            name: 'document_content',
            type: 'text',
          },
          {
            name: 'overall_sentiment',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'emotion_scores',
            type: 'jsonb',
          },
          {
            name: 'analysis_metrics',
            type: 'jsonb',
          },
          {
            name: 'confidence',
            type: 'decimal',
            precision: 3,
            scale: 2,
          },
          {
            name: 'channel',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // Índices para optimizar queries
    await queryRunner.createIndex(
      'sentiment_analyses',
      new TableIndex({
        name: 'IDX_CLIENT_NAME_CREATED_AT',
        columnNames: ['client_name', 'created_at'],
      })
    );

    await queryRunner.createIndex(
      'sentiment_analyses',
      new TableIndex({
        name: 'IDX_CHANNEL_CREATED_AT',
        columnNames: ['channel', 'created_at'],
      })
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('sentiment_analyses');
  }
}
```

### Docker Compose para Desarrollo

```yaml
# backend/docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: sentiment-postgres
    environment:
      POSTGRES_DB: sentiment_analysis
      POSTGRES_USER: sentiment_user
      POSTGRES_PASSWORD: sentiment_pass
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U sentiment_user -d sentiment_analysis"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: sentiment-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: sentiment-backend
    environment:
      NODE_ENV: development
      PORT: 3001
      DATABASE_URL: postgresql://sentiment_user:sentiment_pass@postgres:5432/sentiment_analysis
      REDIS_URL: redis://redis:6379
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      FRONTEND_URL: http://localhost:3000
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./src:/app/src
      - ./uploads:/app/uploads
    command: npm run dev

volumes:
  postgres_data:
  redis_data:
```

### Frontend: API Client

```typescript
// frontend/src/lib/api-client.ts
import axios, { AxiosInstance } from 'axios';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para agregar token JWT
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Interceptor de errores
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Sentiment Analysis endpoints
  async analyzeSentiment(file: File, clientName: string, channel: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('clientName', clientName);
    formData.append('channel', channel);

    const response = await this.client.post('/analyses', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  }

  async getHistory(params: {
    page?: number;
    limit?: number;
    clientName?: string;
    sentimentType?: string;
    channel?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const response = await this.client.get('/analyses/history', { params });
    return response.data.data;
  }

  async getAnalysisById(id: string) {
    const response = await this.client.get(`/analyses/${id}`);
    return response.data.data;
  }

  async getSessionDashboard(id: string) {
    const response = await this.client.get(`/sessions/dashboard/${id}`);
    return response.data.data;
  }

  async getSessionTrends(params: { from: Date; to: Date }) {
    const response = await this.client.get('/sessions/trends', { params });
    return response.data.data;
  }

  async exportAnalyses(params: {
    format: 'csv' | 'json' | 'xlsx';
    filters?: any;
  }) {
    const response = await this.client.post('/export', params, {
      responseType: 'blob',
    });
    return response.data;
  }
}

export const apiClient = new ApiClient();
```

---

## 🐍 OPCIÓN 2: Backend Python + Flask {#opción-2-python-flask}

### Ventajas

✅ **Ecosistema ML/NLP potente** - spaCy, NLTK, scikit-learn, transformers
✅ **Integración Hugging Face** - Modelos pre-entrenados para español
✅ **Análisis offline avanzado** - Modelos locales sin dependencia de OpenAI
✅ **Gran comunidad** - Mucho soporte para procesamiento de texto

### Desventajas

❌ **Reescritura completa** - 0% de reutilización de código
❌ **Sin type safety nativo** - Aunque Python 3.10+ tiene type hints
❌ **Ecosistema diferente** - pip vs npm, pytest vs jest
❌ **Performance I/O** - Python es síncrono por defecto (requiere async)
❌ **Time-to-market más lento** - 6-8 semanas vs 2-3 con Node.js

### Arquitectura Propuesta

```
backend-python/
├── app/
│   ├── api/                          # Flask Blueprints
│   │   ├── __init__.py
│   │   ├── analyses.py
│   │   ├── sessions.py
│   │   └── export.py
│   ├── domain/                       # Domain Layer
│   │   ├── entities/
│   │   │   ├── sentiment_analysis.py
│   │   │   ├── session_metrics.py
│   │   │   └── session_conclusion.py
│   │   ├── value_objects/
│   │   │   ├── emotion_score.py
│   │   │   ├── sentiment_type.py
│   │   │   └── analysis_metrics.py
│   │   └── ports/
│   │       ├── sentiment_analyzer_port.py
│   │       ├── text_extractor_port.py
│   │       └── repository_port.py
│   ├── application/                  # Use Cases & Services
│   │   ├── use_cases/
│   │   │   ├── analyze_sentiment.py
│   │   │   ├── get_historical.py
│   │   │   └── export_analysis.py
│   │   └── services/
│   │       ├── session_metrics_service.py
│   │       ├── session_trends_service.py
│   │       └── session_conclusion_service.py
│   ├── infrastructure/               # Adapters & Persistence
│   │   ├── database/
│   │   │   ├── models.py             # SQLAlchemy models
│   │   │   └── connection.py
│   │   ├── repositories/
│   │   │   ├── postgres_sentiment_repository.py
│   │   │   └── postgres_metrics_repository.py
│   │   ├── adapters/
│   │   │   ├── openai_analyzer.py
│   │   │   ├── pdf_extractor.py
│   │   │   └── csv_exporter.py
│   │   └── di/
│   │       └── container.py          # Dependency injection
│   ├── config/
│   │   ├── settings.py               # Pydantic settings
│   │   └── database.py
│   └── shared/
│       ├── exceptions.py
│       └── utils.py
├── migrations/                       # Alembic migrations
├── tests/
├── requirements.txt
├── Dockerfile
└── docker-compose.yml
```

### Ejemplo de Entidad Python

```python
# app/domain/entities/sentiment_analysis.py
from dataclasses import dataclass
from datetime import datetime
from typing import Dict, Any
from ..value_objects import EmotionScore, SentimentType, AnalysisMetrics

@dataclass(frozen=True)
class SentimentAnalysis:
    """Domain entity for sentiment analysis results"""

    id: str
    client_name: str
    document_name: str
    document_content: str
    overall_sentiment: SentimentType
    emotion_scores: EmotionScore
    analysis_metrics: AnalysisMetrics
    confidence: float
    channel: str
    created_at: datetime
    updated_at: datetime

    def __post_init__(self):
        """Validate entity invariants"""
        if not self.id or not self.id.strip():
            raise ValueError("ID cannot be empty")

        if not self.client_name or not self.client_name.strip():
            raise ValueError("Client name cannot be empty")

        if not 0 <= self.confidence <= 1:
            raise ValueError("Confidence must be between 0 and 1")

    def is_high_confidence(self) -> bool:
        """Check if analysis has high confidence"""
        return self.confidence >= 0.8

    def get_dominant_emotion(self) -> str:
        """Get the emotion with highest score"""
        emotions = {
            'joy': self.emotion_scores.joy,
            'sadness': self.emotion_scores.sadness,
            'anger': self.emotion_scores.anger,
            'fear': self.emotion_scores.fear,
            'surprise': self.emotion_scores.surprise,
            'disgust': self.emotion_scores.disgust,
        }
        return max(emotions, key=emotions.get)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization"""
        return {
            'id': self.id,
            'clientName': self.client_name,
            'documentName': self.document_name,
            'documentContent': self.document_content,
            'overallSentiment': self.overall_sentiment.value,
            'emotionScores': self.emotion_scores.to_dict(),
            'analysisMetrics': self.analysis_metrics.to_dict(),
            'confidence': self.confidence,
            'channel': self.channel,
            'createdAt': self.created_at.isoformat(),
            'updatedAt': self.updated_at.isoformat(),
        }
```

### Ejemplo de Flask Blueprint

```python
# app/api/analyses.py
from flask import Blueprint, request, jsonify
from werkzeug.exceptions import BadRequest
from app.infrastructure.di.container import Container
from app.shared.exceptions import ValidationError, NotFoundError

bp = Blueprint('analyses', __name__, url_prefix='/api/v1/analyses')

@bp.route('/', methods=['POST'])
def analyze_sentiment():
    """Analyze sentiment from uploaded PDF"""
    try:
        # Validate request
        if 'file' not in request.files:
            raise ValidationError('PDF file is required')

        file = request.files['file']
        client_name = request.form.get('clientName')
        channel = request.form.get('channel')

        if not client_name or not channel:
            raise ValidationError('clientName and channel are required')

        # Get use case from DI container
        container = Container()
        analyze_use_case = container.get_analyze_sentiment_use_case()
        metrics_service = container.get_session_metrics_service()
        conclusion_service = container.get_session_conclusion_service()

        # Execute analysis
        result = analyze_use_case.execute(
            file_buffer=file.read(),
            client_name=client_name,
            document_name=file.filename,
            channel=channel
        )

        # Calculate metrics
        metrics = metrics_service.calculate_session_metrics(
            analysis_id=result.analysis.id,
            transcript=result.analysis.document_content,
            analysis_date=result.analysis.created_at
        )

        # Generate conclusion
        conclusion = conclusion_service.generate_conclusion(
            analysis_id=result.analysis.id,
            transcript=result.analysis.document_content,
            sentiment_analysis=result.analysis,
            session_metrics=metrics
        )

        return jsonify({
            'success': True,
            'data': {
                'analysis': result.analysis.to_dict(),
                'metrics': metrics.to_dict(),
                'conclusion': conclusion.to_dict(),
                'processingTimeMs': result.processing_time_ms
            }
        }), 201

    except ValidationError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/history', methods=['GET'])
def get_history():
    """Get historical analyses with filtering and pagination"""
    try:
        # Parse query parameters
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        sort_by = request.args.get('sortBy', 'createdAt')
        sort_order = request.args.get('sortOrder', 'desc')

        filters = {
            'client_name': request.args.get('clientName'),
            'sentiment_type': request.args.get('sentimentType'),
            'channel': request.args.get('channel'),
            'start_date': request.args.get('startDate'),
            'end_date': request.args.get('endDate'),
            'min_confidence': float(request.args.get('minConfidence', 0)),
        }

        # Get use case
        container = Container()
        use_case = container.get_historical_analysis_use_case()

        result = use_case.execute(
            page=page,
            limit=limit,
            sort_by=sort_by,
            sort_order=sort_order,
            filters=filters
        )

        return jsonify({
            'success': True,
            'data': {
                'analyses': [a.to_dict() for a in result.analyses],
                'pagination': result.pagination,
                'statistics': result.statistics
            }
        })

    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500
```

---

## 📡 COMUNICACIÓN FRONTEND ↔ BACKEND {#comunicación-frontend-backend}

### Protocolo Recomendado: REST API + WebSockets

| Característica | Implementación |
|----------------|----------------|
| **Análisis síncronos** | REST API (POST /api/v1/analyses) |
| **Consultas históricas** | REST API (GET /api/v1/analyses/history) |
| **Progreso en tiempo real** | WebSocket (/ws/analysis-progress) |
| **Notificaciones** | WebSocket (/ws/notifications) |
| **Exportación** | REST API con streaming (POST /api/v1/export) |

### Flujo de Comunicación

```
┌─────────────┐                                    ┌─────────────┐
│   FRONTEND  │                                    │   BACKEND   │
└──────┬──────┘                                    └──────┬──────┘
       │                                                  │
       │ 1. POST /api/v1/analyses                        │
       │    (file, clientName, channel)                  │
       ├────────────────────────────────────────────────>│
       │                                                  │
       │ 2. WebSocket connect /ws/analysis-progress      │
       ├────────────────────────────────────────────────>│
       │                                                  │
       │                                                  │ 3. Extract PDF
       │                                                  │
       │ 4. Progress: { stage: "extracting", percent: 10}│
       │<─────────────────────────────────────────────────┤
       │                                                  │
       │                                                  │ 5. Call OpenAI
       │                                                  │
       │ 6. Progress: { stage: "analyzing", percent: 50} │
       │<─────────────────────────────────────────────────┤
       │                                                  │
       │                                                  │ 7. Save to DB
       │                                                  │
       │ 8. Progress: { stage: "saving", percent: 90}    │
       │<─────────────────────────────────────────────────┤
       │                                                  │
       │ 9. Response: { success: true, data: {...} }     │
       │<─────────────────────────────────────────────────┤
       │                                                  │
```

### Implementación WebSocket (Socket.IO)

**Backend (Node.js):**
```typescript
// backend/src/infrastructure/websocket/AnalysisProgressSocket.ts
import { Server } from 'socket.io';
import { EventEmitter } from 'events';

export class AnalysisProgressEmitter extends EventEmitter {
  private static instance: AnalysisProgressEmitter;

  static getInstance() {
    if (!this.instance) {
      this.instance = new AnalysisProgressEmitter();
    }
    return this.instance;
  }

  emitProgress(analysisId: string, stage: string, percent: number) {
    this.emit('progress', { analysisId, stage, percent });
  }
}

export function setupWebSocket(io: Server) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('subscribe', (analysisId: string) => {
      socket.join(`analysis-${analysisId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  const emitter = AnalysisProgressEmitter.getInstance();
  emitter.on('progress', (data) => {
    io.to(`analysis-${data.analysisId}`).emit('progress', data);
  });
}
```

**Frontend (React Hook):**
```typescript
// frontend/src/hooks/useAnalysisProgress.ts
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface ProgressData {
  stage: string;
  percent: number;
}

export function useAnalysisProgress(analysisId: string | null) {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!analysisId) return;

    const newSocket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001');

    newSocket.on('connect', () => {
      newSocket.emit('subscribe', analysisId);
    });

    newSocket.on('progress', (data: ProgressData) => {
      setProgress(data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [analysisId]);

  return progress;
}
```

---

## 🔐 AUTENTICACIÓN Y AUTORIZACIÓN {#autenticación-autorización}

### JWT Authentication Middleware

```typescript
// backend/src/api/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // Attach user to request
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Role-based access control
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}
```

---

## 📊 COMPARACIÓN DE OPCIONES {#comparación-opciones}

| Aspecto | Node.js + Express | Python + Flask |
|---------|-------------------|----------------|
| **Reutilización de código** | ✅ 95% (dominio/aplicación intactos) | ❌ 0% (reescritura completa) |
| **Time to market** | ✅ 2-3 semanas | ⚠️ 6-8 semanas |
| **Type safety** | ✅ TypeScript nativo | ⚠️ Type hints opcionales |
| **Performance I/O** | ✅ Excelente (async/await) | ⚠️ Bueno (sync por defecto) |
| **Ecosistema ML/NLP** | ⚠️ Limitado | ✅ Excelente (spaCy, NLTK) |
| **Mantenibilidad** | ✅ Mismo stack | ⚠️ Dos stacks diferentes |
| **Curva de aprendizaje** | ✅ Baja (mismo lenguaje) | ⚠️ Media (nuevo lenguaje) |
| **Deployment** | ✅ Simple (Docker único) | ⚠️ Dos contenedores |
| **Hiring** | ✅ Full-stack JS/TS | ⚠️ Frontend + Backend separados |
| **Costo de desarrollo** | ✅ Bajo | ⚠️ Alto |
| **Flexibilidad futura** | ✅ Alta | ⚠️ Media |

---

## 🚀 RECOMENDACIÓN FINAL {#recomendación-final}

### Ir con Node.js + Express por:

1. **Reuso del 95% del código existente**
   - Dominio, aplicación e infraestructura pueden copiarse directamente
   - Solo requiere crear adaptadores para PostgreSQL/Redis

2. **Migración incremental posible**
   - Puedes mover endpoints uno por uno
   - Frontend puede consumir ambos backends durante la transición

3. **Mismo ecosistema tecnológico**
   - npm, TypeScript, Jest, ESLint
   - Un solo equipo puede mantener todo

4. **Time-to-market más rápido**
   - 2-3 semanas vs 6-8 semanas
   - Menor riesgo de errores al reescribir

5. **Mejor mantenibilidad a largo plazo**
   - Un solo lenguaje de programación
   - Código compartido entre frontend y backend (tipos, validaciones)

6. **Deployment más simple**
   - Un único stack tecnológico
   - Menos complejidad en CI/CD

### Considera Python + Flask solo si:

- Necesitas análisis de sentimiento **offline** con modelos propios
- Planeas usar **Hugging Face** para modelos especializados en español
- Tienes un equipo dedicado de Data Science
- El rendimiento de ML es crítico vs el de APIs

---

## 📝 Próximos Pasos Recomendados

### Fase 1: Setup (Semana 1)
- [ ] Crear estructura de carpetas del backend
- [ ] Configurar Docker Compose (PostgreSQL + Redis)
- [ ] Setup TypeORM con migrations
- [ ] Configurar Express con middlewares básicos

### Fase 2: Migración de Dominio (Semana 1-2)
- [ ] Copiar entidades de dominio
- [ ] Copiar value objects
- [ ] Copiar ports
- [ ] Adaptar pruebas unitarias

### Fase 3: Implementación de Infraestructura (Semana 2)
- [ ] Implementar PostgreSQL repositories
- [ ] Configurar Redis para caché
- [ ] Adaptar DIContainer
- [ ] Testear persistencia

### Fase 4: API Layer (Semana 2-3)
- [ ] Implementar controllers
- [ ] Crear routes
- [ ] Implementar middlewares (auth, rate limiting, CORS)
- [ ] Configurar WebSockets para progreso en tiempo real

### Fase 5: Testing & Deployment (Semana 3)
- [ ] Escribir tests de integración
- [ ] Configurar CI/CD
- [ ] Deploy a staging
- [ ] Pruebas de carga y performance

---

## 📚 Referencias

**Ubicaciones de archivos clave:**
- Domain Layer: `apps/sentiment-analysis/src/core/domain/`
- Application Layer: `apps/sentiment-analysis/src/core/application/`
- Infrastructure: `apps/sentiment-analysis/src/infrastructure/`
- Frontend: `apps/sentiment-analysis/src/app/`

**Tecnologías recomendadas:**
- Backend: Node.js 20+ con Express 4.x
- Database: PostgreSQL 16
- Cache: Redis 7
- ORM: TypeORM 0.3.x o Prisma 5.x
- WebSockets: Socket.IO 4.x
- Auth: JWT con jsonwebtoken
- Validation: Zod
- Testing: Jest + Supertest

---

**Documento generado:** 2025-11-27
**Ubicación:** `C:\Users\fluid\banorte-monorepo\ARQUITECTURA_DESACOPLAMIENTO_BACKEND_FRONTEND.md`
