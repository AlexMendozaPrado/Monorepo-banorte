import { AnalyzeSentimentUseCase } from '../../../core/application/use-cases/AnalyzeSentimentUseCase';
import { SentimentAnalyzerMock } from '../../mocks/SentimentAnalyzerMock';
import { TextExtractorMock } from '../../mocks/TextExtractorMock';
import { SentimentAnalysisRepositoryMock } from '../../mocks/RepositoryMock';
import { SentimentType } from '../../../core/domain/value-objects/SentimentType';
import {
  createMockPDFBuffer,
  createMockExtractedText,
  createMockAnalyzeSentimentCommand,
  TEST_TEXT_CONTENT,
  MOCK_EMOTION_POSITIVE,
} from '../../mocks/testData';

describe('AnalyzeSentimentUseCase', () => {
  let useCase: AnalyzeSentimentUseCase;
  let mockAnalyzer: SentimentAnalyzerMock;
  let mockExtractor: TextExtractorMock;
  let mockRepository: SentimentAnalysisRepositoryMock;

  beforeEach(() => {
    // Crear mocks frescos para cada test (estado limpio)
    mockAnalyzer = new SentimentAnalyzerMock();
    mockExtractor = new TextExtractorMock();
    mockRepository = new SentimentAnalysisRepositoryMock();

    // Inyectar mocks en el Use Case (Dependency Injection)
    // El Use Case recibe Ports, no sabe si son mocks o reales
    useCase = new AnalyzeSentimentUseCase(
      mockAnalyzer,    // en vez de OpenAISentimentAnalyzer
      mockExtractor,   // en vez de PDFTextExtractor
      mockRepository   // en vez de InMemoryRepository / Supabase
    );
  });

  afterEach(() => {
    // Limpiar estado después de cada test
    mockAnalyzer.reset();
    mockExtractor.reset();
    mockRepository.reset();
  });

  describe('Camino Feliz - Análisis Exitoso', () => {
    it('debería analizar sentimiento exitosamente con inputs válidos', async () => {
      // ARRANGE — preparar datos y configurar mocks
      const command = createMockAnalyzeSentimentCommand();
      mockExtractor.setMockExtractedText(createMockExtractedText(TEST_TEXT_CONTENT));
      mockAnalyzer.setMockResponse({
        overallSentiment: SentimentType.POSITIVE,
        emotionScores: MOCK_EMOTION_POSITIVE,
        confidence: 0.92,
      });

      // ACT — ejecutar el caso de uso
      const result = await useCase.execute(command);

      // ASSERT — verificar el resultado
      expect(result).toBeDefined();
      expect(result.analysis).toBeDefined();
      expect(result.analysis.overallSentiment).toBe(SentimentType.POSITIVE);
      expect(result.analysis.confidence).toBe(0.92);
      expect(result.analysis.clientName).toBe(command.clientName);
      expect(result.analysis.documentName).toBe(command.documentName);
      expect(result.analysis.channel).toBe(command.channel);
      expect(result.processingTimeMs).toBeGreaterThanOrEqual(0);
    });

    it('debería guardar el análisis en el repositorio', async () => {
      // ARRANGE
      const command = createMockAnalyzeSentimentCommand();

      // ACT
      await useCase.execute(command);

      // ASSERT — verificar que el mock del repositorio guardó el análisis
      const savedAnalyses = mockRepository.getAll();
      expect(savedAnalyses).toHaveLength(1);
      expect(savedAnalyses[0].clientName).toBe(command.clientName);
    });

    it('debería llamar todas las dependencias en orden correcto', async () => {
      // ARRANGE
      const command = createMockAnalyzeSentimentCommand();

      // ACT
      await useCase.execute(command);

      // ASSERT — verificar el historial de llamadas del mock
      const analyzerHistory = mockAnalyzer.getCallHistory();
      expect(analyzerHistory).toHaveLength(1);
      expect(analyzerHistory[0].clientName).toBe(command.clientName);
      expect(mockRepository.getAll()).toHaveLength(1);
    });

    it('debería generar IDs únicos para cada análisis', async () => {
      // ARRANGE
      const command = createMockAnalyzeSentimentCommand();

      // ACT — ejecutar dos veces
      const result1 = await useCase.execute(command);
      const result2 = await useCase.execute(command);

      // ASSERT — cada análisis tiene un ID diferente
      expect(result1.analysis.id).not.toBe(result2.analysis.id);
      expect(mockRepository.getAll()).toHaveLength(2);
    });
  });

  describe('Validación de Inputs', () => {
    it('debería lanzar error cuando el buffer del archivo está vacío', async () => {
      // ARRANGE — crear comando con buffer vacío
      const command = createMockAnalyzeSentimentCommand({
        fileBuffer: Buffer.alloc(0),
      });

      // ACT & ASSERT — verificar que lanza el error esperado
      await expect(useCase.execute(command)).rejects.toThrow(
        'File buffer cannot be empty'
      );
    });

    it('debería lanzar error cuando el nombre del cliente está vacío', async () => {
      // ARRANGE
      const command = createMockAnalyzeSentimentCommand({
        clientName: '',
      });

      // ACT & ASSERT
      await expect(useCase.execute(command)).rejects.toThrow(
        'Client name is required'
      );
    });

    it('debería lanzar error cuando el nombre del cliente es solo espacios', async () => {
      // ARRANGE
      const command = createMockAnalyzeSentimentCommand({
        clientName: '   ',
      });

      // ACT & ASSERT
      await expect(useCase.execute(command)).rejects.toThrow(
        'Client name is required'
      );
    });

    it('debería lanzar error cuando el nombre del documento está vacío', async () => {
      // ARRANGE
      const command = createMockAnalyzeSentimentCommand({
        documentName: '',
      });

      // ACT & ASSERT
      await expect(useCase.execute(command)).rejects.toThrow(
        'Document name is required'
      );
    });

    it('debería lanzar error cuando el canal está vacío', async () => {
      // ARRANGE
      const command = createMockAnalyzeSentimentCommand({
        channel: '',
      });

      // ACT & ASSERT
      await expect(useCase.execute(command)).rejects.toThrow(
        'Channel is required'
      );
    });

    it('debería lanzar error cuando el archivo excede el tamaño máximo', async () => {
      // ARRANGE — crear un archivo más grande que el límite
      const maxSize = mockExtractor.getMaxFileSize();
      const oversizedBuffer = Buffer.alloc(maxSize + 1);
      const command = createMockAnalyzeSentimentCommand({
        fileBuffer: oversizedBuffer,
      });

      // ACT & ASSERT
      await expect(useCase.execute(command)).rejects.toThrow(
        `File size exceeds maximum limit of ${maxSize} bytes`
      );
    });
  });

  describe('Errores del Analizador de Sentimiento', () => {
    it('debería lanzar error cuando el analizador no está listo', async () => {
      // ARRANGE — configurar el mock para que NO esté listo
      const command = createMockAnalyzeSentimentCommand();
      mockAnalyzer.setReady(false);

      // ACT & ASSERT
      await expect(useCase.execute(command)).rejects.toThrow(
        'Sentiment analyzer is not ready'
      );
    });

    it('debería lanzar error cuando el analizador falla', async () => {
      // ARRANGE — configurar el mock para que falle (simula caída de OpenAI)
      const command = createMockAnalyzeSentimentCommand();
      mockAnalyzer.setShouldFail(true);

      // ACT & ASSERT
      await expect(useCase.execute(command)).rejects.toThrow(
        'Sentiment analyzer failed'
      );
    });

    it('NO debería guardar el análisis cuando el analizador falla', async () => {
      // ARRANGE
      const command = createMockAnalyzeSentimentCommand();
      mockAnalyzer.setShouldFail(true);

      // ACT — intentar ejecutar (esperamos que falle)
      try {
        await useCase.execute(command);
      } catch (error) {
        // Error esperado
      }

      // ASSERT — el repositorio debe estar vacío
      expect(mockRepository.getAll()).toHaveLength(0);
    });
  });

  describe('Errores de Extracción de PDF', () => {
    it('debería lanzar error cuando el PDF es inválido', async () => {
      // ARRANGE — configurar el mock para que rechace el PDF
      const command = createMockAnalyzeSentimentCommand();
      mockExtractor.setValidPDF(false);

      // ACT & ASSERT
      await expect(useCase.execute(command)).rejects.toThrow(
        'Invalid PDF file provided'
      );
    });

    it('debería lanzar error cuando la extracción de PDF falla', async () => {
      // ARRANGE — configurar el mock para que falle
      const command = createMockAnalyzeSentimentCommand();
      mockExtractor.setShouldFail(true);

      // ACT & ASSERT
      await expect(useCase.execute(command)).rejects.toThrow(
        'Failed to validate PDF'
      );
    });

    it('debería lanzar error cuando el texto extraído está vacío', async () => {
      // ARRANGE — el PDF es válido pero no tiene contenido
      const command = createMockAnalyzeSentimentCommand();
      mockExtractor.setMockExtractedText(createMockExtractedText(''));

      // ACT & ASSERT
      await expect(useCase.execute(command)).rejects.toThrow(
        'No text content could be extracted from the PDF file'
      );
    });

    it('debería lanzar error cuando el texto extraído es solo espacios en blanco', async () => {
      // ARRANGE
      const command = createMockAnalyzeSentimentCommand();
      mockExtractor.setMockExtractedText(createMockExtractedText('   \n\t  '));

      // ACT & ASSERT
      await expect(useCase.execute(command)).rejects.toThrow(
        'No text content could be extracted from the PDF file'
      );
    });
  });

  describe('Errores del Repositorio', () => {
    it('debería lanzar error cuando el repositorio falla al guardar', async () => {
      // ARRANGE — simular que la BD está caída
      const command = createMockAnalyzeSentimentCommand();
      mockRepository.setShouldFail(true);

      // ACT & ASSERT
      await expect(useCase.execute(command)).rejects.toThrow(
        'Failed to save analysis'
      );
    });
  });

  describe('Métricas del Análisis', () => {
    it('debería calcular el tiempo de procesamiento correctamente', async () => {
      // ARRANGE
      const command = createMockAnalyzeSentimentCommand();

      // ACT
      const result = await useCase.execute(command);

      // ASSERT — con mocks debería ser casi instantáneo
      expect(result.processingTimeMs).toBeGreaterThanOrEqual(0);
      expect(result.processingTimeMs).toBeLessThan(10000);
    });

    it('debería incluir métricas del análisis en el resultado', async () => {
      // ARRANGE
      const command = createMockAnalyzeSentimentCommand();

      // ACT
      const result = await useCase.execute(command);

      // ASSERT — verificar que las métricas de texto se calcularon
      expect(result.analysis.analysisMetrics).toBeDefined();
      expect(result.analysis.analysisMetrics.wordCount).toBeGreaterThan(0);
      expect(result.analysis.analysisMetrics.sentenceCount).toBeGreaterThan(0);
      expect(result.analysis.analysisMetrics.paragraphCount).toBeGreaterThan(0);
    });
  });

  describe('Diferentes Tipos de Sentimiento', () => {
    it('debería manejar sentimiento negativo correctamente', async () => {
      // ARRANGE — configurar mock para devolver sentimiento negativo
      const command = createMockAnalyzeSentimentCommand();
      mockAnalyzer.setMockResponse({
        overallSentiment: SentimentType.NEGATIVE,
        emotionScores: {
          joy: 0.1,
          sadness: 0.7,
          anger: 0.6,
          fear: 0.4,
          surprise: 0.2,
          disgust: 0.3,
        },
        confidence: 0.88,
      });

      // ACT
      const result = await useCase.execute(command);

      // ASSERT
      expect(result.analysis.overallSentiment).toBe(SentimentType.NEGATIVE);
      expect(result.analysis.emotionScores.sadness).toBeGreaterThan(0.5);
    });

    it('debería manejar sentimiento neutral correctamente', async () => {
      // ARRANGE — configurar mock para devolver sentimiento neutral
      const command = createMockAnalyzeSentimentCommand();
      mockAnalyzer.setMockResponse({
        overallSentiment: SentimentType.NEUTRAL,
        emotionScores: {
          joy: 0.3,
          sadness: 0.3,
          anger: 0.2,
          fear: 0.2,
          surprise: 0.2,
          disgust: 0.1,
        },
        confidence: 0.75,
      });

      // ACT
      const result = await useCase.execute(command);

      // ASSERT
      expect(result.analysis.overallSentiment).toBe(SentimentType.NEUTRAL);
    });
  });

  describe('Casos Borde', () => {
    it('debería manejar confianza muy baja', async () => {
      // ARRANGE
      const command = createMockAnalyzeSentimentCommand();
      mockAnalyzer.setMockResponse({
        overallSentiment: SentimentType.NEUTRAL,
        emotionScores: MOCK_EMOTION_POSITIVE,
        confidence: 0.3,
      });

      // ACT
      const result = await useCase.execute(command);

      // ASSERT
      expect(result.analysis.confidence).toBe(0.3);
    });

    it('debería manejar caracteres especiales en el nombre del cliente', async () => {
      // ARRANGE — nombre con acentos, apóstrofes y ampersand
      const command = createMockAnalyzeSentimentCommand({
        clientName: 'José María O\'Brien & García',
      });

      // ACT
      const result = await useCase.execute(command);

      // ASSERT
      expect(result.analysis.clientName).toBe('José María O\'Brien & García');
    });

    it('debería preservar los metadatos del documento', async () => {
      // ARRANGE
      const command = createMockAnalyzeSentimentCommand();
      const mockExtractedText = createMockExtractedText(TEST_TEXT_CONTENT);
      mockExtractor.setMockExtractedText(mockExtractedText);

      // ACT
      const result = await useCase.execute(command);

      // ASSERT
      expect(result.analysis.documentContent).toBe(mockExtractedText.content);
    });
  });
});
