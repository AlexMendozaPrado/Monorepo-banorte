import OpenAI from 'openai';
import { 
  SentimentAnalyzerPort, 
  SentimentAnalysisRequest, 
  SentimentAnalysisResponse 
} from '../../core/domain/ports/SentimentAnalyzerPort';
import { SentimentType } from '../../core/domain/value-objects/SentimentType';
import { EmotionScoreValueObject } from '../../core/domain/value-objects/EmotionScore';

export class OpenAISentimentAnalyzer implements SentimentAnalyzerPort {
  private openai: OpenAI;
  private model: string;
  private maxTokens: number;
  private temperature: number;

  constructor(
    apiKey: string,
    model: string = 'gpt-4',
    maxTokens: number = 4000,
    temperature: number = 0.3
  ) {
    this.openai = new OpenAI({ apiKey });
    this.model = model;
    this.maxTokens = maxTokens;
    this.temperature = temperature;
  }

  async analyzeSentiment(request: SentimentAnalysisRequest): Promise<SentimentAnalysisResponse> {
    try {
      const prompt = this.buildAnalysisPrompt(request);

      // Prepare the completion request
      const completionRequest: any = {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
      };

      // Add JSON mode only for compatible models
      if (this.supportsJsonMode()) {
        completionRequest.response_format = { type: 'json_object' };
      }

      const completion = await this.openai.chat.completions.create(completionRequest);

      const responseContent = completion.choices[0]?.message?.content;
      if (!responseContent) {
        throw new Error('No response received from OpenAI');
      }

      return this.parseAnalysisResponse(responseContent);
    } catch (error) {
      console.error('Error in OpenAI sentiment analysis:', error);
      throw new Error(`Sentiment analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async isReady(): Promise<boolean> {
    try {
      // Test with a simple request
      const testCompletion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: 'Test' }],
        max_tokens: 10,
      });

      return !!testCompletion.choices[0]?.message?.content;
    } catch (error) {
      console.error('OpenAI readiness check failed:', error);
      return false;
    }
  }

  getModelInfo(): { name: string; version: string; maxTokens: number } {
    return {
      name: this.model,
      version: '1.0',
      maxTokens: this.maxTokens,
    };
  }

  private supportsJsonMode(): boolean {
    // Models that support JSON mode
    const jsonModeModels = [
      'gpt-4-1106-preview',
      'gpt-4-turbo-preview',
      'gpt-4-turbo',
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-3.5-turbo-1106',
      'gpt-3.5-turbo-0125',
    ];

    return jsonModeModels.some(model => this.model.includes(model));
  }

  private getSystemPrompt(): string {
    const jsonModeInstruction = this.supportsJsonMode()
      ? "IMPORTANTE: Debes responder ÚNICAMENTE en formato JSON válido con la siguiente estructura:"
      : "IMPORTANTE: Debes responder con un objeto JSON válido. Asegúrate de que tu respuesta contenga únicamente el JSON, sin texto adicional antes o después:";

    return `Eres un experto analista de sentimientos especializado en el sector bancario mexicano, trabajando para Banorte.

Tu tarea es analizar documentos y conversaciones de clientes para determinar:
1. El sentimiento general (positivo, neutral, negativo)
2. Las emociones específicas presentes en el texto
3. El nivel de confianza en tu análisis

${jsonModeInstruction}
{
  "overallSentiment": "positive" | "neutral" | "negative",
  "emotionScores": {
    "joy": 0.0-1.0,
    "sadness": 0.0-1.0,
    "anger": 0.0-1.0,
    "fear": 0.0-1.0,
    "surprise": 0.0-1.0,
    "disgust": 0.0-1.0
  },
  "confidence": 0.0-1.0,
  "reasoning": "Breve explicación del análisis"
}

Consideraciones especiales para el contexto bancario:
- Palabras como "problema", "error", "demora" pueden indicar frustración
- Expresiones de gratitud o satisfacción son indicadores positivos
- Consultas técnicas sin emociones fuertes son generalmente neutrales
- Los puntajes de emociones deben sumar aproximadamente 1.0

Responde SOLO con el JSON, sin explicaciones adicionales.`;
  }

  private buildAnalysisPrompt(request: SentimentAnalysisRequest): string {
    return `Analiza el siguiente texto de un cliente de Banorte:

Cliente: ${request.clientName}
Canal: ${request.channel}
Documento: ${request.documentName}

Texto a analizar:
"""
${request.text}
"""

Proporciona un análisis completo del sentimiento y emociones presentes en el texto.`;
  }

  private parseAnalysisResponse(responseContent: string): SentimentAnalysisResponse {
    try {
      // Try to extract JSON from the response (in case it's wrapped in text)
      let jsonContent = responseContent.trim();

      // Look for JSON object in the response
      const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonContent = jsonMatch[0];
      }

      const parsed = JSON.parse(jsonContent);

      // Validate required fields
      if (!parsed.overallSentiment || !parsed.emotionScores || parsed.confidence === undefined) {
        throw new Error('Invalid response format from OpenAI');
      }

      // Validate sentiment type
      const sentimentType = this.parseSentimentType(parsed.overallSentiment);

      // Validate and normalize emotion scores
      const rawScores = {
        joy: parsed.emotionScores.joy || 0,
        sadness: parsed.emotionScores.sadness || 0,
        anger: parsed.emotionScores.anger || 0,
        fear: parsed.emotionScores.fear || 0,
        surprise: parsed.emotionScores.surprise || 0,
        disgust: parsed.emotionScores.disgust || 0
      };

      const normalizedScores = this.normalizeEmotionScores(rawScores);
      const emotionScores = new EmotionScoreValueObject(
        normalizedScores.joy,
        normalizedScores.sadness,
        normalizedScores.anger,
        normalizedScores.fear,
        normalizedScores.surprise,
        normalizedScores.disgust
      );

      // Validate confidence
      const confidence = Math.max(0, Math.min(1, parsed.confidence));

      return {
        overallSentiment: sentimentType,
        emotionScores,
        confidence,
        reasoning: parsed.reasoning || 'No reasoning provided',
      };
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      console.error('Response content:', responseContent);

      // Fallback: create a basic analysis if parsing fails
      return this.createFallbackAnalysis(responseContent);
    }
  }

  private normalizeEmotionScores(scores: Record<string, number>): Record<string, number> {
    const MINIMUM_THRESHOLD = 0.05; // 5% mínimo para considerar una emoción presente

    const values = Object.values(scores);
    const sum = values.reduce((acc, val) => acc + val, 0);

    // Si la suma es muy baja, el modelo no detectó emociones claras
    // En lugar de distribuir equitativamente, asignar ceros
    if (sum < 0.01) {
      return {
        joy: 0,
        sadness: 0,
        anger: 0,
        fear: 0,
        surprise: 0,
        disgust: 0
      };
    }

    // Paso 1: Normalizar primero
    const normalizedScores: Record<string, number> = {};
    for (const [key, value] of Object.entries(scores)) {
      normalizedScores[key] = value / sum;
    }

    // Paso 2: Filtrar emociones por debajo del umbral
    const filteredScores: Record<string, number> = {};
    let filteredSum = 0;

    for (const [key, value] of Object.entries(normalizedScores)) {
      if (value >= MINIMUM_THRESHOLD) {
        filteredScores[key] = value;
        filteredSum += value;
      } else {
        filteredScores[key] = 0; // Asignar 0 a emociones insignificantes
      }
    }

    // Paso 3: Re-normalizar solo las emociones significativas para que sumen 1.0
    if (filteredSum > 0) {
      for (const key in filteredScores) {
        if (filteredScores[key] > 0) {
          filteredScores[key] = filteredScores[key] / filteredSum;
        }
      }
    }

    return filteredScores;
  }

  private parseSentimentType(sentiment: string): SentimentType {
    const normalizedSentiment = sentiment.toLowerCase().trim();

    switch (normalizedSentiment) {
      case 'positive':
      case 'positivo':
        return SentimentType.POSITIVE;
      case 'negative':
      case 'negativo':
        return SentimentType.NEGATIVE;
      case 'neutral':
        return SentimentType.NEUTRAL;
      default:
        console.warn(`Unknown sentiment type: ${sentiment}, defaulting to neutral`);
        return SentimentType.NEUTRAL;
    }
  }

  private createFallbackAnalysis(responseContent: string): SentimentAnalysisResponse {
    console.log('Creating fallback analysis due to parsing error');

    // Simple text analysis for fallback
    const text = responseContent.toLowerCase();
    let sentiment = SentimentType.NEUTRAL;
    let confidence = 0.5;

    // Basic sentiment detection
    const positiveWords = ['bueno', 'excelente', 'satisfecho', 'contento', 'feliz', 'gracias'];
    const negativeWords = ['malo', 'terrible', 'molesto', 'enojado', 'problema', 'error'];

    const positiveCount = positiveWords.filter(word => text.includes(word)).length;
    const negativeCount = negativeWords.filter(word => text.includes(word)).length;

    if (positiveCount > negativeCount) {
      sentiment = SentimentType.POSITIVE;
      confidence = 0.6;
    } else if (negativeCount > positiveCount) {
      sentiment = SentimentType.NEGATIVE;
      confidence = 0.6;
    }

    // Create basic emotion scores that sum to 1
    let joy = 0.1, sadness = 0.1, anger = 0.1, fear = 0.1, surprise = 0.1, disgust = 0.1;

    if (sentiment === SentimentType.POSITIVE) {
      joy = 0.5;
      sadness = 0.1;
      anger = 0.1;
      fear = 0.1;
      surprise = 0.1;
      disgust = 0.1;
    } else if (sentiment === SentimentType.NEGATIVE) {
      joy = 0.1;
      sadness = 0.3;
      anger = 0.3;
      fear = 0.1;
      surprise = 0.1;
      disgust = 0.1;
    } else {
      // Neutral - distribute evenly
      joy = sadness = anger = fear = surprise = disgust = 1/6;
    }

    const emotionScores = new EmotionScoreValueObject(joy, sadness, anger, fear, surprise, disgust);

    return {
      overallSentiment: sentiment,
      emotionScores,
      confidence,
      reasoning: 'Análisis básico debido a error en el parsing de la respuesta de OpenAI',
    };
  }
}
