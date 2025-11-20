import { SentimentAnalysisResult } from "../SentimentAnalysis";

export interface SentimentExtractorInput {
  text: string;
  opts?: {
    mode?: "generic" | "legal" | "academic" | "finance";
    locale?: "es" | "en";
  };
}

export interface SentimentExtractorPort {
  extract(input: SentimentExtractorInput): Promise<SentimentAnalysisResult>;
}
