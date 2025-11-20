import { AnalyzePdfUseCase } from "@/core/application/documents/use-cases/AnalyzePdfUseCase";
import { PdfParseTextExtractor } from "@/infrastructure/pdf/PdfParseTextExtractor";
import { OpenAIKeywordExtractor } from "@/infrastructure/llm/OpenAIKeywordExtractor";
import { getOpenAI, getOpenAIModel } from "@/lib/env";

export function makeAnalyzePdfUseCase(): AnalyzePdfUseCase {
  const openai = getOpenAI();
  const model = getOpenAIModel();
  
  const textExtractor = new PdfParseTextExtractor();
  const keywordExtractor = new OpenAIKeywordExtractor(openai, model);
  
  return new AnalyzePdfUseCase(textExtractor, keywordExtractor);
}
