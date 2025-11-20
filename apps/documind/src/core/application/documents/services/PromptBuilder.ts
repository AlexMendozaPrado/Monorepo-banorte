export interface PromptOptions {
  mode?: "generic" | "legal" | "academic" | "finance";
  locale?: "es" | "en";
  minItems?: number;
  maxItems?: number;
  categoriesOverride?: string[];
  extraGuidance?: string;
}

export class PromptBuilder {
  buildSystemPrompt(opts: PromptOptions = {}): string {
    const {
      mode = "generic",
      locale = "es",
      minItems = 8,
      maxItems = 20,
      categoriesOverride,
      extraGuidance = ""
    } = opts;

    const defaultCategories = ["person", "organization", "date", "amount", "location", "topic", "other"];
    const categories = categoriesOverride || defaultCategories;

    const modeInstructions = {
      generic: "Extrae palabras clave generales del documento",
      legal: "Extrae términos legales, partes involucradas, fechas importantes y conceptos jurídicos",
      academic: "Extrae conceptos académicos, autores, metodologías y términos técnicos",
      finance: "Extrae términos financieros, montos, fechas de vencimiento y entidades financieras"
    };

    const localeInstructions = {
      es: "Responde en español",
      en: "Respond in English"
    };

    return `Eres un experto en análisis de documentos. ${modeInstructions[mode]}.

${localeInstructions[locale]}.

Categorías disponibles: ${categories.join(", ")}

Instrucciones:
1. Extrae entre ${minItems} y ${maxItems} palabras clave del texto proporcionado
2. Clasifica cada palabra clave en una de las categorías disponibles
3. Devuelve ÚNICAMENTE un array JSON válido con objetos que tengan la estructura: {"phrase": "palabra clave", "kind": "categoria"}
4. NO incluyas texto adicional, explicaciones o comentarios
5. NO uses markdown ni formato adicional
6. Solo el array JSON puro

${extraGuidance}`;
  }

  buildUserPrompt(documentText: string, opts: PromptOptions = {}): string {
    return `Analiza el siguiente texto y extrae las palabras clave según las instrucciones del sistema:

${documentText}`;
  }
}
