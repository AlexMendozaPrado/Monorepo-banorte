import {
  SentimentAnalyzerPort,
  SentimentAnalysisRequest,
  SentimentAnalysisResponse
} from '../../core/domain/ports/SentimentAnalyzerPort';
import { SentimentType } from '../../core/domain/value-objects/SentimentType';
import { MOCK_EMOTION_POSITIVE, MOCK_EMOTION_NEGATIVE, MOCK_EMOTION_NEUTRAL } from './testData';

/**
 * Implementación mock de SentimentAnalyzerPort para testing.
 * Cumple el mismo contrato (Port) que OpenAISentimentAnalyzer,
 * pero devuelve respuestas controlables sin llamar a la API real.
 */
export class SentimentAnalyzerMock implements SentimentAnalyzerPort {
  private ready: boolean = true;
  private shouldFail: boolean = false;
  private mockResponse: SentimentAnalysisResponse | null = null;
  private callHistory: SentimentAnalysisRequest[] = [];

  async analyzeSentiment(request: SentimentAnalysisRequest): Promise<SentimentAnalysisResponse> {
    // Registra la llamada para poder verificarla en los tests
    this.callHistory.push(request);

    // Si se configuró para fallar, lanza error (simula caída de OpenAI)
    if (this.shouldFail) {
      throw new Error('Sentiment analyzer failed');
    }

    // Si hay una respuesta configurada, la devuelve
    if (this.mockResponse) {
      return this.mockResponse;
    }

    // Comportamiento por defecto: devuelve sentimiento positivo
    return {
      overallSentiment: SentimentType.POSITIVE,
      emotionScores: MOCK_EMOTION_POSITIVE,
      confidence: 0.92,
      reasoning: 'Mock analysis reasoning',
    };
  }

  async isReady(): Promise<boolean> {
    return this.ready;
  }

  getModelInfo() {
    return {
      name: 'mock-model',
      version: '1.0.0',
      maxTokens: 4000,
    };
  }

  // ─── Métodos de utilidad para tests ─────────────────────────
  /** Controla si el analizador está "listo" */
  setReady(ready: boolean): void {
    this.ready = ready;
  }

  /** Fuerza que el mock lance un error (simula fallo de la API) */
  setShouldFail(shouldFail: boolean): void {
    this.shouldFail = shouldFail;
  }

  /** Define la respuesta que devolverá el mock */
  setMockResponse(response: SentimentAnalysisResponse): void {
    this.mockResponse = response;
  }

  /** Devuelve el historial de llamadas para verificar en los asserts */
  getCallHistory(): SentimentAnalysisRequest[] {
    return this.callHistory;
  }

  /** Limpia todo el estado — se llama en afterEach() */
  reset(): void {
    this.ready = true;
    this.shouldFail = false;
    this.mockResponse = null;
    this.callHistory = [];
  }
}

/**
 * Factory para crear un mock ya configurado
 */
export const createSentimentAnalyzerMock = (config?: {
  ready?: boolean;
  shouldFail?: boolean;
  response?: SentimentAnalysisResponse;
}): SentimentAnalyzerMock => {
  const mock = new SentimentAnalyzerMock();

  if (config?.ready !== undefined) {
    mock.setReady(config.ready);
  }

  if (config?.shouldFail) {
    mock.setShouldFail(config.shouldFail);
  }

  if (config?.response) {
    mock.setMockResponse(config.response);
  }

  return mock;
};
