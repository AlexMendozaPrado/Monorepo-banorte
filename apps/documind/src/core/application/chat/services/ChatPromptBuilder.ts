import { ChatMessage, createChatMessage } from "@/core/domain/chat/ChatMessage";
import { DocumentChunk } from "@/core/domain/chat/DocumentChunk";

/**
 * Service for building RAG prompts
 * This service is part of the Application Layer and orchestrates prompt construction
 */
export class ChatPromptBuilder {
  /**
   * Build a system prompt for RAG chat
   * This prompt instructs the model how to use the provided context
   */
  buildSystemPrompt(): string {
    return `Eres un asistente virtual inteligente especializado en analizar y responder preguntas sobre documentos.

Tu trabajo es:
1. Responder preguntas basándote ÚNICAMENTE en el contexto proporcionado
2. Si la información no está en el contexto, di claramente que no tienes esa información
3. Citar las secciones relevantes del contexto cuando sea apropiado
4. Ser preciso, claro y conciso en tus respuestas
5. Mantener un tono profesional y amigable

IMPORTANTE:
- NO inventes información que no esté en el contexto
- Si no estás seguro, dilo claramente
- Puedes hacer inferencias razonables basadas en el contexto proporcionado`;
  }

  /**
   * Build a user prompt with context for RAG
   * Combines the user's question with relevant document chunks
   */
  buildUserPromptWithContext(
    userQuestion: string,
    relevantChunks: Array<{
      chunk: DocumentChunk;
      similarity: number;
    }>
  ): string {
    if (relevantChunks.length === 0) {
      return `Pregunta: ${userQuestion}

Contexto: No se encontraron documentos relevantes para responder esta pregunta.`;
    }

    // Build context from chunks
    const contextSections = relevantChunks
      .map((item, index) => {
        const { chunk, similarity } = item;
        return `[Documento ${index + 1}] (Relevancia: ${Math.round(similarity * 100)}%)
Título: ${chunk.title}
Contenido:
${chunk.content}`;
      })
      .join("\n\n---\n\n");

    return `Contexto relevante de los documentos:

${contextSections}

---

Pregunta del usuario: ${userQuestion}

Por favor, responde la pregunta basándote únicamente en el contexto proporcionado arriba.`;
  }

  /**
   * Build messages for RAG chat
   * Creates a complete message array with system prompt and context
   */
  buildRAGMessages(
    userQuestion: string,
    relevantChunks: Array<{
      chunk: DocumentChunk;
      similarity: number;
    }>,
    conversationHistory?: ChatMessage[]
  ): ChatMessage[] {
    const messages: ChatMessage[] = [];

    // 1. Add system prompt
    messages.push(
      createChatMessage({
        role: "system",
        content: this.buildSystemPrompt(),
      })
    );

    // 2. Add conversation history (if any)
    if (conversationHistory && conversationHistory.length > 0) {
      // Filter out system messages from history to avoid duplication
      const nonSystemMessages = conversationHistory.filter(
        (msg) => msg.role !== "system"
      );
      messages.push(...nonSystemMessages);
    }

    // 3. Add current user question with context
    messages.push(
      createChatMessage({
        role: "user",
        content: this.buildUserPromptWithContext(userQuestion, relevantChunks),
        contextDocuments: relevantChunks.map((item) => ({
          id: item.chunk.id,
          title: item.chunk.title,
          similarity: item.similarity,
        })),
      })
    );

    return messages;
  }

  /**
   * Build a simple chat message without RAG context
   * Used for general questions not requiring document context
   */
  buildSimpleChatMessages(
    userQuestion: string,
    conversationHistory?: ChatMessage[]
  ): ChatMessage[] {
    const messages: ChatMessage[] = [];

    // Add system prompt
    messages.push(
      createChatMessage({
        role: "system",
        content: "Eres un asistente virtual inteligente y servicial. Responde de manera clara, precisa y amigable.",
      })
    );

    // Add conversation history
    if (conversationHistory && conversationHistory.length > 0) {
      const nonSystemMessages = conversationHistory.filter(
        (msg) => msg.role !== "system"
      );
      messages.push(...nonSystemMessages);
    }

    // Add current question
    messages.push(
      createChatMessage({
        role: "user",
        content: userQuestion,
      })
    );

    return messages;
  }
}
