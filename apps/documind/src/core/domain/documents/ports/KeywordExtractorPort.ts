import { Keyword } from "@/core/domain/documents/Keyword";

export interface KeywordExtractorPort {
  extract(input: { text: string; opts?: any }): Promise<Keyword[]>;
}
