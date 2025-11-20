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
    // Create fresh mocks for each test
    mockAnalyzer = new SentimentAnalyzerMock();
    mockExtractor = new TextExtractorMock();
    mockRepository = new SentimentAnalysisRepositoryMock();

    // Inject mocks into use case
    useCase = new AnalyzeSentimentUseCase(
      mockAnalyzer,
      mockExtractor,
      mockRepository
    );
  });

  afterEach(() => {
    // Clean up after each test
    mockAnalyzer.reset();
    mockExtractor.reset();
    mockRepository.reset();
  });

  describe('Happy Path - Successful Analysis', () => {
    it('should analyze sentiment successfully with valid inputs', async () => {
      // Arrange
      const command = createMockAnalyzeSentimentCommand();
      mockExtractor.setMockExtractedText(createMockExtractedText(TEST_TEXT_CONTENT));
      mockAnalyzer.setMockResponse({
        overallSentiment: SentimentType.POSITIVE,
        emotionScores: MOCK_EMOTION_POSITIVE,
        confidence: 0.92,
      });

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result).toBeDefined();
      expect(result.analysis).toBeDefined();
      expect(result.analysis.overallSentiment).toBe(SentimentType.POSITIVE);
      expect(result.analysis.confidence).toBe(0.92);
      expect(result.analysis.clientName).toBe(command.clientName);
      expect(result.analysis.documentName).toBe(command.documentName);
      expect(result.analysis.channel).toBe(command.channel);
      expect(result.processingTimeMs).toBeGreaterThan(0);
    });

    it('should save analysis to repository', async () => {
      // Arrange
      const command = createMockAnalyzeSentimentCommand();

      // Act
      await useCase.execute(command);

      // Assert
      const savedAnalyses = mockRepository.getAll();
      expect(savedAnalyses).toHaveLength(1);
      expect(savedAnalyses[0].clientName).toBe(command.clientName);
    });

    it('should call all dependencies in correct order', async () => {
      // Arrange
      const command = createMockAnalyzeSentimentCommand();

      // Act
      await useCase.execute(command);

      // Assert
      const analyzerHistory = mockAnalyzer.getCallHistory();
      expect(analyzerHistory).toHaveLength(1);
      expect(analyzerHistory[0].clientName).toBe(command.clientName);
      expect(mockRepository.getAll()).toHaveLength(1);
    });

    it('should generate unique IDs for each analysis', async () => {
      // Arrange
      const command = createMockAnalyzeSentimentCommand();

      // Act
      const result1 = await useCase.execute(command);
      const result2 = await useCase.execute(command);

      // Assert
      expect(result1.analysis.id).not.toBe(result2.analysis.id);
      expect(mockRepository.getAll()).toHaveLength(2);
    });
  });

  describe('Input Validation', () => {
    it('should throw error when file buffer is empty', async () => {
      // Arrange
      const command = createMockAnalyzeSentimentCommand({
        fileBuffer: Buffer.alloc(0),
      });

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow(
        'File buffer cannot be empty'
      );
    });

    it('should throw error when client name is empty', async () => {
      // Arrange
      const command = createMockAnalyzeSentimentCommand({
        clientName: '',
      });

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow(
        'Client name is required'
      );
    });

    it('should throw error when client name is only whitespace', async () => {
      // Arrange
      const command = createMockAnalyzeSentimentCommand({
        clientName: '   ',
      });

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow(
        'Client name is required'
      );
    });

    it('should throw error when document name is empty', async () => {
      // Arrange
      const command = createMockAnalyzeSentimentCommand({
        documentName: '',
      });

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow(
        'Document name is required'
      );
    });

    it('should throw error when channel is empty', async () => {
      // Arrange
      const command = createMockAnalyzeSentimentCommand({
        channel: '',
      });

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow(
        'Channel is required'
      );
    });

    it('should throw error when file size exceeds maximum', async () => {
      // Arrange
      const maxSize = mockExtractor.getMaxFileSize();
      const oversizedBuffer = Buffer.alloc(maxSize + 1);
      const command = createMockAnalyzeSentimentCommand({
        fileBuffer: oversizedBuffer,
      });

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow(
        `File size exceeds maximum limit of ${maxSize} bytes`
      );
    });
  });

  describe('Sentiment Analyzer Errors', () => {
    it('should throw error when analyzer is not ready', async () => {
      // Arrange
      const command = createMockAnalyzeSentimentCommand();
      mockAnalyzer.setReady(false);

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow(
        'Sentiment analyzer is not ready'
      );
    });

    it('should throw error when analyzer fails', async () => {
      // Arrange
      const command = createMockAnalyzeSentimentCommand();
      mockAnalyzer.setShouldFail(true);

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow(
        'Sentiment analyzer failed'
      );
    });

    it('should not save analysis when analyzer fails', async () => {
      // Arrange
      const command = createMockAnalyzeSentimentCommand();
      mockAnalyzer.setShouldFail(true);

      // Act
      try {
        await useCase.execute(command);
      } catch (error) {
        // Expected error
      }

      // Assert
      expect(mockRepository.getAll()).toHaveLength(0);
    });
  });

  describe('PDF Extraction Errors', () => {
    it('should throw error when PDF is invalid', async () => {
      // Arrange
      const command = createMockAnalyzeSentimentCommand();
      mockExtractor.setValidPDF(false);

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow(
        'Invalid PDF file provided'
      );
    });

    it('should throw error when PDF extraction fails', async () => {
      // Arrange
      const command = createMockAnalyzeSentimentCommand();
      mockExtractor.setShouldFail(true);

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow(
        'Failed to validate PDF'
      );
    });

    it('should throw error when extracted text is empty', async () => {
      // Arrange
      const command = createMockAnalyzeSentimentCommand();
      mockExtractor.setMockExtractedText(createMockExtractedText(''));

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow(
        'No text content could be extracted from the PDF file'
      );
    });

    it('should throw error when extracted text is only whitespace', async () => {
      // Arrange
      const command = createMockAnalyzeSentimentCommand();
      mockExtractor.setMockExtractedText(createMockExtractedText('   \n\t  '));

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow(
        'No text content could be extracted from the PDF file'
      );
    });
  });

  describe('Repository Errors', () => {
    it('should throw error when repository save fails', async () => {
      // Arrange
      const command = createMockAnalyzeSentimentCommand();
      mockRepository.setShouldFail(true);

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow(
        'Failed to save analysis'
      );
    });
  });

  describe('Analysis Metrics', () => {
    it('should calculate processing time correctly', async () => {
      // Arrange
      const command = createMockAnalyzeSentimentCommand();

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result.processingTimeMs).toBeGreaterThan(0);
      expect(result.processingTimeMs).toBeLessThan(10000); // Should be fast with mocks
    });

    it('should include analysis metrics in result', async () => {
      // Arrange
      const command = createMockAnalyzeSentimentCommand();

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result.analysis.analysisMetrics).toBeDefined();
      expect(result.analysis.analysisMetrics.wordCount).toBeGreaterThan(0);
      expect(result.analysis.analysisMetrics.sentenceCount).toBeGreaterThan(0);
      expect(result.analysis.analysisMetrics.paragraphCount).toBeGreaterThan(0);
    });
  });

  describe('Different Sentiment Types', () => {
    it('should handle negative sentiment correctly', async () => {
      // Arrange
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
          trust: 0.2,
          anticipation: 0.3,
        },
        confidence: 0.88,
      });

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result.analysis.overallSentiment).toBe(SentimentType.NEGATIVE);
      expect(result.analysis.emotionScores.sadness).toBeGreaterThan(0.5);
    });

    it('should handle neutral sentiment correctly', async () => {
      // Arrange
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
          trust: 0.4,
          anticipation: 0.4,
        },
        confidence: 0.75,
      });

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result.analysis.overallSentiment).toBe(SentimentType.NEUTRAL);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very low confidence scores', async () => {
      // Arrange
      const command = createMockAnalyzeSentimentCommand();
      mockAnalyzer.setMockResponse({
        overallSentiment: SentimentType.NEUTRAL,
        emotionScores: MOCK_EMOTION_POSITIVE,
        confidence: 0.3,
      });

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result.analysis.confidence).toBe(0.3);
    });

    it('should handle special characters in client name', async () => {
      // Arrange
      const command = createMockAnalyzeSentimentCommand({
        clientName: 'José María O\'Brien & García',
      });

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result.analysis.clientName).toBe('José María O\'Brien & García');
    });

    it('should preserve document metadata', async () => {
      // Arrange
      const command = createMockAnalyzeSentimentCommand();
      const mockExtractedText = createMockExtractedText(TEST_TEXT_CONTENT);
      mockExtractor.setMockExtractedText(mockExtractedText);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result.analysis.documentContent).toBe(mockExtractedText.content);
    });
  });
});
