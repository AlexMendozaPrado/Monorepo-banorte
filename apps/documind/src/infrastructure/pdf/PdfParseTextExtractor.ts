import { DocumentTextExtractorPort } from "@/core/domain/documents/ports/DocumentTextExtractorPort";
import pdfParse from "pdf-parse";

export class PdfParseTextExtractor implements DocumentTextExtractorPort {
  async extractText(input: { bytes: Buffer; mime: string }): Promise<{ fullText: string }> {
    if (input.mime !== "application/pdf") {
      throw new Error("Unsupported file type. Only PDF files are allowed.");
    }

    try {
      const data = await pdfParse(input.bytes);
      return { fullText: data.text };
    } catch (error) {
      throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
