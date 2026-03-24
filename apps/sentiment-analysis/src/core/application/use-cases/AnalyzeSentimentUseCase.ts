import { v4 as uuidv4 } from 'uuid';
import { SentimentAnalysisEntity, SentimentAnalysis } from '../../domain/entities/SentimentAnalysis';
import { AnalysisMetricsValueObject } from '../../domain/value-objects/AnalysisMetrics';
import { SentimentAnalyzerPort, SentimentAnalysisRequest } from '../../domain/ports/SentimentAnalyzerPort';
import { TextExtractorPort } from '../../domain/ports/TextExtractorPort';
import { SentimentAnalysisRepositoryPort } from '../../domain/ports/SentimentAnalysisRepositoryPort';
import { SentimentAnalysisResult } from '../../domain/value-objects/SentimentAnalysisExtended';

export interface AnalyzeSentimentCommand {
  fileBuffer: Buffer;
  clientName: string;
  documentName: string;
  channel: string;
}

export interface AnalyzeSentimentResult {
  analysis: SentimentAnalysisEntity;
  processingTimeMs: number;
  extendedAnalysis?: SentimentAnalysisResult; // NUEVO: Análisis extendido
}

export class AnalyzeSentimentUseCase {
  constructor(
    private readonly sentimentAnalyzer: SentimentAnalyzerPort,
    private readonly textExtractor: TextExtractorPort,
    private readonly repository: SentimentAnalysisRepositoryPort,
    private readonly extendedSentimentExtractor?: any // OpenAISentimentExtractor
  ) {}

  async execute(command: AnalyzeSentimentCommand): Promise<AnalyzeSentimentResult> {
    const startTime = Date.now();

    try {
      // Validar entradas
      this.validateCommand(command);

      // Verificar si el analizador está listo
      const isAnalyzerReady = await this.sentimentAnalyzer.isReady();
      if (!isAnalyzerReady) {
        throw new Error('Sentiment analyzer is not ready. Please check configuration.');
      }

      // Validar archivo PDF
      const isValidPDF = await this.textExtractor.isValidPDF(command.fileBuffer);
      if (!isValidPDF) {
        throw new Error('Invalid PDF file provided.');
      }

      // Extraer texto del PDF
      const extractedText = await this.textExtractor.extractTextFromPDF(command.fileBuffer, {
        includeMetadata: true,
        preserveFormatting: false,
      });

      if (!extractedText.content || extractedText.content.trim().length === 0) {
        throw new Error('No text content could be extracted from the PDF file.');
      }

      // Analizar sentimiento
      const analysisRequest: SentimentAnalysisRequest = {
        text: extractedText.content,
        clientName: command.clientName,
        documentName: command.documentName,
        channel: command.channel,
      };

      const sentimentResult = await this.sentimentAnalyzer.analyzeSentiment(analysisRequest);

      // Calcular tiempo de procesamiento y métricas
      const processingTimeMs = Date.now() - startTime;
      const analysisMetrics = AnalysisMetricsValueObject.fromText(
        extractedText.content,
        processingTimeMs,
        'es' // Asumiendo español para Banorte
      );

      // Crear entidad de análisis de sentimiento
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

      // Guardar en repositorio
      const savedAnalysis = await this.repository.save(analysisEntity);

      // Convertir de vuelta a entidad para asegurar que tenemos todos los métodos
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

      // NUEVO: Ejecutar análisis extendido si el extractor está disponible
      let extendedAnalysis: SentimentAnalysisResult | undefined;
      if (this.extendedSentimentExtractor) {
        try {
          console.log('[AnalyzeSentimentUseCase] Executing extended analysis...');
          extendedAnalysis = await this.extendedSentimentExtractor.extract({
            text: extractedText.content,
            opts: {
              mode: 'finance',
              locale: 'es'
            }
          });
          console.log('[AnalyzeSentimentUseCase] Extended analysis completed');
        } catch (error) {
          console.error('[AnalyzeSentimentUseCase] Extended analysis failed:', error);
          // No fallar el proceso completo si el análisis extendido falla
        }
      }

      return {
        analysis: resultEntity,
        processingTimeMs,
        extendedAnalysis,
      };
    } catch (error) {
      const processingTimeMs = Date.now() - startTime;
      
      // Registrar error para monitoreo
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

    // Verificar límites de tamaño de archivo
    const maxFileSize = this.textExtractor.getMaxFileSize();
    if (command.fileBuffer.length > maxFileSize) {
      throw new Error(`File size exceeds maximum limit of ${maxFileSize} bytes.`);
    }
  }
}
