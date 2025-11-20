import { KeywordExtractorPort } from "@/core/domain/documents/ports/KeywordExtractorPort";
import { Keyword } from "@/core/domain/documents/Keyword";
import { PromptBuilder } from "@/core/application/documents/services/PromptBuilder";
import OpenAI from "openai";

export class OpenAIKeywordExtractor implements KeywordExtractorPort {
  private promptBuilder = new PromptBuilder();

  constructor(
    private readonly openai: OpenAI,
    private readonly model: string = "gpt-4o-mini"
  ) {}

  async extract(input: { text: string; opts?: any }): Promise<Keyword[]> {
    try {
      const systemPrompt = this.promptBuilder.buildSystemPrompt(input.opts);
      const userPrompt = this.promptBuilder.buildUserPrompt(input.text, input.opts);

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0,
        max_tokens: 1000
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        return [];
      }

      // Extract JSON array using regex to capture the first [...] that appears
      const jsonMatch = content.match(/\[[\s\S]*?\]/);
      if (!jsonMatch) {
        console.warn("No JSON array found in OpenAI response");
        return [];
      }

      try {
        const keywords = JSON.parse(jsonMatch[0]) as Keyword[];
        return Array.isArray(keywords) ? keywords : [];
      } catch (parseError) {
        console.warn("Failed to parse JSON from OpenAI response:", parseError);
        return [];
      }
    } catch (error) {
      console.error("Error extracting keywords with OpenAI:", error);
      return [];
    }
  }
}
