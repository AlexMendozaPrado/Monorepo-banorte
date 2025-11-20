# Análisis de Sentimientos - Documind

## Descripción

Se ha implementado un sistema completo de análisis de sentimientos que extrae métricas detalladas de documentos PDF y las muestra en el Dashboard A (Dashboard Ejecutivo).

## Arquitectura Implementada

### Backend

#### 1. **Tipos de Dominio** (`SentimentAnalysis.ts`)
Contiene todas las interfaces y tipos para el análisis:
- `SentimentScore`: Escala de 1-7
- `EmotionData`: Distribución de emociones
- `TimelinePoint`: Evolución temporal del sentimiento
- `KeywordData`: Palabras clave con sentimiento asociado
- `Alert`: Alertas y recomendaciones de negocio
- `DocumentInfo`: Metadata del documento
- `TextMetrics`: Métricas del texto
- `SentimentAnalysisResult`: Resultado completo del análisis

#### 2. **Port** (`SentimentExtractorPort.ts`)
Interface que define el contrato para extraer análisis de sentimientos.

#### 3. **Implementación OpenAI** (`OpenAISentimentExtractor.ts`)
Implementa el análisis usando GPT-4o-mini:
- Construye prompts especializados
- Extrae JSON estructurado de la respuesta
- Maneja errores con valores por defecto

#### 4. **Prompt Builder** (`SentimentPromptBuilder.ts`)
Construye prompts detallados que solicitan:
- Sentimiento general (1-7)
- Nivel de confianza (0-100%)
- Distribución de emociones (%)
- Timeline emocional
- Palabras clave con frecuencia y sentimiento
- Alertas y recomendaciones
- Información del documento
- Métricas del texto

#### 5. **Use Case Actualizado** (`AnalyzePdfUseCase.ts`)
Ahora ejecuta 3 pasos:
1. Extrae texto del PDF
2. Extrae keywords
3. **Extrae análisis de sentimientos** (NUEVO)

#### 6. **API Route** (`/api/analyze/route.ts`)
Retorna:
```json
{
  "keywords": [...],
  "sentimentAnalysis": {
    "sentimentScore": 5,
    "confidenceLevel": 87,
    "emotions": [...],
    "timeline": [...],
    "keywords": [...],
    "alerts": [...],
    "documentInfo": {...},
    "textMetrics": {...}
  },
  "fullText": "...",
  "documentId": "...",
  "chunkCount": 42
}
```

### Frontend

#### 1. **DashboardA Component** (`DashboardA.tsx`)
Dashboard ejecutivo que muestra:
- Información del documento
- Sentimiento general (escala visual 1-7)
- Nivel de confianza
- Distribución de emociones
- Palabras clave y triggers
- Alertas y recomendaciones
- Métricas del texto
- Timeline emocional

#### 2. **Página de Análisis** (`/sentiment-analysis/page.tsx`)
Flujo completo:
1. Upload de documento
2. Análisis con barra de progreso
3. Visualización en Dashboard A
4. Opción de volver a cargar otro documento

## Uso

### 1. Acceder a la página
```
http://localhost:3000/sentiment-analysis
```

### 2. Cargar un PDF
- Arrastra un archivo PDF o haz clic para seleccionar
- El sistema mostrará el progreso:
  - Subiendo archivo (10%)
  - Extrayendo texto (30%)
  - Analizando sentimientos con IA (60%)
  - Completado (100%)

### 3. Ver el Dashboard
Una vez completado el análisis, se mostrará automáticamente el Dashboard A con todas las métricas.

### 4. Volver a analizar
Haz clic en "Volver a cargar documento" para analizar otro archivo.

## Modos de Análisis

El sistema soporta 4 modos (actualmente usa "finance"):
- `generic`: Documentos generales
- `legal`: Documentos legales y jurídicos
- `academic`: Documentos académicos y científicos
- `finance`: Documentos financieros y de negocios (DEFAULT)

Para cambiar el modo, edita la línea en `sentiment-analysis/page.tsx`:
```typescript
formData.append("mode", "finance"); // Cambia a "legal", "academic" o "generic"
```

## Ejemplo de Métricas Extraídas

```json
{
  "sentimentScore": 5,
  "confidenceLevel": 87,
  "emotions": [
    {"emotion": "Alegría", "percentage": 35},
    {"emotion": "Neutral", "percentage": 20},
    {"emotion": "Sorpresa", "percentage": 15},
    {"emotion": "Tristeza", "percentage": 10},
    {"emotion": "Enojo", "percentage": 10},
    {"emotion": "Disgusto", "percentage": 10}
  ],
  "keywords": [
    {"word": "inversión", "frequency": 24, "sentiment": 6},
    {"word": "comisiones", "frequency": 18, "sentiment": 3}
  ],
  "alerts": [
    {
      "id": "1",
      "message": "Cliente expresó interés en producto de inversión",
      "priority": "Alta",
      "context": "Minuto 15: 'Me interesa conocer más sobre los fondos'",
      "timestamp": "15:45"
    }
  ],
  "documentInfo": {
    "client": "Grupo Financiero XYZ",
    "channel": "Reunión Virtual",
    "date": "15/07/2023",
    "duration": "45 minutos",
    "participants": ["Juan Pérez", "María González"]
  },
  "textMetrics": {
    "words": 3245,
    "sentences": 215,
    "avgWordsPerSentence": 15.1,
    "readability": "Medio-Alto",
    "readingTime": "16 minutos",
    "vocabularyType": "Técnico Financiero"
  }
}
```

## Archivos Creados/Modificados

### Nuevos Archivos
1. `src/core/domain/documents/SentimentAnalysis.ts`
2. `src/core/domain/documents/ports/SentimentExtractorPort.ts`
3. `src/core/application/documents/services/SentimentPromptBuilder.ts`
4. `src/infrastructure/llm/OpenAISentimentExtractor.ts`
5. `src/components/dashboard/DashboardA.tsx`
6. `src/app/sentiment-analysis/page.tsx`

### Archivos Modificados
1. `src/core/application/documents/use-cases/AnalyzePdfUseCase.ts`
2. `src/composition/container.ts`
3. `src/app/api/analyze/route.ts`

## Variables de Entorno Requeridas

Asegúrate de tener configuradas en `.env.local`:
```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

## Próximos Pasos

### Opcional - Mejoras Futuras
1. **Histórico**: Guardar análisis previos en la base de datos
2. **Comparativas**: Comparar sentimiento entre diferentes documentos
3. **Exportar PDF**: Generar reporte en PDF del análisis
4. **Dashboards B y C**: Implementar las otras vistas de dashboard
5. **Filtros**: Permitir filtrar por fecha, cliente, sentimiento, etc.
6. **Gráficas**: Agregar visualizaciones con Chart.js o Recharts
7. **Real-time**: WebSocket para análisis en tiempo real

## Testing

Para probar la implementación:
1. Prepara un PDF de prueba (documento financiero, reunión, informe, etc.)
2. Accede a `/sentiment-analysis`
3. Carga el PDF
4. Verifica que se muestren todas las métricas en el Dashboard A

## Notas Técnicas

- **Modelo**: GPT-4o-mini (rápido y económico)
- **Temperature**: 0.3 (respuestas consistentes pero con algo de creatividad)
- **Max Tokens**: 2500 (suficiente para análisis detallado)
- **Formato**: JSON estructurado
- **Fallback**: Si falla el análisis, se muestran valores por defecto
- **Logging**: Todos los pasos están logueados en consola del servidor
