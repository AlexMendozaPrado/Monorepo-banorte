import { SentimentType } from '../../core/domain/value-objects/SentimentType';
import { EmotionScore } from '../../core/domain/value-objects/EmotionScore';
import { AnalysisMetricsValueObject } from '../../core/domain/value-objects/AnalysisMetrics';
import { SentimentAnalysisEntity } from '../../core/domain/entities/SentimentAnalysis';

/**
 * Test data factory for creating consistent test data across unit tests
 */

// Sample text content for testing
export const TEST_TEXT_CONTENT = `
Estimado equipo de Banorte,

Quiero expresar mi satisfacción con el servicio recibido. La atención fue excelente
y resolvieron mi problema de manera rápida y eficiente. Estoy muy contento con el resultado.

Gracias por su profesionalismo.

Saludos cordiales.
`;

export const TEST_TEXT_NEGATIVE = `
Estoy muy molesto con el servicio. La atención fue pésima y nadie resolvió mi problema.
Esto es inaceptable y estoy muy frustrado con la situación.
`;

export const TEST_TEXT_NEUTRAL = `
Solicito información sobre los requisitos para abrir una cuenta.
Por favor envíenme la documentación necesaria.
`;

// Mock PDF buffer
export const createMockPDFBuffer = (size: number = 1024): Buffer => {
  return Buffer.alloc(size, 'test-pdf-content');
};

// Mock emotion scores
export const createMockEmotionScore = (overrides?: Partial<EmotionScore>): EmotionScore => {
  return {
    joy: 0.8,
    sadness: 0.1,
    anger: 0.05,
    fear: 0.05,
    surprise: 0.15,
    disgust: 0.02,
    trust: 0.75,
    anticipation: 0.6,
    ...overrides,
  };
};

export const MOCK_EMOTION_POSITIVE: EmotionScore = createMockEmotionScore();

export const MOCK_EMOTION_NEGATIVE: EmotionScore = createMockEmotionScore({
  joy: 0.1,
  sadness: 0.6,
  anger: 0.7,
  fear: 0.4,
  trust: 0.2,
});

export const MOCK_EMOTION_NEUTRAL: EmotionScore = createMockEmotionScore({
  joy: 0.3,
  sadness: 0.3,
  anger: 0.2,
  fear: 0.2,
  trust: 0.4,
});

// Mock analysis metrics
export const createMockAnalysisMetrics = (
  overrides?: Partial<{
    wordCount: number;
    sentenceCount: number;
    paragraphCount: number;
    averageWordsPerSentence: number;
    readabilityScore: number;
    processingTimeMs: number;
    languageDetected: string;
  }>
): AnalysisMetricsValueObject => {
  return new AnalysisMetricsValueObject(
    overrides?.wordCount ?? 250,                   // wordCount
    overrides?.sentenceCount ?? 15,                // sentenceCount
    overrides?.paragraphCount ?? 5,                // paragraphCount
    overrides?.averageWordsPerSentence ?? 16.7,    // averageWordsPerSentence
    overrides?.readabilityScore ?? 65.5,           // readabilityScore
    overrides?.processingTimeMs ?? 5000,           // processingTimeMs
    overrides?.languageDetected ?? 'es'            // languageDetected
  );
};

// Mock sentiment analysis entity
export const createMockSentimentAnalysis = (
  overrides?: Partial<SentimentAnalysisEntity>
): SentimentAnalysisEntity => {
  const now = new Date();

  return new SentimentAnalysisEntity(
    overrides?.id || 'test-id-123',
    overrides?.clientName || 'Juan Pérez',
    overrides?.documentName || 'test-document.pdf',
    overrides?.documentContent || TEST_TEXT_CONTENT,
    overrides?.overallSentiment || SentimentType.POSITIVE,
    overrides?.emotionScores || MOCK_EMOTION_POSITIVE,
    overrides?.analysisMetrics || createMockAnalysisMetrics(),
    overrides?.confidence || 0.92,
    overrides?.channel || 'Email',
    overrides?.createdAt || now,
    overrides?.updatedAt || now
  );
};

// Mock extracted text
export const createMockExtractedText = (content: string = TEST_TEXT_CONTENT) => ({
  content,
  metadata: {
    pageCount: 1,
    title: 'Test Document',
    author: 'Test Author',
    creationDate: new Date('2024-01-01'),
    modificationDate: new Date('2024-01-15'),
    fileSize: 1024,
  },
});

// Mock command data
export const createMockAnalyzeSentimentCommand = (overrides?: any) => ({
  fileBuffer: createMockPDFBuffer(),
  clientName: 'Test Client',
  documentName: 'test-document.pdf',
  channel: 'Email',
  ...overrides,
});

// Collection of mock analyses for repository tests
// Using a function to avoid premature execution
export const getMockAnalysesCollection = () => [
  createMockSentimentAnalysis({
    id: '1',
    clientName: 'Cliente A',
    overallSentiment: SentimentType.POSITIVE,
    channel: 'Email',
    confidence: 0.95,
    createdAt: new Date('2024-01-15'),
  }),
  createMockSentimentAnalysis({
    id: '2',
    clientName: 'Cliente B',
    overallSentiment: SentimentType.NEGATIVE,
    channel: 'Chat',
    confidence: 0.88,
    createdAt: new Date('2024-01-16'),
  }),
  createMockSentimentAnalysis({
    id: '3',
    clientName: 'Cliente C',
    overallSentiment: SentimentType.NEUTRAL,
    channel: 'Phone',
    confidence: 0.75,
    createdAt: new Date('2024-01-17'),
  }),
  createMockSentimentAnalysis({
    id: '4',
    clientName: 'Cliente A',
    overallSentiment: SentimentType.POSITIVE,
    channel: 'Email',
    confidence: 0.92,
    createdAt: new Date('2024-01-18'),
  }),
];
