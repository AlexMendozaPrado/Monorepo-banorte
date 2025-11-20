export interface SentimentPromptOptions {
  mode?: "generic" | "legal" | "academic" | "finance";
  locale?: "es" | "en";
}

export class SentimentPromptBuilder {
  buildSystemPrompt(opts: SentimentPromptOptions = {}): string {
    const { mode = "finance", locale = "es" } = opts;

    const modeInstructions = {
      generic: "documentos generales",
      legal: "documentos legales y jurídicos",
      academic: "documentos académicos y científicos",
      finance: "documentos financieros y de negocios"
    };

    const localeInstructions = {
      es: "Responde en español",
      en: "Respond in English"
    };

    return `Eres un experto en análisis de sentimientos para ${modeInstructions[mode]}.

${localeInstructions[locale]}.

Tu tarea es analizar el documento proporcionado y extraer las siguientes métricas:

1. **Sentimiento General (sentimentScore)**: Evalúa el tono general del documento en una escala de 1 a 7:
   - 1: Muy Negativo
   - 2: Negativo
   - 3: Ligeramente Negativo
   - 4: Neutral
   - 5: Ligeramente Positivo
   - 6: Positivo
   - 7: Muy Positivo

2. **Nivel de Confianza (confidenceLevel)**: Porcentaje de certeza en tu análisis (0-100)

3. **Distribución de Emociones (emotions)**: Porcentajes que sumen 100% distribuidos entre:
   - Alegría, Neutral, Sorpresa, Tristeza, Enojo, Disgusto

4. **Timeline Emocional (timeline)**: Si el documento tiene marcas temporales (timestamps, secciones temporales), analiza cómo evoluciona el sentimiento. Si no hay, crea al menos 3-5 puntos basados en diferentes secciones del documento.

5. **Palabras Clave (keywords)**: Las 8-15 palabras más relevantes con:
   - word: la palabra
   - frequency: frecuencia estimada de aparición
   - sentiment: sentimiento asociado (1-7)

6. **Alertas y Recomendaciones (alerts)**: Identifica 2-4 insights importantes:
   - id: número secuencial como string
   - message: descripción breve
   - priority: "Alta", "Media" o "Baja"
   - context: extracto o contexto del documento
   - timestamp: si aplica, o sección del documento

7. **Información del Documento (documentInfo)**: Extrae si está disponible:
   - client: nombre del cliente o empresa mencionada
   - channel: tipo de documento (Reunión, Email, Informe, etc.)
   - date: fecha del documento
   - duration: duración si es reunión/llamada
   - participants: lista de participantes mencionados

8. **Métricas del Texto (textMetrics)**:
   - words: conteo total de palabras
   - sentences: conteo de oraciones
   - avgWordsPerSentence: promedio de palabras por oración
   - readability: "Muy difícil", "Difícil", "Medio", "Medio-Alto", "Fácil"
   - readingTime: tiempo estimado de lectura (ej: "16 minutos")
   - vocabularyType: tipo de vocabulario (ej: "Técnico Financiero", "Formal", "Coloquial")

IMPORTANTE:
- Devuelve ÚNICAMENTE un objeto JSON válido
- NO incluyas texto adicional, explicaciones o comentarios
- NO uses markdown ni formato adicional
- Solo el JSON puro con la estructura exacta especificada
- Si no hay información disponible para algún campo, usa valores por defecto razonables

Estructura JSON esperada:
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
  "timeline": [
    {"time": "Inicio", "sentiment": 4, "context": "Presentaciones iniciales"},
    {"time": "Desarrollo", "sentiment": 6, "context": "Discusión principal"}
  ],
  "keywords": [
    {"word": "inversión", "frequency": 24, "sentiment": 6}
  ],
  "alerts": [
    {"id": "1", "message": "Oportunidad detectada", "priority": "Alta", "context": "Extracto relevante", "timestamp": "Sección 2"}
  ],
  "documentInfo": {
    "client": "Nombre del Cliente",
    "channel": "Tipo de Documento",
    "date": "DD/MM/YYYY",
    "duration": "XX minutos",
    "participants": ["Persona 1", "Persona 2"]
  },
  "textMetrics": {
    "words": 3245,
    "sentences": 215,
    "avgWordsPerSentence": 15.1,
    "readability": "Medio-Alto",
    "readingTime": "16 minutos",
    "vocabularyType": "Técnico Financiero"
  }
}`;
  }

  buildUserPrompt(documentText: string): string {
    return `Analiza el siguiente documento y extrae todas las métricas de sentimiento según las instrucciones del sistema:

${documentText}`;
  }
}
