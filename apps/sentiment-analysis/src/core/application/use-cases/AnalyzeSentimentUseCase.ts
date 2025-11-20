import { v4 as uuidv4 } from 'uuid';
import { SentimentAnalysisEntity, SentimentAnalysis } from '../../domain/entities/SentimentAnalysis';
import { AnalysisMetricsValueObject } from '../../domain/value-objects/AnalysisMetrics';
import { SentimentAnalyzerPort, SentimentAnalysisRequest } from '../../domain/ports/SentimentAnalyzerPort';
import { TextExtractorPort } from '../../domain/ports/TextExtractorPort';
import { SentimentAnalysisRepositoryPort } from '../../domain/ports/SentimentAnalysisRepositoryPort';

export interface AnalyzeSentimentCommand {
  fileBuffer: Buffer;
  clientName: string;
  documentName: string;
  channel: string;
}

export interface AnalyzeSentimentResult {
  analysis: SentimentAnalysisEntity;
  processingTimeMs: number;
}

export class AnalyzeSentimentUseCase {
  constructor(
    private readonly sentimentAnalyzer: SentimentAnalyzerPort,
    private readonly textExtractor: TextExtractorPort,
    private readonly repository: SentimentAnalysisRepositoryPort
  ) {}

  async execute(command: AnalyzeSentimentCommand): Promise<AnalyzeSentimentResult> {
    const startTime = Date.now();

    try {
      // Validate inputs
      this.validateCommand(command);

      // Check if analyzer is ready
      const isAnalyzerReady = await this.sentimentAnalyzer.isReady();
      if (!isAnalyzerReady) {
        throw new Error('Sentiment analyzer is not ready. Please check configuration.');
      }

      // Validate PDF file
      const isValidPDF = await this.textExtractor.isValidPDF(command.fileBuffer);
      if (!isValidPDF) {
        throw new Error('Invalid PDF file provided.');
      }

      // Extract text from PDF
      const extractedText = await this.textExtractor.extractTextFromPDF(command.fileBuffer, {
        includeMetadata: true,
        preserveFormatting: false,
      });

      if (!extractedText.content || extractedText.content.trim().length === 0) {
        throw new Error('No text content could be extracted from the PDF file.');
      }

      // Analyze sentiment
      const analysisRequest: SentimentAnalysisRequest = {
        text: extractedText.content,
        clientName: command.clientName,
        documentName: command.documentName,
        channel: command.channel,
      };

      const sentimentResult = await this.sentimentAnalyzer.analyzeSentiment(analysisRequest);

      // Calculate processing time and metrics
      const processingTimeMs = Date.now() - startTime;
      const analysisMetrics = AnalysisMetricsValueObject.fromText(
        extractedText.content,
        processingTimeMs,
        'es' // Assuming Spanish for Banorte
      );

      // Create sentiment analysis entity
      const analysisEntity = new SentimentAnalysisEntity(
        uuidv4(),
        command.clientName,
        command.documentName,
        extractedText.content,
        sentimentResult.overallSentiment,
        sentimentResult.emotionScores,
        analysisMetrics,
        sentimentResult.confidence,
        command.channel,
        new Date(),
        new Date()
      );

      // Save to repository
      const savedAnalysis = await this.repository.save(analysisEntity);

      // Convert back to entity to ensure we have all methods
      const resultEntity = new SentimentAnalysisEntity(
        savedAnalysis.id,
        savedAnalysis.clientName,
        savedAnalysis.documentName,
        savedAnalysis.documentContent,
        savedAnalysis.overallSentiment,
        savedAnalysis.emotionScores,
        savedAnalysis.analysisMetrics,
        savedAnalysis.confidence,
        savedAnalysis.channel,
        savedAnalysis.createdAt,
        savedAnalysis.updatedAt
      );

      return {
        analysis: resultEntity,
        processingTimeMs,
      };
    } catch (error) {
      const processingTimeMs = Date.now() - startTime;
      
      // Log error for monitoring
      console.error('Error in AnalyzeSentimentUseCase:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        command: {
          clientName: command.clientName,
          documentName: command.documentName,
          channel: command.channel,
          fileSize: command.fileBuffer.length,
        },
        processingTimeMs,
      });

      throw error;
    }
  }

  private validateCommand(command: AnalyzeSentimentCommand): void {
    if (!command.fileBuffer || command.fileBuffer.length === 0) {
      throw new Error('File buffer cannot be empty.');
    }

    if (!command.clientName || command.clientName.trim().length === 0) {
      throw new Error('Client name is required.');
    }

    if (!command.documentName || command.documentName.trim().length === 0) {
      throw new Error('Document name is required.');
    }

    if (!command.channel || command.channel.trim().length === 0) {
      throw new Error('Channel is required.');
    }

    // Check file size limits
    const maxFileSize = this.textExtractor.getMaxFileSize();
    if (command.fileBuffer.length > maxFileSize) {
      throw new Error(`File size exceeds maximum limit of ${maxFileSize} bytes.`);
    }
  }
}
