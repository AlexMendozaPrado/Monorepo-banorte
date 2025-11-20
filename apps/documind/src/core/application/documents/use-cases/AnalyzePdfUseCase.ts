import { DocumentTextExtractorPort } from "@/core/domain/documents/ports/DocumentTextExtractorPort";
import { KeywordExtractorPort } from "@/core/domain/documents/ports/KeywordExtractorPort";
import { SentimentExtractorPort } from "@/core/domain/documents/ports/SentimentExtractorPort";
import { Keyword } from "@/core/domain/documents/Keyword";
import { SentimentAnalysisResult } from "@/core/domain/documents/SentimentAnalysis";

export interface AnalyzePdfInput {
  bytes: Buffer;
  mime: string;
  mode?: "generic" | "legal" | "academic" | "finance";
}

export interface AnalyzePdfOutput {
  keywords: Keyword[];
  fullText: string;
  sentimentAnalysis: SentimentAnalysisResult;
}

export class AnalyzePdfUseCase {
  constructor(
    private readonly textExtractor: DocumentTextExtractorPort,
    private readonly keywordExtractor: KeywordExtractorPort,
    private readonly sentimentExtractor: SentimentExtractorPort
  ) {}

  async execute(input: AnalyzePdfInput): Promise<AnalyzePdfOutput> {
    const { bytes, mime, mode = "generic" } = input;

    // 1. Extract text from PDF
    const { fullText } = await this.textExtractor.extractText({ bytes, mime });

    // 2. Extract keywords using LLM
    const keywords = await this.keywordExtractor.extract({
      text: fullText,
      opts: {
        mode,
        locale: "es",
        minItems: 8,
        maxItems: 20
      }
    });

    // 3. Extract sentiment analysis using LLM
    const sentimentAnalysis = await this.sentimentExtractor.extract({
      text: fullText,
      opts: {
        mode,
        locale: "es"
      }
    });

    return { keywords, fullText, sentimentAnalysis };
  }
}
