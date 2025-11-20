import { DocumentTextExtractorPort } from "@/core/domain/documents/ports/DocumentTextExtractorPort";
import { KeywordExtractorPort } from "@/core/domain/documents/ports/KeywordExtractorPort";
import { Keyword } from "@/core/domain/documents/Keyword";

export interface AnalyzePdfInput {
  bytes: Buffer;
  mime: string;
  mode?: "generic" | "legal" | "academic" | "finance";
}

export interface AnalyzePdfOutput {
  keywords: Keyword[];
  fullText: string;
}

export class AnalyzePdfUseCase {
  constructor(
    private readonly textExtractor: DocumentTextExtractorPort,
    private readonly keywordExtractor: KeywordExtractorPort
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

    return { keywords, fullText };
  }
}
