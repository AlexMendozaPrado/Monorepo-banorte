import { SentimentExtractorPort, SentimentExtractorInput } from "@/core/domain/documents/ports/SentimentExtractorPort";
import { SentimentAnalysisResult } from "@/core/domain/documents/SentimentAnalysis";
import { SentimentPromptBuilder } from "@/core/application/documents/services/SentimentPromptBuilder";
import OpenAI from "openai";

export class OpenAISentimentExtractor implements SentimentExtractorPort {
  private promptBuilder = new SentimentPromptBuilder();

  constructor(
    private readonly openai: OpenAI,
    private readonly model: string = "gpt-4o-mini"
  ) {}

  async extract(input: SentimentExtractorInput): Promise<SentimentAnalysisResult> {
    try {
      const systemPrompt = this.promptBuilder.buildSystemPrompt(input.opts);
      const userPrompt = this.promptBuilder.buildUserPrompt(input.text);

      console.log("[OpenAISentimentExtractor] Analyzing sentiment...");

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2500
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        console.warn("[OpenAISentimentExtractor] No content in OpenAI response");
        return this.getDefaultAnalysis();
      }

      // Extract JSON object using regex to capture the first {...} that appears
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.warn("[OpenAISentimentExtractor] No JSON object found in OpenAI response");
        return this.getDefaultAnalysis();
      }

      try {
        const analysis = JSON.parse(jsonMatch[0]) as SentimentAnalysisResult;
        console.log(`[OpenAISentimentExtractor] Analysis complete. Sentiment: ${analysis.sentimentScore}/7`);
        return analysis;
      } catch (parseError) {
        console.warn("[OpenAISentimentExtractor] Failed to parse JSON from OpenAI response:", parseError);
        return this.getDefaultAnalysis();
      }
    } catch (error) {
      console.error("[OpenAISentimentExtractor] Error analyzing sentiment with OpenAI:", error);
      return this.getDefaultAnalysis();
    }
  }

  private getDefaultAnalysis(): SentimentAnalysisResult {
    return {
      sentimentScore: 4,
      confidenceLevel: 50,
      emotions: [
        { emotion: "Neutral", percentage: 80 },
        { emotion: "Alegría", percentage: 10 },
        { emotion: "Sorpresa", percentage: 5 },
        { emotion: "Tristeza", percentage: 3 },
        { emotion: "Enojo", percentage: 1 },
        { emotion: "Disgusto", percentage: 1 }
      ],
      timeline: [
        { time: "Inicio", sentiment: 4, context: "Inicio del documento" },
        { time: "Desarrollo", sentiment: 4, context: "Desarrollo del contenido" },
        { time: "Final", sentiment: 4, context: "Conclusión del documento" }
      ],
      keywords: [
        { word: "documento", frequency: 10, sentiment: 4 },
        { word: "análisis", frequency: 8, sentiment: 4 }
      ],
      alerts: [
        {
          id: "1",
          message: "Análisis no disponible",
          priority: "Baja",
          context: "No se pudo completar el análisis de sentimientos",
          timestamp: "N/A"
        }
      ],
      documentInfo: {
        client: "Cliente no identificado",
        channel: "Documento",
        date: new Date().toLocaleDateString("es-MX"),
        duration: "N/A",
        participants: []
      },
      textMetrics: {
        words: 0,
        sentences: 0,
        avgWordsPerSentence: 0,
        readability: "Medio",
        readingTime: "N/A",
        vocabularyType: "General"
      }
    };
  }
}
