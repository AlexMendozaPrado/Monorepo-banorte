export interface DocumentTextExtractorPort {
  extractText(input: { bytes: Buffer; mime: string }): Promise<{ fullText: string }>;
}
